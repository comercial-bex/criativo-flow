/**
 * Hook de Reflexão de Produtividade - DESABILITADO
 * Tabela produtividade_reflexao foi removida
 */
export function useProdutividadeReflexao() {
  return {
    reflexoes: [],
    reflexaoHoje: null,
    loading: false,
    saving: false,
    salvarReflexao: () => console.warn('⚠️ produtividade_reflexao removida'),
    gerarInsightIA: () => console.warn('⚠️ produtividade_reflexao removida'),
    refresh: () => {},
  };
}
