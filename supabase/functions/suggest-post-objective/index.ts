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

    const prompt = `Analise o seguinte post de rede social e sugira o objetivo estratégico mais adequado:

Título: ${post.titulo || "Sem título"}
Legenda: ${post.legenda || "Sem legenda"}
Tipo de criativo: ${post.tipo_criativo || "card"}
Contexto: ${post.contexto_estrategico || "Não informado"}

Objetivos possíveis:
- humanizar: Mostrar o lado humano da marca, criar conexão emocional
- educar: Ensinar algo, compartilhar conhecimento
- resolver: Solucionar problemas, responder dúvidas
- entreter: Divertir, criar conteúdo leve e descontraído
- converter: Estimular vendas, gerar conversão

Retorne APENAS uma palavra com o objetivo mais adequado (humanizar, educar, resolver, entreter ou converter), sem explicações.`;

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
            content: "Você é um estrategista de marketing digital especializado em análise de conteúdo para redes sociais.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao sugerir objetivo: ${response.statusText}`);
    }

    const data = await response.json();
    const objetivo = data.choices?.[0]?.message?.content?.trim().toLowerCase();

    const objetivosValidos = ["humanizar", "educar", "resolver", "entreter", "converter"];
    const objetivoFinal = objetivosValidos.includes(objetivo) ? objetivo : "educar";

    // Atualizar post com o objetivo sugerido
    const { error: updateError } = await supabase
      .from("posts_planejamento")
      .update({ objetivo_postagem: objetivoFinal })
      .eq("id", post_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, objetivo: objetivoFinal }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erro ao sugerir objetivo:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
