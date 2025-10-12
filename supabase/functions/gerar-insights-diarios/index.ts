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

    // Buscar dados recentes
    const { data: reflexoes } = await supabase
      .from('produtividade_reflexao')
      .select('texto, humor, data')
      .eq('user_id', userId)
      .eq('setor', setor)
      .order('data', { ascending: false })
      .limit(7);

    const { data: pomodoros } = await supabase
      .from('produtividade_pomodoro')
      .select('duracao_minutos, tipo, inicio')
      .eq('user_id', userId)
      .eq('setor', setor)
      .eq('status', 'concluido')
      .gte('inicio', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('inicio', { ascending: false });

    const prompt = `
Você é um coach de produtividade especializado em análise comportamental.

**Dados do usuário (últimos 7 dias):**
- Reflexões diárias: ${JSON.stringify(reflexoes, null, 2)}
- Ciclos Pomodoro: ${JSON.stringify(pomodoros, null, 2)}

**Sua tarefa:**
1. Analise padrões de humor, energia e foco
2. Identifique tendências positivas e negativas
3. Gere 3 insights práticos e objetivos
4. Forneça 2 recomendações acionáveis

**Formato de resposta (máximo 200 palavras):**
📊 Análise Semanal
[Resumo em 2-3 frases]

💡 Insights:
1. [Insight específico]
2. [Insight específico]
3. [Insight específico]

🎯 Recomendações:
• [Ação específica]
• [Ação específica]
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
          { role: 'system', content: 'Você é um coach de produtividade analítico e prático.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const insight = data.choices[0].message.content;

    // Salvar insight
    if (reflexoes && reflexoes.length > 0) {
      await supabase.from('produtividade_reflexao')
        .update({ resumo_ia: insight })
        .eq('user_id', userId)
        .eq('setor', setor)
        .order('data', { ascending: false })
        .limit(1);
    }

    return new Response(JSON.stringify({ insight }), {
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
