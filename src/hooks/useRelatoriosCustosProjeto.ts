import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustosProjetoItem {
  projeto_id: string;
  projeto_nome: string;
  cliente_id?: string;
  cliente_nome?: string;
  custo_total: number;
  receita_total: number;
  lucro_liquido: number;
  margem_lucro_percent: number;
}

export function useRelatoriosCustosProjeto(clienteId?: string) {
  const { data: custosData = [], isLoading } = useQuery({
    queryKey: ['relatorio-custos-projeto', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('vw_custos_projeto')
        .select('*');

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CustosProjetoItem[];
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    custosData,
    isLoading,
  };
}
