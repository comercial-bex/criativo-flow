import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinanceiroKPIs {
  totalReceber: number;
  totalPagar: number;
  saldoLiquido: number;
  vencendoHoje: number;
}

/**
 * Hook otimizado para KPIs da página Financeiro
 * Cache de 3 minutos para evitar requisições repetidas
 */
export function useFinanceiroKPIs() {
  return useQuery({
    queryKey: ['financeiro-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('tipo, valor, status, data_vencimento');

      if (error) throw error;

      const transacoes = data || [];
      const hoje = new Date().toISOString().split('T')[0];

      const kpis: FinanceiroKPIs = {
        totalReceber: transacoes
          .filter(t => t.tipo === 'receber' && t.status !== 'cancelado')
          .reduce((sum, t) => sum + Number(t.valor), 0),
        
        totalPagar: transacoes
          .filter(t => t.tipo === 'pagar' && t.status !== 'cancelado')
          .reduce((sum, t) => sum + Number(t.valor), 0),
        
        saldoLiquido: 0, // Calculado abaixo
        
        vencendoHoje: transacoes
          .filter(t => t.data_vencimento === hoje && t.status === 'pendente')
          .length,
      };

      kpis.saldoLiquido = kpis.totalReceber - kpis.totalPagar;

      return kpis;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
