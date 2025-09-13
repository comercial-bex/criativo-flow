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
Como consultor estratégico sênior especializado em crescimento empresarial e marketing digital, conduza uma análise SWOT PROFUNDA e CRÍTICA para "${clienteData.nome}".

CONTEXTO EMPRESARIAL COMPLETO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFIL DA EMPRESA:
• Nome: ${onboardingData.nome_empresa}
• Segmento: ${onboardingData.segmento_atuacao}
• Produtos/Serviços: ${onboardingData.produtos_servicos}
• Tempo no Mercado: ${onboardingData.tempo_mercado}
• Localização: ${onboardingData.localizacao}
• Estrutura Atual: ${onboardingData.estrutura_atual}

ANÁLISE COMPETITIVA:
• Concorrentes Diretos: ${onboardingData.concorrentes_diretos}
• Diferenciais Declarados: ${onboardingData.diferenciais}

INTELIGÊNCIA DO CLIENTE:
• Público-Alvo: ${onboardingData.publico_alvo?.join(', ')}
• Dores/Problemas: ${onboardingData.dores_problemas}
• O que Valorizam: ${onboardingData.valorizado}
• Ticket Médio: ${onboardingData.ticket_medio}
• Frequência de Compra: ${onboardingData.frequencia_compra}
• Como Encontram a Empresa: ${onboardingData.como_encontram?.join(', ')}
• Formas de Aquisição: ${onboardingData.forma_aquisicao?.join(', ')}

PRESENÇA E ESTRATÉGIA DIGITAL:
• Canais Digitais Ativos: ${onboardingData.presenca_digital?.join(', ')}
• Tipos de Conteúdo: ${onboardingData.tipos_conteudo?.join(', ')}
• Frequência de Postagens: ${onboardingData.frequencia_postagens}
• Mídia Paga: ${onboardingData.midia_paga}
• Objetivos Digitais: ${onboardingData.objetivos_digitais}

RELACIONAMENTO E ATENDIMENTO:
• Tipos de Relacionamento: ${onboardingData.relacionamento_clientes?.join(', ')}
• Canais de Atendimento: ${onboardingData.canais_atendimento_ativos}
• Equipe de Vendas Externa: ${onboardingData.equipe_vendas_externa}

IDENTIDADE E POSICIONAMENTO:
• História da Marca: ${onboardingData.historia_marca}
• Valores Principais: ${onboardingData.valores_principais}
• Tom de Voz: ${onboardingData.tom_voz?.join(', ')}
• Como Quer Ser Lembrada: ${onboardingData.como_lembrada}

VISÃO E EXPECTATIVAS:
• Objetivos 6 meses: ${onboardingData.onde_6_meses}
• Resultados Esperados: ${onboardingData.resultados_esperados?.join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUÇÕES PARA ANÁLISE CRÍTICA E PROFUNDA:

1. ANÁLISE CRÍTICA DOS GAPS INVISÍVEIS:
   - Identifique contradições entre o que declaram e o que realmente fazem
   - Detecte oportunidades que eles NÃO estão vendo no próprio negócio
   - Aponte blind spots estratégicos baseados nos dados fornecidos

2. INSIGHTS DE CRESCIMENTO EXPONENCIAL:
   - Conecte pontos que eles não conectaram entre público-alvo e estratégia digital
   - Identifique alavancas de crescimento escondidas nos próprios dados
   - Sugira estratégias de monetização que estão sendo ignoradas

3. ANÁLISE COMPETITIVA PROFUNDA:
   - Baseado no segmento e concorrentes, identifique movimentos estratégicos necessários
   - Detecte vulnerabilidades competitivas e como explorá-las
   - Identifique tendências do setor que podem ser antecipadas

RESPONDA NO FORMATO ESTRUTURADO:

🎯 FORÇAS (Assets Estratégicos):
- [FORÇA COMERCIAL]: Identifique vantagens competitivas específicas que podem ser MONETIZADAS imediatamente
- [FORÇA OPERACIONAL]: Detecte eficiências ou processos únicos que aceleram vendas/conversão  
- [FORÇA DE MARCA]: Aponte elementos de diferenciação que estão sendo SUBUTILIZADOS para aquisição

🚀 OPORTUNIDADES (Territórios Inexplorados):
- [NICHO OCULTO]: Identifique segmentos específicos do público que estão sendo ignorados mas têm alto potencial
- [ESTRATÉGIA DIGITAL]: Detecte tactics de conteúdo/engajamento baseadas nas dores reais do público
- [PARCERIA ESTRATÉGICA]: Sugira colaborações específicas considerando localização/segmento/objetivos

⚠️ FRAQUEZAS (Gargalos Críticos):
- [GARGALO DE VENDAS]: Identifique limitações específicas que impedem escalonamento de receita
- [GAP DIGITAL]: Detecte falhas na presença digital que limitam aquisição orgânica de seguidores
- [LIMITAÇÃO OPERACIONAL]: Aponte processos internos que impedem crescimento sustentável

🚨 AMEAÇAS (Riscos Estratégicos):
- [RISCO COMPETITIVO]: Analise movimentos prováveis da concorrência que podem impactar market share
- [RISCO DE MERCADO]: Identifique mudanças no comportamento do consumidor que podem afetar o modelo de negócio
- [RISCO DIGITAL]: Detecte vulnerabilidades na estratégia digital que podem comprometer aquisição futura

💡 ESTRATÉGIAS PRIORITÁRIAS (Plano de Ação):
- [AÇÃO IMEDIATA]: Movimento específico para impacto em vendas nos próximos 30 dias
- [TÁTICA DE CRESCIMENTO]: Estratégia concreta para multiplicar seguidores no nicho identificado
- [DIFERENCIAÇÃO COMPETITIVA]: Posicionamento único baseado nos insights descobertos

SEJA BRUTALMENTE ESPECÍFICO. Use os dados reais fornecidos. Identifique o que eles NÃO estão vendo. Forneça insights acionáveis que gerem crescimento mensurável.
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
            content: 'Você é McKenzie + BCG + Deloitte condensados em uma IA. 20+ anos transformando empresas. Especialista em crescimento exponencial, marketing digital estratégico e monetização. Você vê padrões invisíveis, identifica oportunidades ocultas e gera insights que aumentam receita. Seja direto, crítico e baseado em dados reais.'
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