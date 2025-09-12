import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      .select('nome, segmento_atuacao')
      .eq('id', clienteId)
      .single();

    if (clienteError || !clienteData) {
      throw new Error('Cliente não encontrado');
    }

    // Preparar prompt para análise da matriz SWOT
    const prompt = `
Você é um consultor especialista em análise estratégica e marketing digital. 
Analise os dados de onboarding da empresa "${clienteData.nome}" e forneça uma análise detalhada da matriz SWOT (Forças, Oportunidades, Fraquezas, Ameaças).

DADOS DA EMPRESA:
Nome: ${onboardingData.nome_empresa}
Segmento: ${onboardingData.segmento_atuacao}
Produtos/Serviços: ${onboardingData.produtos_servicos}
Tempo de Mercado: ${onboardingData.tempo_mercado}
Localização: ${onboardingData.localizacao}
Estrutura: ${onboardingData.estrutura_atual}

DIAGNÓSTICO DE MERCADO:
Concorrentes: ${onboardingData.concorrentes_diretos}
Diferenciais: ${onboardingData.diferenciais}
Fatores de Crise: ${onboardingData.fatores_crise}
Área de Atendimento: ${onboardingData.area_atendimento}

PÚBLICO-ALVO E COMPORTAMENTO:
Público-alvo: ${onboardingData.publico_alvo?.join(', ')}
Dores/Problemas: ${onboardingData.dores_problemas}
O que valorizam: ${onboardingData.valorizado}
Ticket Médio: ${onboardingData.ticket_medio}

MARKETING ATUAL:
Presença Digital: ${onboardingData.presenca_digital?.join(', ')}
Mídia Paga: ${onboardingData.midia_paga}
Tipos de Conteúdo: ${onboardingData.tipos_conteudo?.join(', ')}

MATRIZ SWOT ATUAL:
FORÇAS: ${onboardingData.forcas}
FRAQUEZAS: ${onboardingData.fraquezas}
OPORTUNIDADES: ${onboardingData.oportunidades}
AMEAÇAS: ${onboardingData.ameacas}

OBJETIVOS:
Digitais: ${onboardingData.objetivos_digitais}
Offline: ${onboardingData.objetivos_offline}
Visão 6 meses: ${onboardingData.onde_6_meses}

TAREFA:
1. Analise criticamente a matriz SWOT atual fornecida
2. Identifique pontos que podem estar sendo subestimados ou superestimados
3. Sugira melhorias e complementos para cada quadrante
4. Forneça insights estratégicos baseados nos dados
5. Proponha ações específicas para maximizar forças e oportunidades, e minimizar fraquezas e ameaças

Responda em português, de forma estruturada e profissional, com análise aprofundada e recomendações práticas.
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
            content: 'Você é um consultor estratégico especialista em análise SWOT e marketing digital com mais de 15 anos de experiência. Forneça análises detalhadas, insights valiosos e recomendações práticas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      clienteNome: clienteData.nome,
      onboardingData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-swot function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});