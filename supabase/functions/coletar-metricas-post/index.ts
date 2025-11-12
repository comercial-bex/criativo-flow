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

    const { post_id, metricas } = await req.json();

    console.log(`[coletar-metricas] Post: ${post_id}`);

    // 1. Buscar dados do post
    const { data: post, error: postError } = await supabaseClient
      .from('posts_planejamento')
      .select('*, planejamento_editorial(cliente_id)')
      .eq('id', post_id)
      .single();

    if (postError) throw postError;

    // 2. Calcular métricas
    const totalEngajamentos = (metricas.curtidas || 0) + (metricas.comentarios || 0) + 
                              (metricas.compartilhamentos || 0) + (metricas.salvamentos || 0);
    
    const taxaEngajamento = metricas.alcance > 0 
      ? ((totalEngajamentos / metricas.alcance) * 100).toFixed(2) 
      : 0;
    
    const taxaCliques = metricas.impressoes > 0 
      ? ((metricas.cliques_link || 0) / metricas.impressoes * 100).toFixed(2)
      : 0;

    // Score de performance (0-100)
    const scorePerformance = Math.min(100, (
      (metricas.curtidas * 1) +
      (metricas.comentarios * 3) +
      (metricas.compartilhamentos * 5) +
      (metricas.salvamentos * 7) +
      (metricas.cliques_link * 10)
    ) / 10).toFixed(1);

    // 3. Extrair dados temporais
    const dataPublicacao = new Date(post.data_postagem);
    const diaSemana = dataPublicacao.getDay();
    const horaPublicacao = dataPublicacao.getHours();

    // 4. Inserir métricas
    const { data: metricaInserida, error: insertError } = await supabaseClient
      .from('post_performance_metrics')
      .insert({
        post_id,
        cliente_id: post.planejamento_editorial.cliente_id,
        tipo_conteudo: post.tipo_conteudo,
        formato_postagem: post.formato_postagem,
        dia_semana: diaSemana,
        hora_publicacao: horaPublicacao,
        data_publicacao: post.data_postagem,
        impressoes: metricas.impressoes || 0,
        alcance: metricas.alcance || 0,
        curtidas: metricas.curtidas || 0,
        comentarios: metricas.comentarios || 0,
        compartilhamentos: metricas.compartilhamentos || 0,
        salvamentos: metricas.salvamentos || 0,
        cliques_link: metricas.cliques_link || 0,
        taxa_engajamento: taxaEngajamento,
        taxa_cliques: taxaCliques,
        score_performance: scorePerformance,
        plataforma: metricas.plataforma || 'instagram',
        texto_estruturado: post.texto_estruturado,
        tinha_cta: post.texto_estruturado?.toLowerCase().includes('clique') || false,
        tinha_hashtags: post.texto_estruturado?.includes('#') || false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`✅ Métricas coletadas com sucesso. Score: ${scorePerformance}`);

    return new Response(
      JSON.stringify({
        success: true,
        metrica: metricaInserida,
        calculado: {
          taxa_engajamento: taxaEngajamento,
          score_performance: scorePerformance
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[coletar-metricas] Error:', error);
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
