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
      .select('nome')
      .eq('id', clienteId)
      .single();

    if (clienteError || !clienteData) {
      throw new Error('Cliente não encontrado');
    }

    // Preparar prompt para análise da matriz SWOT
    const prompt = `
Analise estrategicamente os dados de onboarding de "${clienteData.nome}" identificando insights específicos para CRESCIMENTO, VENDAS e AQUISIÇÃO DE SEGUIDORES que podem estar fora da visão atual da empresa.

DADOS DO ONBOARDING:
Nome: ${onboardingData.nome_empresa}
Segmento: ${onboardingData.segmento_atuacao}
Produtos/Serviços: ${onboardingData.produtos_servicos}
Tempo de Mercado: ${onboardingData.tempo_mercado}
Localização: ${onboardingData.localizacao}
Estrutura: ${onboardingData.estrutura_atual}
Concorrentes: ${onboardingData.concorrentes_diretos}
Diferenciais: ${onboardingData.diferenciais}
Público-alvo: ${onboardingData.publico_alvo?.join(', ')}
Dores dos Clientes: ${onboardingData.dores_problemas}
O que Valorizam: ${onboardingData.valorizado}
Ticket Médio: ${onboardingData.ticket_medio}
Frequência de Compra: ${onboardingData.frequencia_compra}
Presença Digital: ${onboardingData.presenca_digital?.join(', ')}
Tipos de Conteúdo: ${onboardingData.tipos_conteudo?.join(', ')}
Objetivos Digitais: ${onboardingData.objetivos_digitais}
Visão 6 meses: ${onboardingData.onde_6_meses}

IDENTIFIQUE PONTOS ESPECÍFICOS QUE RESPONDAM:

FORÇAS:
- Quais vantagens competitivas únicas podem ser melhor exploradas para vendas?
- Que aspectos da estrutura/experiência podem acelerar aquisição de clientes?
- Quais diferenciais estão sendo subutilizados para conversão?

OPORTUNIDADES:
- Que nichos de mercado específicos estão sendo perdidos baseado no público-alvo atual?
- Quais estratégias de conteúdo podem multiplicar o engajamento com base nas dores identificadas?
- Que parcerias estratégicas fazem sentido considerando o segmento e localização?

FRAQUEZAS:
- Quais gargalos operacionais estão limitando o crescimento de vendas?
- Que aspectos da presença digital estão impedindo a aquisição de novos seguidores?
- Quais processos internos precisam ser otimizados para escalar?

AMEAÇAS:
- Que movimentos dos concorrentes podem impactar a base de clientes atual?
- Quais mudanças de mercado podem afetar o ticket médio e frequência de compra?
- Que riscos digitais podem comprometer a aquisição de novos públicos?

RESPONDA APENAS:

FORÇAS:
- [insight específico para vendas/crescimento]
- [vantagem competitiva subutilizada]
- [força estrutural para escalar]

OPORTUNIDADES:
- [nicho específico não explorado]
- [estratégia de conteúdo para engajamento]
- [parceria estratégica concreta]

FRAQUEZAS:
- [gargalo operacional específico]
- [limitação digital para aquisição]
- [processo interno que impede escala]

AMEAÇAS:
- [movimento competitivo iminente]
- [risco de mercado específico]
- [ameaça digital concreta]

ESTRATÉGIAS PRIORITÁRIAS:
- [ação específica para aumentar vendas baseada nos dados]
- [tática concreta para aquisição de seguidores no nicho identificado]
- [movimento estratégico para diferenciação competitiva]

Seja específico, baseado nos dados reais fornecidos, e foque em insights que a empresa pode não estar vendo.
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
        max_completion_tokens: 2000
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