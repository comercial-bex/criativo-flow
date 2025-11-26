/**
 * Hook de Metas de Produtividade - DESABILITADO
 * Tabela produtividade_metas foi removida
 */
export function useProdutividadeMetas(_setor?: string) {
  return {
    metas: [],
    loading: false,
    criarMeta: (_data: any) => Promise.resolve(),
    atualizarProgresso: (_id: string, _progresso: number) => Promise.resolve(),
    refresh: () => {},
  };
}
