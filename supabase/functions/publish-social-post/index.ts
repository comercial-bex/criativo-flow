// Publicação de posts nas redes sociais
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostData {
  titulo: string;
  legenda: string;
  anexo_url?: string;
  formato: string;
  platforms: string[];
  cliente_id?: string;
  responsavel_id?: string;
}

interface PublishResult {
  platform: string;
  success: boolean;
  post_id?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const postData: PostData = await req.json();
    console.log('📝 Dados do post recebidos:', postData);

    // Buscar integrações ativas do usuário para as plataformas selecionadas
    const { data: integrations, error: integrationError } = await supabase
      .from('social_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('provider', postData.platforms);

    if (integrationError) {
      console.error('❌ Erro ao buscar integrações:', integrationError);
      throw integrationError;
    }

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma integração ativa encontrada para as plataformas selecionadas' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔗 Encontradas ${integrations.length} integrações ativas`);

    const results: PublishResult[] = [];

    // Publicar em cada plataforma
    for (const integration of integrations) {
      try {
        console.log(`📤 Publicando no ${integration.provider}...`);
        
        let publishResult: PublishResult = {
          platform: integration.provider,
          success: false
        };

        if (integration.provider === 'facebook') {
          publishResult = await publishToFacebook(integration, postData);
        } else if (integration.provider === 'instagram') {
          publishResult = await publishToInstagram(integration, postData);
        } else if (integration.provider === 'linkedin') {
          publishResult = await publishToLinkedIn(integration, postData);
        } else {
          publishResult.error = `Plataforma ${integration.provider} não suportada`;
        }

        results.push(publishResult);

        // Log da tentativa de publicação
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'social_publish',
          before: { platform: integration.provider },
          after: publishResult
        });

      } catch (error: any) {
        console.error(`❌ Erro ao publicar no ${integration.provider}:`, error);
        results.push({
          platform: integration.provider,
          success: false,
          error: error?.message || 'Erro desconhecido'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Publicação concluída: ${successCount}/${results.length} sucessos`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Post publicado em ${successCount}/${results.length} plataformas`,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erro geral na publicação:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Erro desconhecido'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Função para publicar no Facebook
async function publishToFacebook(integration: any, postData: PostData): Promise<PublishResult> {
  try {
    const pageId = integration.account_data?.id || integration.provider_user_id;
    const accessToken = integration.access_token;

    let endpoint = `https://graph.facebook.com/${pageId}/feed`;
    let payload: any = {
      message: `${postData.titulo}\n\n${postData.legenda}`,
      access_token: accessToken
    };

    // Se tem imagem/vídeo
    if (postData.anexo_url) {
      if (postData.formato === 'reel' || postData.anexo_url.includes('.mp4')) {
        endpoint = `https://graph.facebook.com/${pageId}/videos`;
        payload = {
          description: `${postData.titulo}\n\n${postData.legenda}`,
          file_url: postData.anexo_url,
          access_token: accessToken
        };
      } else {
        endpoint = `https://graph.facebook.com/${pageId}/photos`;
        payload = {
          caption: `${postData.titulo}\n\n${postData.legenda}`,
          url: postData.anexo_url,
          access_token: accessToken
        };
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.id) {
      return {
        platform: 'facebook',
        success: true,
        post_id: result.id
      };
    } else {
      return {
        platform: 'facebook',
        success: false,
        error: result.error?.message || 'Erro desconhecido'
      };
    }
  } catch (error: any) {
    return {
      platform: 'facebook',
      success: false,
      error: error?.message || 'Erro desconhecido'
    };
  }
}

// Função para publicar no Instagram
async function publishToInstagram(integration: any, postData: PostData): Promise<PublishResult> {
  try {
    const instagramAccountId = integration.account_data?.instagram_business_account?.id;
    
    if (!instagramAccountId) {
      return {
        platform: 'instagram',
        success: false,
        error: 'Conta Instagram Business não encontrada'
      };
    }

    const accessToken = integration.access_token;
    
    if (!postData.anexo_url) {
      return {
        platform: 'instagram',
        success: false,
        error: 'Instagram requer imagem ou vídeo'
      };
    }

    // Primeiro, criar a mídia
    const createMediaEndpoint = `https://graph.facebook.com/${instagramAccountId}/media`;
    const mediaPayload: any = {
      caption: `${postData.titulo}\n\n${postData.legenda}`,
      access_token: accessToken
    };

    if (postData.anexo_url.includes('.mp4') || postData.formato === 'reel') {
      mediaPayload.media_type = 'VIDEO';
      mediaPayload.video_url = postData.anexo_url;
    } else {
      mediaPayload.image_url = postData.anexo_url;
    }

    const createResponse = await fetch(createMediaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediaPayload)
    });

    const createResult = await createResponse.json();

    if (!createResponse.ok || !createResult.id) {
      return {
        platform: 'instagram',
        success: false,
        error: createResult.error?.message || 'Erro ao criar mídia'
      };
    }

    // Aguardar processamento da mídia
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Publicar a mídia
    const publishEndpoint = `https://graph.facebook.com/${instagramAccountId}/media_publish`;
    const publishPayload = {
      creation_id: createResult.id,
      access_token: accessToken
    };

    const publishResponse = await fetch(publishEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishPayload)
    });

    const publishResult = await publishResponse.json();

    if (publishResponse.ok && publishResult.id) {
      return {
        platform: 'instagram',
        success: true,
        post_id: publishResult.id
      };
    } else {
      return {
        platform: 'instagram',
        success: false,
        error: publishResult.error?.message || 'Erro ao publicar'
      };
    }
  } catch (error: any) {
    return {
      platform: 'instagram',
      success: false,
      error: error?.message || 'Erro desconhecido'
    };
  }
}

// Função para publicar no LinkedIn
async function publishToLinkedIn(integration: any, postData: PostData): Promise<PublishResult> {
  try {
    const accessToken = integration.access_token;
    const authorId = `urn:li:person:${integration.provider_user_id}`;

    const endpoint = 'https://api.linkedin.com/v2/ugcPosts';
    const payload = {
      author: authorId,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${postData.titulo}\n\n${postData.legenda}`
          },
          shareMediaCategory: postData.anexo_url ? 'IMAGE' : 'NONE',
          ...(postData.anexo_url && {
            media: [{
              status: 'READY',
              description: {
                text: postData.titulo
              },
              media: postData.anexo_url,
              title: {
                text: postData.titulo
              }
            }]
          })
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.id) {
      return {
        platform: 'linkedin',
        success: true,
        post_id: result.id
      };
    } else {
      return {
        platform: 'linkedin',
        success: false,
        error: result.message || 'Erro desconhecido'
      };
    }
  } catch (error: any) {
    return {
      platform: 'linkedin',
      success: false,
      error: error?.message || 'Erro desconhecido'
    };
  }
}