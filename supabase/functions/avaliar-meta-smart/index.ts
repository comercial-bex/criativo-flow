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
    const { descricao, titulo } = await req.json();

    const prompt = `
Avalie o seguinte objetivo segundo os critérios SMART:

**Meta:** "${titulo}"
**Descrição:** "${descricao}"

**Critérios de avaliação (0-100):**
1. **Específica (Specific):** Está clara e bem definida?
2. **Mensurável (Measurable):** Pode ser quantificada ou medida?
3. **Atingível (Achievable):** É realista e alcançável?
4. **Relevante (Relevant):** Está alinhada com objetivos maiores?
5. **Temporal (Time-bound):** Tem prazo definido?

**Retorne APENAS um JSON válido neste formato:**
{
  "especifica": 85,
  "mensuravel": 70,
  "atingivel": 90,
  "relevante": 80,
  "temporal": 60,
  "media": 77,
  "feedback": "A meta está bem definida mas falta um prazo específico."
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
          { role: 'system', content: 'Você é um especialista em definição de metas SMART. Responda APENAS com JSON válido.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    // Extrair JSON da resposta
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch[0]);

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
