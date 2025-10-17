import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LancamentoContabil {
  id: string;
  numero_lancamento: number;
  data_lancamento: string;
  descricao: string;
  tipo_origem: 'folha' | 'adiantamento' | 'manual' | 'ponto' | 'outros';
  origem_id?: string;
  conta_debito_id: string;
  conta_credito_id: string;
  valor: number;
  centro_custo?: string;
  unidade?: string;
  created_by?: string;
  created_at?: string;
}

export function useLancamentosContabeis(filters?: {
  dataInicio?: string;
  dataFim?: string;
  tipoOrigem?: string;
}) {
  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ['lancamentos-contabeis', filters],
    queryFn: async () => {
      let query = supabase
        .from('financeiro_lancamentos')
        .select(`
          *,
          conta_debito:conta_debito_id(codigo, nome),
          conta_credito:conta_credito_id(codigo, nome)
        `, { count: 'exact' })
        .order('data_lancamento', { ascending: false })
        .range(0, 49); // Paginação: primeiros 50 registros
      
      if (filters?.dataInicio) query = query.gte('data_lancamento', filters.dataInicio);
      if (filters?.dataFim) query = query.lte('data_lancamento', filters.dataFim);
      if (filters?.tipoOrigem) query = query.eq('tipo_origem', filters.tipoOrigem);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30 * 1000, // 30 segundos (dados críticos)
    gcTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    lancamentos,
    isLoading,
  };
}
