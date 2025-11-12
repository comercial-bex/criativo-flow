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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { clienteId, tipo_conteudo, formato_postagem, dia_semana, hora, texto_estruturado } = await req.json();

    console.log(`[prever-performance] Cliente: ${clienteId}, Tipo: ${tipo_conteudo}, Dia: ${dia_semana}, Hora: ${hora}`);

    // 1. Buscar histórico de métricas similares
    const { data: metricas, error: metricasError } = await supabaseClient
      .from('post_performance_metrics')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('tipo_conteudo', tipo_conteudo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (metricasError) {
      console.error('Erro ao buscar métricas:', metricasError);
    }

    // 2. Calcular médias por horário similar
    const metricasPorHorario = (metricas || []).filter(m => 
      Math.abs(m.hora_publicacao - hora) <= 2 && m.dia_semana === dia_semana
    );

    const mediaHorario = metricasPorHorario.length > 0 ? {
      impressoes: Math.round(metricasPorHorario.reduce((sum, m) => sum + m.impressoes, 0) / metricasPorHorario.length),
      alcance: Math.round(metricasPorHorario.reduce((sum, m) => sum + m.alcance, 0) / metricasPorHorario.length),
      taxa_engajamento: (metricasPorHorario.reduce((sum, m) => sum + m.taxa_engajamento, 0) / metricasPorHorario.length).toFixed(2),
      score_performance: (metricasPorHorario.reduce((sum, m) => sum + m.score_performance, 0) / metricasPorHorario.length).toFixed(1)
    } : null;

    // 3. Preparar contexto para IA
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY não configurado');

    const prompt = `Você é um especialista em análise preditiva de performance de posts em redes sociais.

CONTEXTO DO POST:
- Tipo de conteúdo: ${tipo_conteudo}
- Formato: ${formato_postagem || 'não especificado'}
- Dia da semana: ${getDiaSemanaTexto(dia_semana)}
- Horário planejado: ${hora}:00h
- Preview do texto: ${texto_estruturado?.substring(0, 150) || 'não disponível'}

DADOS HISTÓRICOS DO CLIENTE:
${metricas && metricas.length > 0 ? `
Total de posts anteriores: ${metricas.length}
Média geral de engajamento: ${(metricas.reduce((sum, m) => sum + m.taxa_engajamento, 0) / metricas.length).toFixed(2)}%
Score médio de performance: ${(metricas.reduce((sum, m) => sum + m.score_performance, 0) / metricas.length).toFixed(1)}/100
` : 'Sem histórico disponível (usar benchmarks do mercado)'}

${mediaHorario ? `
DADOS ESPECÍFICOS PARA ESTE HORÁRIO (${getDiaSemanaTexto(dia_semana)} às ${hora}h):
- Impressões médias: ${mediaHorario.impressoes}
- Alcance médio: ${mediaHorario.alcance}
- Taxa de engajamento: ${mediaHorario.taxa_engajamento}%
- Score de performance: ${mediaHorario.score_performance}/100
` : `Sem dados históricos para este horário específico.`}

TAREFA:
Com base nos dados acima e em benchmarks do mercado brasileiro, faça uma previsão de performance para este post.

RETORNE UM JSON VÁLIDO COM:
{
  "previsao_performance": {
    "score_geral": 75,
    "nivel_confianca": "alto",
    "impressoes_estimadas": 1200,
    "alcance_estimado": 950,
    "taxa_engajamento_estimada": 6.5,
    "curtidas_estimadas": 80,
    "comentarios_estimados": 12,
    "compartilhamentos_estimados": 5
  },
  "analise_fatores": {
    "pontos_fortes": ["Horário de pico", "Tipo de conteúdo engaja bem"],
    "pontos_atencao": ["Dia com menor audiência"],
    "nivel_competitividade": "médio"
  },
  "recomendacoes": [
    "Considere adicionar CTA forte no final",
    "Use hashtags estratégicas (#marketing, #dicas)"
  ],
  "melhor_horario_alternativo": {
    "dia_semana": 2,
    "hora": 18,
    "motivo": "Terça-feira às 18h tem 25% mais engajamento"
  },
  "comparacao_mercado": {
    "acima_media": true,
    "percentil": 68
  }
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`;

    // 4. Chamar IA para previsão
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit excedido. Tente novamente em instantes.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const previsao = JSON.parse(aiData.choices[0].message.content);

    // 5. Retornar previsão completa
    return new Response(
      JSON.stringify({
        success: true,
        ...previsao,
        metadata: {
          baseado_em_historico: metricas && metricas.length > 0,
          total_posts_analisados: metricas?.length || 0,
          tem_dados_horario_especifico: mediaHorario !== null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[prever-performance] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getDiaSemanaTexto(dia: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[dia];
}
