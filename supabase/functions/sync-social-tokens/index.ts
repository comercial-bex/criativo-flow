// Auto-refresh de tokens das integrações sociais
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Iniciando sincronização de tokens...');

    // Buscar integrações ativas que expiram nas próximas 24 horas
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

    const { data: integrationsToRefresh, error: fetchError } = await supabase
      .from('social_integrations_cliente')
      .select('*')
      .eq('is_active', true)
      .lt('token_expires_at', twentyFourHoursFromNow.toISOString())
      .not('refresh_token', 'is', null);

    if (fetchError) {
      console.error('❌ Erro ao buscar integrações:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Encontradas ${integrationsToRefresh?.length || 0} integrações para renovar`);

    const results = [];

    for (const integration of integrationsToRefresh || []) {
      try {
        console.log(`🔄 Renovando token para ${integration.provider} - ${integration.account_name}`);

        let newTokenData = null;

        if (integration.provider === 'facebook') {
          // Renovar token do Facebook
          const fbAppId = Deno.env.get('FACEBOOK_APP_ID');
          const fbAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');
          
          if (!fbAppId || !fbAppSecret) {
            console.log('⚠️ Credenciais do Facebook não configuradas');
            continue;
          }

          const response = await fetch(
            `https://graph.facebook.com/oauth/access_token?` +
            `grant_type=fb_exchange_token&` +
            `client_id=${fbAppId}&` +
            `client_secret=${fbAppSecret}&` +
            `fb_exchange_token=${integration.access_token}`
          );

          if (response.ok) {
            const data: FacebookTokenResponse = await response.json();
            newTokenData = {
              access_token: data.access_token,
              token_expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString()
            };
          }
        } else if (integration.provider === 'google') {
          // Renovar token do Google
          const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
          const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
          
          if (!googleClientId || !googleClientSecret || !integration.refresh_token) {
            console.log('⚠️ Credenciais do Google ou refresh token não disponíveis');
            continue;
          }

          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: googleClientId,
              client_secret: googleClientSecret,
              refresh_token: integration.refresh_token,
              grant_type: 'refresh_token'
            }),
          });

          if (response.ok) {
            const data: GoogleTokenResponse = await response.json();
            newTokenData = {
              access_token: data.access_token,
              token_expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
              // O Google pode retornar um novo refresh_token
              ...(data.refresh_token && { refresh_token: data.refresh_token })
            };
          }
        }

        if (newTokenData) {
          const { error: updateError } = await supabase
            .from('social_integrations_cliente')
            .update({
              ...newTokenData,
              updated_at: new Date().toISOString()
            })
            .eq('id', integration.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar token ${integration.provider}:`, updateError);
            results.push({
              integration_id: integration.id,
              provider: integration.provider,
              success: false,
              error: updateError.message
            });
          } else {
            console.log(`✅ Token renovado com sucesso para ${integration.provider}`);
            results.push({
              integration_id: integration.id,
              provider: integration.provider,
              success: true,
              expires_at: newTokenData.token_expires_at
            });
          }
        } else {
          console.log(`⚠️ Falha ao renovar token para ${integration.provider}`);
          results.push({
            integration_id: integration.id,
            provider: integration.provider,
            success: false,
            error: 'Failed to refresh token'
          });
        }
      } catch (error: any) {
        console.error(`❌ Erro inesperado ao renovar ${integration.provider}:`, error);
        results.push({
          integration_id: integration.id,
          provider: integration.provider,
          success: false,
          error: error?.message || 'Erro inesperado'
        });
      }
    }

    console.log('✅ Sincronização de tokens concluída');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token refresh completed',
        processed: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erro geral na sincronização:', error);
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