export const STEP_DESCRIPTIONS = {
  1: {
    title: "Identificação da Empresa",
    importance: "Base fundamental do relatório. Define o contexto e posicionamento inicial.",
    connection: "Esses dados são usados para personalizar todo o relatório e comparar com concorrentes.",
    impact: "Sem essas informações, o relatório ficará genérico e sem contexto específico do negócio.",
    examples: "Nome, segmento, site, descrição da empresa"
  },
  2: {
    title: "Mercado & Análise SWOT",
    importance: "Contextualiza o ambiente competitivo e identifica oportunidades/ameaças.",
    connection: "A IA usa esses insights para fazer recomendações estratégicas no relatório final.",
    impact: "Sem SWOT, o relatório perde a análise estratégica e recomendações personalizadas.",
    examples: "Concorrentes diretos, pontos fortes, fraquezas, oportunidades"
  },
  3: {
    title: "Análise de Concorrentes",
    importance: "Permite comparação direta com players do mercado.",
    connection: "Cada concorrente é analisado pela IA para gerar gráficos comparativos e insights competitivos.",
    impact: "Sem concorrentes, não há benchmark - o relatório fica limitado a análise interna.",
    examples: "Sites, redes sociais, pontos fortes de cada concorrente"
  },
  4: {
    title: "Análise de IA",
    importance: "A IA processa todos os dados coletados dos concorrentes.",
    connection: "Gera scores, métricas e análises que alimentam o relatório final.",
    impact: "Esta é a etapa de processamento - dados brutos viram insights acionáveis.",
    examples: "SEO score, presença digital, engajamento social"
  },
  5: {
    title: "Relatório Final",
    importance: "Consolida tudo em um documento profissional e acionável.",
    connection: "Une: identificação + SWOT + análise de concorrentes + insights de IA.",
    impact: "Gera uma apresentação one-page e documento markdown completo.",
    examples: "Dashboard visual, recomendações estratégicas, próximos passos"
  }
};

export type StepDescription = typeof STEP_DESCRIPTIONS[keyof typeof STEP_DESCRIPTIONS];
