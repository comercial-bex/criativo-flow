import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connection_id, provider } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[test-social-api] Testing ${provider} API...`);

    let testResult = { success: false, message: '' };

    switch (provider) {
      case 'facebook':
        testResult = await testFacebookAPI(supabase);
        break;
      case 'instagram':
        testResult = await testInstagramAPI(supabase);
        break;
      case 'google_analytics':
        testResult = await testGoogleAnalyticsAPI(supabase);
        break;
      default:
        testResult = { success: false, message: `Provider não suportado: ${provider}` };
    }

    // Atualizar status da conexão
    if (connection_id) {
      await supabase
        .from('system_connections')
        .update({
          status: testResult.success ? 'connected' : 'disconnected',
          last_ping: new Date().toISOString(),
          error_message: testResult.success ? null : testResult.message
        })
        .eq('id', connection_id);
    }

    return new Response(
      JSON.stringify(testResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[test-social-api] Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function testFacebookAPI(supabase: any) {
  const appId = Deno.env.get('META_APP_ID');
  const appSecret = Deno.env.get('META_APP_SECRET');

  if (!appId || !appSecret) {
    return {
      success: false,
      message: 'META_APP_ID ou META_APP_SECRET não configurados'
    };
  }

  try {
    // Testar Graph API com app access token
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: `Erro Facebook API: ${error.error?.message || 'Falha na autenticação'}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `App Access Token obtido com sucesso. App ID: ${appId}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao conectar Facebook API: ${error.message}`
    };
  }
}

async function testInstagramAPI(supabase: any) {
  const appId = Deno.env.get('INSTAGRAM_APP_ID') || Deno.env.get('META_APP_ID');
  const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET') || Deno.env.get('META_APP_SECRET');

  if (!appId || !appSecret) {
    return {
      success: false,
      message: 'INSTAGRAM_APP_ID/META_APP_ID ou INSTAGRAM_APP_SECRET não configurados'
    };
  }

  // Instagram usa mesma API do Facebook
  return await testFacebookAPI(supabase);
}

async function testGoogleAnalyticsAPI(supabase: any) {
  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID');
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  if (!measurementId && !clientId) {
    return {
      success: false,
      message: 'GA4_MEASUREMENT_ID ou GOOGLE_CLIENT_ID não configurados'
    };
  }

  // Validação básica de formato
  if (measurementId && !measurementId.startsWith('G-')) {
    return {
      success: false,
      message: 'GA4_MEASUREMENT_ID deve começar com "G-"'
    };
  }

  return {
    success: true,
    message: `Google Analytics configurado. Measurement ID: ${measurementId || 'OAuth configurado'}`
  };
}
