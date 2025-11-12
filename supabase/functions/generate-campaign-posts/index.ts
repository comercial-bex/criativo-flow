import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planejamentoId, clienteId, campanhaIds = [], quantidadePorPeriodo = { pre: 3, durante: 5, pos: 2 } } = await req.json();

    console.log(`🎯 Gerando posts para planejamento ${planejamentoId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Buscar campanhas do planejamento
    const { data: campanhas, error: campanhasError } = await supabase
      .from('planejamento_campanhas')
      .select(`
        *,
        data_comemorativa:datas_comemorativas(*)
      `)
      .eq('planejamento_id', planejamentoId)
      .in('id', campanhaIds.length > 0 ? campanhaIds : []);

    if (campanhasError) {
      console.error('Erro ao buscar campanhas:', campanhasError);
      throw campanhasError;
    }

    if (!campanhas || campanhas.length === 0) {
      // Se não houver campanhas, retornar erro amigável
      return new Response(
        JSON.stringify({ 
          error: "Nenhuma campanha selecionada. Adicione datas comemorativas primeiro.",
          postsGerados: []
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📅 Encontradas ${campanhas.length} campanhas`);

    // Buscar dados do cliente para contexto
    const { data: cliente } = await supabase
      .from('clientes')
      .select('nome, segmento')
      .eq('id', clienteId)
      .single();

    // Buscar onboarding para ter contexto da marca
    const { data: onboarding } = await supabase
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();

    // Buscar conteúdo editorial do planejamento
    const { data: conteudoEditorial } = await supabase
      .from('conteudo_editorial')
      .select('missao, posicionamento, persona')
      .eq('planejamento_id', planejamentoId)
      .single();

    const postsGerados: any[] = [];

    // Gerar posts para cada campanha
    for (const campanha of campanhas) {
      const dataComemorativa = campanha.data_comemorativa;
      
      console.log(`📝 Gerando posts para campanha: ${campanha.nome_campanha}`);

      // Calcular datas dos períodos
      const dataInicio = new Date(campanha.data_inicio);
      const dataFim = new Date(campanha.data_fim);
      const diasPreCampanha = campanha.periodo_pre_campanha || 7;
      const diasPosCampanha = campanha.periodo_pos_campanha || 3;

      // Calcular quando começa e termina cada período
      const inicioPre = new Date(dataInicio);
      inicioPre.setDate(inicioPre.getDate() - diasPreCampanha);
      
      const fimDurante = dataFim;
      
      const inicioPos = new Date(dataFim);
      inicioPos.setDate(inicioPos.getDate() + 1);
      
      const fimPos = new Date(dataFim);
      fimPos.setDate(fimPos.getDate() + diasPosCampanha);

      // Preparar contexto para a IA
      const systemPrompt = `Você é um especialista em marketing de conteúdo e redes sociais, especializado em criar posts estratégicos para datas comemorativas.

**SUA MISSÃO:**
Criar posts temáticos para a campanha "${campanha.nome_campanha}" considerando 3 períodos estratégicos:
1. **Pré-campanha (${diasPreCampanha} dias antes)**: Criar antecipação e awareness
2. **Durante a campanha**: Ápice da conversão e engajamento
3. **Pós-campanha (${diasPosCampanha} dias depois)**: Prolongar resultados e agradecer

**DADOS DA DATA COMEMORATIVA:**
- Nome: ${dataComemorativa.nome}
- Descrição: ${dataComemorativa.descricao}
- Potencial de Engajamento: ${dataComemorativa.potencial_engajamento}
- Sugestão de Campanha: ${dataComemorativa.sugestao_campanha}
- Tipo: ${dataComemorativa.tipo}
- Segmentos Relevantes: ${Array.isArray(dataComemorativa.segmentos) ? dataComemorativa.segmentos.join(', ') : 'Geral'}

**CONTEXTO DA MARCA:**
- Cliente: ${cliente?.nome}
- Segmento: ${cliente?.segmento || onboarding?.segmento_atuacao}
- Missão: ${conteudoEditorial?.missao || 'Não informado'}
- Posicionamento: ${conteudoEditorial?.posicionamento || 'Não informado'}
- Público-alvo: ${Array.isArray(onboarding?.publico_alvo) ? onboarding.publico_alvo.join(', ') : 'Não informado'}
- Tom de voz: ${Array.isArray(onboarding?.tom_voz) ? onboarding.tom_voz.join(', ') : 'Profissional e acessível'}

**REGRAS CRÍTICAS:**
1. Cada período deve ter um objetivo claro:
   - Pré: Criar expectativa e educar
   - Durante: Converter e engajar ao máximo
   - Pós: Agradecer e prolongar relacionamento
2. Posts devem ser autênticos e relevantes ao segmento do cliente
3. Usar linguagem adequada ao tom de voz da marca
4. CTAs claros e adequados a cada fase
5. Hashtags estratégicas (5-10 por post)
6. Variar formatos: carrossel, reels, stories, posts estáticos

**FORMATO DE RESPOSTA (JSON puro, sem markdown):**
{
  "posts": [
    {
      "periodo": "pre|durante|pos",
      "data_postagem": "YYYY-MM-DD",
      "titulo": "Título atrativo do post",
      "legenda": "Legenda completa com emojis e quebras de linha",
      "formato_postagem": "post|carrossel|reels|stories",
      "tipo_criativo": "foto|video|infografico|texto",
      "objetivo_postagem": "awareness|conversao|engajamento|educacao",
      "call_to_action": "CTA claro e direto",
      "hashtags": ["hashtag1", "hashtag2", ...],
      "componente_hesec": "Hook|Empatia|Solução|Evidência|Call to Action",
      "contexto_estrategico": "Breve explicação da estratégia do post"
    }
  ]
}`;

      const userPrompt = `Gere posts para a campanha "${campanha.nome_campanha}":

**QUANTIDADE DE POSTS POR PERÍODO:**
- Pré-campanha (${inicioPre.toLocaleDateString('pt-BR')} a ${dataInicio.toLocaleDateString('pt-BR')}): ${quantidadePorPeriodo.pre} posts
- Durante campanha (${dataInicio.toLocaleDateString('pt-BR')} a ${fimDurante.toLocaleDateString('pt-BR')}): ${quantidadePorPeriodo.durante} posts
- Pós-campanha (${inicioPos.toLocaleDateString('pt-BR')} a ${fimPos.toLocaleDateString('pt-BR')}): ${quantidadePorPeriodo.pos} posts

**TOTAL:** ${quantidadePorPeriodo.pre + quantidadePorPeriodo.durante + quantidadePorPeriodo.pos} posts

Distribua as datas de forma equilibrada em cada período. Varie os formatos e componentes HESEC.
Retorne APENAS o JSON, sem markdown.`;

      console.log(`🤖 Chamando IA para gerar ${quantidadePorPeriodo.pre + quantidadePorPeriodo.durante + quantidadePorPeriodo.pos} posts`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit excedido. Aguarde e tente novamente." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos Lovable AI insuficientes. Adicione em Settings → Workspace → Usage." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error('Erro da API Lovable:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Resposta vazia da IA");
      }

      // Extrair JSON
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      }

      if (!jsonMatch) {
        console.error("Resposta da IA não contém JSON:", content);
        throw new Error("Resposta da IA inválida");
      }

      const resultado = JSON.parse(jsonMatch[0]);

      // Adicionar metadata aos posts
      if (resultado.posts && Array.isArray(resultado.posts)) {
        resultado.posts.forEach((post: any) => {
          postsGerados.push({
            ...post,
            campanha_id: campanha.id,
            planejamento_id: planejamentoId,
            data_comemorativa_nome: dataComemorativa.nome,
            periodo_campanha: post.periodo
          });
        });
      }

      console.log(`✅ ${resultado.posts?.length || 0} posts gerados para ${campanha.nome_campanha}`);
    }

    console.log(`🎉 Total de ${postsGerados.length} posts gerados para ${campanhas.length} campanhas`);

    return new Response(
      JSON.stringify({
        success: true,
        postsGerados,
        metadata: {
          total_posts: postsGerados.length,
          total_campanhas: campanhas.length,
          campanhas: campanhas.map(c => ({
            nome: c.nome_campanha,
            data_inicio: c.data_inicio,
            data_fim: c.data_fim,
            posts_pre: postsGerados.filter(p => p.campanha_id === c.id && p.periodo === 'pre').length,
            posts_durante: postsGerados.filter(p => p.campanha_id === c.id && p.periodo === 'durante').length,
            posts_pos: postsGerados.filter(p => p.campanha_id === c.id && p.periodo === 'pos').length,
          }))
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Erro ao gerar posts de campanha:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erro desconhecido",
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
