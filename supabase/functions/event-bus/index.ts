import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventPayload {
  event_type: 'grs.action.created' | 'grs.action.assigned.specialist' | 'task.created.from.grs' | 'approval.request.created';
  trace_id: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = "https://xvpqgwbktpfodbuhwqhh.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: EventPayload = await req.json();
    const { event_type, trace_id, data, metadata } = payload;

    console.log(`📡 [EVENT-BUS] Recebido evento: ${event_type}`, { trace_id, data });

    // 1️⃣ BROADCAST VIA SUPABASE REALTIME
    const channelName = `grs-events:${trace_id}`;
    const channel = supabase.channel(channelName);

    await channel.send({
      type: 'broadcast',
      event: event_type,
      payload: {
        trace_id,
        timestamp: new Date().toISOString(),
        data,
        metadata,
      },
    });

    console.log(`✅ [EVENT-BUS] Evento ${event_type} publicado no canal ${channelName}`);

    // 2️⃣ LOG ESTRUTURADO NA TABELA logs_atividade (se aplicável)
    if (data.cliente_id && data.usuario_id) {
      const { error: logError } = await supabase.rpc('criar_log_atividade', {
        p_cliente_id: data.cliente_id,
        p_usuario_id: data.usuario_id,
        p_acao: event_type,
        p_entidade_tipo: 'event_bus',
        p_entidade_id: trace_id,
        p_descricao: `🔔 Evento ${event_type} processado via Event Bus`,
        p_metadata: {
          trace_id,
          event_type,
          data,
          metadata,
        },
      });

      if (logError) {
        console.error('❌ [EVENT-BUS] Erro ao criar log:', logError);
      } else {
        console.log('📝 [EVENT-BUS] Log estruturado criado');
      }
    }

    // 3️⃣ WEBHOOK PARA SISTEMAS EXTERNOS (OPCIONAL)
    // Você pode adicionar chamadas HTTP aqui se precisar integrar com outros sistemas
    // Exemplo: await fetch('https://webhook.example.com', { method: 'POST', body: JSON.stringify(payload) });

    return new Response(
      JSON.stringify({
        success: true,
        event_type,
        trace_id,
        channel: channelName,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ [EVENT-BUS] Erro ao processar evento:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
