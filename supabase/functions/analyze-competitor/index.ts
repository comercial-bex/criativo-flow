import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, site, instagram, facebook, tiktok, youtube } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um analista de marketing digital especializado em benchmarking competitivo.

IMPORTANTE:
- Analise dados PÚBLICOS disponíveis (sem necessidade de login)
- Seja conservador nas estimativas
- Use null para dados indisponíveis
- Retorne APENAS JSON válido

FORMATO DE SAÍDA (JSON):
{
  "nome": "string",
  "seguidores": {
    "instagram": number | null,
    "facebook": number | null,
    "tiktok": number | null,
    "youtube": number | null
  },
  "medias": {
    "likes": number | null,
    "comments": number | null
  },
  "engajamento_percent": number | null,
  "frequencia_posts_semana": number | null,
  "formatos_fortes": ["video", "carrossel", "imagem", "reels", "stories"],
  "percepcao_visual": "string (máx 150 caracteres)",
  "top_posts": [
    {
      "plataforma": "instagram|tiktok|youtube|facebook",
      "url": "string",
      "interacoes": number,
      "tema": "string",
      "tipo": "video|carrossel|imagem"
    }
  ]
}`;

    const userPrompt = `Analise o concorrente "${nome}" com base nos links públicos:

**Links fornecidos:**
- Site: ${site || 'não fornecido'}
- Instagram: ${instagram || 'não fornecido'}
- Facebook: ${facebook || 'não fornecido'}
- TikTok: ${tiktok || 'não fornecido'}
- YouTube: ${youtube || 'não fornecido'}

Com base em estimativas de dados públicos, retorne a análise no formato JSON especificado.`;

    console.log('📤 Analisando concorrente:', nome);
    
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
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da IA:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit excedido. Aguarde alguns segundos.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes no Lovable workspace.');
      }
      
      throw new Error(`Erro da IA: ${response.status}`);
    }

    const data = await response.json();
    const analiseIA = JSON.parse(data.choices[0].message.content);

    console.log('✅ Análise concluída:', nome);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analise: analiseIA,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Erro em analyze-competitor:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});