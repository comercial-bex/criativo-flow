import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { post_id, texto_original, tipo_conteudo, objetivo } = await req.json();

    console.log(`[gerar-variacoes-ab] Post: ${post_id}`);

    // 1. Buscar dados do post
    const { data: post, error: postError } = await supabaseClient
      .from('posts_planejamento')
      .select('*, planejamento_editorial(cliente_id, titulo)')
      .eq('id', post_id)
      .single();

    if (postError) throw postError;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY não configurado');

    // 2. Gerar 3 variações com abordagens diferentes
    const prompt = `Você é um copywriter especialista em testes A/B para redes sociais.

TEXTO ORIGINAL:
${texto_original}

CONTEXTO:
- Tipo de conteúdo: ${tipo_conteudo}
- Formato: ${post.formato_postagem}
- Objetivo: ${objetivo || 'gerar engajamento'}

TAREFA:
Crie 3 variações do texto acima, cada uma com uma abordagem diferente para teste A/B:

VARIAÇÃO A: Abordagem Emocional
- Use storytelling e apelo emocional
- Framework: PAS (Problem-Agitate-Solution)
- Foco em conexão emocional com a audiência

VARIAÇÃO B: Abordagem Racional
- Use dados, fatos e argumentos lógicos
- Framework: AIDA (Attention-Interest-Desire-Action)
- Foco em benefícios concretos e mensuráveis

VARIAÇÃO C: Abordagem de Urgência + Social Proof
- Use gatilhos de escassez e prova social
- Framework: CTA direto com urgência
- Foco em ação imediata

IMPORTANTE:
- Mantenha o mesmo tamanho aproximado do original
- Preserve hashtags e menções se houver
- Cada variação deve ter CTA claro
- Adeque ao formato ${post.formato_postagem}

RETORNE JSON:
{
  "variacoes": [
    {
      "letra": "A",
      "texto": "texto da variação A",
      "abordagem": "emocional",
      "framework": "PAS",
      "destaque": "Ponto forte desta variação"
    },
    {
      "letra": "B",
      "texto": "texto da variação B",
      "abordagem": "racional",
      "framework": "AIDA",
      "destaque": "Ponto forte desta variação"
    },
    {
      "letra": "C",
      "texto": "texto da variação C",
      "abordagem": "urgencia_social",
      "framework": "CTA",
      "destaque": "Ponto forte desta variação"
    }
  ],
  "recomendacao_teste": "Sugestão de como distribuir o teste entre as variações"
}

Retorne APENAS o JSON válido.`;

    // 3. Chamar IA
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit excedido' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const resultado = JSON.parse(aiData.choices[0].message.content);

    // 4. Salvar variações no banco
    const testeNome = `AB_${post_id.substring(0, 8)}_${Date.now()}`;
    const variacoesInseridas = [];

    for (const variacao of resultado.variacoes) {
      const { data: variacaoInserida, error: insertError } = await supabaseClient
        .from('post_ab_variations')
        .insert({
          post_id,
          cliente_id: post.planejamento_editorial.cliente_id,
          teste_nome: testeNome,
          variacao_letra: variacao.letra,
          texto_estruturado: variacao.texto,
          abordagem: variacao.abordagem,
          framework_usado: variacao.framework,
          is_ativa: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir variação:', insertError);
      } else {
        variacoesInseridas.push({
          ...variacaoInserida,
          destaque: variacao.destaque
        });
      }
    }

    console.log(`✅ ${variacoesInseridas.length} variações criadas para teste ${testeNome}`);

    return new Response(
      JSON.stringify({
        success: true,
        teste_nome: testeNome,
        variacoes: variacoesInseridas,
        recomendacao_teste: resultado.recomendacao_teste
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[gerar-variacoes-ab] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
