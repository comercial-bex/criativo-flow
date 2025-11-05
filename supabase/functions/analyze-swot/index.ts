import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { clienteId } = await req.json();

    if (!clienteId) {
      throw new Error('clienteId is required');
    }

    // Buscar dados de onboarding do cliente
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();

    if (onboardingError || !onboardingData) {
      throw new Error('Dados de onboarding não encontrados para este cliente');
    }

    // Buscar dados básicos do cliente
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('nome')
      .eq('id', clienteId)
      .single();

    if (clienteError || !clienteData) {
      throw new Error('Cliente não encontrado');
    }

    // Preparar prompt contextualizado para análise da matriz SWOT
    const prompt = `
Você é um consultor estratégico especializado em marketing digital e crescimento empresarial. 
Analise a empresa "${clienteData.nome}" e forneça uma análise SWOT estruturada em JSON.

CONTEXTO DA EMPRESA:
Empresa: ${onboardingData.nome_empresa}
Segmento: ${onboardingData.segmento_atuacao}
Localização: ${onboardingData.localizacao}
Tempo no mercado: ${onboardingData.tempo_mercado}
Produtos/Serviços: ${onboardingData.produtos_servicos}

PÚBLICO E MERCADO:
Público-alvo: ${onboardingData.publico_alvo?.join(', ')}
Principais dores: ${onboardingData.dores_problemas}
O que valorizam: ${onboardingData.valorizado}
Ticket médio: ${onboardingData.ticket_medio}

PRESENÇA DIGITAL ATUAL:
Canais ativos: ${onboardingData.presenca_digital?.join(', ')}
Tipos de conteúdo: ${onboardingData.tipos_conteudo?.join(', ')}
Frequência de posts: ${onboardingData.frequencia_postagens}
Objetivos digitais: ${onboardingData.objetivos_digitais}

COMPETIÇÃO E DIFERENCIAÇÃO:
Concorrentes: ${onboardingData.concorrentes_diretos}
Diferenciais: ${onboardingData.diferenciais}

OBJETIVOS E VISÃO:
Onde quer estar em 6 meses: ${onboardingData.onde_6_meses}
Resultados esperados: ${onboardingData.resultados_esperados?.join(', ')}

INSTRUÇÕES:
1. Considere a realidade do mercado local de ${onboardingData.localizacao}
2. Baseie-se no perfil real do público-alvo mencionado
3. Seja específico sobre o segmento ${onboardingData.segmento_atuacao}
4. Foque em ações práticas e viáveis
5. Use linguagem natural e profissional

Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "forcas": ["força 1", "força 2", "força 3"],
  "fraquezas": ["fraqueza 1", "fraqueza 2", "fraqueza 3"],
  "oportunidades": ["oportunidade 1", "oportunidade 2", "oportunidade 3"],
  "ameacas": ["ameaça 1", "ameaça 2", "ameaça 3"]
}

Cada item deve ter entre 80-150 caracteres e ser específico para esta empresa e contexto.
`;

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor estratégico experiente especializado em marketing digital. Forneça análises práticas, diretas e baseadas na realidade do mercado brasileiro. Use linguagem profissional e natural, sem emojis ou formatação excessiva.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse JSON da resposta
    let swotData;
    try {
      // Tentar extrair JSON do texto (caso venha com markdown ou texto extra)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        swotData = JSON.parse(jsonMatch[0]);
      } else {
        swotData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON da IA:', parseError);
      console.error('Resposta recebida:', analysisText);
      throw new Error('Não foi possível processar a análise SWOT gerada pela IA');
    }

    return new Response(JSON.stringify({ 
      success: true,
      swot: swotData,
      clienteNome: clienteData.nome,
      onboardingData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-swot function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});