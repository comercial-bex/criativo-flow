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
      ? `Você é um especialista em marketing digital e criação de conteúdo para redes sociais seguindo o MODELO BEX. 

CONTEXTO ESTRATÉGICO:
- Gere conteúdo baseado nas personas, posicionamento e objetivos da empresa
- Cada post deve ter justificativa estratégica clara
- Legendas devem ser completas (150-300 palavras) com narrativa envolvente
- Include call-to-actions específicos para cada persona
- Use hashtags estratégicas baseadas no posicionamento da marca

ESTRUTURA OBRIGATÓRIA PARA CADA POST:
{
  "titulo": "Título engajador e específico",
  "legenda": "Legenda completa de 150-300 palavras com emojis, narrativa e CTA específico",
  "objetivo_postagem": "Engajamento|Vendas|Educação|Relacionamento|Branding",
  "tipo_criativo": "post|carrossel|stories",
  "formato_postagem": "post|reel|story", 
  "componente_hesec": "Componente específico do framework (ex: HESEC: Histórias)",
  "persona_alvo": "Nome da persona específica",
  "call_to_action": "CTA específico e personalizado para a persona",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "contexto_estrategico": "Explicação de 2-3 linhas do por que este post, como ele atinge a persona e qual resultado esperado"
}

DIRETRIZES OBRIGATÓRIAS:
1. Legendas COMPLETAS com início envolvente, desenvolvimento e CTA claro
2. Contexto estratégico explicando o motivo de cada post
3. CTAs personalizados por persona (não genéricos)
4. Hashtags balanceadas: marca + nicho + localização + trending
5. Componentes H.E.S.E.C específicos e aplicados corretamente

IMPORTANTE: Responda APENAS com o JSON válido, sem comentários ou texto adicional.`
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