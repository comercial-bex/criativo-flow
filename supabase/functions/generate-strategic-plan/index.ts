import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clienteId, periodo } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados de onboarding
    const { data: onboarding, error: onboardingError } = await supabase
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();

    if (onboardingError || !onboarding) {
      return new Response(
        JSON.stringify({ 
          error: "Cliente precisa ter onboarding completo antes de gerar plano estratégico" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('nome, cnpj_cpf')
      .eq('id', clienteId)
      .single();

    const systemPrompt = `Você é um especialista em planejamento estratégico empresarial com 20 anos de experiência.
Baseado nos dados de onboarding de um cliente, você deve criar um plano estratégico coeso e inspirador.

**Suas entregas OBRIGATÓRIAS:**
1. **Missão** (2-3 frases): Declaração clara do propósito da empresa, por que ela existe
2. **Visão** (2-3 frases): Onde a empresa quer chegar em 3-5 anos, ambiciosa mas alcançável
3. **Valores** (exatamente 5): Princípios fundamentais que guiam as decisões e cultura
4. **Análise SWOT**: 4-5 itens em cada categoria (Forças, Fraquezas, Oportunidades, Ameaças)

**Regras CRÍTICAS:**
- Seja específico ao segmento de atuação do cliente
- Use linguagem profissional mas acessível
- Valores devem ser palavras-chave (max 3 palavras cada)
- SWOT deve ser prático e acionável
- Retorne SEMPRE em formato JSON válido, SEM markdown

**Formato de resposta (JSON puro):**
{
  "missao": "string (declaração completa)",
  "visao": "string (declaração completa)",
  "valores": ["valor1", "valor2", "valor3", "valor4", "valor5"],
  "analise_swot": {
    "forcas": ["força1", "força2", "força3", "força4", "força5"],
    "fraquezas": ["fraqueza1", "fraqueza2", "fraqueza3", "fraqueza4"],
    "oportunidades": ["oportunidade1", "oportunidade2", "oportunidade3", "oportunidade4"],
    "ameacas": ["ameaça1", "ameaça2", "ameaça3", "ameaça4"]
  }
}`;

    const userPrompt = `**DADOS DO CLIENTE:**

**Empresa:** ${cliente?.nome || 'Não informado'}
**CNPJ:** ${cliente?.cnpj_cpf || 'Não informado'}
**Segmento:** ${onboarding.segmento_atuacao || 'Não informado'}
**Tempo no mercado:** ${onboarding.tempo_mercado || 'Não informado'}
**Área de atendimento:** ${onboarding.area_atendimento || 'Não informado'}

**Produtos/Serviços:**
${onboarding.produtos_servicos || 'Não informado'}

**Público-alvo:**
${Array.isArray(onboarding.publico_alvo) ? onboarding.publico_alvo.join(', ') : onboarding.publico_alvo || 'Não informado'}

**Valores já declarados pelo cliente:**
${onboarding.valores_principais || 'Não informado'}

**Diferenciais competitivos:**
${onboarding.diferenciais || 'Não informado'}

**Objetivos Digitais:**
${onboarding.objetivos_digitais || 'Não informado'}

**Objetivos Offline:**
${onboarding.objetivos_offline || 'Não informado'}

**Onde querem estar em 6 meses:**
${onboarding.onde_6_meses || 'Não informado'}

**Forças (self-assessment):**
${onboarding.forcas || 'Não informado'}

**Fraquezas (self-assessment):**
${onboarding.fraquezas || 'Não informado'}

**Oportunidades (self-assessment):**
${onboarding.oportunidades || 'Não informado'}

**Ameaças (self-assessment):**
${onboarding.ameacas || 'Não informado'}

**História da marca:**
${onboarding.historia_marca || 'Não informado'}

**Como querem ser lembrados:**
${onboarding.como_lembrada || 'Não informado'}

**Tom de voz:**
${Array.isArray(onboarding.tom_voz) ? onboarding.tom_voz.join(', ') : onboarding.tom_voz || 'Não informado'}

---

**INSTRUÇÕES:**
Crie um plano estratégico completo e coeso baseado nesses dados. A missão deve refletir o propósito atual, a visão deve ser inspiradora e alinhada com "onde querem estar em 6 meses", os valores devem incorporar o que o cliente declarou mas refinados profissionalmente, e o SWOT deve ser prático e acionável.

Retorne APENAS o JSON, sem markdown, sem comentários.`;

    console.log("🎯 Gerando plano estratégico para cliente:", clienteId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Aguarde alguns instantes e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos Lovable AI insuficientes. Adicione créditos em Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro da API Lovable:", response.status, errorText);
      throw new Error(`Erro na API Lovable: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("📝 Resposta da IA recebida:", content.substring(0, 200));

    // Extrair JSON do conteúdo (pode vir com ```json ou markdown)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Tentar remover markdown
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error("Conteúdo da IA não contém JSON válido:", content);
      throw new Error("Resposta da IA não contém JSON válido");
    }
    
    const strategicPlan = JSON.parse(jsonMatch[0]);

    // Validar estrutura
    if (!strategicPlan.missao || !strategicPlan.visao || !Array.isArray(strategicPlan.valores)) {
      throw new Error("Plano estratégico com estrutura inválida");
    }

    console.log("✅ Plano estratégico gerado com sucesso");

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: strategicPlan,
        metadata: {
          cliente_nome: cliente?.nome,
          gerado_em: new Date().toISOString(),
          modelo_ia: "google/gemini-2.5-flash"
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Erro ao gerar plano estratégico:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro desconhecido ao gerar plano estratégico",
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
