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
    const { prompt, type = 'text', model = 'gemini' } = await req.json();
    
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
    
    // Configure API based on model selection
    let apiUrl: string;
    let apiKey: string | undefined;
    let modelName: string;

    if (model === 'gpt4') {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      apiKey = Deno.env.get('OPENAI_API_KEY');
      modelName = "gpt-4.1-2025-04-14";
      
      if (!apiKey) {
        console.warn('⚠️ OPENAI_API_KEY not configured, falling back to Lovable AI');
        // Auto-fallback to Lovable AI
        apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
        apiKey = Deno.env.get('LOVABLE_API_KEY');
        modelName = "google/gemini-2.5-flash";
      }
    } else {
      // Default to Lovable AI (Gemini)
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get('LOVABLE_API_KEY');
      modelName = "google/gemini-2.5-flash";
    }

    if (!apiKey) {
      throw new Error('No AI API key configured');
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

    console.log(`🤖 Using AI model: ${modelName}`);

    const requestBody: any = {
      model: modelName,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: shouldReturnJSON ? 4000 : 2000
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error (${modelName}):`, errorText);
      
      // Handle rate limits and payment errors
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      if (response.status === 402) {
        throw new Error('Insufficient credits. Please add credits to your Lovable AI workspace.');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
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
      generatedText: generatedText,  // Padronizado para frontend
      content: generatedText,         // Mantido para retrocompatibilidade
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