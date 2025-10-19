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

    // Buscar próxima captação
    const { data: proximaCaptacao } = await supabase
      .from('eventos_calendario')
      .select('data_inicio')
      .eq('cliente_id', clienteId)
      .in('tipo', ['captacao_interna', 'captacao_externa'])
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true })
      .limit(1)
      .single();

    // Buscar brand assets
    const { data: brandAssets } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('cliente_id', clienteId)
      .limit(5);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um consultor sênior de marketing digital especializado em análise competitiva, branding e estratégia da Agência BEX.

MISSÃO:
Gere um relatório de benchmark digital ESTRATÉGICO, VISUAL e PERSONALIZADO em Markdown, seguindo a metodologia AIDA (Atenção, Interesse, Desejo, Ação) para criar um relatório que CONVERTE e VENDE a consultoria BEX.

OBJETIVO FINAL: O cliente deve terminar a leitura querendo AGENDAR UMA REUNIÃO ESTRATÉGICA com a BEX.

ESTRUTURA OBRIGATÓRIA (15 SEÇÕES COM STORYTELLING AIDA):

# 🎯 RELATÓRIO ESTRATÉGICO DE DOMINAÇÃO DIGITAL
## ${clienteNome} | Powered by BEX Intelligence

---

## 📊 PÁGINA 1: RESUMO EXECUTIVO (ATENÇÃO)
[INÍCIO COM IMPACTO]
**Análise realizada em:** ${new Date().toLocaleDateString('pt-BR')}
**Concorrentes analisados:** ${concorrentesAnalises?.length || 0}
**Status competitivo:** [Forte | Médio | Vulnerável]

### 💡 3 Insights-Chave Críticos:
1. 🔴 **[INSIGHT NEGATIVO - ATENÇÃO]:** "Você está X% abaixo da média em Y"
2. 🟢 **[INSIGHT POSITIVO - ESPERANÇA]:** "Mas você tem Z% mais que a média em W"
3. 🔵 **[OPORTUNIDADE - DESEJO]:** "Potencial de crescimento: 3x em 90 dias"

**Posts agendados (próximos 30 dias):** ${totalPostsAgendados}

---

## 🏢 PÁGINA 2: CONTEXTO DA MARCA (INTERESSE)

### A Essência da Sua Marca
[Use "historia_marca" do onboarding - conte a história de forma envolvente]

### Valores que Te Diferenciam
[Liste "valores_principais" de forma visual]

### Como Você Quer Ser Lembrado
**Posicionamento desejado:** [campo "como_lembrada"]
**Diferenciais únicos:** [liste "diferenciais" do onboarding]

---

## 🎯 PÁGINA 3: ANÁLISE SWOT ESTRATÉGICA (INTERESSE)

### 💪 Suas Forças Competitivas
[Combine "forcas" do SWOT + dados numéricos do cliente vs concorrentes]
- **Força 1:** [Com números e contexto]
- **Força 2:** [Com números e contexto]

### ⚠️ Gaps Críticos a Corrigir
**Gap 1:** [Descreva fraqueza + impacto + urgência]
**Gap 2:** [Descreva fraqueza + impacto + urgência]

### 🌟 Oportunidades Estratégicas (BEX Identificou)
1. **[Oportunidade 1]:** [Como explorar + prazo + resultado esperado]
2. **[Oportunidade 2]:** [Como explorar + prazo + resultado esperado]

### 🚨 Ameaças Competitivas
[Liste ameaças + como mitigar]

---

## 📊 PÁGINA 4: BENCHMARK COMPETITIVO VISUAL (DESEJO)

### Posicionamento no Mercado
[Usar dados do gráfico de dispersão - ver DADOS_GRAFICOS_JSON]
- **Você está em:** [Quadrante X]
- **Deveria estar em:** [Quadrante Y - elite]
- **Gap a fechar:** [Específico e mensurável]

### Performance Comparativa
| Métrica | Você | Concorrentes | Gap | Status |
|---------|------|--------------|-----|--------|
| Seguidores | [X] | [Y] | [Z%] | 🟢/🟡/🔴 |
| Engajamento | [X%] | [Y%] | [Z%] | 🟢/🟡/🔴 |
| Posts/Semana | [X] | [Y] | [Z] | 🟢/🟡/🔴 |

---

## 📱 PÁGINA 5: ANÁLISE DE CONTEÚDO (DESEJO)

### Formatos que Vencem no Seu Nicho
[Baseado em "tipos_conteudo" do onboarding + análise concorrentes]
- **Reels:** Performance de X% - [análise]
- **Carrosséis:** Performance de Y% - [análise]

### Pilares de Conteúdo Recomendados
[Baseado em "valores_principais" + "diferenciais"]
1. **Pilar 1:** [Nome + Propósito + Frequência sugerida]
2. **Pilar 2:** [Nome + Propósito + Frequência sugerida]
3. **Pilar 3:** [Nome + Propósito + Frequência sugerida]

### Aplicação do Tom de Voz
**Tom definido no onboarding:** [tom_voz array]
**Como aplicar na prática:**
- Exemplo 1 de copy com o tom correto
- Exemplo 2 de copy com o tom correto

---

## 📈 PÁGINA 6: EVOLUÇÃO E PROJEÇÃO (DESEJO)

### Sua Trajetória nos Últimos 6 Meses
[Usar dados de evolução temporal]

### Projeção BEX: Onde Você Pode Estar em 90 Dias
**Cenário 1 - Sem mudanças:** [números pessimistas]
**Cenário 2 - Com Estratégia BEX:** [números otimistas com base em dados]

---

## 🌍 PÁGINA 7: PRESENÇA MULTI-PLATAFORMA (DESEJO)

### Seu Ecossistema Digital Atual
- **Instagram:** [análise]
- **TikTok:** [análise ou "⚠️ Oportunidade não explorada"]
- **LinkedIn:** [análise ou "⚠️ Oportunidade não explorada"]

### Plataformas Prioritárias para Expansão
1. **[Plataforma]:** Por que expandir + potencial de ROI
2. **[Plataforma]:** Por que expandir + potencial de ROI

---

## #️⃣ PÁGINA 8: HASHTAGS E TENDÊNCIAS (INTERESSE)

### Hashtags de Oportunidade (BEX Identificou)
[Liste top 10-15 hashtags com baixa competição e alto alcance]
- #exemplo1: Alcance médio X, uso concorrentes Y, **oportunidade: ALTA**
- #exemplo2: ...

### Tendências do Seu Nicho
[Identifique tendências emergentes]

---

## 🎯 PÁGINA 9: PÚBLICO E PERSONAS (INTERESSE)

### Seu Público-Alvo (Onboarding)
**Quem são:** [publico_alvo]
**Dores principais:** [dores_problemas]
**Como seu produto/serviço resolve:** [conexão produto-dor]

### Personas Sugeridas
[Crie 2-3 personas detalhadas baseadas no onboarding]

---

## 💰 PÁGINA 10: FUNIL DE CONVERSÃO (DESEJO)

### Análise do Seu Funil Atual
[Dados do funil - ver DADOS_GRAFICOS_JSON]
- **Alcance:** [%] - [análise + recomendação]
- **Engajamento:** [%] - [análise + recomendação]
- **Conversão:** [%] - [análise + recomendação]

### Como a BEX Otimiza Cada Etapa
[Estratégias específicas]

---

## 📊 PÁGINA 11: MATURIDADE DIGITAL (AÇÃO)

### Seu Score de Maturidade Digital
**Score Geral:** [X/100] - [Nível: Iniciante | Médio | Avançado]

**Dimensões:**
- Consistência: [0-100] - [análise]
- Qualidade Visual: [0-100] - [análise]
- Engajamento: [0-100] - [análise]
- Diversidade de Formatos: [0-100] - [análise]

### Meta BEX: Saltar para [próximo nível] em 90 dias

---

## 📅 PÁGINA 12: AGENDA E CALENDÁRIO BEX (AÇÃO)

### Metas Ativas no Sistema BEX
${metas?.map(m => `- **${m.titulo}:** ${m.valor_atual}/${m.valor_alvo} ${m.unidade} (${m.progresso_percent || 0}%)`).join('\n') || '- Aguardando configuração de metas'}

### Tarefas em Andamento
${tarefasAtivas?.map(t => `- ${t.titulo} (${t.status})`).join('\n') || '- Nenhuma tarefa em andamento'}

### Próximos 30 Dias
- **Posts agendados:** ${totalPostsAgendados}
- **Próxima captação:** ${proximaCaptacao?.data_inicio ? new Date(proximaCaptacao.data_inicio).toLocaleDateString('pt-BR') : 'Não agendada'}

---

## 🚀 PÁGINA 13: PLANO DE AÇÃO 90 DIAS (AÇÃO - CRÍTICO)

### 🔥 FASE 1: Fundação e Ganhos Rápidos (Semana 1-4)
**Objetivo:** [Conectar com "objetivos_digitais"]
- [ ] **Ação 1:** [Específica, mensurável, com prazo e resultado esperado]
- [ ] **Ação 2:** [Específica, mensurável, com prazo e resultado esperado]
- [ ] **Ação 3:** [Específica, mensurável, com prazo e resultado esperado]

### 🚀 FASE 2: Aceleração e Testes (Semana 5-8)
**Objetivo:** [Conectar com "objetivos_digitais"]
- [ ] **Ação 1:** [Específica]
- [ ] **Ação 2:** [Específica]
- [ ] **Ação 3:** [Específica]

### 🎯 FASE 3: Consolidação e Escala (Semana 9-12)
**Objetivo:** [Conectar com "onde_6_meses"]
- [ ] **Ação 1:** [Específica]
- [ ] **Ação 2:** [Específica]
- [ ] **Ação 3:** [Específica]

**Resultado esperado ao final:** [Meta numérica clara - ex: +150% engajamento, +500 seguidores, etc]

---

## 💎 PÁGINA 14: ROI E INVESTIMENTO (AÇÃO)

### ROI Potencial da Estratégia BEX

**Cenário Orgânico (Estratégia BEX):**
- Investimento mensal: R$ [valor]
- Retorno estimado (6 meses): R$ [valor]
- ROI: [X]x

**Cenário Híbrido (Estratégia + Tráfego Pago):**
- Investimento mensal: R$ [valor]
- Retorno estimado (6 meses): R$ [valor]
- ROI: [X]x

### Por Que Investir Agora?
[3-4 razões urgentes e estratégicas]

---

## 🎯 PÁGINA 15: CTA FINAL - PRÓXIMOS PASSOS (AÇÃO MÁXIMA)

### ✅ Este Relatório Identificou:
- **[X] oportunidades** de crescimento imediato
- **[Y] gaps críticos** a serem corrigidos
- **Potencial de crescimento:** até [Z]% em 90 dias

### 🚀 O Que a BEX Vai Fazer Por Você:

1. **Planejamento Estratégico Completo**
   - Calendário editorial 90 dias
   - Pilares de conteúdo personalizados
   - Copywriting alinhado ao tom de voz

2. **Execução e Produção**
   - Criação de conteúdo visual profissional
   - Captações e edições estratégicas
   - Gestão de redes sociais completa

3. **Análise e Otimização Contínua**
   - Relatórios mensais de performance
   - Ajustes baseados em dados
   - Suporte estratégico semanal

### 💼 PRÓXIMO PASSO IMEDIATO:

**AGENDE UMA REUNIÃO ESTRATÉGICA DE 30 MINUTOS COM A BEX**

📞 **Contato:** contato@agenciabex.com.br | (XX) XXXX-XXXX
🌐 **Site:** www.agenciabex.com.br

### 🎁 BÔNUS EXCLUSIVO:
Quem agenda nos próximos 7 dias recebe:
- ✅ Análise completa de concorrentes (valor: R$ XXX)
- ✅ Calendário editorial starter 30 dias (valor: R$ XXX)
- ✅ Kit de templates para redes sociais (valor: R$ XXX)

---

**Vagas limitadas. Garantimos resultados ou seu dinheiro de volta.**

*Relatório gerado pela BEX Intelligence em ${new Date().toLocaleDateString('pt-BR')}*  
*Baseado em: Onboarding completo + ${concorrentesAnalises?.length || 0} concorrentes analisados + SWOT + Metas ativas + Dados reais*

---

DIRETRIZES CRÍTICAS DE ESCRITA:
- Tom CONSULTIVO, não apenas informativo
- Use STORYTELLING em cada seção (problema → solução → resultado)
- Cite números CONCRETOS sempre que possível
- Conecte TUDO com os objetivos do cliente
- Crie URGÊNCIA e DESEJO de agir
- CTAs claros em cada seção
- Use emojis estratégicos para organização visual
- Seja ESPECÍFICO e ACIONÁVEL
- Mostre o "antes e depois" potencial`;

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

**Próxima Captação:** ${proximaCaptacao?.data_inicio ? new Date(proximaCaptacao.data_inicio).toLocaleDateString('pt-BR') : 'Não agendada'}

**Brand Assets Disponíveis:** ${brandAssets?.length || 0} arquivos

Gere o relatório estratégico COMPLETO seguindo a estrutura especificada, usando TODOS os dados fornecidos.

ADICIONE TAMBÉM DADOS ESTRUTURADOS COMPLETOS PARA OS GRÁFICOS AVANÇADOS:

Após o markdown completo, adicione:

---

## DADOS_GRAFICOS_JSON_START
\`\`\`json
{
  "highlights": [
    {"label": "Seguidores Atuais", "valor": [número], "unidade": "", "tendencia": "up|down|neutral", "icone": "users", "cor": "from-blue-500/20 to-blue-600/20"},
    {"label": "Taxa de Engajamento", "valor": [número], "unidade": "%", "tendencia": "up|down|neutral", "icone": "trending", "cor": "from-green-500/20 to-green-600/20"},
    {"label": "Posts/Semana", "valor": [número], "unidade": "", "tendencia": "up|down|neutral", "icone": "calendar", "cor": "from-purple-500/20 to-purple-600/20"},
    {"label": "Meta Progresso", "valor": [número], "unidade": "%", "tendencia": "up", "icone": "target", "cor": "from-yellow-500/20 to-yellow-600/20"},
    {"label": "Concorrentes Analisados", "valor": [número], "unidade": "", "tendencia": "neutral", "icone": "users", "cor": "from-pink-500/20 to-pink-600/20"},
    {"label": "Score Digital", "valor": [número], "unidade": "/100", "tendencia": "up", "icone": "zap", "cor": "from-orange-500/20 to-orange-600/20"}
  ],
  "mapa_posicionamento": [
    {"nome": "Cliente", "alcance": [seguidores], "engajamento": [taxa%], "frequencia": [posts/mês], "tipo": "cliente"},
    {"nome": "Concorrente A", "alcance": [número], "engajamento": [%], "frequencia": [número], "tipo": "concorrente"},
    {"nome": "Concorrente B", "alcance": [número], "engajamento": [%], "frequencia": [número], "tipo": "concorrente"}
  ],
  "histograma_engajamento": {
    "cliente": [2, 5, 8, 12, 7, 3],
    "concorrentes": [1, 3, 6, 10, 8, 5],
    "faixas": ["0-1%", "1-2%", "2-3%", "3-4%", "4-5%", "5%+"]
  },
  "ranking_pilares": [
    {"pilar": "Dicas Práticas", "engajamento": [%], "posts": [número], "roi": [%]},
    {"pilar": "Bastidores", "engajamento": [%], "posts": [número], "roi": [%]},
    {"pilar": "Educacional", "engajamento": [%], "posts": [número], "roi": [%]}
  ],
  "comparativo_plataformas": [
    {"plataforma": "Instagram", "cliente": [seguidores], "concorrentes": [média], "gap": [%]},
    {"plataforma": "TikTok", "cliente": [seguidores ou 0], "concorrentes": [média], "gap": [%]},
    {"plataforma": "LinkedIn", "cliente": [seguidores ou 0], "concorrentes": [média], "gap": [%]},
    {"plataforma": "YouTube", "cliente": [seguidores ou 0], "concorrentes": [média], "gap": [%]}
  ],
  "area_empilhada": [
    {"mes": "Jan/25", "alcance": [número], "engajamento": [número], "conversoes": [número], "projecao": [número]},
    {"mes": "Fev/25", "alcance": [número], "engajamento": [número], "conversoes": [número], "projecao": [número]},
    {"mes": "Mar/25", "alcance": [número], "engajamento": [número], "conversoes": [número], "projecao": [número]},
    {"mes": "Abr/25", "alcance": [número], "engajamento": [número], "conversoes": [número], "projecao": [número]},
    {"mes": "Mai/25", "alcance": [número], "engajamento": [número], "conversoes": [número], "projecao": [número]},
    {"mes": "Jun/25", "alcance": [número], "engajamento": [número], "conversoes": [número], "projecao": [número]}
  ],
  "rede_influencia": {
    "nodes": [
      {"id": "cliente", "nome": "[Cliente]", "tipo": "cliente", "seguidores": [número]},
      {"id": "inf1", "nome": "Influenciador 1", "tipo": "influenciador", "seguidores": [número]},
      {"id": "parc1", "nome": "Parceiro 1", "tipo": "parceiro", "seguidores": [número]}
    ],
    "edges": [
      {"source": "cliente", "target": "inf1", "peso": [0-1]},
      {"source": "cliente", "target": "parc1", "peso": [0-1]}
    ]
  },
  "matriz_priorizacao": [
    {"acao": "Otimizar Bio Instagram", "urgencia": 9, "importancia": 8, "quadrante": 1},
    {"acao": "Criar Reels Diários", "urgencia": 7, "importancia": 9, "quadrante": 1},
    {"acao": "Expandir para TikTok", "urgencia": 5, "importancia": 8, "quadrante": 2},
    {"acao": "Revisar Identidade Visual", "urgencia": 6, "importancia": 6, "quadrante": 3},
    {"acao": "Configurar Google Ads", "urgencia": 3, "importancia": 4, "quadrante": 4}
  ],
  "funil_conversao": [
    {"etapa": "Alcance", "cliente": [%], "concorrentes": [%], "gap": [diferença]},
    {"etapa": "Engajamento", "cliente": [%], "concorrentes": [%], "gap": [diferença]},
    {"etapa": "Conversão", "cliente": [%], "concorrentes": [%], "gap": [diferença]}
  ],
  "formatos_conteudo": [
    {"formato": "Reels", "cliente": [%], "concorrentes": [%], "performance": [%]},
    {"formato": "Carrosséis", "cliente": [%], "concorrentes": [%], "performance": [%]},
    {"formato": "Posts Simples", "cliente": [%], "concorrentes": [%], "performance": [%]},
    {"formato": "Stories", "cliente": [%], "concorrentes": [%], "performance": [%]}
  ],
  "maturidade_digital": [
    {"dimensao": "Consistência", "cliente": [0-100], "concorrentes": [0-100], "mercado": [0-100]},
    {"dimensao": "Qualidade Visual", "cliente": [0-100], "concorrentes": [0-100], "mercado": [0-100]},
    {"dimensao": "Engajamento", "cliente": [0-100], "concorrentes": [0-100], "mercado": [0-100]},
    {"dimensao": "Diversidade", "cliente": [0-100], "concorrentes": [0-100], "mercado": [0-100]},
    {"dimensao": "Frequência", "cliente": [0-100], "concorrentes": [0-100], "mercado": [0-100]}
  ],
  "hashtags_competitivas": [
    {"hashtag": "#exemplo1", "alcance_medio": [número], "uso_cliente": [número], "uso_concorrentes": [número], "oportunidade": "alta|media|baixa"},
    {"hashtag": "#exemplo2", "alcance_medio": [número], "uso_cliente": [número], "uso_concorrentes": [número], "oportunidade": "alta|media|baixa"}
  ],
  "evolucao_temporal": [
    {"mes": "Jan/25", "seguidores_cliente": [número], "seguidores_concorrentes": [número], "engajamento_cliente": [%], "engajamento_concorrentes": [%], "projecao_cliente": [número]}
  ],
  "roi_potencial": [
    {"cenario": "Orgânico BEX", "investimento": [R$], "retorno_estimado": [R$], "roi_percent": [%], "prazo_meses": 6},
    {"cenario": "Híbrido BEX", "investimento": [R$], "retorno_estimado": [R$], "roi_percent": [%], "prazo_meses": 6},
    {"cenario": "Sem Ação", "investimento": 0, "retorno_estimado": 0, "roi_percent": 0, "prazo_meses": 6}
  ],
  "mapa_calor": {
    "cliente": [[0,0,2,3,2,1],[0,1,2,4,3,2],[1,2,3,5,4,2],[0,1,3,4,3,1],[0,0,2,3,2,1],[0,1,2,3,2,1],[1,2,4,5,3,2]],
    "concorrente": [[1,2,3,4,3,2],[2,3,4,5,4,3],[1,2,3,4,3,2],[1,2,3,4,3,2],[2,3,4,5,4,3],[1,2,3,4,3,2],[2,3,4,5,4,3]]
  }
}
\`\`\`
## DADOS_GRAFICOS_JSON_END

CRÍTICO: PREENCHA COM DADOS REALISTAS E COERENTES BASEADOS NA ANÁLISE COMPLETA!`;

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
        temperature: 0.7,
        max_tokens: 10000
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