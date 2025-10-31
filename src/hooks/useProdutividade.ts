import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProdutividadeMetric {
  responsavel_id: string;
  responsavel_nome: string;
  setor_responsavel: string;
  tarefas_criadas: number;
  tarefas_concluidas: number;
  tarefas_vencidas: number;
  lead_time_medio_dias: number;
}

export function useProdutividade(colaboradorId?: string) {
  return useQuery({
    queryKey: ['produtividade', colaboradorId],
    queryFn: async () => {
      let query = supabase
        .from('vw_produtividade_7d')
        .select('*')
        .order('tarefas_concluidas', { ascending: false });

      if (colaboradorId) {
        query = query.eq('responsavel_id', colaboradorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
