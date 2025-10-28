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

  let config: any;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { extratoId, config: receivedConfig } = body;
    config = receivedConfig;

    if (!extratoId) {
      throw new Error('extratoId é obrigatório');
    }

    if (!config || !config.mapeamentoColunas) {
      throw new Error('config.mapeamentoColunas é obrigatório');
    }

    const { delimitador = ',', linhaInicial = 1, mapeamentoColunas } = config;

    // Validar mapeamento mínimo
    if (!mapeamentoColunas.data || !mapeamentoColunas.descricao || !mapeamentoColunas.valor) {
      throw new Error('Mapeamento incompleto: data, descricao e valor são obrigatórios');
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

    // Parse CSV
    const lines = fileContent.split('\n').slice(linhaInicial);
    const transactions: any[] = [];

    let periodoInicio: string | null = null;
    let periodoFim: string | null = null;

    for (const line of lines) {
      if (!line.trim()) continue;

      const columns = line.split(delimitador).map(col => col.trim().replace(/^"|"$/g, ''));

      // Mapear colunas
      const getColumn = (mapping: string | undefined) => {
        if (!mapping) return undefined;
        
        const index = parseInt(mapping);
        if (!isNaN(index)) {
          return columns[index]?.trim();
        }
        
        // Busca por nome (case-insensitive)
        return columns.find(col => 
          col && col.toLowerCase().includes(mapping.toLowerCase())
        )?.trim();
      };

      const dataStr = getColumn(mapeamentoColunas.data);
      const descricao = getColumn(mapeamentoColunas.descricao);
      const valorStr = getColumn(mapeamentoColunas.valor);
      const tipoStr = mapeamentoColunas.tipo ? getColumn(mapeamentoColunas.tipo) : undefined;
      const documento = mapeamentoColunas.documento ? getColumn(mapeamentoColunas.documento) : undefined;

      if (!dataStr || !descricao || !valorStr) {
        console.log('⚠️ Linha ignorada (dados faltando):', { dataStr, descricao, valorStr });
        continue;
      }

      // Converter data (suporta DD/MM/YYYY, YYYY-MM-DD)
      let dataTransacao: string;
      if (dataStr.includes('/')) {
        const [day, month, year] = dataStr.split('/');
        dataTransacao = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        dataTransacao = dataStr;
      }

      // Determinar período
      if (!periodoInicio || dataTransacao < periodoInicio) periodoInicio = dataTransacao;
      if (!periodoFim || dataTransacao > periodoFim) periodoFim = dataTransacao;

      // Converter valor
      const valorNumerico = parseFloat(valorStr.replace(/[^\d,-]/g, '').replace(',', '.'));
      const valor = Math.abs(valorNumerico);

      // Determinar tipo de movimento
      let tipoMovimento: 'credito' | 'debito' = 'credito';

      // 1. Verifica coluna tipo primeiro (mais confiável)
      if (tipoStr) {
        const tipo = tipoStr.toLowerCase();
        if (tipo.includes('d') || tipo.includes('debito') || tipo.includes('débito') || tipo.includes('saida') || tipo.includes('saída')) {
          tipoMovimento = 'debito';
        }
      }
      // 2. Se não tem coluna tipo, verifica sinal negativo no valor
      else if (valorStr.includes('-') || valorNumerico < 0) {
        tipoMovimento = 'debito';
      }
      // 3. Contexto da descrição (backup)
      else if (descLower.includes('pagamento') || descLower.includes('saque') || descLower.includes('tarifa')) {
        tipoMovimento = 'debito';
      }

      // Detectar categoria/tipo de transação na descrição
      let categoriaTransacao = null;
      const descLower = descricao.toLowerCase();
      
      if (descLower.includes('pix')) {
        categoriaTransacao = 'PIX';
      } else if (descLower.includes('ted')) {
        categoriaTransacao = 'TED';
      } else if (descLower.includes('doc')) {
        categoriaTransacao = 'DOC';
      } else if (descLower.includes('boleto') || descLower.includes('pagamento')) {
        categoriaTransacao = 'Boleto';
      } else if (descLower.includes('transferencia') || descLower.includes('transferência')) {
        categoriaTransacao = 'Transferência';
      } else if (descLower.includes('deposito') || descLower.includes('depósito')) {
        categoriaTransacao = 'Depósito';
      } else if (descLower.includes('saque')) {
        categoriaTransacao = 'Saque';
      } else if (descLower.includes('tarifa') || descLower.includes('taxa')) {
        categoriaTransacao = 'Tarifa';
      }

      transactions.push({
        extrato_id: extratoId,
        data_transacao: dataTransacao,
        descricao: descricao.trim(),
        valor,
        tipo_movimento: tipoMovimento,
        numero_documento: documento || null,
        categoria_sugerida: categoriaTransacao,
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
    console.error('❌ Erro ao processar CSV:', error);
    console.error('📋 Config recebida:', JSON.stringify(config || {}, null, 2));
    return new Response(
      JSON.stringify({ 
        error: error.message,
        detalhes: 'Verifique se a configuração de colunas está correta'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
