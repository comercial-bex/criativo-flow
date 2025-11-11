/**
 * @deprecated Use useProjetosOptimized from '@/hooks/useProjetosOptimized'
 * Este hook será removido em versões futuras.
 * Migre para o hook otimizado com TanStack Query para melhor performance e cache compartilhado.
 */

import { useAuth } from './useAuth';
import { 
  useProjetosOptimized, 
  useCreateProjetoOptimized, 
  useUpdateProjetoOptimized, 
  useDeleteProjetoOptimized,
  useProjetoLucro,
  type Projeto as ProjetoOptimized
} from '@/hooks/useProjetosOptimized';

export interface Projeto {
  id: string;
  cliente_id: string | null;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string;
  tipo_projeto: 'plano_editorial' | 'avulso' | 'campanha';
  data_inicio: string | null;
  data_prazo: string | null;
  created_by: string | null;
  responsavel_grs_id: string | null;
  responsavel_atendimento_id: string | null;
  orcamento_estimado: number | null;
  progresso: number;
  created_at: string;
  updated_at: string;
  clientes?: {
    nome: string;
  };
  profiles?: {
    nome: string;
  };
}

export interface TarefaProjeto {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string | null;
  setor_responsavel: string;
  responsavel_id: string | null;
  status: string;
  prioridade: string;
  data_inicio: string | null;
  data_prazo: string | null;
  horas_estimadas: number | null;
  horas_trabalhadas: number;
  dependencias: string[] | null;
  anexos: string[] | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  responsavel?: {
    nome: string;
  };
  projetos?: {
    titulo: string;
    clientes?: {
      nome: string;
    };
  };
}

interface ProjetoLucro {
  total_receitas: number;
  total_custos: number;
  lucro_liquido: number;
  margem_lucro: number;
}

/**
 * Hook legado que usa hooks otimizados internamente
 * Mantido apenas para retrocompatibilidade
 */
export function useProjetos() {
  const { user } = useAuth();
  
  // Usar hooks otimizados
  const { data, isLoading, refetch } = useProjetosOptimized({ 
    includeRelations: true,
    pageSize: 50 
  });
  
  const createMutation = useCreateProjetoOptimized();
  const updateMutation = useUpdateProjetoOptimized();
  const deleteMutation = useDeleteProjetoOptimized();

  const projetos = (data?.projetos || []) as Projeto[];

  // Wrapper functions para manter compatibilidade
  const createProjeto = async (projeto: Partial<Projeto>) => {
    if (!user) return null;
    
    try {
      const result = await createMutation.mutateAsync(projeto as any);
      return result;
    } catch (error) {
      return null;
    }
  };

  const updateProjeto = async (id: string, updates: Partial<Projeto>) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteProjeto = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Funções de tarefas mantidas vazias para compatibilidade
  const createTarefa = async (tarefa: Partial<TarefaProjeto>) => {
    console.warn('createTarefa está deprecated. Use hooks específicos de tarefas.');
    return null;
  };

  const updateTarefa = async (id: string, updates: Partial<TarefaProjeto>) => {
    console.warn('updateTarefa está deprecated. Use hooks específicos de tarefas.');
    return false;
  };

  const calcularLucro = async (projetoId: string): Promise<ProjetoLucro> => {
    console.warn('calcularLucro está deprecated. Use useProjetoLucro hook diretamente.');
    // Retorna valores padrão - usuário deve usar o hook otimizado
    return {
      total_receitas: 0,
      total_custos: 0,
      lucro_liquido: 0,
      margem_lucro: 0
    };
  };

  return {
    projetos,
    tarefas: [] as TarefaProjeto[], // Vazio - usar hooks específicos de tarefas
    loading: isLoading,
    isLoading,
    fetchProjetos: refetch,
    fetchTarefasPorSetor: (setor?: string) => {}, // Deprecated
    createProjeto,
    updateProjeto,
    deleteProjeto,
    createTarefa,
    updateTarefa,
    calcularLucro,
  };
}