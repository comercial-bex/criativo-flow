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

    const { clienteId, tipo_conteudo, data_postagem, publico_alvo } = await req.json();

    console.log(`[sugerir-horarios] Cliente: ${clienteId}, Tipo: ${tipo_conteudo}`);

    // 1. Buscar analytics históricos do cliente
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from('analytics_horarios')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('tipo_conteudo', tipo_conteudo)
      .order('engajamento_medio', { ascending: false })
      .limit(10);

    if (analyticsError) console.error('Analytics error:', analyticsError);

    // 2. Buscar posts anteriores do mesmo tipo
    const { data: postsAnteriores, error: postsError } = await supabaseClient
      .from('posts_planejamento')
      .select('data_postagem, formato_postagem, tipo_conteudo')
      .eq('tipo_conteudo', tipo_conteudo)
      .order('data_postagem', { ascending: false })
      .limit(20);

    if (postsError) console.error('Posts error:', postsError);

    // 3. Calcular dia da semana da data escolhida
    const dataPost = new Date(data_postagem);
    const diaSemana = dataPost.getDay();

    // 4. Preparar prompt para IA
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY não configurado');

    const prompt = `Você é um especialista em marketing digital e estratégia de redes sociais.

CONTEXTO:
- Cliente ID: ${clienteId}
- Tipo de Conteúdo: ${tipo_conteudo}
- Público-alvo: ${publico_alvo || 'não especificado'}
- Data da postagem: ${data_postagem} (${getDiaSemanaTexto(diaSemana)})

DADOS HISTÓRICOS:
${analytics && analytics.length > 0 ? `
Analytics anteriores (melhores horários):
${analytics.map(a => `- ${getDiaSemanaTexto(a.dia_semana)} às ${a.hora}h: ${a.engajamento_medio}% engajamento médio`).join('\n')}
` : 'Sem dados históricos disponíveis'}

${postsAnteriores && postsAnteriores.length > 0 ? `
Posts anteriores deste tipo:
${postsAnteriores.map(p => `- ${new Date(p.data_postagem).toLocaleDateString('pt-BR')}: ${p.formato_postagem}`).join('\n')}
` : ''}

TAREFA:
Com base nos dados acima e nas melhores práticas de redes sociais, sugira:

1. **Três melhores horários** para postar no dia ${data_postagem} (${getDiaSemanaTexto(diaSemana)})
2. **Justificativa** para cada horário considerando:
   - Tipo de conteúdo (${tipo_conteudo})
   - Comportamento típico do público brasileiro
   - Dados históricos (se disponíveis)
3. **Recomendações estratégicas** específicas para este tipo de post

FORMATO DE RESPOSTA (JSON):
{
  "horarios_sugeridos": [
    {
      "hora": 9,
      "minuto": 0,
      "score": 95,
      "justificativa": "Horário de pico matinal, ideal para conteúdo informativo"
    },
    {
      "hora": 18,
      "minuto": 30,
      "score": 88,
      "justificativa": "Pós-trabalho, audiência mais engajada"
    },
    {
      "hora": 21,
      "minuto": 0,
      "score": 82,
      "justificativa": "Horário noturno de maior consumo de redes sociais"
    }
  ],
  "recomendacoes": [
    "Use CTAs fortes neste horário",
    "Evite textos muito longos no período da manhã"
  ],
  "melhor_horario_geral": "18:30"
}

Retorne APENAS o JSON válido, sem explicações adicionais.`;

    // 5. Chamar Lovable AI
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
      const errorText = await aiResponse.text();
      console.error('AI Error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit excedido. Tente novamente em alguns instantes.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos no painel.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const sugestao = JSON.parse(aiData.choices[0].message.content);

    // 6. Retornar sugestões
    return new Response(
      JSON.stringify({
        success: true,
        ...sugestao,
        metadata: {
          baseado_em_analytics: analytics && analytics.length > 0,
          total_posts_historicos: postsAnteriores?.length || 0,
          dia_semana: getDiaSemanaTexto(diaSemana)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sugerir-horarios] Error:', error);
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
