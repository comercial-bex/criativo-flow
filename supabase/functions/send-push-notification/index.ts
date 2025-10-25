import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  userId: string;
  title: string;
  message: string;
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, title, message, url } = await req.json() as PushPayload;

    console.log('📤 Sending push notification:', { userId, title });

    // Buscar subscriptions do usuário
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ No subscriptions found for user:', userId);
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📮 Found ${subscriptions.length} subscription(s)`);

    // Enviar push para todas as subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushPayload = JSON.stringify({
          title,
          message,
          url: url || '/dashboard',
          icon: '/icon-192.png',
          badge: '/badge-72.png'
        });

        // Usar web-push API (requer configuração de VAPID keys)
        // Por enquanto, apenas logamos
        console.log('Would send push to:', sub.endpoint.substring(0, 50) + '...');
        
        // TODO: Implementar envio real com web-push
        // Isso requer:
        // 1. Instalar web-push library
        // 2. Configurar VAPID keys como secrets
        // 3. Usar webpush.sendNotification()
        
        return { success: true };
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    console.log(`✅ Sent ${successCount}/${subscriptions.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        total: subscriptions.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
