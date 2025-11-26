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
export function useFolhaPonto() {
  return {
    pontos: [],
    isLoading: false,
    salvar: () => console.warn('⚠️ rh_folha_ponto removida'),
    aprovar: () => console.warn('⚠️ rh_folha_ponto removida'),
    rejeitar: () => console.warn('⚠️ rh_folha_ponto removida'),
  };
}
