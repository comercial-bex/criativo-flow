import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjetoFinanceiroMetric {
  projeto_id: string;
  projeto_nome: string;
  cliente_id: string;
  cliente_nome: string;
  total_receitas: number;
  total_custos: number;
  margem_liquida: number;
  roi_percentual: number;
  total_transacoes: number;
}

export function useFinanceiroProjetoMetrics(projetoId?: string) {
  return useQuery({
    queryKey: ['financeiro-projeto-metrics', projetoId],
    queryFn: async () => {
      let query = supabase
        .from('vw_dashboard_financeiro_projeto')
        .select('*')
        .order('roi_percentual', { ascending: false });

      if (projetoId) {
        query = query.eq('projeto_id', projetoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true
  });
}
