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
      // Retornar array vazio até view ser criada
      return [] as DREItem[];
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
