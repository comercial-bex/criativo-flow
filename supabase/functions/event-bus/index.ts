import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GRSEvent {
  type: 'grs.action.created' | 'grs.action.assigned.specialist' | 'task.created.from.grs' | 'approval.request.created';
  trace_id: string;
  timestamp: string;
  source: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event: GRSEvent = await req.json();
    
    console.log(`📢 EVENT-BUS: ${event.type}`, {
      trace_id: event.trace_id,
      source: event.source,
      timestamp: event.timestamp,
    });

    // 1️⃣ BROADCAST VIA SUPABASE REALTIME
    const channel = supabase.channel(`events:${event.trace_id}`);
    
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: event.type,
          payload: {
            trace_id: event.trace_id,
            data: event.data,
            timestamp: event.timestamp,
            source: event.source,
          }
        });
        console.log(`✅ Broadcast enviado: ${event.type}`);
      }
    });

    // 2️⃣ LOG ESTRUTURADO NO BANCO
    const { error: logError } = await supabase
      .from('logs_atividade')
      .insert({
        cliente_id: event.data.cliente_id,
        usuario_id: event.data.usuario_id || null,
        acao: `event_bus:${event.type}`,
        entidade_tipo: 'event_bus',
        entidade_id: event.trace_id,
        descricao: `📢 Event Bus: ${event.type}`,
        trace_id: event.trace_id,
        metadata: {
          event_type: event.type,
          source: event.source,
          data: event.data,
          timestamp: event.timestamp,
        }
      });

    if (logError) {
      console.error('❌ Erro ao salvar log:', logError);
    } else {
      console.log('✅ Log salvo no banco');
    }

    // 3️⃣ (OPCIONAL) WEBHOOK PARA SISTEMAS EXTERNOS
    if (event.metadata?.webhook_url) {
      try {
        const webhookResponse = await fetch(event.metadata.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
        console.log(`🔗 Webhook enviado: ${webhookResponse.status}`);
      } catch (webhookError) {
        console.error('❌ Erro ao enviar webhook:', webhookError);
      }
    }

    // Cleanup
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 1000);

    return new Response(
      JSON.stringify({ 
        success: true, 
        trace_id: event.trace_id,
        message: `Event ${event.type} processado com sucesso`,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro no Event Bus:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
