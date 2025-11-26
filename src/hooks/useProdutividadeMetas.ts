/**
 * Hook de Metas de Produtividade - DESABILITADO
 * Tabela produtividade_metas foi removida
 */
export function useProdutividadeMetas() {
  return {
    metas: [],
    loading: false,
    criarMeta: () => console.warn('⚠️ produtividade_metas removida'),
    atualizarProgresso: () => console.warn('⚠️ produtividade_metas removida'),
    refresh: () => {},
  };
}
