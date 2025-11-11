import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QUERY_CONFIG } from '@/lib/queryConfig';

export interface Cliente {
  id: string;
  nome: string;
  razao_social?: string;
  nome_fantasia?: string;
  email?: string;
  telefone?: string;
  cnpj_cpf?: string;
  situacao_cadastral?: string;
  cnae_principal?: string;
  endereco?: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'arquivado';
  assinatura_id?: string;
  valor_personalizado?: number;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
  assinaturas?: any;
  projetos?: any[];
}

export interface ClienteInput {
  nome: string;
  razao_social?: string;
  nome_fantasia?: string;
  email?: string | null;
  telefone?: string | null;
  cnpj_cpf?: string | null;
  situacao_cadastral?: string;
  cnae_principal?: string;
  endereco?: string | null;
  status: 'ativo' | 'inativo' | 'pendente' | 'arquivado';
  assinatura_id?: string;
  valor_personalizado?: number;
  logo_url?: string;
}

const QUERY_KEY = 'clientes';

// ============================================================================
// FETCH TODOS CLIENTES COM CACHE OTIMIZADO
// ============================================================================
export function useClientes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          assinaturas (
            id,
            nome,
            preco,
            posts_mensais
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cliente[];
    },
    ...QUERY_CONFIG.semiStatic,
    enabled: options?.enabled !== false,
  });
}

// ============================================================================
// FETCH CLIENTES ATIVOS (mais usado, cache dedicado)
// ============================================================================
export function useClientesAtivos() {
  return useQuery({
    queryKey: [QUERY_KEY, 'ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, email, logo_url')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      return data as Cliente[];
    },
    ...QUERY_CONFIG.semiStatic,
  });
}

// ============================================================================
// FETCH CLIENTE INDIVIDUAL COM DETALHES COMPLETOS
// ============================================================================
export function useCliente(clienteId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;

      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          assinaturas (
            id,
            nome,
            preco,
            posts_mensais,
            reels_suporte,
            anuncios_facebook,
            anuncios_google
          ),
          projetos (
            id,
            titulo,
            status,
            prazo
          )
        `)
        .eq('id', clienteId)
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    enabled: !!clienteId && (options?.enabled !== false),
    ...QUERY_CONFIG.dynamic,
  });
}

// ============================================================================
// FETCH MÚLTIPLOS CLIENTES EM PARALELO
// ============================================================================
export function useClientesMultiplos(clienteIds: string[]) {
  return useQueries({
    queries: clienteIds.map(id => ({
      queryKey: [QUERY_KEY, 'detail', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as Cliente;
      },
      ...QUERY_CONFIG.semiStatic,
    })),
  });
}

// ============================================================================
// ESTATÍSTICAS DE CLIENTES (cache agressivo)
// ============================================================================
export function useClientesStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('status, assinatura_id');

      if (error) throw error;

      const stats = {
        total: data.length,
        ativos: data.filter(c => c.status === 'ativo').length,
        inativos: data.filter(c => c.status === 'inativo').length,
        pendentes: data.filter(c => c.status === 'pendente').length,
        arquivados: data.filter(c => c.status === 'arquivado').length,
        comAssinatura: data.filter(c => c.assinatura_id).length,
        semAssinatura: data.filter(c => !c.assinatura_id).length,
      };

      return stats;
    },
    ...QUERY_CONFIG.static,
  });
}

// ============================================================================
// CRIAR CLIENTE
// ============================================================================
export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clienteData: ClienteInput) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select()
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    onSuccess: (novoCliente) => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', 'clientes'] });
      
      // Adicionar otimisticamente ao cache
      queryClient.setQueryData<Cliente[]>([QUERY_KEY, 'list'], (old = []) => {
        return [novoCliente, ...old];
      });

      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao criar cliente');
    },
  });
}

// ============================================================================
// ATUALIZAR CLIENTE
// ============================================================================
export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClienteInput> }) => {
      const { data: updated, error } = await supabase
        .from('clientes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Cliente;
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      // Snapshot do estado anterior
      const previousList = queryClient.getQueryData<Cliente[]>([QUERY_KEY, 'list']);
      const previousDetail = queryClient.getQueryData<Cliente>([QUERY_KEY, 'detail', id]);

      // Atualização otimista na lista
      queryClient.setQueryData<Cliente[]>([QUERY_KEY, 'list'], (old = []) => {
        return old.map(c => c.id === id ? { ...c, ...data } : c);
      });

      // Atualização otimista no detalhe
      queryClient.setQueryData<Cliente>([QUERY_KEY, 'detail', id], (old) => {
        return old ? { ...old, ...data } : old;
      });

      return { previousList, previousDetail, id };
    },
    onError: (error, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousList) {
        queryClient.setQueryData([QUERY_KEY, 'list'], context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData([QUERY_KEY, 'detail', context.id], context.previousDetail);
      }
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente');
    },
    onSettled: (data, error, variables) => {
      // Revalidar após mutação
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', 'clientes'] });
    },
  });
}

// ============================================================================
// DELETAR CLIENTE
// ============================================================================
export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clienteId: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;
      return clienteId;
    },
    onMutate: async (clienteId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previousList = queryClient.getQueryData<Cliente[]>([QUERY_KEY, 'list']);

      // Remover otimisticamente
      queryClient.setQueryData<Cliente[]>([QUERY_KEY, 'list'], (old = []) => {
        return old.filter(c => c.id !== clienteId);
      });

      return { previousList };
    },
    onError: (error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData([QUERY_KEY, 'list'], context.previousList);
      }
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao deletar cliente');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', 'clientes'] });
    },
  });
}

// ============================================================================
// PREFETCH CLIENTE (para otimização de navegação)
// ============================================================================
export function usePrefetchCliente() {
  const queryClient = useQueryClient();

  return (clienteId: string) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEY, 'detail', clienteId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('clientes')
          .select(`
            *,
            assinaturas (
              id,
              nome,
              preco,
              posts_mensais
            ),
            projetos (
              id,
              titulo,
              status,
              prazo
            )
          `)
          .eq('id', clienteId)
          .single();

        if (error) throw error;
        return data as Cliente;
      },
    });
  };
}
