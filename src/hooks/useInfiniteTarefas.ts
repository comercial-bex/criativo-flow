import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FetchTarefasOptions {
  clienteId?: string;
  projetoId?: string;
  status?: string;
  limit?: number;
}

export function useInfiniteTarefas(options: FetchTarefasOptions = {}) {
  const { clienteId, projetoId, status, limit = 20 } = options;

  return useInfiniteQuery({
    queryKey: ['tarefas-infinite', clienteId, projetoId, status],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('tarefa')
        .select('*')
        .range(pageParam, pageParam + limit - 1)
        .order('created_at', { ascending: false });

      if (clienteId) {
        // Buscar projetos do cliente primeiro
        const { data: projetos } = await supabase
          .from('projetos')
          .select('id')
          .eq('cliente_id', clienteId);
        
        const projetoIds = projetos?.map(p => p.id) || [];
        if (projetoIds.length > 0) {
          query = query.in('projeto_id', projetoIds);
        } else {
          return []; // Sem projetos = sem tarefas
        }
      }

      if (projetoId) {
        query = query.eq('projeto_id', projetoId);
      }

      if (status) {
        query = query.eq('status', status as any);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
