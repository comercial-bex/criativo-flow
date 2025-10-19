import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clienteId, clienteNome, clienteAnalise, concorrentesAnalises } = await req.json();
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Buscar dados completos do onboarding
    const { data: onboarding } = await supabase
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();
    
    // Buscar metas e agenda do cliente
    const { data: metas } = await supabase
      .from('cliente_metas')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('status', 'em_andamento');
    
    const { data: tarefasAtivas } = await supabase
      .from('tarefa')
      .select('titulo, status')
      .eq('cliente_id', clienteId)
      .in('status', ['aguardando', 'em_progresso'])
      .limit(5);
    
    const { data: postsAgendados } = await supabase
      .from('posts_planejamento')
      .select('count')
      .eq('cliente_id', clienteId)
      .gte('data_postagem', new Date().toISOString())
      .lte('data_postagem', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const totalPostsAgendados = postsAgendados?.[0]?.count || 0;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um consultor sênior de marketing digital especializado em análise competitiva, branding e estratégia.

MISSÃO:
Gere um relatório de benchmark digital ESTRATÉGICO, VISUAL e PERSONALIZADO em Markdown, baseado no onboarding completo do cliente.

DADOS DISPONÍVEIS:
- Onboarding completo (história, valores, SWOT, objetivos, público-alvo, tom de voz)
- Análise de concorrentes
- Metas e tarefas ativas do cliente
- Posts agendados

ESTRUTURA OBRIGATÓRIA:

# 📊 Relatório Estratégico de Benchmark Digital
## {Nome Cliente}

---

## 🎯 Resumo Executivo Estratégico
[Conecte: posição competitiva + SWOT + objetivos do cliente em 4-5 linhas impactantes]
[Mencione: "${totalPostsAgendados} posts agendados para os próximos 30 dias"]

---

## 🏢 Contexto da Marca

### História e Essência
[Use dados de "historia_marca" e "valores_principais" do onboarding]

### Posicionamento Desejado
**Como quer ser lembrada:** [campo "como_lembrada"]
**Diferenciais únicos:** [liste "diferenciais" do onboarding]

---

## 📊 Diagnóstico Atual (SWOT + Benchmark)

### 💪 Forças Identificadas
[Combine "forcas" do SWOT + pontos fortes vs. concorrentes]
- [Força 1 com números]
- [Força 2 com números]
- [Força 3]

### ⚠️ Fraquezas e Gaps Competitivos
[Combine "fraquezas" do SWOT + onde concorrentes são melhores]
**Gap Crítico 1:** [descreva o gap]
**Gap Crítico 2:** [descreva o gap]

### 🌟 Oportunidades Estratégicas
[Combine "oportunidades" do SWOT + lacunas dos concorrentes]
1. **[Oportunidade]:** [Como explorar]
2. **[Oportunidade]:** [Como explorar]

### 🚨 Ameaças e Riscos
[Combine "ameacas" do SWOT + movimentos competitivos perigosos]

---

## 📈 Análise Comparativa Digital

### Audiência
- **Cliente:** [seguidores] | **Média Concorrentes:** [X] | **Gap:** [+/-Y%]
- **Status:** Forte | Neutra | Vulnerável
- **Recomendação:** [Ação específica baseada nos objetivos do cliente]

### Engajamento
- **Cliente:** [taxa%] | **Média Concorrentes:** [X%] | **Gap:** [+/-Y%]
- **Status:** Forte | Neutra | Vulnerável
- **Recomendação:** [Conecte com "objetivos_digitais" do onboarding]

### Frequência de Publicação
- **Cliente:** [posts/semana] | **Média Concorrentes:** [X]
- **Frequência contratada:** [usar "frequencia_postagens" do onboarding]
- **Posts agendados (30 dias):** ${totalPostsAgendados}
- **Recomendação:** [Ajuste necessário]

### Qualidade e Tom de Voz
- **Tom desejado (onboarding):** [usar "tom_voz" array]
- **Tom percebido nos concorrentes:** [análise]
- **Alinhamento:** ✅ Alinhado | ⚠️ Ajustes necessários
- **Recomendação:** [Como aplicar o tom nos próximos posts]

### Formatos Vencedores no Nicho
[Conecte com "tipos_conteudo" do onboarding]
- **[Formato]:** [Performance + exemplo de concorrente]
- **[Formato]:** [Performance + exemplo de concorrente]

---

## 🎯 Estratégia de Conteúdo Personalizada

### Personas e Público-Alvo
[Use "publico_alvo" e "dores_problemas" do onboarding]
**Público principal:** [detalhe]
**Dores identificadas:** [liste as dores]
**Como nosso conteúdo resolve:** [conecte produto/serviço com dores]

### Pilares de Conteúdo Sugeridos
[Baseado em "valores_principais" + "diferenciais" + "objetivos_digitais"]
1. **Pilar 1:** [Nome] - [Propósito]
2. **Pilar 2:** [Nome] - [Propósito]
3. **Pilar 3:** [Nome] - [Propósito]

### Aplicação do Tom de Voz
**Tom definido:** [tom_voz array]
**Exemplos práticos de copywriting:**
- [Exemplo 1 aplicando o tom]
- [Exemplo 2 aplicando o tom]

---

## 💡 Plano de Ação Estratégico (90 dias)

### 🔥 Semana 1-4: Fundação e Imediatos
**Objetivo:** [conecte com "objetivos_digitais"]
- [ ] **Ação 1:** [Específica e mensurável]
- [ ] **Ação 2:** [Específica e mensurável]
- [ ] **Ação 3:** [Específica e mensurável]

### 🚀 Semana 5-8: Aceleração
**Objetivo:** [conecte com "objetivos_digitais"]
- [ ] **Ação 1:** [Específica]
- [ ] **Ação 2:** [Específica]
- [ ] **Ação 3:** [Específica]

### 🎯 Semana 9-12: Consolidação
**Objetivo:** [conecte com "onde_6_meses"]
- [ ] **Ação 1:** [Específica]
- [ ] **Ação 2:** [Específica]
- [ ] **Ação 3:** [Específica]

---

## 📊 Metas e KPIs Estratégicos

### Metas Ativas (Sistema BEX)
${metas?.map(m => `- **${m.titulo}:** ${m.valor_atual}/${m.valor_alvo} ${m.unidade} (${m.progresso_percent || 0}%)`).join('\n') || '- Nenhuma meta cadastrada'}

### Metas Sugeridas (próximos 3 meses)
[Baseado em "objetivos_digitais" + "objetivos_offline" + análise competitiva]
1. **[Meta 1]:** [Valor inicial] → [Valor alvo] em [prazo]
2. **[Meta 2]:** [Valor inicial] → [Valor alvo] em [prazo]
3. **[Meta 3]:** [Valor inicial] → [Valor alvo] em [prazo]

---

## 🔑 Diferenciais Competitivos a Explorar

[Liste e priorize os "diferenciais" do onboarding]
1. **[Diferencial 1]:** Como comunicar isso nos posts
2. **[Diferencial 2]:** Como comunicar isso nos posts
3. **[Diferencial 3]:** Como comunicar isso nos posts

**Concorrentes NÃO estão comunicando:**
- [Gap 1 identificado]
- [Gap 2 identificado]

---

## 📋 Tarefas em Andamento (Sistema BEX)
${tarefasAtivas?.map(t => `- ${t.titulo} (${t.status})`).join('\n') || '- Nenhuma tarefa em andamento'}

---

## 📝 Próximos Passos Imediatos

### 24-48 horas
- [ ] [Ação urgente conectada aos objetivos]
- [ ] [Ação urgente conectada aos objetivos]

### 1 semana
- [ ] [Ação curto prazo]
- [ ] [Ação curto prazo]

### 1 mês
- [ ] [Ação médio prazo conectada com "onde_6_meses"]

---

**📅 Próxima revisão sugerida:** ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}

*Relatório estratégico gerado pela BEX Intelligence em ${new Date().toLocaleDateString('pt-BR')}*  
*Baseado em: Onboarding completo + Análise de ${concorrentesAnalises?.length || 0} concorrentes + SWOT + Metas ativas + Agenda BEX*

---

DIRETRIZES CRÍTICAS:
- Use TODOS os dados do onboarding fornecidos
- Conecte SEMPRE com objetivos_digitais e objetivos_offline
- Cite números CONCRETOS (seguidores, engajamento, posts)
- Tom consultivo, estratégico e personalizado
- Seja ESPECÍFICO e ACIONÁVEL em cada recomendação
- Use emojis para organização visual
- Mencione metas ativas do sistema BEX
- Conecte análise competitiva com SWOT do cliente`;

    const userPrompt = `Cliente: ${clienteNome}

**Dados do Onboarding Completo:**
\`\`\`json
${JSON.stringify(onboarding || {}, null, 2)}
\`\`\`

**Análise do Cliente (Redes Sociais):**
\`\`\`json
${JSON.stringify(clienteAnalise, null, 2)}
\`\`\`

**Análises dos Concorrentes:**
\`\`\`json
${JSON.stringify(concorrentesAnalises, null, 2)}
\`\`\`

**Metas Ativas (Sistema BEX):**
\`\`\`json
${JSON.stringify(metas || [], null, 2)}
\`\`\`

**Tarefas em Andamento:**
\`\`\`json
${JSON.stringify(tarefasAtivas || [], null, 2)}
\`\`\`

**Posts Agendados (próximos 30 dias):** ${totalPostsAgendados}

Gere o relatório estratégico COMPLETO seguindo a estrutura especificada, usando TODOS os dados fornecidos.`;

    console.log('📤 Gerando relatório para:', clienteNome);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da IA:', errorText);
      throw new Error(`Erro da IA: ${response.status}`);
    }

    const data = await response.json();
    const relatorioMarkdown = data.choices[0].message.content;

    console.log('✅ Relatório gerado');

    // Contar versões existentes para este cliente
    const { count: versaoAtual } = await supabase
      .from('relatorios_benchmark')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId);

    const novaVersao = (versaoAtual || 0) + 1;

    // Extrair user_id do token de autenticação se disponível
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id;
      } catch (e) {
        console.log('Sem autenticação - relatório público');
      }
    }

    // Salvar relatório na tabela
    const { data: novoRelatorio, error: dbError } = await supabase
      .from('relatorios_benchmark')
      .insert({
        cliente_id: clienteId,
        titulo: `Relatório de Benchmark Digital - ${clienteNome}`,
        relatorio_markdown: relatorioMarkdown,
        cliente_analise: clienteAnalise,
        concorrentes_analises: concorrentesAnalises,
        versao: novaVersao,
        gerado_por: userId
      })
      .select('id, link_hash, versao')
      .single();

    if (dbError) {
      console.error('❌ Erro ao salvar relatório:', dbError);
      throw new Error('Erro ao salvar relatório no banco de dados');
    }

    console.log('✅ Relatório salvo:', novoRelatorio.id);

    // Construir URL da apresentação
    const baseUrl = supabaseUrl.replace('.supabase.co', '');
    const linkApresentacao = `${baseUrl}/apresentacao/${novoRelatorio.link_hash}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        relatorio: relatorioMarkdown,
        relatorio_id: novoRelatorio.id,
        link_hash: novoRelatorio.link_hash,
        versao: novoRelatorio.versao,
        link_apresentacao: linkApresentacao,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Erro em generate-competitive-report:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});