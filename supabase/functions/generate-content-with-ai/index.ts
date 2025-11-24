import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { prompt, type = 'post', model = 'google/gemini-2.5-flash' } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incorreta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Definir system message baseado no tipo
    let systemMessage = 'Você é um especialista em marketing digital e criação de conteúdo.';
    
    if (type === 'personas') {
      systemMessage = `Você é um especialista em marketing digital e criação de personas estratégicas.
Sua tarefa é gerar 3 personas detalhadas e realistas baseadas nas informações fornecidas.
IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional antes ou depois.`;
    } else if (type === 'post') {
      systemMessage = 'Você é um redator especialista em redes sociais. Crie conteúdo envolvente e otimizado.';
    } else if (type === 'legenda') {
      systemMessage = 'Você é um copywriter especialista em legendas para redes sociais.';
    } else if (type === 'hashtags') {
      systemMessage = 'Você é um especialista em hashtags e SEO para redes sociais.';
    } else if (type === 'swot') {
      systemMessage = 'Você é um consultor estratégico especialista em análise SWOT.';
    }

    console.log(`🤖 Gerando conteúdo do tipo: ${type} com modelo: ${model}`);

    // Preparar payload para Lovable AI Gateway
    const aiPayload: any = {
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
    };

    // Para personas, usar tool calling para garantir JSON estruturado
    if (type === 'personas') {
      aiPayload.tools = [
        {
          type: 'function',
          function: {
            name: 'gerar_personas',
            description: 'Gera 3 personas estratégicas detalhadas',
            parameters: {
              type: 'object',
              properties: {
                personas: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'object',
                    properties: {
                      nome: { type: 'string', description: 'Nome completo da persona' },
                      idade: { type: 'string', description: 'Faixa etária (ex: 25-35 anos)' },
                      profissao: { type: 'string', description: 'Profissão ou ocupação' },
                      resumo: { type: 'string', description: 'Resumo descritivo da persona em 1-2 frases' },
                      dores: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Lista de 3-5 dores/problemas principais'
                      },
                      motivacoes: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Lista de 3-5 motivações principais'
                      },
                      canais_preferidos: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Canais de comunicação preferidos'
                      },
                      comportamento_compra: { 
                        type: 'string', 
                        description: 'Descrição do comportamento de compra'
                      },
                      objecoes: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Principais objeções de compra'
                      },
                      como_ajudar: { 
                        type: 'string', 
                        description: 'Como sua empresa pode ajudar essa persona'
                      }
                    },
                    required: ['nome', 'idade', 'profissao', 'resumo', 'dores', 'motivacoes', 'canais_preferidos', 'comportamento_compra', 'objecoes', 'como_ajudar'],
                    additionalProperties: false
                  }
                }
              },
              required: ['personas'],
              additionalProperties: false
            }
          }
        }
      ];
      aiPayload.tool_choice = { type: 'function', function: { name: 'gerar_personas' } };
    }

    // Chamar Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erro da API de IA:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione fundos ao workspace Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao gerar conteúdo com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('✅ Resposta da IA recebida');

    let content: any;

    // Extrair conteúdo
    if (type === 'personas') {
      // Para tool calling, o conteúdo vem em tool_calls
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          content = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error('❌ Erro ao fazer parse do JSON das personas:', e);
          return new Response(
            JSON.stringify({ error: 'Formato de resposta inválido da IA' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.error('❌ Tool call não encontrado na resposta');
        return new Response(
          JSON.stringify({ error: 'Resposta da IA incompleta' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Para outros tipos, texto simples
      content = aiData.choices?.[0]?.message?.content || '';
    }

    return new Response(
      JSON.stringify({ content, type }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro no edge function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
