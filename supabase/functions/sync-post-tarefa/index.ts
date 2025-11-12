import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { post, action } = await req.json();

    console.log(`[sync-post-tarefa] Action: ${action}, Post ID: ${post.id}`);

    if (action === 'create' || action === 'update') {
      // Verificar se já existe uma tarefa vinculada
      const { data: existingTarefa } = await supabaseClient
        .from('tarefas')
        .select('id')
        .eq('origem', 'plano_editorial')
        .eq('trace_id', post.id)
        .maybeSingle();

      const tarefaData = {
        tipo: getTipoTarefa(post.formato_postagem),
        titulo: post.titulo || `Post ${post.formato_postagem}`,
        descricao: post.descricao || '',
        prioridade: 'media' as const,
        status: mapStatusPostToTarefa(post.status_post || 'a_fazer'),
        responsavel_id: post.responsavel_id,
        data_entrega_prevista: post.data_postagem,
        data_publicacao: post.data_postagem,
        canais: [getCanal(post.formato_postagem)],
        cliente_id: post.cliente_id,
        projeto_id: post.projeto_id,
        origem: 'plano_editorial',
        trace_id: post.id,
        area: [getArea(post.formato_postagem)],
        executor_area: getExecutorArea(post.formato_postagem),
      };

      if (existingTarefa) {
        // Atualizar tarefa existente
        const { error } = await supabaseClient
          .from('tarefas')
          .update(tarefaData)
          .eq('id', existingTarefa.id);

        if (error) throw error;

        console.log(`[sync-post-tarefa] Tarefa atualizada: ${existingTarefa.id}`);

        return new Response(
          JSON.stringify({ success: true, tarefa_id: existingTarefa.id, action: 'updated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Criar nova tarefa
        const { data: newTarefa, error } = await supabaseClient
          .from('tarefas')
          .insert(tarefaData)
          .select()
          .single();

        if (error) throw error;

        console.log(`[sync-post-tarefa] Nova tarefa criada: ${newTarefa.id}`);

        return new Response(
          JSON.stringify({ success: true, tarefa_id: newTarefa.id, action: 'created' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (action === 'delete') {
      // Deletar tarefa vinculada
      const { error } = await supabaseClient
        .from('tarefas')
        .delete()
        .eq('origem', 'plano_editorial')
        .eq('trace_id', post.id);

      if (error) throw error;

      console.log(`[sync-post-tarefa] Tarefa deletada para post: ${post.id}`);

      return new Response(
        JSON.stringify({ success: true, action: 'deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-post-tarefa] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getTipoTarefa(formato: string) {
  const mapping: Record<string, string> = {
    'reels': 'reels_instagram',
    'card': 'criativo_card',
    'carrossel': 'criativo_carrossel',
    'motion': 'criativo_vt',
    'story': 'stories_interativo',
    'post': 'feed_post',
  };
  return mapping[formato.toLowerCase()] || 'feed_post';
}

function mapStatusPostToTarefa(statusPost: string) {
  const mapping: Record<string, string> = {
    'a_fazer': 'backlog',
    'em_producao': 'em_producao',
    'pronto': 'aprovado',
    'publicado': 'publicado',
    'temporario': 'backlog',
  };
  return mapping[statusPost] || 'backlog';
}

function getCanal(formato: string) {
  const mapping: Record<string, string> = {
    'reels': 'Instagram',
    'card': 'Instagram',
    'carrossel': 'Instagram',
    'story': 'Instagram',
    'post': 'Instagram',
    'motion': 'Instagram',
  };
  return mapping[formato.toLowerCase()] || 'Instagram';
}

function getArea(formato: string) {
  const mapping: Record<string, string> = {
    'reels': 'Audiovisual',
    'motion': 'Audiovisual',
    'card': 'Design',
    'carrossel': 'Design',
    'story': 'Design',
    'post': 'Design',
  };
  return mapping[formato.toLowerCase()] || 'Design';
}

function getExecutorArea(formato: string) {
  const mapping: Record<string, string> = {
    'reels': 'Audiovisual',
    'motion': 'Audiovisual',
    'card': 'Criativo',
    'carrossel': 'Criativo',
    'story': 'Criativo',
    'post': 'Criativo',
  };
  return mapping[formato.toLowerCase()] || 'Criativo';
}
