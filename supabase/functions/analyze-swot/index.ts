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

    // Preparar prompt ULTRA PROFUNDO para análise da matriz SWOT
    const prompt = `
MISSÃO: Você é um consultor estratégico de marketing digital SÊNIOR com 20+ anos transformando empresas através de insights penetrantes que 95% dos consultores não conseguem enxergar.

EMPRESA ANALISADA: "${clienteData.nome}"

═══════════════════════════════════════════════════════════════════════════════
📊 DADOS EMPRESARIAIS COMPLETOS
═══════════════════════════════════════════════════════════════════════════════

🏢 PERFIL ORGANIZACIONAL:
• Empresa: ${onboardingData.nome_empresa}
• Segmento: ${onboardingData.segmento_atuacao}
• Produtos/Serviços: ${onboardingData.produtos_servicos}
• Tempo no Mercado: ${onboardingData.tempo_mercado}
• Localização: ${onboardingData.localizacao}
• Estrutura: ${onboardingData.estrutura_atual}

💰 INTELIGÊNCIA COMERCIAL:
• Público-Alvo: ${onboardingData.publico_alvo?.join(', ')}
• Dores Específicas: ${onboardingData.dores_problemas}
• Fatores de Valor: ${onboardingData.valorizado}
• Ticket Médio: ${onboardingData.ticket_medio}
• Ciclo de Compra: ${onboardingData.frequencia_compra}
• Canais de Descoberta: ${onboardingData.como_encontram?.join(', ')}
• Métodos de Aquisição: ${onboardingData.forma_aquisicao?.join(', ')}

🏆 POSICIONAMENTO COMPETITIVO:
• Concorrentes Diretos: ${onboardingData.concorrentes_diretos}
• Diferenciais Declarados: ${onboardingData.diferenciais}
• História da Marca: ${onboardingData.historia_marca}
• Valores Fundamentais: ${onboardingData.valores_principais}
• Identidade Desejada: ${onboardingData.como_lembrada}

🌐 ECOSSISTEMA DIGITAL:
• Presença Ativa: ${onboardingData.presenca_digital?.join(', ')}
• Conteúdo Atual: ${onboardingData.tipos_conteudo?.join(', ')}
• Frequência: ${onboardingData.frequencia_postagens}
• Investimento Pago: ${onboardingData.midia_paga}
• Tom Comunicacional: ${onboardingData.tom_voz?.join(', ')}
• Objetivos Digitais: ${onboardingData.objetivos_digitais}

🎯 RELACIONAMENTO & OPERAÇÕES:
• Tipos de Relacionamento: ${onboardingData.relacionamento_clientes?.join(', ')}
• Canais Atendimento: ${onboardingData.canais_atendimento_ativos}
• Force de Vendas: ${onboardingData.equipe_vendas_externa}

🚀 VISÃO ESTRATÉGICA:
• Projeção 6 meses: ${onboardingData.onde_6_meses}
• Resultados Esperados: ${onboardingData.resultados_esperados?.join(', ')}
• Objetivos Offline: ${onboardingData.objetivos_offline}

═══════════════════════════════════════════════════════════════════════════════
🧠 METODOLOGIA DE ANÁLISE PENETRANTE
═══════════════════════════════════════════════════════════════════════════════

DETECTE O INVISÍVEL:
1. CONTRADIÇÕES FATAIS: O que declaram vs. o que realmente fazem - identifique gaps críticos
2. OPORTUNIDADES CEGAS: Vantagens competitivas que eles possuem mas não exploram
3. LACUNAS ESTRATÉGICAS: Conexões óbvias entre dados que eles não fizeram
4. BLIND SPOTS COMPETITIVOS: Vulnerabilidades que concorrentes podem explorar
5. ALAVANCAS OCULTAS: Recursos subutilizados que podem gerar crescimento exponencial

FOQUE NO CRESCIMENTO:
• MONETIZAÇÃO IMEDIATA: O que pode gerar receita em 30 dias
• SCALING ORGÂNICO: Como multiplicar seguidores sem investimento adicional  
• LEAD ACQUISITION: Estratégias específicas baseadas no perfil real do público
• DIFERENCIAÇÃO COMPETITIVA: Posicionamento único baseado em dados reais

═══════════════════════════════════════════════════════════════════════════════
📋 FORMATO DE RESPOSTA OBRIGATÓRIO
═══════════════════════════════════════════════════════════════════════════════

🎯 FORÇAS (Assets Estratégicos Subutilizados):
[FORÇA COMERCIAL]: [Vantagem específica + como monetizar imediatamente]
[FORÇA OPERACIONAL]: [Eficiência única + como acelerar conversão]
[FORÇA DE MARCA]: [Diferencial real + como explorar para aquisição]
[FORÇA DIGITAL]: [Capacidade online + estratégia de amplificação]

🚀 OPORTUNIDADES (Territórios Virgens):
[NICHO OCULTO]: [Segmento específico ignorado + estratégia de captura]
[GAP COMPETITIVO]: [Falha dos concorrentes + como explorar]
[TREND EMERGENTE]: [Tendência do setor + como se posicionar primeiro]
[SINERGIA INEXPLORADA]: [Conexão entre recursos + estratégia de ativação]

⚠️ FRAQUEZAS (Gargalos Críticos Invisíveis):
[GARGALO DE RECEITA]: [Limitação específica + impacto no faturamento]
[FALHA DIGITAL]: [Gap na presença online + perda de oportunidades]
[INCONSISTÊNCIA]: [Contradição entre declarado e executado]
[LIMITAÇÃO OPERACIONAL]: [Processo que impede escala + solução]

🚨 AMEAÇAS (Riscos Estratégicos Reais):
[RISCO COMPETITIVO]: [Movimento provável da concorrência + contramedida]
[VULNERABILIDADE DIGITAL]: [Fraqueza online + como concorrentes podem explorar]
[MUDANÇA DE MERCADO]: [Tendência que pode obsolescer o modelo atual]
[DEPENDÊNCIA CRÍTICA]: [Ponto único de falha + estratégia de mitigação]

💡 INSIGHTS PENETRANTES (O Que Eles Não Veem):
[CONEXÃO OCULTA]: [Padrão não identificado nos dados + oportunidade]
[ALAVANCA ESCONDIDA]: [Recurso subutilizado + potencial de crescimento]
[ESTRATÉGIA REVERSA]: [Abordagem contraintuitiva baseada nos dados]

🎯 PLANO DE AÇÃO IMEDIATO (30-60-90 dias):
[30 DIAS]: [Ação específica para impacto imediato em vendas/seguidores]
[60 DIAS]: [Estratégia de médio prazo para diferenciação]
[90 DIAS]: [Movimento estratégico para dominação do nicho]

═══════════════════════════════════════════════════════════════════════════════

DIRETRIZES CRÍTICAS:
✓ Use APENAS dados reais fornecidos - não invente informações
✓ Seja BRUTALMENTE específico e acionável
✓ Identifique contradições entre intenção e execução
✓ Detecte oportunidades que 95% dos consultores perdem
✓ Foque em crescimento mensurável: seguidores, leads, vendas
✓ Conecte pontos que eles não conectaram
✓ Forneça insights que gerem resultados imediatos

ANÁLISE DEVE SER: Profunda • Crítica • Acionável • Baseada em dados • Focada em crescimento
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