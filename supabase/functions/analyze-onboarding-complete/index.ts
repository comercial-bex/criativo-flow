import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { onboardingId, clienteId } = await req.json();
    
    console.log(`🚀 Iniciando análise de onboarding: ${onboardingId} para cliente: ${clienteId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar dados completos
    console.log("📊 Buscando dados do cliente e onboarding...");
    
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", clienteId)
      .single();

    if (clienteError) throw clienteError;

    const { data: onboarding, error: onboardingError } = await supabase
      .from("cliente_onboarding")
      .select("*")
      .eq("id", onboardingId)
      .single();

    if (onboardingError) throw onboardingError;

    // Buscar assinatura se informada
    let assinatura = null;
    if (onboarding.assinatura_id) {
      const { data: assData } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("id", onboarding.assinatura_id)
        .single();
      assinatura = assData;
    }

    const duracaoMeses = onboarding.duracao_contrato_meses || 6;
    const postsPlano = assinatura?.posts_mensais || 30;
    const areasFoco = onboarding.areas_foco || [];
    const campanhasMensais = onboarding.campanhas_mensais || [];

    console.log(`📅 Duração: ${duracaoMeses} meses | Posts: ${postsPlano}/mês | Áreas: ${areasFoco.length}`);

    // 2. Construir prompt para IA
    const systemPrompt = `Você é um consultor estratégico sênior especializado em marketing digital e planejamento empresarial.

**MISSÃO:** Analisar o onboarding completo de um cliente e gerar:
1. Relatório Executivo em Markdown
2. Metas SMART automáticas (JSON)
3. Cronograma de Ações detalhado (JSON)
4. Plano Estratégico com Missão, Visão, Valores e SWOT (JSON)

**DADOS DO CLIENTE:**
- Nome: ${cliente.nome}
- Segmento: ${onboarding.segmento_atuacao || "Não informado"}
- Produtos/Serviços: ${onboarding.produtos_servicos || "Não informado"}
- Tempo de Mercado: ${onboarding.tempo_mercado || "Não informado"}
- Localização: ${onboarding.localizacao || "Não informado"}

**PÚBLICO-ALVO:**
${Array.isArray(onboarding.publico_alvo) ? onboarding.publico_alvo.join(", ") : onboarding.publico_alvo || "Não informado"}

**DORES E PROBLEMAS:**
${onboarding.dores_problemas || "Não informado"}

**O QUE O PÚBLICO VALORIZA:**
${onboarding.valorizado || "Não informado"}

**PRESENÇA DIGITAL ATUAL:**
${Array.isArray(onboarding.presenca_digital) ? onboarding.presenca_digital.join(", ") : "Não informado"}

**ANÁLISE SWOT:**
- Forças: ${onboarding.forcas || "Não informado"}
- Fraquezas: ${onboarding.fraquezas || "Não informado"}
- Oportunidades: ${onboarding.oportunidades || "Não informado"}
- Ameaças: ${onboarding.ameacas || "Não informado"}

**OBJETIVOS:**
- Digitais: ${onboarding.objetivos_digitais || "Não informado"}
- Offline: ${onboarding.objetivos_offline || "Não informado"}
- Visão 6 meses: ${onboarding.onde_6_meses || "Não informado"}

**MARCA:**
- História: ${onboarding.historia_marca || "Não informado"}
- Valores: ${onboarding.valores_principais || "Não informado"}
- Tom de Voz: ${Array.isArray(onboarding.tom_voz) ? onboarding.tom_voz.join(", ") : "Não informado"}

**PLANO CONTRATADO:**
- Duração: ${duracaoMeses} meses
- Posts por mês: ${postsPlano}
- Áreas de foco: ${areasFoco.join(", ") || "Não informadas"}

**CAMPANHAS PLANEJADAS:**
${campanhasMensais.length > 0 ? campanhasMensais.map((c: any) => `Mês ${c.mes}: ${c.nome} (${c.tipo}) - ${c.descricao || ""}`).join("\n") : "Nenhuma campanha específica"}

**FORMATO DE RESPOSTA (JSON VÁLIDO):**
{
  "relatorio_markdown": "# Relatório Estratégico\\n\\n## Resumo Executivo\\n[2-3 parágrafos]\\n\\n## Análise SWOT Detalhada\\n### Forças\\n- [lista]\\n### Fraquezas\\n- [lista]\\n### Oportunidades\\n- [lista]\\n### Ameaças\\n- [lista]\\n\\n## Recomendações Estratégicas\\n[3-5 recomendações]",
  
  "metas": [
    {
      "titulo": "Meta clara e mensurável",
      "descricao": "Como atingir esta meta",
      "valor_alvo": 1000,
      "unidade": "seguidores",
      "area": "branding",
      "mes_referencia": 1
    }
  ],
  
  "cronograma": {
    "mes_1": {
      "semana_1": ["Ação específica 1", "Ação específica 2"],
      "semana_2": ["Ação específica 3", "Ação específica 4"],
      "semana_3": ["Ação específica 5"],
      "semana_4": ["Ação específica 6"]
    }
  },
  
  "plano_estrategico": {
    "missao": "Declaração de missão clara",
    "visao": "Onde a empresa quer chegar",
    "valores": ["Valor 1", "Valor 2", "Valor 3"],
    "swot": {
      "forcas": ["Força 1", "Força 2", "Força 3"],
      "fraquezas": ["Fraqueza 1", "Fraqueza 2"],
      "oportunidades": ["Oportunidade 1", "Oportunidade 2", "Oportunidade 3"],
      "ameacas": ["Ameaça 1", "Ameaça 2"]
    }
  }
}

**REGRAS CRÍTICAS:**
1. Gere EXATAMENTE ${duracaoMeses} metas (uma por mês), distribuídas entre as áreas de foco
2. Para cada mês, crie cronograma com 4 semanas de ações específicas
3. Incorpore as campanhas mensais fornecidas no cronograma
4. Use dados reais fornecidos, não invente informações
5. Metas devem ser SMART (Específicas, Mensuráveis, Atingíveis, Relevantes, Temporais)
6. Retorne APENAS JSON válido, sem markdown`;

    // 3. Chamar IA
    console.log("🤖 Chamando IA para análise...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Gere o relatório estratégico completo baseado nos dados fornecidos." }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("❌ Erro na IA:", aiResponse.status, errorText);
      throw new Error(`Erro na IA: ${aiResponse.status} - ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("IA não retornou conteúdo");
    }

    // Limpar markdown se presente
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    console.log("📝 Parseando resposta da IA...");
    const resultado = JSON.parse(jsonContent);

    // 4. Criar plano estratégico
    console.log("💾 Salvando plano estratégico...");
    const { data: plano, error: planoError } = await supabase
      .from("planos_estrategicos")
      .insert({
        cliente_id: clienteId,
        titulo: `Plano Estratégico ${duracaoMeses} meses - ${cliente.nome}`,
        periodo_inicio: new Date().toISOString(),
        periodo_fim: new Date(Date.now() + duracaoMeses * 30 * 24 * 60 * 60 * 1000).toISOString(),
        missao: resultado.plano_estrategico.missao,
        visao: resultado.plano_estrategico.visao,
        valores: resultado.plano_estrategico.valores,
        analise_swot: resultado.plano_estrategico.swot,
        origem_ia: true,
        dados_onboarding: onboarding,
      })
      .select()
      .single();

    if (planoError) throw planoError;

    // 5. Criar metas
    console.log(`🎯 Criando ${resultado.metas.length} metas...`);
    const metasParaInserir = resultado.metas.map((meta: any) => ({
      cliente_id: clienteId,
      origem_onboarding_id: onboardingId,
      tipo_meta: meta.area === "vendas" ? "vendas" : meta.area === "branding" ? "alcance" : "engajamento",
      titulo: meta.titulo,
      descricao: meta.descricao,
      valor_alvo: meta.valor_alvo,
      valor_atual: 0,
      unidade: meta.unidade,
      area_foco: meta.area,
      mes_referencia: meta.mes_referencia,
      periodo_inicio: new Date(Date.now() + (meta.mes_referencia - 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      periodo_fim: new Date(Date.now() + meta.mes_referencia * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "em_andamento",
      progresso_percent: 0,
    }));

    const { error: metasError } = await supabase
      .from("cliente_metas")
      .insert(metasParaInserir);

    if (metasError) throw metasError;

    // 6. Atualizar onboarding
    console.log("📋 Atualizando onboarding...");
    await supabase
      .from("cliente_onboarding")
      .update({
        relatorio_ia_gerado: resultado.relatorio_markdown,
        relatorio_gerado_em: new Date().toISOString(),
        plano_estrategico_id: plano.id,
      })
      .eq("id", onboardingId);

    // 7. Criar campanhas
    let campanhasCriadas = 0;
    if (campanhasMensais.length > 0) {
      console.log(`📅 Criando ${campanhasMensais.length} campanhas...`);
      const campanhasParaInserir = campanhasMensais.map((camp: any) => ({
        nome: camp.nome,
        cliente_id: clienteId,
        tipo_campanha: camp.tipo,
        objetivo: camp.descricao || `Campanha ${camp.nome}`,
        data_inicio: new Date(Date.now() + (camp.mes - 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        data_fim: new Date(Date.now() + camp.mes * 30 * 24 * 60 * 60 * 1000).toISOString(),
        origem_onboarding: true,
        onboarding_id: onboardingId,
        ativo: true,
      }));

      const { error: campError } = await supabase
        .from("campanha")
        .insert(campanhasParaInserir);

      if (!campError) campanhasCriadas = campanhasMensais.length;
    }

    console.log("✅ Análise concluída com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        relatorio: resultado.relatorio_markdown,
        metas_criadas: resultado.metas.length,
        campanhas_criadas: campanhasCriadas,
        plano_estrategico_id: plano.id,
        cronograma: resultado.cronograma,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
