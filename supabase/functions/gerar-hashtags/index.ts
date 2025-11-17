import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contexto, redeSocial = "instagram", quantidade = 20 } = await req.json();

    if (!contexto) {
      throw new Error("Contexto é obrigatório");
    }

    // Hashtags genéricas por rede social
    const hashtagsBase: Record<string, string[]> = {
      instagram: [
        "#marketing", "#marketingdigital", "#midiassociais", "#conteudo", "#instagram",
        "#reels", "#stories", "#engajamento", "#socialmedia", "#digitalmarketing",
        "#business", "#empreendedorismo", "#negocios", "#inovacao", "#estrategia",
        "#branding", "#design", "#comunicacao", "#marketing2024", "#social"
      ],
      tiktok: [
        "#tiktok", "#viral", "#fyp", "#foryou", "#tendencia",
        "#video", "#conteudo", "#criativo", "#marketing", "#trend",
        "#brasil", "#brasileiro", "#viral2024", "#tiktokbrasil", "#marketing"
      ],
      linkedin: [
        "#linkedin", "#business", "#networking", "#carreira", "#profissional",
        "#empreendedorismo", "#lideranca", "#gestao", "#inovacao", "#tecnologia",
        "#marketing", "#vendas", "#estrategia", "#negocios", "#sucesso"
      ],
      facebook: [
        "#facebook", "#marketing", "#negocios", "#empreendedorismo", "#brasil",
        "#socialmedia", "#digitalmarketing", "#conteudo", "#engajamento", "#publicidade"
      ]
    };

    // Hashtags específicas baseadas em palavras-chave do contexto
    const palavrasChave = contexto.toLowerCase();
    const hashtagsEspecificas: string[] = [];

    // Mapear palavras-chave para hashtags relevantes
    const mapeamento: Record<string, string[]> = {
      "beleza": ["#beleza", "#beauty", "#makeup", "#skincare", "#cosmeticos"],
      "moda": ["#moda", "#fashion", "#estilo", "#style", "#look"],
      "comida": ["#comida", "#food", "#gastronomia", "#receita", "#chef"],
      "fitness": ["#fitness", "#treino", "#academia", "#saude", "#bemestar"],
      "tecnologia": ["#tecnologia", "#tech", "#inovacao", "#digital", "#software"],
      "viagem": ["#viagem", "#travel", "#turismo", "#destino", "#aventura"],
      "educacao": ["#educacao", "#ensino", "#aprendizado", "#escola", "#conhecimento"],
      "saude": ["#saude", "#health", "#wellness", "#bemestar", "#saudavel"],
      "sustentabilidade": ["#sustentabilidade", "#meioambiente", "#ecologia", "#verde", "#sustentavel"],
      "pets": ["#pets", "#cachorros", "#gatos", "#animais", "#petlovers"],
    };

    Object.entries(mapeamento).forEach(([palavra, tags]) => {
      if (palavrasChave.includes(palavra)) {
        hashtagsEspecificas.push(...tags);
      }
    });

    // Combinar hashtags base com específicas
    const hashtagsRelevantes = [
      ...hashtagsEspecificas,
      ...(hashtagsBase[redeSocial] || hashtagsBase.instagram)
    ];

    // Remover duplicadas e limitar quantidade
    const hashtagsUnicas = [...new Set(hashtagsRelevantes)].slice(0, quantidade);

    console.log(`Geradas ${hashtagsUnicas.length} hashtags para ${redeSocial}`);

    return new Response(
      JSON.stringify({
        hashtags: hashtagsUnicas,
        contexto,
        redeSocial,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao gerar hashtags:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        hashtags: [],
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
