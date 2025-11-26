/**
 * Hook de Reflexão de Produtividade - DESABILITADO
 * Tabela produtividade_reflexao foi removida
 */
export function useProdutividadeReflexao(_setor?: string) {
  return {
    reflexoes: [],
    reflexaoHoje: null,
    loading: false,
    saving: false,
    salvarReflexao: (_texto: string, _humor: string) => Promise.resolve(),
    gerarInsightIA: () => Promise.resolve(),
    refresh: () => {},
  };
}
