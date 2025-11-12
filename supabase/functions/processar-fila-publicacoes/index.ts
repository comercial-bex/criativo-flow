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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('[processar-fila] Iniciando processamento da fila...');

    // 1. Buscar posts pendentes para publicação
    const agora = new Date();
    const { data: filaItems, error: filaError } = await supabaseClient
      .from('publicacao_queue')
      .select('*')
      .eq('status', 'pendente')
      .lte('data_agendamento', agora.toISOString())
      .lt('tentativas', 'max_tentativas')
      .order('data_agendamento', { ascending: true })
      .limit(10);

    if (filaError) throw filaError;

    if (!filaItems || filaItems.length === 0) {
      console.log('[processar-fila] Nenhum post para publicar no momento');
      return new Response(
        JSON.stringify({ success: true, processados: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[processar-fila] ${filaItems.length} posts para processar`);

    const resultados = [];

    // 2. Processar cada item da fila
    for (const item of filaItems) {
      try {
        // Marcar como processando
        await supabaseClient
          .from('publicacao_queue')
          .update({ 
            status: 'processando',
            tentativas: item.tentativas + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        const resultadoPlataformas: any = {};

        // 3. Publicar em cada plataforma
        for (const plataforma of item.plataformas) {
          try {
            if (plataforma === 'instagram') {
              const resultado = await publicarInstagram(item, supabaseClient);
              resultadoPlataformas.instagram = resultado;
            } else if (plataforma === 'facebook') {
              const resultado = await publicarFacebook(item, supabaseClient);
              resultadoPlataformas.facebook = resultado;
            } else if (plataforma === 'linkedin') {
              const resultado = await publicarLinkedIn(item, supabaseClient);
              resultadoPlataformas.linkedin = resultado;
            }
          } catch (platformError: any) {
            console.error(`Erro ao publicar no ${plataforma}:`, platformError);
            resultadoPlataformas[plataforma] = {
              success: false,
              error: platformError.message
            };
          }
        }

        // 4. Verificar se todas as publicações foram bem-sucedidas
        const todasSucesso = Object.values(resultadoPlataformas).every((r: any) => r.success);

        // 5. Atualizar status do item
        await supabaseClient
          .from('publicacao_queue')
          .update({
            status: todasSucesso ? 'publicado' : 'erro',
            resultado: resultadoPlataformas,
            publicado_at: todasSucesso ? new Date().toISOString() : null,
            erro_mensagem: todasSucesso ? null : JSON.stringify(resultadoPlataformas),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        // 6. Atualizar status do post
        if (todasSucesso) {
          await supabaseClient
            .from('posts_planejamento')
            .update({ status_post: 'publicado' })
            .eq('id', item.post_id);
        }

        resultados.push({
          item_id: item.id,
          post_id: item.post_id,
          success: todasSucesso,
          plataformas: resultadoPlataformas
        });

      } catch (itemError: any) {
        console.error(`Erro ao processar item ${item.id}:`, itemError);
        await supabaseClient
          .from('publicacao_queue')
          .update({
            status: 'erro',
            erro_mensagem: itemError.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
      }
    }

    console.log(`[processar-fila] ✅ Processados ${resultados.length} itens`);

    return new Response(
      JSON.stringify({
        success: true,
        processados: resultados.length,
        resultados
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[processar-fila] Error:', error);
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

async function publicarInstagram(item: any, supabase: any): Promise<any> {
  console.log(`[Instagram] Publicando post ${item.post_id}`);
  
  // Buscar token de acesso do cliente
  const { data: integration } = await supabase
    .from('social_integrations_cliente')
    .select('access_token, page_id')
    .eq('cliente_id', item.cliente_id)
    .eq('provider', 'instagram')
    .eq('is_active', true)
    .single();

  if (!integration) {
    throw new Error('Integração do Instagram não encontrada ou inativa');
  }

  // Criar container de mídia
  const mediaUrl = item.imagem_url || item.video_url;
  const isVideo = !!item.video_url;

  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${integration.page_id}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [isVideo ? 'video_url' : 'image_url']: mediaUrl,
        caption: item.texto_publicacao,
        access_token: integration.access_token
      })
    }
  );

  if (!containerResponse.ok) {
    const error = await containerResponse.json();
    throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
  }

  const { id: containerId } = await containerResponse.json();

  // Publicar container
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${integration.page_id}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: integration.access_token
      })
    }
  );

  if (!publishResponse.ok) {
    const error = await publishResponse.json();
    throw new Error(`Instagram publish error: ${JSON.stringify(error)}`);
  }

  const publishData = await publishResponse.json();

  return {
    success: true,
    post_id: publishData.id,
    platform: 'instagram'
  };
}

async function publicarFacebook(item: any, supabase: any): Promise<any> {
  console.log(`[Facebook] Publicando post ${item.post_id}`);
  
  const { data: integration } = await supabase
    .from('social_integrations_cliente')
    .select('access_token, page_id')
    .eq('cliente_id', item.cliente_id)
    .eq('provider', 'facebook')
    .eq('is_active', true)
    .single();

  if (!integration) {
    throw new Error('Integração do Facebook não encontrada ou inativa');
  }

  const endpoint = item.imagem_url || item.video_url 
    ? `https://graph.facebook.com/v18.0/${integration.page_id}/photos`
    : `https://graph.facebook.com/v18.0/${integration.page_id}/feed`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: item.texto_publicacao,
      url: item.imagem_url || item.video_url,
      access_token: integration.access_token
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  return {
    success: true,
    post_id: data.id,
    platform: 'facebook'
  };
}

async function publicarLinkedIn(item: any, supabase: any): Promise<any> {
  console.log(`[LinkedIn] Publicando post ${item.post_id}`);
  
  const { data: integration } = await supabase
    .from('social_integrations_cliente')
    .select('access_token, page_id')
    .eq('cliente_id', item.cliente_id)
    .eq('provider', 'linkedin')
    .eq('is_active', true)
    .single();

  if (!integration) {
    throw new Error('Integração do LinkedIn não encontrada ou inativa');
  }

  const payload: any = {
    author: `urn:li:organization:${integration.page_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: item.texto_publicacao
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integration.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  return {
    success: true,
    post_id: data.id,
    platform: 'linkedin'
  };
}
