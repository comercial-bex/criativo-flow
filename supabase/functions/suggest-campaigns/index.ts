import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { localizacao, segmento, duracao_meses } = await req.json();

    if (!localizacao || !segmento || !duracao_meses) {
      throw new Error('localizacao, segmento e duracao_meses são obrigatórios');
    }

    const systemPrompt = `Você é um especialista em marketing digital e calendário comercial brasileiro.
Sugira campanhas mensais específicas para uma empresa baseando-se em:
- Localização: ${localizacao}
- Segmento: ${segmento}
- Duração: ${duracao_meses} meses

INSTRUÇÕES:
1. Considere eventos comerciais nacionais (Dia das Mães, Black Friday, Natal, etc.)
2. Considere eventos regionais de ${localizacao} (festas locais, datas importantes)
3. Considere sazonalidade do segmento ${segmento}
4. Forneça exatamente ${duracao_meses} campanhas, uma para cada mês
5. Cada campanha deve ter: mês (1-12), nome (máx 50 chars), tipo (promocional/sazonal/lancamento/institucional), descrição (máx 150 chars)

Retorne APENAS um JSON válido no formato:
{
  "campanhas": [
    {
      "mes": 1,
      "nome": "Verão em Dobro",
      "tipo": "promocional",
      "descricao": "Aproveite o calor de janeiro com descontos especiais em produtos de verão"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Gere ${duracao_meses} campanhas para ${segmento} em ${localizacao}. Comece a partir do mês atual e vá sequencialmente.` 
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos insuficientes. Adicione créditos na aba de configurações.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    let campanhas;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        campanhas = parsed.campanhas;
      } else {
        campanhas = JSON.parse(content).campanhas;
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      console.error('Resposta recebida:', content);
      throw new Error('Não foi possível processar as sugestões de campanhas');
    }

    return new Response(
      JSON.stringify({ success: true, campanhas }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-campaigns:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
