import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Edge function iniciada, método:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo a OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('❌ API key do OpenAI não configurada');
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await req.json();
    console.log('📝 Prompt recebido. Tamanho:', prompt.length);
    
    if (!prompt) {
      console.error('❌ Prompt não fornecido no body');
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detectar se é um prompt para JSON ou texto simples
    const isJsonRequest = prompt.includes('JSON') || prompt.includes('json') || prompt.includes('Formate a resposta em JSON');

    const systemContent = isJsonRequest 
      ? `Você é um especialista em marketing digital e criação de conteúdo para redes sociais seguindo o formato de calendário editorial específico. 

FORMATO OBRIGATÓRIO DO CALENDÁRIO EDITORIAL:
Cada post deve seguir exatamente esta estrutura:
POST | DIA DA SEMANA | CRIATIVO | OBJETIVO | LEGENDA

ESTRUTURA JSON OBRIGATÓRIA PARA CADA POST:
{
  "post": "Número sequencial (01, 02, 03, etc.)",
  "dia_semana": "Nome do dia da semana (SEGUNDA, TERÇA, QUARTA, etc.)",
  "criativo": "IMAGEM|VÍDEO|CARROSEL",
  "objetivo": "Descrição clara e específica do objetivo do post (2-3 linhas)",
  "legenda": "Legenda completa com texto envolvente e hashtags relevantes no final",
  "titulo": "Título engajador para identificação interna",
  "objetivo_postagem": "Engajamento|Vendas|Educação|Relacionamento|Branding",
  "tipo_criativo": "post|carrossel|stories",
  "formato_postagem": "post|reel|story",
  "componente_hesec": "Framework aplicado",
  "persona_alvo": "Persona específica",
  "call_to_action": "CTA específico",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "contexto_estrategico": "Justificativa estratégica"
}

DIRETRIZES OBRIGATÓRIAS:
1. CRIATIVO deve ser: IMAGEM, VÍDEO ou CARROSEL (exatamente como especificado)
2. DIA_SEMANA deve ser o nome completo: SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SÁBADO, DOMINGO
3. POST deve ser numeração sequencial: 01, 02, 03, etc.
4. OBJETIVO deve ser uma descrição clara e específica (2-3 linhas) do que o post pretende alcançar
5. LEGENDA deve incluir texto envolvente + hashtags estratégicas no final
6. Varie os tipos de CRIATIVO ao longo do calendário (IMAGEM, VÍDEO, CARROSEL)
7. Distribua os posts ao longo dos dias da semana de forma estratégica

IMPORTANTE: Responda APENAS com o JSON válido em formato de array, sem comentários ou texto adicional.`
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
        max_tokens: 4000,
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
        console.log('Texto original:', generatedText.substring(0, 500) + '...');
        
        // Tentar recuperar JSON truncado procurando por um array válido
        try {
          const match = generatedText.match(/\[[\s\S]*\]/);
          if (match) {
            const recoveredJson = JSON.parse(match[0]);
            console.log('JSON recuperado com sucesso:', recoveredJson.length, 'posts');
            return new Response(JSON.stringify(recoveredJson), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (recoveryError) {
          console.log('Falha na recuperação do JSON, usando fallback');
        }
        
        // Fallback: criar array de posts padrão
        const fallbackPosts = [
          {
            titulo: "Post Inspiracional",
            legenda: "🌟 Inspire-se todos os dias! A criatividade é o que move nossos sonhos para a realidade. Cada projeto que criamos é uma extensão dos nossos valores e paixões. Aqui na nossa empresa, acreditamos que a inspiração deve ser constante e acessível a todos. Venha descobrir como podemos ajudar você a transformar suas ideias em realidade! ✨ #inspiracao #criatividade #sonhos #realizacao #motivacao",
            objetivo_postagem: "Engajamento",
            tipo_criativo: "post",
            formato_postagem: "post",
            componente_hesec: "HESEC: Emoções",
            persona_alvo: "Maria da Costura",
            call_to_action: "Venha conhecer nossa loja e se inspire!",
            hashtags: ["#inspiracao", "#criatividade", "#sonhos", "#realizacao", "#motivacao"],
            contexto_estrategico: "Este post visa conectar emocionalmente com Maria da Costura, mostrando que valorizamos a criatividade e os sonhos dos nossos clientes, criando um vínculo emocional que fortalece a relação com a marca."
          },
          {
            titulo: "Dica Valiosa", 
            legenda: "💡 Dica do dia: Escolher o tecido certo faz toda a diferença no seu projeto! A qualidade dos materiais que você utiliza impacta diretamente no resultado final da sua criação. Por isso, sempre recomendamos tecidos que combinam durabilidade, beleza e facilidade de trabalho. Nossa equipe está sempre pronta para ajudar você a escolher os melhores materiais para cada tipo de projeto. Venha conhecer nossa seleção exclusiva e deixe sua criação ainda mais especial! 🧵",
            objetivo_postagem: "Educação",
            tipo_criativo: "post",
            formato_postagem: "post",
            componente_hesec: "HESEC: Educação",
            persona_alvo: "Lucas Designer",
            call_to_action: "Solicite orientação da nossa equipe especializada!",
            hashtags: ["#dicas", "#tecidos", "#qualidade", "#projetos", "#conhecimento"],
            contexto_estrategico: "Este post educativo posiciona nossa marca como especialista técnico, fornecendo valor real para Lucas Designer e demonstrando nossa expertise, o que gera confiança e autoridade no mercado."
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