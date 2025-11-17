import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HashtagRequest {
  texto: string;
  plataforma: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  objetivo?: string;
  nicho?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { texto, plataforma, objetivo, nicho }: HashtagRequest = await req.json();

    if (!texto) {
      throw new Error('Texto é obrigatório');
    }

    // Limites de hashtags por plataforma
    const limites = {
      instagram: { principal: 10, nicho: 8, trending: 12 },
      facebook: { principal: 5, nicho: 5, trending: 5 },
      linkedin: { principal: 5, nicho: 3, trending: 2 },
      twitter: { principal: 3, nicho: 2, trending: 2 }
    };

    const limite = limites[plataforma] || limites.instagram;

    const prompt = `Você é um especialista em marketing digital e geração de hashtags estratégicas.

TEXTO DO POST:
"${texto}"

PLATAFORMA: ${plataforma}
${objetivo ? `OBJETIVO: ${objetivo}` : ''}
${nicho ? `NICHO: ${nicho}` : ''}

Gere hashtags ESTRATÉGICAS seguindo esta estrutura:

1. PRINCIPAIS (${limite.principal}): Hashtags de alto volume, relacionadas ao tema central
2. NICHO (${limite.nicho}): Hashtags específicas do nicho/setor, médio volume
3. TRENDING (${limite.trending}): Hashtags em alta no momento, relacionadas ao contexto

REGRAS CRÍTICAS:
- Use APENAS português brasileiro
- Hashtags devem ser relevantes ao texto
- Priorize hashtags com engagement real
- Evite hashtags genéricas demais (#love, #instagood)
- Considere localização quando aplicável (#saopaulo, #brasil)
- Para LinkedIn, foque em profissionalismo
- Para Instagram, misture popularidade e nicho

Retorne APENAS um JSON válido:
{
  "hashtags_principais": ["#exemplo1", "#exemplo2"],
  "hashtags_nicho": ["#nicho1", "#nicho2"],
  "hashtags_trending": ["#trending1", "#trending2"],
  "justificativa": "Breve explicação da estratégia"
}`;

    console.log('🏷️ Gerando hashtags com IA...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em marketing digital focado em hashtags estratégicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Nenhuma resposta da IA');
    }

    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Formato de resposta inválido');
    }

    const hashtags = JSON.parse(jsonMatch[0]);

    console.log('✅ Hashtags geradas com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        hashtags_principais: hashtags.hashtags_principais || [],
        hashtags_nicho: hashtags.hashtags_nicho || [],
        hashtags_trending: hashtags.hashtags_trending || [],
        justificativa: hashtags.justificativa || '',
        plataforma,
        total: [
          ...hashtags.hashtags_principais,
          ...hashtags.hashtags_nicho,
          ...hashtags.hashtags_trending
        ].length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao gerar hashtags:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
