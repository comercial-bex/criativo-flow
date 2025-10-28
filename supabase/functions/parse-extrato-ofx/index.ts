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

    // Buscar extrato
    const { data: extrato, error: extratoError } = await supabase
      .from('extratos_importados')
      .select('*')
      .eq('id', extratoId)
      .single();

    if (extratoError) throw extratoError;

    // Baixar arquivo do storage
    const filePath = extrato.arquivo_url.split('/').slice(-2).join('/');
    const { data: fileData, error: fileError } = await supabase.storage
      .from('extratos_bancarios')
      .download(filePath);

    if (fileError) throw fileError;

    const fileContent = await fileData.text();

    // Parse OFX básico (simplificado)
    const transactions: any[] = [];
    const transactionBlocks = fileContent.split('<STMTTRN>').slice(1);

    let periodoInicio: string | null = null;
    let periodoFim: string | null = null;

    for (const block of transactionBlocks) {
      const dtposted = block.match(/<DTPOSTED>(\d+)/)?.[1];
      const trnamt = block.match(/<TRNAMT>([-\d.]+)/)?.[1];
      const memo = block.match(/<MEMO>(.*?)</)?.[1] || '';
      const checknum = block.match(/<CHECKNUM>(.*?)</)?.[1];

      if (!dtposted || !trnamt) continue;

      // Converter data OFX (YYYYMMDD) para ISO
      const year = dtposted.substring(0, 4);
      const month = dtposted.substring(4, 6);
      const day = dtposted.substring(6, 8);
      const dataTransacao = `${year}-${month}-${day}`;

      // Determinar período
      if (!periodoInicio || dataTransacao < periodoInicio) periodoInicio = dataTransacao;
      if (!periodoFim || dataTransacao > periodoFim) periodoFim = dataTransacao;

      const valor = parseFloat(trnamt);
      const tipoMovimento = valor >= 0 ? 'credito' : 'debito';

      transactions.push({
        extrato_id: extratoId,
        data_transacao: dataTransacao,
        descricao: memo.trim() || 'Sem descrição',
        valor: Math.abs(valor),
        tipo_movimento: tipoMovimento,
        numero_documento: checknum || null,
      });
    }

    // Inserir transações na tabela temporária
    if (transactions.length > 0) {
      const { error: insertError } = await supabase
        .from('extratos_transacoes_temp')
        .insert(transactions);

      if (insertError) throw insertError;
    }

    // Atualizar extrato
    const { error: updateError } = await supabase
      .from('extratos_importados')
      .update({
        total_transacoes: transactions.length,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        status: 'concluido'
      })
      .eq('id', extratoId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        transacoes_processadas: transactions.length,
        periodo: { inicio: periodoInicio, fim: periodoFim }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao processar OFX:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
