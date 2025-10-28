import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName } = await req.json();
    
    if (!fileContent || !fileName) {
      throw new Error('fileContent e fileName são obrigatórios');
    }

    console.log('📊 Analisando estrutura de:', fileName);

    // Pegar apenas as primeiras 20 linhas para análise
    const lines = fileContent.split('\n').slice(0, 20).join('\n');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um especialista em análise de extratos bancários.
Sua tarefa é analisar a estrutura de arquivos CSV de extratos e retornar APENAS um JSON válido com a configuração ideal.

REGRAS IMPORTANTES:
1. Identifique o delimitador correto (vírgula, ponto-vírgula ou tab)
2. Determine a primeira linha que contém dados (pule cabeçalhos)
3. Mapeie as colunas pelo índice numérico (0, 1, 2...) OU pelo nome da coluna
4. Colunas obrigatórias: data, descricao, valor
5. Colunas opcionais: tipo, saldo, documento
6. Calcule sua confiança na análise (0.0 a 1.0)
7. Identifique o banco se possível

FORMATO DE RESPOSTA (JSON válido):
{
  "delimitador": ",",
  "linhaInicial": 1,
  "mapeamentoColunas": {
    "data": "0",
    "descricao": "1",
    "valor": "2",
    "tipo": "3",
    "saldo": "4",
    "documento": "5"
  },
  "confianca": 0.95,
  "observacoes": "Banco detectado: Nubank, formato padrão CSV"
}`;

    const userPrompt = `Analise este extrato e retorne a configuração ideal:

ARQUIVO: ${fileName}

CONTEÚDO (primeiras 20 linhas):
${lines}

Retorne APENAS o JSON de configuração, sem texto adicional.`;

    console.log('🤖 Chamando Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_config",
              description: "Retorna a configuração sugerida para o parser CSV",
              parameters: {
                type: "object",
                properties: {
                  delimitador: {
                    type: "string",
                    enum: [",", ";", "\t"],
                    description: "Delimitador usado no CSV"
                  },
                  linhaInicial: {
                    type: "number",
                    description: "Número da primeira linha com dados (começa em 0)"
                  },
                  mapeamentoColunas: {
                    type: "object",
                    properties: {
                      data: { type: "string", description: "Índice ou nome da coluna de data" },
                      descricao: { type: "string", description: "Índice ou nome da coluna de descrição" },
                      valor: { type: "string", description: "Índice ou nome da coluna de valor" },
                      tipo: { type: "string", description: "Índice ou nome da coluna de tipo (opcional)" },
                      saldo: { type: "string", description: "Índice ou nome da coluna de saldo (opcional)" },
                      documento: { type: "string", description: "Índice ou nome da coluna de documento (opcional)" }
                    },
                    required: ["data", "descricao", "valor"],
                    additionalProperties: false
                  },
                  confianca: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                    description: "Confiança na análise (0.0 a 1.0)"
                  },
                  observacoes: {
                    type: "string",
                    description: "Observações sobre o banco detectado ou formato"
                  }
                },
                required: ["delimitador", "linhaInicial", "mapeamentoColunas", "confianca"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_config" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erro na API:', aiResponse.status, errorText);
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('✅ Resposta da IA recebida');

    // Extrair configuração do tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'suggest_config') {
      throw new Error('IA não retornou configuração válida');
    }

    const config = JSON.parse(toolCall.function.arguments);

    // Validar configuração mínima
    if (!config.delimitador || !config.mapeamentoColunas?.data || !config.mapeamentoColunas?.valor) {
      throw new Error('Configuração incompleta retornada pela IA');
    }

    console.log('✨ Configuração gerada com sucesso');
    console.log(`📊 Confiança: ${(config.confianca * 100).toFixed(0)}%`);

    // Gerar preview simulado das primeiras 3 transações
    const preview = [];
    const dataLines = lines.split('\n').slice(config.linhaInicial || 1).filter(l => l.trim());
    
    for (let i = 0; i < Math.min(3, dataLines.length); i++) {
      const cells = dataLines[i].split(config.delimitador);
      const dataIdx = parseInt(config.mapeamentoColunas.data) || 0;
      const descIdx = parseInt(config.mapeamentoColunas.descricao) || 1;
      const valorIdx = parseInt(config.mapeamentoColunas.valor) || 2;
      
      if (cells.length > Math.max(dataIdx, descIdx, valorIdx)) {
        preview.push({
          data: cells[dataIdx]?.trim() || '-',
          descricao: cells[descIdx]?.trim() || '-',
          valor: cells[valorIdx]?.trim() || '-'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        config: {
          delimitador: config.delimitador,
          linhaInicial: config.linhaInicial || 1,
          mapeamentoColunas: config.mapeamentoColunas
        },
        preview,
        confianca: config.confianca || 0.8,
        bancoDetectado: config.observacoes || 'Não identificado'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Erro ao analisar extrato:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
