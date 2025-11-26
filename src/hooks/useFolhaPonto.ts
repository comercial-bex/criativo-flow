import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FolhaPonto {
  id: string;
  colaborador_id: string;
  competencia: string;
  status: 'pendente' | 'aprovado_gestor' | 'aprovado_rh' | 'rejeitado';
}

/**
 * Hook de Folha de Ponto - DESABILITADO
 * Tabela rh_folha_ponto foi removida
 */
export function useFolhaPonto(_userId?: string, _competencia?: string) {
  return {
    pontos: [],
    isLoading: false,
    salvar: (_data?: any) => console.warn('⚠️ rh_folha_ponto removida'),
    aprovar: (_id: string) => Promise.resolve(),
    rejeitar: (_id: string) => Promise.resolve(),
  };
}
