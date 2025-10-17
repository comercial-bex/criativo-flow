import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar todas as conexões com monitoramento habilitado
    const { data: connections, error: connError } = await supabaseAdmin
      .from('system_connections')
      .select('id, name')
      .eq('monitoring_enabled', true);

    if (connError) throw new Error(`Failed to fetch connections: ${connError.message}`);

    console.log(`[Monitor] Testing ${connections?.length || 0} connections...`);

    // Testar em paralelo (limite de 8 simultâneos)
    const batchSize = 8;
    const results = [];

    for (let i = 0; i < (connections?.length || 0); i += batchSize) {
      const batch = connections!.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (conn) => {
          const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/monitor-test-connection`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ connection_id: conn.id }),
          });

          if (!response.ok) {
            throw new Error(`Test failed for ${conn.name}`);
          }

          const data = await response.json();
          return { connection_name: conn.name, ...data };
        })
      );

      results.push(...batchResults);
    }

    // Processar resultados
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[Monitor] Batch test completed: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        total: connections?.length || 0,
        successful,
        failed,
        results: results.map((r, idx) => ({
          connection: connections?.[idx]?.name,
          status: r.status,
          data: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? (r.reason as Error).message : null,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in monitor-test-all:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
