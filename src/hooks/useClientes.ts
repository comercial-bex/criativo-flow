import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

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
// FETCH CLIENTES COM CACHE
// ============================================================================
export function useClientes() {
  return useQuery({
    queryKey: [QUERY_KEY],
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
  });
}

// ============================================================================
// FETCH CLIENTE INDIVIDUAL
// ============================================================================
export function useCliente(clienteId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, clienteId],
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
      return data;
    },
    enabled: !!clienteId,
    staleTime: 3 * 60 * 1000, // 3 minutos
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
      return data;
    },
    onSuccess: (novoCliente) => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      
      // Adicionar otimisticamente ao cache
      queryClient.setQueryData<Cliente[]>([QUERY_KEY], (old = []) => {
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
      return updated;
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      // Snapshot do estado anterior
      const previousClientes = queryClient.getQueryData<Cliente[]>([QUERY_KEY]);

      // Atualização otimista
      queryClient.setQueryData<Cliente[]>([QUERY_KEY], (old = []) => {
        return old.map(c => c.id === id ? { ...c, ...data } : c);
      });

      return { previousClientes };
    },
    onError: (error, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousClientes) {
        queryClient.setQueryData([QUERY_KEY], context.previousClientes);
      }
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cliente atualizado com sucesso!');
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
    },
    onMutate: async (clienteId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previousClientes = queryClient.getQueryData<Cliente[]>([QUERY_KEY]);

      // Remover otimisticamente
      queryClient.setQueryData<Cliente[]>([QUERY_KEY], (old = []) => {
        return old.filter(c => c.id !== clienteId);
      });

      return { previousClientes };
    },
    onError: (error, variables, context) => {
      if (context?.previousClientes) {
        queryClient.setQueryData([QUERY_KEY], context.previousClientes);
      }
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao deletar cliente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cliente removido com sucesso!');
    },
  });
}

// ============================================================================
// ESTATÍSTICAS DE CLIENTES (com cache agressivo)
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
        comAssinatura: data.filter(c => c.assinatura_id).length,
        semAssinatura: data.filter(c => !c.assinatura_id).length,
      };

      return stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - stats mudam menos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}
