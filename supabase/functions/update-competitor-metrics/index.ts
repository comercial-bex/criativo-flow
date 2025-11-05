import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetitorAnalysisResponse {
  success: boolean;
  analise?: any;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cliente_id, force_refresh = false, notify_changes = true } = await req.json();

    console.log('🔄 Iniciando atualização de métricas de concorrentes', { cliente_id, force_refresh });

    // Buscar concorrentes ativos
    let query = supabase
      .from('concorrentes_analise')
      .select(`
        id,
        nome_concorrente,
        site_url,
        instagram_url,
        facebook_url,
        tiktok_url,
        youtube_url,
        linkedin_url,
        analise_ia,
        onboarding_id,
        onboarding_clientes!inner(cliente_id)
      `)
      .or('instagram_url.not.is.null,facebook_url.not.is.null,tiktok_url.not.is.null,youtube_url.not.is.null,linkedin_url.not.is.null');

    if (cliente_id) {
      query = query.eq('onboarding_clientes.cliente_id', cliente_id);
    }

    const { data: concorrentes, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Erro ao buscar concorrentes:', fetchError);
      throw fetchError;
    }

    if (!concorrentes || concorrentes.length === 0) {
      console.log('ℹ️ Nenhum concorrente encontrado para atualizar');
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum concorrente para atualizar', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 ${concorrentes.length} concorrentes encontrados`);

    const updates = [];
    const alerts = [];

    for (const concorrente of concorrentes) {
      try {
        console.log(`🔍 Analisando: ${concorrente.nome_concorrente}`);

        // Chamar função de análise de concorrentes
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
          'analyze-competitor',
          {
            body: {
              nome: concorrente.nome_concorrente,
              site: concorrente.site_url,
              instagram: concorrente.instagram_url,
              facebook: concorrente.facebook_url,
              tiktok: concorrente.tiktok_url,
              youtube: concorrente.youtube_url,
              linkedin: concorrente.linkedin_url,
            }
          }
        );

        if (analysisError || !analysisData?.success) {
          console.error(`❌ Erro ao analisar ${concorrente.nome_concorrente}:`, analysisError);
          continue;
        }

        const novaAnalise = analysisData.analise;
        const analiseAnterior = concorrente.analise_ia;

        // Extrair métricas da análise
        const metricas = {
          seguidores_instagram: novaAnalise?.metricas_redes?.instagram?.seguidores || null,
          seguidores_facebook: novaAnalise?.metricas_redes?.facebook?.seguidores || null,
          seguidores_tiktok: novaAnalise?.metricas_redes?.tiktok?.seguidores || null,
          seguidores_youtube: novaAnalise?.metricas_redes?.youtube?.seguidores || null,
          seguidores_linkedin: novaAnalise?.metricas_redes?.linkedin?.seguidores || null,
          engajamento_percent: novaAnalise?.metricas_redes?.engajamento_medio || null,
          frequencia_posts_semana: novaAnalise?.metricas_redes?.frequencia_posts_semana || null,
          media_likes: novaAnalise?.metricas_redes?.media_likes || null,
          media_comments: novaAnalise?.metricas_redes?.media_comentarios || null,
        };

        // Salvar snapshot no histórico
        const { error: histError } = await supabase
          .from('concorrentes_metricas_historico')
          .insert({
            concorrente_id: concorrente.id,
            ...metricas,
            snapshot_completo: novaAnalise,
          });

        if (histError) {
          console.error('❌ Erro ao salvar histórico:', histError);
        } else {
          console.log(`✅ Histórico salvo para ${concorrente.nome_concorrente}`);
        }

        // Atualizar análise atual
        const { error: updateError } = await supabase
          .from('concorrentes_analise')
          .update({
            analise_ia: novaAnalise,
            updated_at: new Date().toISOString(),
          })
          .eq('id', concorrente.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar análise:', updateError);
        }

        // Detectar mudanças significativas (>15%)
        if (notify_changes && analiseAnterior) {
          const mudancas = detectarMudancasSignificativas(analiseAnterior, novaAnalise);
          if (mudancas.length > 0) {
            alerts.push({
              concorrente: concorrente.nome_concorrente,
              mudancas,
            });
          }
        }

        updates.push({
          concorrente: concorrente.nome_concorrente,
          status: 'success',
          metricas,
        });

      } catch (error) {
        console.error(`❌ Erro ao processar ${concorrente.nome_concorrente}:`, error);
        updates.push({
          concorrente: concorrente.nome_concorrente,
          status: 'error',
          error: error.message,
        });
      }

      // Aguardar 2s entre análises para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Criar notificações se houver alertas
    if (alerts.length > 0 && notify_changes) {
      for (const alert of alerts) {
        const mensagem = `${alert.concorrente}: ${alert.mudancas.join(', ')}`;
        
        // Buscar admins para notificar
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (admins) {
          for (const admin of admins) {
            await supabase.from('notificacoes').insert({
              user_id: admin.user_id,
              titulo: '📊 Mudança Competitiva Detectada',
              mensagem,
              tipo: 'info',
              data_evento: new Date().toISOString(),
            });
          }
        }
      }
    }

    console.log(`✅ Atualização concluída: ${updates.filter(u => u.status === 'success').length}/${updates.length} sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.filter(u => u.status === 'success').length,
        failed: updates.filter(u => u.status === 'error').length,
        alerts: alerts.length,
        details: updates,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Função auxiliar para detectar mudanças significativas
function detectarMudancasSignificativas(analiseAnterior: any, novaAnalise: any): string[] {
  const mudancas: string[] = [];
  const threshold = 0.15; // 15%

  const plataformas = ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin'];

  for (const plataforma of plataformas) {
    const seguidoresAntigos = analiseAnterior?.metricas_redes?.[plataforma]?.seguidores;
    const seguidoresNovos = novaAnalise?.metricas_redes?.[plataforma]?.seguidores;

    if (seguidoresAntigos && seguidoresNovos) {
      const variacao = (seguidoresNovos - seguidoresAntigos) / seguidoresAntigos;
      
      if (Math.abs(variacao) > threshold) {
        const sinal = variacao > 0 ? '+' : '';
        const percentual = (variacao * 100).toFixed(1);
        mudancas.push(
          `${plataforma.charAt(0).toUpperCase() + plataforma.slice(1)}: ${sinal}${percentual}% seguidores`
        );
      }
    }
  }

  return mudancas;
}
