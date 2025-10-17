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
    const { event, payload, metadata } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Log do evento na tabela event_logs
    await supabaseClient.from('event_logs').insert({
      event_type: event,
      payload: payload,
      metadata: metadata,
    });

    // Processar eventos específicos
    switch (event) {
      case 'project.created':
        // Notificar equipe sobre novo projeto
        if (payload.responsavel_id) {
          await supabaseClient.from('notificacoes').insert({
            user_id: payload.responsavel_id,
            titulo: 'Novo Projeto Criado',
            mensagem: `Projeto "${payload.titulo || 'Sem título'}" foi criado com sucesso`,
            tipo: 'info',
            data_evento: new Date().toISOString(),
          });
        }
        console.log(`✅ Event: ${event} - Projeto ${payload.projeto_id} criado`);
        break;

      case 'task.created':
        // Notificar executor quando tarefa for atribuída
        if (payload.executor_id) {
          await supabaseClient.from('notificacoes').insert({
            user_id: payload.executor_id,
            titulo: 'Nova Tarefa Atribuída',
            mensagem: `Você foi atribuído à tarefa: ${payload.titulo || 'Nova tarefa'}`,
            tipo: 'info',
            data_evento: new Date().toISOString(),
          });
        }
        console.log(`✅ Event: ${event} - Tarefa ${payload.tarefa_id} criada`);
        break;

      case 'briefing.completed':
        console.log(`✅ Event: ${event} - Briefing ${payload.briefing_id} completo`);
        break;

      default:
        console.log(`ℹ️ Event não processado: ${event}`);
    }

    return new Response(
      JSON.stringify({ success: true, event }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro no event-bus:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
