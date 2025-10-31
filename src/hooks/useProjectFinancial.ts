import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFinancialSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  custos_tarefas: number;
  custos_eventos: number;
  custos_folha: number;
}

export function useProjectFinancial(projetoId?: string) {
  return useQuery({
    queryKey: ['project-financial', projetoId],
    queryFn: async () => {
      if (!projetoId) return null;

      const { data, error } = await supabase.rpc('get_project_financial_summary', {
        p_projeto_id: projetoId
      });
      
      if (error) throw error;
      return data as unknown as ProjectFinancialSummary;
    },
    enabled: !!projetoId,
    staleTime: 2 * 60 * 1000, // 2min cache
  });
}
