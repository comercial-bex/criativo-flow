import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getQueryConfig } from '@/lib/queryConfig';

// ============================================================================
// INTERFACES
// ============================================================================
export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  setor_responsavel: string;
  responsavel_id: string | null;
  projeto_id: string | null;
  cliente_id: string | null;
  data_inicio: string | null;
  data_prazo: string | null;
  prazo_executor: string | null;
  horas_estimadas: number | null;
  horas_trabalhadas: number;
  executor_area: string | null;
  dependencias: string[] | null;
  anexos: string[] | null;
  observacoes: string | null;
  capa_anexo_id: string | null;
  aprovacao_status: string | null;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  responsavel_nome?: string;
  cliente_nome?: string;
  projeto_nome?: string;
  pessoas?: {
    id: string;
    nome: string;
    email: string;
  };
  clientes?: {
    id: string;
    nome: string;
  };
  projetos?: {
    id: string;
    titulo: string;
  };
}

export interface TarefaInput extends Partial<Tarefa> {
  titulo: string;
}

const QUERY_KEY = 'tarefas-optimized';

// ============================================================================
// FETCH TAREFAS COM FILTROS
// ============================================================================
interface FetchTarefasParams {
  responsavelId?: string;
  projetoId?: string;
  clienteId?: string;
  status?: string;
  prioridade?: string;
  executorArea?: string | null;
  includeRelations?: boolean;
  page?: number;
  pageSize?: number;
}

export function useTarefas(params: FetchTarefasParams = {}) {
  const {
    responsavelId,
    projetoId,
    clienteId,
    status,
    prioridade,
    executorArea,
    includeRelations = false,
    page = 0,
    pageSize = 100,
  } = params;

  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: async () => {
      let query = supabase
        .from('tarefa')
        .select(
          includeRelations
            ? `
              *,
              pessoas:responsavel_id (
                id,
                nome,
                email
              ),
              clientes:cliente_id (
                id,
                nome
              ),
              projetos:projeto_id (
                id,
                titulo
              )
            `
            : '*',
          { count: 'exact' }
        );

      // Aplicar filtros
      if (responsavelId) query = query.eq('responsavel_id', responsavelId);
      if (projetoId) query = query.eq('projeto_id', projetoId);
      if (clienteId) query = query.eq('cliente_id', clienteId);
      if (status) query = query.eq('status', status as any);
      if (prioridade) query = query.eq('prioridade', prioridade as any);
      if (executorArea !== undefined) {
        if (executorArea === null) {
          query = query.or('executor_area.is.null,executor_area.eq.Criativo');
        } else {
          query = query.eq('executor_area', executorArea as any);
        }
      }

      // Ordenação e paginação
      query = query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Processar tarefas para normalizar data_prazo
      const tarefas = (data || []).map((t: any) => ({
        ...t,
        data_prazo: t.prazo_executor || t.data_prazo,
        responsavel_nome: t.pessoas?.[0]?.nome || t.pessoas?.nome,
        cliente_nome: t.clientes?.[0]?.nome || t.clientes?.nome,
        projeto_nome: t.projetos?.[0]?.titulo || t.projetos?.titulo,
      }));

      return {
        tarefas: tarefas as Tarefa[],
        total: count || 0,
      };
    },
    ...getQueryConfig('dynamic'), // Tarefas mudam frequentemente
    retry: 1,
  });
}

// ============================================================================
// FETCH MINHAS TAREFAS (com cache separado para melhor performance)
// ============================================================================
export function useMinhasTarefas(userId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'minhas', userId],
    queryFn: async () => {
      if (!userId) return { tarefas: [], total: 0 };

      const { data, error, count } = await supabase
        .from('tarefa')
        .select(
          `
          *,
          pessoas:responsavel_id (
            id,
            nome,
            email
          ),
          clientes:cliente_id (
            id,
            nome
          ),
          projetos:projeto_id (
            id,
            titulo
          )
        `,
          { count: 'exact' }
        )
        .eq('responsavel_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tarefas = (data || []).map((t: any) => ({
        ...t,
        data_prazo: t.prazo_executor || t.data_prazo,
        responsavel_nome: t.pessoas?.[0]?.nome || t.pessoas?.nome,
        cliente_nome: t.clientes?.[0]?.nome || t.clientes?.nome,
        projeto_nome: t.projetos?.[0]?.titulo || t.projetos?.titulo,
      }));

      return {
        tarefas: tarefas as Tarefa[],
        total: count || 0,
      };
    },
    enabled: !!userId,
    ...getQueryConfig('dynamic'),
    retry: 1,
  });
}

// ============================================================================
// FETCH TAREFA INDIVIDUAL
// ============================================================================
export function useTarefa(tarefaId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, tarefaId],
    queryFn: async () => {
      if (!tarefaId) return null;

      const { data, error } = await supabase
        .from('tarefa')
        .select(
          `
          *,
          pessoas:responsavel_id (
            id,
            nome,
            email
          ),
          clientes:cliente_id (
            id,
            nome
          ),
          projetos:projeto_id (
            id,
            titulo
          )
        `
        )
        .eq('id', tarefaId)
        .single();

      if (error) throw error;

      return data as any;
    },
    enabled: !!tarefaId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// ============================================================================
// CRIAR TAREFA
// ============================================================================
export function useCreateTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tarefa: any) => {
      const { data, error } = await supabase
        .from('tarefa')
        .insert([tarefa])
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      // Invalidar todas as queries de tarefas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa: ' + error.message);
    },
  });
}

// ============================================================================
// ATUALIZAR TAREFA
// ============================================================================
export function useUpdateTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('tarefa')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onMutate: async ({ id, updates }) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      // Snapshot do estado anterior
      const previousList = queryClient.getQueryData([QUERY_KEY, 'list']);
      const previousMinhas = queryClient.getQueryData([QUERY_KEY, 'minhas']);

      // Atualização otimista
      queryClient.setQueryData<{ tarefas: Tarefa[]; total: number }>(
        [QUERY_KEY, 'list'],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tarefas: old.tarefas.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          };
        }
      );

      return { previousList, previousMinhas };
    },
    onError: (error, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousList) {
        queryClient.setQueryData([QUERY_KEY, 'list'], context.previousList);
      }
      if (context?.previousMinhas) {
        queryClient.setQueryData([QUERY_KEY, 'minhas'], context.previousMinhas);
      }
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tarefa atualizada com sucesso!');
    },
  });
}

// ============================================================================
// DELETAR TAREFA
// ============================================================================
export function useDeleteTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tarefa').delete().eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previous = queryClient.getQueryData([QUERY_KEY, 'list']);

      // Remover otimisticamente
      queryClient.setQueryData<{ tarefas: Tarefa[]; total: number }>(
        [QUERY_KEY, 'list'],
        (old) => {
          if (!old) return old;
          return {
            tarefas: old.tarefas.filter((t) => t.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, 'list'], context.previous);
      }
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tarefa excluída com sucesso!');
    },
  });
}

// ============================================================================
// ESTATÍSTICAS DE TAREFAS
// ============================================================================
export function useTarefasStats(userId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          total: 0,
          em_andamento: 0,
          vencidas: 0,
          concluidas_semana: 0,
        };
      }

      const { data, error } = await supabase
        .from('tarefa')
        .select('status, data_prazo, prazo_executor, created_at')
        .eq('responsavel_id', userId);

      if (error) throw error;

      const agora = new Date();
      const inicioSemana = new Date(agora);
      inicioSemana.setDate(agora.getDate() - 7);

      const stats = {
        total: data.length,
        em_andamento: data.filter((t: any) => 
          t.status === 'em_andamento' || t.status === 'em_producao'
        ).length,
        vencidas: data.filter((t: any) => {
          const prazo = new Date(t.prazo_executor || t.data_prazo || '');
          return prazo < agora && t.status !== 'concluido' && t.status !== 'publicado';
        }).length,
        concluidas_semana: data.filter((t: any) => {
          const updated = new Date(t.created_at);
          return (
            (t.status === 'concluido' || t.status === 'publicado') &&
            updated >= inicioSemana
          );
        }).length,
      };

      return stats;
    },
    enabled: !!userId,
    ...getQueryConfig('realtime'), // Stats precisam ser atualizadas
  });
}

// ============================================================================
// PREFETCH INTELIGENTE
// ============================================================================
export function usePrefetchTarefas() {
  const queryClient = useQueryClient();

  const prefetchProjetoTarefas = async (projetoId: string) => {
    await queryClient.prefetchQuery({
      queryKey: [QUERY_KEY, 'list', { projetoId }],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tarefa')
          .select('*, pessoas:responsavel_id(nome), projetos:projeto_id(titulo)')
          .eq('projeto_id', projetoId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          tarefas: data || [],
          total: data?.length || 0,
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchMinhasTarefas = async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: [QUERY_KEY, 'minhas', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tarefa')
          .select('*')
          .eq('responsavel_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          tarefas: data || [],
          total: data?.length || 0,
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchProjetoTarefas,
    prefetchMinhasTarefas,
  };
}
