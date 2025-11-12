import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo_criativo, tipo_conteudo, titulo, objetivo_postagem, publico_alvo } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    const frameworks = {
      aida: `Atenção → Interesse → Desejo → Ação`,
      cta_direto: `Mensagem direta com CTA poderoso`,
      storytelling: `Contexto → Conflito → Resolução → CTA emocional`
    };
    
    const prompt = `Você é um especialista em copywriting para redes sociais.

Crie uma estrutura de texto para:
- Tipo de Criativo: ${tipo_criativo || 'post'} (reels, card, carrossel, etc)
- Tipo de Conteúdo: ${tipo_conteudo || 'informar'} (informar, inspirar, entreter, vender, posicionar)
- Título: ${titulo || 'Post'}
- Objetivo: ${objetivo_postagem || 'Engajar'}
- Público: ${publico_alvo || 'Público geral'}

Escolha o framework mais adequado (AIDA, CTA direto ou Storytelling) e crie uma estrutura clara e objetiva de 100-200 palavras.

Retorne apenas o texto estruturado, pronto para uso, sem explicações adicionais.`;
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }
    
    const data = await response.json();
    const textoEstruturado = data.choices[0]?.message?.content || '';
    
    return new Response(
      JSON.stringify({ texto_estruturado: textoEstruturado }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
