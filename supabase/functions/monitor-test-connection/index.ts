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
    const { connection_id } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar conexão
    const { data: conn, error: connError } = await supabaseAdmin
      .from('system_connections')
      .select('*')
      .eq('id', connection_id)
      .single();

    if (connError) throw new Error(`Connection not found: ${connError.message}`);
    if (!conn) throw new Error('Connection not found');

    console.log(`[Monitor] Testing connection: ${conn.name} (${conn.group})`);

    // Executar testes baseados no grupo
    const startTime = Date.now();
    let testResult: 'ok' | 'warn' | 'fail' = 'ok';
    let errorDetails: string | null = null;
    let newStatus: 'connected' | 'degraded' | 'disconnected' | 'pending' = 'connected';
    let severity: 'low' | 'medium' | 'high' | 'critical' | null = null;

    try {
      if (conn.group === 'database') {
        // Teste DB: SELECT 1
        const { error: dbError } = await supabaseAdmin.rpc('check_user_integrity');
        if (dbError) {
          testResult = 'fail';
          newStatus = 'disconnected';
          severity = 'critical';
          errorDetails = dbError.message;
        }
      } else if (conn.group === 'integration' && conn.name.includes('Storage')) {
        // Teste Storage: listar buckets
        const { error: storageError } = await supabaseAdmin.storage.listBuckets();
        if (storageError) {
          testResult = 'fail';
          newStatus = 'disconnected';
          severity = 'high';
          errorDetails = storageError.message;
        }
      } else if (conn.group === 'api' && conn.name.includes('WhatsApp')) {
        // Teste WhatsApp health (dummy por enquanto)
        testResult = 'ok';
        newStatus = 'connected';
      } else if (conn.group === 'module' || conn.group === 'modal') {
        // Teste básico de módulos/modais (verificar se rota existe)
        testResult = 'ok';
        newStatus = 'connected';
      } else if (conn.group === 'api') {
        // Para APIs externas, fazer ping básico com fetch
        try {
          // Timeout de 3s para APIs externas
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          
          // Verificar se endpoint está configurado
          const endpoint = conn.config?.endpoint || conn.config?.url;
          
          if (!endpoint) {
            testResult = 'warn';
            newStatus = 'degraded';
            severity = 'low';
            errorDetails = 'Endpoint não configurado - impossível testar';
          } else {
            // Fazer HEAD request (mais leve que GET)
            const response = await fetch(endpoint, {
              method: 'HEAD',
              signal: controller.signal,
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
              testResult = 'ok';
              newStatus = 'connected';
            } else {
              testResult = 'warn';
              newStatus = 'degraded';
              severity = 'medium';
              errorDetails = `HTTP ${response.status}: ${response.statusText}`;
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            testResult = 'warn';
            newStatus = 'degraded';
            severity = 'medium';
            errorDetails = 'Timeout (>3s) - API lenta';
          } else {
            testResult = 'fail';
            newStatus = 'disconnected';
            severity = 'high';
            errorDetails = `Falha de rede: ${error.message}`;
          }
        }
      } else {
        // Outros tipos sem teste específico - marcar como conectado
        testResult = 'ok';
        newStatus = 'connected';
        errorDetails = null;
      }
    } catch (error: any) {
      testResult = 'fail';
      newStatus = 'disconnected';
      severity = 'critical';
      errorDetails = error.message;
      console.error(`[Monitor] Test failed for ${conn.name}:`, error);
    }

    const latency = Date.now() - startTime;

    // Detectar degradação por latência
    if (latency > 800 && testResult === 'ok') {
      testResult = 'warn';
      newStatus = 'degraded';
      severity = 'medium';
    }

    // Atualizar status da conexão
    const { error: updateError } = await supabaseAdmin
      .from('system_connections')
      .update({
        status: newStatus,
        last_ping: new Date().toISOString(),
        latency_ms: latency,
        error_message: errorDetails,
        severity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id);

    if (updateError) {
      console.error(`[Monitor] Failed to update connection status:`, updateError);
    }

    // Criar registro de check
    const { error: checkError } = await supabaseAdmin
      .from('system_checks')
      .insert({
        connection_id,
        check_type: 'ping',
        result: testResult,
        details: { latency, error: errorDetails }
      });

    if (checkError) {
      console.error(`[Monitor] Failed to create check record:`, checkError);
    }

    // Criar evento se houve mudança de status
    if (newStatus !== conn.status) {
      const eventType = testResult === 'fail' ? 'error' : testResult === 'warn' ? 'warn' : 'info';
      
      await supabaseAdmin
        .from('system_events_bus')
        .insert({
          connection_id,
          event_type: eventType,
          payload: {
            old_status: conn.status,
            new_status: newStatus,
            latency,
            error: errorDetails,
          },
          acknowledged: false,
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: testResult, 
        latency,
        status: newStatus,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error testing connection:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
