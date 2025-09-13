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
        parsedContent = JSON.parse(generatedText);
      } catch {
        // Se não conseguir parsear, criar estrutura padrão
        parsedContent = {
          posts: [
            {
              titulo: "Post Inspiracional",
              descricao: "Conteúdo motivacional para engajar a audiência",
              hashtags: ["#motivacao", "#inspiracao", "#empreendedorismo"],
              objetivo: "Engajamento",
              formato: "post"
            },
            {
              titulo: "Dica Valiosa", 
              descricao: "Compartilhe conhecimento útil para seu público",
              hashtags: ["#dicas", "#conhecimento", "#aprendizado"],
              objetivo: "Educação",
              formato: "post"
            }
          ],
          reels: [
            {
              titulo: "Tutorial Rápido",
              descricao: "Como fazer algo em 60 segundos",
              hashtags: ["#tutorial", "#pratico", "#rapido"],
              objetivo: "Educação",
              formato: "reel"
            }
          ],
          carrosseis: [
            {
              titulo: "Guia Completo",
              descricao: "Passo a passo detalhado sobre o tema",
              hashtags: ["#guia", "#passoapasso", "#completo"],
              objetivo: "Educação", 
              formato: "carrossel"
            }
          ]
        };
      }
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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