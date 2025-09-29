import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { prompt, type = 'text' } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('🤖 AI Content Generation Request:', { prompt, type });

    // Determine if we need structured JSON output
    const shouldReturnJSON = type === 'json' || type === 'hashtags' || prompt.toLowerCase().includes('calendario editorial') || prompt.toLowerCase().includes('posts');

    // Build system message based on content type
    let systemMessage = 'Você é um especialista em marketing digital e criação de conteúdo para redes sociais.';
    
    switch (type) {
      case 'post':
        systemMessage += ' Crie posts criativos e envolventes para redes sociais, sempre com call-to-action.';
        break;
      case 'legenda':
        systemMessage += ' Crie legendas cativantes para fotos e vídeos, com emojis apropriados e hashtags relevantes.';
        break;
      case 'hashtags':
        systemMessage += ' Gere hashtags relevantes e populares. Retorne uma lista de hashtags separadas por espaço.';
        break;
      case 'swot':
        systemMessage += ' Realize análises SWOT profissionais e detalhadas em formato estruturado.';
        break;
      default:
        systemMessage += ' Crie conteúdo profissional e relevante para marketing digital.';
    }
    
    if (shouldReturnJSON) {
      systemMessage = `Você é um especialista em marketing digital. Sempre responda APENAS com JSON válido seguindo esta estrutura exata para calendário editorial:

{
  "posts": [
    {
      "titulo": "Título do post",
      "objetivo_postagem": "Objetivo específico",
      "tipo_criativo": "Imagem/Vídeo/Carrossel",
      "formato_postagem": "Post/Stories/Reels",
      "data_postagem": "YYYY-MM-DD",
      "legenda": "Caption elaborada do post",
      "headline": "Manchete/Título chamativo",
      "conteudo_completo": "Para vídeo: roteiro técnico detalhado. Para post/carrossel: conteúdo elaborado",
      "hashtags": ["#tag1", "#tag2"],
      "call_to_action": "CTA específico",
      "persona_alvo": "Persona específica",
      "componente_hesec": "Hook/Engajamento/Social Proof/Call to Action"
    }
  ]
}

IMPORTANTE: 
- Para VÍDEOS/REELS: "conteudo_completo" deve ser um roteiro técnico detalhado
- Para POSTS/CARROSSEL: "conteudo_completo" deve ser o conteúdo elaborado da postagem
- Sempre inclua todos os campos obrigatórios
- Use datas sequenciais começando pela data fornecida
- NÃO adicione comentários ou texto fora do JSON`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: shouldReturnJSON ? 4000 : 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('✅ Content generated successfully, length:', generatedText.length);

    if (shouldReturnJSON) {
      try {
        // Limpar possível markdown do JSON
        let cleanJson = generatedText.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Tentar parsear o JSON
        const parsedContent = JSON.parse(cleanJson);
        
        // Validar estrutura
        if (!parsedContent.posts || !Array.isArray(parsedContent.posts)) {
          throw new Error('Invalid JSON structure: missing posts array');
        }

        console.log('Successfully parsed JSON with', parsedContent.posts.length, 'posts');

        return new Response(JSON.stringify({ 
          generatedText: JSON.stringify(parsedContent),
          type: 'json',
          success: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Raw response:', generatedText);
        
        // Fallback: tentar recuperar ou retornar estrutura padrão
        const fallbackContent = {
          posts: [
            {
              titulo: "Post de exemplo",
              objetivo_postagem: "Engajar audiência",
              tipo_criativo: "Imagem",
              formato_postagem: "Post",
              data_postagem: new Date().toISOString().split('T')[0],
              legenda: "Conteúdo gerado automaticamente",
              headline: "Título chamativo",
              conteudo_completo: "Conteúdo elaborado da postagem",
              hashtags: ["#marketing", "#digital"],
              call_to_action: "Saiba mais",
              persona_alvo: "Público geral",
              componente_hesec: "Engajamento"
            }
          ]
        };

        return new Response(JSON.stringify({ 
          generatedText: JSON.stringify(fallbackContent),
          type: 'json',
          success: true,
          warning: 'Used fallback content due to parsing error'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Return for simple text or hashtags
    if (type === 'hashtags') {
      // Clean hashtag formatting
      const hashtags = generatedText
        .split(/[\s,\n]+/)
        .filter((tag: string) => tag.trim().startsWith('#'))
        .join(' ');
      
      return new Response(JSON.stringify({ 
        content: hashtags || generatedText,
        type,
        success: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return for simple text
    return new Response(JSON.stringify({ 
      content: generatedText,
      type,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});