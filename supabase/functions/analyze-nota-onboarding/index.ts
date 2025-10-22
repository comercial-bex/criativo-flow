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
    const { notaId, titulo, conteudo, tipoNota } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`📝 Analisando nota: ${titulo} (${tipoNota})`);

    const systemPrompt = `Você é um analista de negócios especializado em onboarding de clientes de agências de marketing e comunicação.

Analise a nota fornecida e extraia insights estruturados para ajudar no planejamento estratégico do cliente.

IMPORTANTE: Retorne APENAS os argumentos da ferramenta analyze_nota em formato JSON válido, sem markdown, sem explicações.`;

    const userPrompt = `Analise a seguinte nota de onboarding:

**Título:** ${titulo}
**Tipo:** ${tipoNota}
**Conteúdo:**
${conteudo}

Extraia:
1. **Keywords principais** (5-10 palavras-chave relevantes)
2. **Categoria sugerida** (briefing, mercado, swot, estrategia, geral)
3. **Score de relevância** (0-10, onde 10 é extremamente relevante para o planejamento estratégico)
4. **Insights estruturados:**
   - Objetivos mencionados ou inferidos
   - Público-alvo identificado (perfil demográfico, psicográfico)
   - Concorrentes citados ou mercado competitivo
   - Dores/problemas do cliente
   - Oportunidades de negócio ou expansão`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_nota",
              description: "Extrai insights estruturados de uma nota de onboarding",
              parameters: {
                type: "object",
                properties: {
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-10 palavras-chave principais extraídas da nota"
                  },
                  categoria: {
                    type: "string",
                    enum: ["briefing", "mercado", "swot", "estrategia", "geral"],
                    description: "Categoria que melhor define esta nota"
                  },
                  relevancia_score: {
                    type: "number",
                    minimum: 0,
                    maximum: 10,
                    description: "Score de relevância para planejamento (0-10)"
                  },
                  insights: {
                    type: "object",
                    properties: {
                      objetivos: {
                        type: "array",
                        items: { type: "string" },
                        description: "Objetivos de negócio mencionados"
                      },
                      publico_alvo: {
                        type: "string",
                        description: "Descrição do público-alvo identificado"
                      },
                      concorrentes: {
                        type: "array",
                        items: { type: "string" },
                        description: "Concorrentes citados ou mercado competitivo"
                      },
                      dores: {
                        type: "array",
                        items: { type: "string" },
                        description: "Problemas/dores do cliente"
                      },
                      oportunidades: {
                        type: "array",
                        items: { type: "string" },
                        description: "Oportunidades de negócio identificadas"
                      }
                    },
                    required: ["objetivos", "publico_alvo", "concorrentes", "dores", "oportunidades"]
                  }
                },
                required: ["keywords", "categoria", "relevancia_score", "insights"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_nota" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings > Workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await aiResponse.text();
      console.error("❌ Erro AI Gateway:", aiResponse.status, errorText);
      throw new Error("Falha ao processar análise IA");
    }

    const data = await aiResponse.json();
    console.log("🤖 Resposta IA:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("IA não retornou análise estruturada");
    }

    const analise = JSON.parse(toolCall.function.arguments);
    console.log("✅ Análise extraída:", JSON.stringify(analise, null, 2));

    // Atualizar nota no banco
    const { error: updateError } = await supabase
      .from("notas_onboarding")
      .update({
        analise_ia: analise.insights,
        keywords: analise.keywords,
        categoria_ia: analise.categoria,
        relevancia_score: analise.relevancia_score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notaId);

    if (updateError) {
      console.error("❌ Erro ao salvar análise:", updateError);
      throw new Error("Falha ao salvar análise no banco");
    }

    console.log("💾 Análise salva com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        analise: {
          keywords: analise.keywords,
          categoria: analise.categoria,
          relevancia_score: analise.relevancia_score,
          insights: analise.insights,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Erro na análise:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});