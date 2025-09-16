import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { prompt } = await req.json();
    
    console.log('Gerando conteúdo com prompt:', prompt);

    // Detectar se é um prompt para JSON ou texto simples
    const isJsonRequest = prompt.includes('JSON') || prompt.includes('json') || prompt.includes('Formate a resposta em JSON');

    const systemContent = isJsonRequest 
      ? 'Você é um especialista em marketing digital e criação de conteúdo para redes sociais. Responda sempre em formato JSON válido com a estrutura solicitada.'
      : 'Você é um especialista em marketing digital e criação de personas. Responda em texto corrido, bem formatado e de fácil leitura.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemContent
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    console.log('Conteúdo gerado:', generatedText);

    // Se é request JSON, tentar parsear
    if (isJsonRequest) {
      let parsedContent;
      try {
        // Limpar o texto antes de parsear
        let cleanText = generatedText.trim();
        
        // Remover markdown code blocks se existirem
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        parsedContent = JSON.parse(cleanText);
        
        // Verificar se é array direto ou objeto com propriedades
        if (Array.isArray(parsedContent)) {
          console.log('Resposta é array direto:', parsedContent.length, 'posts');
          return new Response(JSON.stringify(parsedContent), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (parsedContent.posts || parsedContent.reels || parsedContent.carrosseis) {
          // Converter estrutura antiga para array
          let allPosts = [];
          if (parsedContent.posts) allPosts = allPosts.concat(parsedContent.posts);
          if (parsedContent.reels) allPosts = allPosts.concat(parsedContent.reels);
          if (parsedContent.carrosseis) allPosts = allPosts.concat(parsedContent.carrosseis);
          
          console.log('Convertendo estrutura para array:', allPosts.length, 'posts');
          return new Response(JSON.stringify(allPosts), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error('Estrutura JSON inválida');
        }
        
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        console.log('Texto original:', generatedText);
        
        // Fallback: criar array de posts padrão
        const fallbackPosts = [
          {
            titulo: "Post Inspiracional",
            objetivo_postagem: "Engajamento",
            tipo_criativo: "post_simples",
            formato_postagem: "post",
            legenda: "🌟 Inspire-se todos os dias! A criatividade é o que move nossos sonhos para a realidade. Venha descobrir como podemos ajudar você a criar algo incrível! ✨ #inspiracao #criatividade #sonhos #realizacao #motivacao",
            componente_hesec: "HESEC: Emoções",
            persona_alvo: "Maria da Costura"
          },
          {
            titulo: "Dica Valiosa", 
            objetivo_postagem: "Educação",
            tipo_criativo: "post_simples",
            formato_postagem: "post",
            legenda: "💡 Dica do dia: Escolher o tecido certo faz toda a diferença no seu projeto! Venha conhecer nossa seleção exclusiva e deixe sua criação ainda mais especial. 🧵 #dicas #tecidos #qualidade #projetos #conhecimento",
            componente_hesec: "HESEC: Educação",
            persona_alvo: "Lucas Designer"
          }
        ];
        
        console.log('Usando fallback com', fallbackPosts.length, 'posts');
        return new Response(JSON.stringify(fallbackPosts), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Para requests de texto simples, retornar o texto diretamente
      return new Response(JSON.stringify(generatedText), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erro na geração de conteúdo:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erro ao gerar conteúdo', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});