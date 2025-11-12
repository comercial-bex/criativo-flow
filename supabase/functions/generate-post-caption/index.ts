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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const prompt = `Crie uma legenda criativa e engajadora para um post de rede social com as seguintes características:

Tipo de criativo: ${post.tipo_criativo || "card"}
Objetivo: ${post.objetivo_postagem || "educar"}
Rede social: ${post.rede_social || "instagram"}
Título/Tema: ${post.titulo || "post"}
${post.contexto_estrategico ? `Contexto: ${post.contexto_estrategico}` : ""}
${post.persona_alvo ? `Público-alvo: ${post.persona_alvo}` : ""}

A legenda deve:
- Ter entre 100-150 palavras
- Incluir emojis relevantes
- Ter um CTA (call to action) claro
- Incluir 5-7 hashtags relevantes ao final
- Ser autêntica e alinhada ao objetivo "${post.objetivo_postagem || "educar"}"

Retorne APENAS a legenda, sem explicações adicionais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em copywriting para redes sociais, especializado em criar legendas engajadoras e autênticas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar legenda: ${response.statusText}`);
    }

    const data = await response.json();
    const legenda = data.choices?.[0]?.message?.content;

    if (!legenda) {
      throw new Error("Nenhuma legenda foi gerada");
    }

    // Atualizar post com a legenda gerada
    const { error: updateError } = await supabase
      .from("posts_planejamento")
      .update({ legenda })
      .eq("id", post_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, legenda }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erro ao gerar legenda:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
