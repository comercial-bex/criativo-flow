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

    const { extratoId } = await req.json();

    if (!extratoId) {
      throw new Error('extratoId é obrigatório');
    }

    // Buscar transações temporárias
    const { data: transacoes, error: transacoesError } = await supabase
      .from('extratos_transacoes_temp')
      .select('*')
      .eq('extrato_id', extratoId)
      .eq('status_processamento', 'pendente');

    if (transacoesError) throw transacoesError;

    let processadas = 0;
    let comSugestao = 0;

    // Processar cada transação
    for (const transacao of transacoes || []) {
      try {
        // Chamar função SQL de sugestão de vínculos
        const { data: sugestoes, error: sugestoesError } = await supabase
          .rpc('fn_sugerir_vinculo_transacao', {
            p_descricao: transacao.descricao,
            p_valor: transacao.valor,
            p_data_transacao: transacao.data_transacao,
            p_tipo_movimento: transacao.tipo_movimento
          });

        if (sugestoesError) {
          console.error('Erro ao buscar sugestões:', sugestoesError);
          continue;
        }

        // Se encontrou sugestão, atualizar transação
        if (sugestoes && sugestoes.length > 0) {
          const melhorSugestao = sugestoes[0];

          const updates: any = {
            confianca_vinculo: melhorSugestao.confianca,
            titulo_vinculado_id: melhorSugestao.titulo_id,
          };

          if (melhorSugestao.entidade_tipo === 'cliente') {
            updates.cliente_sugerido_id = melhorSugestao.entidade_id;
          } else {
            updates.fornecedor_sugerido_id = melhorSugestao.entidade_id;
          }

          const { error: updateError } = await supabase
            .from('extratos_transacoes_temp')
            .update(updates)
            .eq('id', transacao.id);

          if (updateError) {
            console.error('Erro ao atualizar transação:', updateError);
          } else {
            comSugestao++;
          }
        }

        processadas++;
      } catch (error) {
        console.error(`Erro ao processar transação ${transacao.id}:`, error);
      }
    }

    // Atualizar status do extrato
    const { error: updateExtratoError } = await supabase
      .from('extratos_importados')
      .update({
        transacoes_processadas: processadas
      })
      .eq('id', extratoId);

    if (updateExtratoError) throw updateExtratoError;

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: processadas,
        suggestions_count: comSugestao
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao processar transações:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
