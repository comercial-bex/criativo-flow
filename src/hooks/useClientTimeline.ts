import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  tipo: 'projeto' | 'tarefa' | 'aprovacao' | 'financeiro' | 'conteudo';
  titulo: string;
  data: string;
  entidade: string;
  metadata: {
    id: string;
    status?: string;
    valor?: number;
    tipo?: string;
  };
}

export function useClientTimeline(clienteId?: string, limit = 50) {
  return useQuery({
    queryKey: ['client-timeline', clienteId, limit],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase.rpc('get_cliente_timeline', {
        p_cliente_id: clienteId,
        p_limit: limit
      });
      
      if (error) {
        console.error('❌ Erro ao buscar timeline:', error);
        throw error;
      }
      
      return (data || []) as TimelineEvent[];
    },
    enabled: !!clienteId,
    staleTime: 1 * 60 * 1000, // 1min cache (timeline atualiza frequentemente)
    refetchOnWindowFocus: true,
  });
}
