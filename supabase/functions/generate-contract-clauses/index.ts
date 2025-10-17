import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cliente, produtos, tipo_contrato, prazo_meses, reajuste_indice } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurada");
    }

    // Montar o prompt para a IA
    const produtosDescricao = produtos.map((p: any) => 
      `- ${p.produto_nome || p.nome}: ${p.descricao_curta || p.descricao || 'Não especificado'} (R$ ${p.valor_unitario || p.preco})`
    ).join('\n');

    const prompt = `
Você é um advogado especialista em contratos de prestação de serviços de marketing digital e comunicação.

**DADOS DO CLIENTE:**
- Nome: ${cliente.nome}
- Documento: ${cliente.documento}
- Endereço: ${cliente.endereco}
${cliente.segmento ? `- Segmento: ${cliente.segmento}` : ''}

**SERVIÇOS CONTRATADOS:**
${produtosDescricao}

**TIPO DE CONTRATO:** ${tipo_contrato === 'recorrente' ? 'Recorrente (mensal)' : 'Avulso (projeto único)'}
**PRAZO:** ${prazo_meses} meses
**REAJUSTE:** ${reajuste_indice}

**TAREFA:**
Gere cláusulas profissionais e juridicamente adequadas para um contrato de prestação de serviços, incluindo:

1. **ESCOPO DOS SERVIÇOS** - Descrição detalhada do que será entregue, baseado nos produtos/serviços acima
2. **SLA (Service Level Agreement)** - Prazos de entrega, disponibilidade, tempos de resposta
3. **CONFIDENCIALIDADE** - Cláusula de sigilo e proteção de informações
4. **PROPRIEDADE INTELECTUAL** - Quem detém os direitos sobre materiais criados
5. **RESCISÃO** - Condições de cancelamento antecipado e multas
6. **FORO** - Foro competente (use a cidade do cliente: ${cliente.endereco?.split(',').pop()?.trim() || 'São Paulo'})

**IMPORTANTE:** 
- Use linguagem formal e técnica
- Seja específico e detalhado
- Proteja ambas as partes (prestador e contratante)
- Adapte as cláusulas aos serviços específicos listados
`;

    // Chamar Lovable AI (Gemini 2.5 Flash)
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "Você é um advogado especialista em contratos de serviços de marketing e comunicação. Gere cláusulas profissionais, detalhadas e juridicamente adequadas." 
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "gerar_clausulas_contrato",
              description: "Retorna as cláusulas do contrato estruturadas",
              parameters: {
                type: "object",
                properties: {
                  escopo: { type: "string", description: "Descrição completa do escopo dos serviços" },
                  sla: { type: "string", description: "Service Level Agreement - prazos e garantias" },
                  confidencialidade: { type: "string", description: "Cláusula de confidencialidade" },
                  propriedade_intelectual: { type: "string", description: "Direitos sobre materiais criados" },
                  rescisao: { type: "string", description: "Condições de rescisão contratual" },
                  foro: { type: "string", description: "Foro competente para resolução de conflitos" }
                },
                required: ["escopo", "sla", "confidencialidade", "propriedade_intelectual", "rescisao", "foro"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "gerar_clausulas_contrato" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro da IA:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos ao seu workspace Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Erro ao chamar IA: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log("Resposta da IA:", JSON.stringify(aiData, null, 2));

    // Extrair os argumentos da tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("IA não retornou as cláusulas no formato esperado");
    }

    const clausulas = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        escopo: clausulas.escopo,
        sla: clausulas.sla,
        confidencialidade: clausulas.confidencialidade,
        propriedade_intelectual: clausulas.propriedade_intelectual,
        rescisao: clausulas.rescisao,
        foro: clausulas.foro
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: any) {
    console.error("Erro na edge function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao gerar cláusulas com IA",
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
