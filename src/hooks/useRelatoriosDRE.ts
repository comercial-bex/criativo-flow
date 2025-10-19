import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DREItem {
  mes: string;
  tipo: 'receita' | 'despesa';
  conta_codigo: string;
  conta_nome: string;
  valor_total: number;
}

export function useRelatoriosDRE(mesInicio?: string, mesFim?: string) {
  const { data: dreData = [], isLoading } = useQuery({
    queryKey: ['relatorio-dre', mesInicio, mesFim],
    queryFn: async () => {
      let query = supabase
        .from('vw_dre')
        .select('*')
        .order('mes', { ascending: false })
        .order('tipo')
        .order('conta_codigo');

      if (mesInicio) {
        query = query.gte('mes', mesInicio);
      }
      if (mesFim) {
        query = query.lte('mes', mesFim);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DREItem[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const refreshDRE = async () => {
    await supabase.rpc('refresh_relatorios_financeiros');
  };

  return {
    dreData,
    isLoading,
    refreshDRE,
  };
}
