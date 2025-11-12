import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { post_id } = await req.json();

    if (!post_id) {
      throw new Error("post_id é obrigatório");
    }

    // Buscar dados do post
    const { data: post, error: postError } = await supabase
      .from("posts_planejamento")
      .select("*")
      .eq("id", post_id)
      .single();

    if (postError) throw postError;

    // Mapear tipo de criativo para tipo de tarefa
    const tipoMap: Record<string, string> = {
      card: "criativo_card",
      reels: "reels_instagram",
      carrossel: "criativo_carrossel",
      story: "stories_instagram",
      outro: "criativo_generico"
    };

    const tipoTarefa = tipoMap[post.tipo_criativo || "outro"] || "criativo_generico";

    // Criar tarefa com dados do post
    const { data: tarefa, error: tarefaError } = await supabase
      .from("tarefa")
      .insert({
        tipo: tipoTarefa,
        titulo: post.titulo || "Post sem título",
        descricao: post.legenda || post.conteudo_completo || "",
        projeto_id: post.planejamento_id,
        cliente_id: post.cliente_id,
        data_publicacao: post.data_postagem,
        canais: [post.rede_social || "instagram"],
        publico_alvo: post.persona_alvo,
        cta: post.call_to_action,
        status: "pendente",
        prioridade: "media"
      })
      .select()
      .single();

    if (tarefaError) throw tarefaError;

    // Atualizar post com ID da tarefa criada
    const { error: updateError } = await supabase
      .from("posts_planejamento")
      .update({ tarefa_criacao_id: tarefa.id })
      .eq("id", post_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, tarefa_id: tarefa.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
