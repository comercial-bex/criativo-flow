/**
 * Hook de Insights de Produtividade - DESABILITADO
 * Tabela produtividade_insights_foco foi removida
 */
export function useProdutividadeInsights(_setor?: string) {
  return {
    insights: null,
    loading: false,
    gerarNovaPrevisao: () => Promise.resolve(),
    refresh: () => {},
  };
}
