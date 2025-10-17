import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      thread_id, 
      content, 
      attachments = [],
      mentioned_users = [] 
    } = await req.json();

    console.log('📨 Enviando mensagem:', { thread_id, content, mentioned_users });

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token!);

    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Inserir mensagem
    const { data: message, error: messageError } = await supabase
      .from('team_chat_messages')
      .insert({
        thread_id,
        sender_id: user.id,
        content,
        attachments,
        mentioned_users
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Notificar usuários mencionados
    if (mentioned_users.length > 0) {
      const { data: sender } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single();

      for (const mentionedId of mentioned_users) {
        await supabase.from('notificacoes').insert({
          user_id: mentionedId,
          titulo: 'Nova menção no chat',
          mensagem: `${sender?.nome || 'Alguém'} mencionou você: ${content.substring(0, 100)}`,
          tipo: 'info',
          data_evento: new Date().toISOString()
        });
      }
    }

    // Atualizar thread com última mensagem
    await supabase
      .from('team_chat_threads')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', thread_id);

    return new Response(JSON.stringify({ success: true, message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
