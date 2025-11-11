import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Reutilizar interfaces do hook existente
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
}

export interface ProjetoInput extends Partial<Projeto> {
  titulo: string;
  cliente_id: string;
}

const QUERY_KEY = 'projetos-optimized';

// ============================================================================
// FETCH PROJETOS COM CACHE E FILTROS AVANÇADOS
// ============================================================================
interface FetchProjetosParams {
  clienteId?: string;
  responsavelGrsId?: string;
  responsavelAtendimentoId?: string;
  status?: string;
  tipo?: 'plano_editorial' | 'avulso' | 'campanha';
  includeRelations?: boolean;
  excludeStatuses?: string[];
  page?: number;
  pageSize?: number;
  orderBy?: 'created_at' | 'data_prazo' | 'titulo';
  ascending?: boolean;
  limit?: number;
}

export function useProjetosOptimized(params: FetchProjetosParams = {}) {
  const { 
    page = 0, 
    pageSize = 50,
    clienteId,
    responsavelGrsId,
    responsavelAtendimentoId,
    status,
    tipo,
    includeRelations = false,
    excludeStatuses,
    orderBy = 'created_at',
    ascending = false,
    limit
  } = params;

  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: async () => {
      let query = supabase
        .from('projetos')
        .select(
          includeRelations 
            ? `
              *,
              clientes (
                id,
                nome,
                email,
                telefone,
                logo_url
              ),
              pessoas!projetos_responsavel_grs_id_fkey (
                id,
                nome,
                email
              ),
              created_by_pessoa:pessoas!projetos_created_by_fkey (
                id,
                nome,
                email
              )
            `
            : '*',
          { count: 'exact' }
        );

      // Aplicar filtros
      if (clienteId) query = query.eq('cliente_id', clienteId);
      if (responsavelGrsId) query = query.eq('responsavel_grs_id', responsavelGrsId);
      if (responsavelAtendimentoId) query = query.eq('responsavel_atendimento_id', responsavelAtendimentoId);
      if (status) query = query.eq('status', status as any);
      if (tipo) query = query.eq('tipo_projeto', tipo);
      if (excludeStatuses && excludeStatuses.length > 0) {
        // Usar filtro OR para excluir múltiplos status
        const statusFilter = excludeStatuses.map(s => `status.neq.${s}`).join(',');
        query = query.or(statusFilter);
      }

      // Ordenação
      query = query.order(orderBy, { ascending });

      // Paginação ou limite
      if (limit) {
        query = query.limit(limit);
      } else {
        query = query.range(page * pageSize, (page + 1) * pageSize - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Tabela de projetos não encontrada');
        }
        throw error;
      }

      return { 
        projetos: (data || []) as any as Projeto[], 
        total: count || 0 
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
  });
}

// ============================================================================
// FETCH PROJETO INDIVIDUAL
// ============================================================================
export function useProjetoOptimized(projetoId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, projetoId],
    queryFn: async () => {
      if (!projetoId) return null;

      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          clientes (
            id,
            nome,
            email,
            telefone,
            logo_url
          ),
          pessoas!projetos_responsavel_grs_id_fkey (
            id,
            nome,
            email
          ),
          tarefa (
            id,
            titulo,
            descricao,
            status,
            prioridade,
            data_prazo,
            responsavel_id,
            horas_estimadas,
            horas_trabalhadas
          ),
          transacoes_financeiras (
            id,
            tipo,
            titulo,
            valor,
            status,
            data_vencimento
          )
        `)
        .eq('id', projetoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projetoId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// ============================================================================
// CRIAR PROJETO COM CACHE OTIMISTA
// ============================================================================
export function useCreateProjetoOptimized() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projeto: any) => {
      const { data, error } = await supabase
        .from('projetos')
        .insert([projeto])
        .select()
        .single();

      if (error) throw error;
      return data as Projeto;
    },
    onSuccess: (novoProjeto) => {
      // Invalidar todas as queries de projetos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      
      // Adicionar otimisticamente ao cache
      queryClient.setQueryData<{ projetos: Projeto[]; total: number }>(
        [QUERY_KEY, {}], 
        (old) => {
          if (!old) return { projetos: [novoProjeto], total: 1 };
          return {
            projetos: [novoProjeto, ...old.projetos],
            total: old.total + 1
          };
        }
      );

      toast.success('Projeto criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto: ' + error.message);
    },
  });
}

// ============================================================================
// ATUALIZAR PROJETO
// ============================================================================
export function useUpdateProjetoOptimized() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('projetos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Projeto;
    },
    onMutate: async ({ id, updates }) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      // Snapshot do estado anterior
      const previous = queryClient.getQueryData([QUERY_KEY, {}]);

      // Atualização otimista
      queryClient.setQueryData<{ projetos: Projeto[]; total: number }>(
        [QUERY_KEY, {}], 
        (old) => {
          if (!old) return old;
          return {
            ...old,
            projetos: old.projetos.map(p => 
              p.id === id ? { ...p, ...updates } : p
            )
          };
        }
      );

      return { previous };
    },
    onError: (error, variables, context) => {
      // Rollback em caso de erro
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, {}], context.previous);
      }
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Projeto atualizado com sucesso!');
    },
  });
}

// ============================================================================
// DELETAR PROJETO
// ============================================================================
export function useDeleteProjetoOptimized() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previous = queryClient.getQueryData([QUERY_KEY, {}]);

      // Remover otimisticamente
      queryClient.setQueryData<{ projetos: Projeto[]; total: number }>(
        [QUERY_KEY, {}], 
        (old) => {
          if (!old) return old;
          return {
            projetos: old.projetos.filter(p => p.id !== id),
            total: old.total - 1
          };
        }
      );

      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, {}], context.previous);
      }
      console.error('Erro ao deletar projeto:', error);
      toast.error('Erro ao excluir projeto');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Projeto excluído com sucesso!');
    },
  });
}

// ============================================================================
// ESTATÍSTICAS DE PROJETOS
// ============================================================================
export function useProjetosStatsOptimized(clienteId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('projetos')
        .select('status, prioridade, progresso, orcamento_estimado, tipo_projeto');

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        porStatus: {
          planejamento: data.filter((p: any) => p.status === 'planejamento').length,
          emAndamento: data.filter((p: any) => p.status === 'em_andamento').length,
          pausado: data.filter((p: any) => p.status === 'pausado').length,
          concluido: data.filter((p: any) => p.status === 'concluido').length,
          cancelado: data.filter((p: any) => p.status === 'cancelado').length,
        },
        porPrioridade: {
          baixa: data.filter(p => p.prioridade === 'baixa').length,
          media: data.filter(p => p.prioridade === 'media').length,
          alta: data.filter(p => p.prioridade === 'alta').length,
          urgente: data.filter(p => p.prioridade === 'urgente').length,
        },
        porTipo: {
          planoEditorial: data.filter(p => p.tipo_projeto === 'plano_editorial').length,
          avulso: data.filter(p => p.tipo_projeto === 'avulso').length,
          campanha: data.filter(p => p.tipo_projeto === 'campanha').length,
        },
        progressoMedio: data.length > 0 
          ? data.reduce((sum, p) => sum + p.progresso, 0) / data.length 
          : 0,
        orcamentoTotal: data.reduce((sum, p) => sum + (p.orcamento_estimado || 0), 0),
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// ============================================================================
// CALCULAR LUCRO DO PROJETO (com cache)
// ============================================================================
export function useProjetoLucro(projetoId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'lucro', projetoId],
    queryFn: async () => {
      if (!projetoId) return null;

      const { data, error } = await supabase
        .rpc('fn_calcular_lucro_projeto' as any, {
          p_projeto_id: projetoId
        });

      if (error) throw error;
      
      return data[0] as {
        total_receitas: number;
        total_custos: number;
        lucro_liquido: number;
        margem_lucro: number;
      };
    },
    enabled: !!projetoId,
    staleTime: 5 * 60 * 1000, // 5 minutos - cálculos pesados
  });
}
