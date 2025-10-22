import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AggregatedInsights {
  objetivos: string[];
  publico_alvo: string[];
  concorrentes: string[];
  dores: string[];
  oportunidades: string[];
  total_notas: number;
  score_medio: number;
}

export function useNotasInsights(clienteId: string) {
  return useQuery({
    queryKey: ['notas-insights', clienteId],
    queryFn: async (): Promise<AggregatedInsights> => {
      const { data, error } = await supabase.rpc('fn_agregar_insights_notas', {
        p_cliente_id: clienteId
      });

      if (error) {
        console.error("Erro ao buscar insights:", error);
        throw error;
      }

      if (!data || typeof data !== 'object') {
        return {
          objetivos: [],
          publico_alvo: [],
          concorrentes: [],
          dores: [],
          oportunidades: [],
          total_notas: 0,
          score_medio: 0
        };
      }

      return data as unknown as AggregatedInsights;
    },
    enabled: !!clienteId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}