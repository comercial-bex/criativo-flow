/**
 * Hook de Insights de Produtividade - DESABILITADO
 * Tabela produtividade_insights_foco foi removida
 */
export function useProdutividadeInsights() {
  return {
    insights: null,
    loading: false,
    gerarNovaPrevisao: () => console.warn('⚠️ produtividade_insights_foco removida'),
    refresh: () => {},
  };
}
