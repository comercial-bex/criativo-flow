/**
 * @deprecated Use useProjetosGRSOptimized from '@/hooks/useProjetosGRSOptimized'
 * Este hook será removido em versões futuras.
 * Migre para o hook otimizado com TanStack Query para melhor performance e cache compartilhado.
 */

import { useAuth } from "@/hooks/useAuth";
import { useProjetosGRSOptimized } from "@/hooks/useProjetosGRSOptimized";

interface Projeto {
  id: string;
  titulo: string;
  status: string;
  data_prazo: string | null;
  cliente_id: string;
  cliente_nome: string;
  progresso: number;
}

interface Metricas {
  projetosPendentes: number;
  tarefasNovo: number;
  tarefasEmAndamento: number;
  tarefasConcluido: number;
}

export function useProjetosGRS() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useProjetosGRSOptimized(user?.id);

  return {
    projetos: (data?.projetos || []) as Projeto[],
    metricas: data?.metricas || {
      projetosPendentes: 0,
      tarefasNovo: 0,
      tarefasEmAndamento: 0,
      tarefasConcluido: 0
    } as Metricas,
    loading: isLoading,
    refresh: refetch
  };
}
