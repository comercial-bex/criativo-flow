import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { extratoId, transacoesIds } = await req.json();

    if (!extratoId || !transacoesIds || !Array.isArray(transacoesIds)) {
      throw new Error('extratoId e transacoesIds são obrigatórios');
    }

    // Buscar extrato
    const { data: extrato, error: extratoError } = await supabase
      .from('extratos_importados')
      .select('*')
      .eq('id', extratoId)
      .single();

    if (extratoError) throw extratoError;

    // Buscar transações selecionadas
    const { data: transacoes, error: transacoesError } = await supabase
      .from('extratos_transacoes_temp')
      .select('*')
      .in('id', transacoesIds);

    if (transacoesError) throw transacoesError;

    let importadas = 0;
    const errors: string[] = [];

    // Importar cada transação
    for (const transacao of transacoes || []) {
      try {
        const tipo = transacao.tipo_movimento === 'credito' ? 'receber' : 'pagar';
        const entidadeId = transacao.cliente_sugerido_id || transacao.fornecedor_sugerido_id;

        // Criar título financeiro
        const tituloData: any = {
          tipo,
          numero_documento: transacao.numero_documento || `EXT-${transacao.id.substring(0, 8)}`,
          descricao: transacao.descricao,
          valor_original: transacao.valor,
          valor_pendente: transacao.valor,
          data_emissao: transacao.data_transacao,
          data_vencimento: transacao.data_transacao,
          status: 'pendente',
          categoria: transacao.categoria_sugerida,
          observacoes: transacao.observacoes_usuario,
          origem: 'extrato_bancario',
          conta_bancaria_id: extrato.conta_bancaria_id,
        };

        if (tipo === 'receber' && entidadeId) {
          tituloData.cliente_id = entidadeId;
        } else if (tipo === 'pagar' && entidadeId) {
          tituloData.fornecedor_id = entidadeId;
        }

        const { data: titulo, error: tituloError } = await supabase
          .from('titulos_financeiros')
          .insert([tituloData])
          .select()
          .single();

        if (tituloError) {
          errors.push(`Erro ao criar título para transação ${transacao.id}: ${tituloError.message}`);
          continue;
        }

        // Marcar transação como importada
        const { error: updateError } = await supabase
          .from('extratos_transacoes_temp')
          .update({
            status_processamento: 'importado',
            titulo_vinculado_id: titulo.id
          })
          .eq('id', transacao.id);

        if (updateError) {
          console.error('Erro ao marcar transação como importada:', updateError);
        }

        importadas++;
      } catch (error) {
        errors.push(`Erro ao importar transação ${transacao.id}: ${error.message}`);
        console.error(`Erro ao importar transação ${transacao.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported_count: importadas,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao importar transações:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
