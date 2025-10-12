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
    const { userId, setor } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar pomodoros dos últimos 30 dias
    const { data: pomodoros } = await supabase
      .from('produtividade_pomodoro')
      .select('inicio, duracao_minutos, tipo')
      .eq('user_id', userId)
      .eq('setor', setor)
      .eq('status', 'concluido')
      .eq('tipo', 'foco')
      .gte('inicio', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('inicio', { ascending: true });

    // Buscar reflexões para correlacionar humor
    const { data: reflexoes } = await supabase
      .from('produtividade_reflexao')
      .select('data, humor')
      .eq('user_id', userId)
      .eq('setor', setor)
      .gte('data', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const prompt = `
Você é um especialista em análise de produtividade e cronobiologia.

**Dados históricos (últimos 30 dias):**
- Ciclos Pomodoro: ${JSON.stringify(pomodoros, null, 2)}
- Reflexões de humor: ${JSON.stringify(reflexoes, null, 2)}

**Sua tarefa:**
1. Identifique os horários com maior concentração de ciclos Pomodoro completos
2. Correlacione com dias de humor positivo
3. Calcule energia média (0-100) em diferentes períodos do dia
4. Sugira 3-5 horários ideais para tarefas complexas

**Retorne APENAS um JSON válido neste formato:**
{
  "horarios_ideais": ["09:00", "10:30", "14:00", "16:00"],
  "energia_media": 75,
  "melhor_periodo": "manhã",
  "recomendacoes": "Agende tarefas criativas pela manhã e reuniões à tarde."
}
    `;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em produtividade e análise de dados. Responda APENAS com JSON válido.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch[0]);

    // Salvar insights
    await supabase.from('produtividade_insights_foco').insert({
      user_id: userId,
      setor: setor,
      horarios_ideais: result.horarios_ideais,
      energia_media: result.energia_media,
      recomendacoes: result.recomendacoes
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
