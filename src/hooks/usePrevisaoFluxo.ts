import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format } from 'date-fns';

export function usePrevisaoFluxo(periodo: 'hoje' | 'semana' | 'mes' = 'semana') {
  return useQuery({
    queryKey: ['previsao-fluxo', periodo],
    queryFn: async () => {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const dataFim = format(
        periodo === 'hoje' ? new Date() :
        periodo === 'semana' ? addDays(new Date(), 7) :
        addDays(new Date(), 30),
        'yyyy-MM-dd'
      );
      
      // Buscar contas a receber pendentes
      const { data: receber } = await supabase
        .from('titulos_financeiros')
        .select('valor_liquido, data_vencimento')
        .eq('tipo', 'receber')
        .in('status', ['pendente', 'vencido'])
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', dataFim);
      
      // Buscar contas a pagar pendentes
      const { data: pagar } = await supabase
        .from('titulos_financeiros')
        .select('valor_liquido, data_vencimento')
        .eq('tipo', 'pagar')
        .in('status', ['pendente', 'vencido'])
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', dataFim);
      
      // Buscar saldo atual em caixa/bancos
      const { data: saldoAtual } = await supabase
        .from('contas_bancarias')
        .select('saldo_atual')
        .eq('ativo', true);
      
      const totalReceber = receber?.reduce((acc, t) => acc + (t.valor_liquido || 0), 0) || 0;
      const totalPagar = pagar?.reduce((acc, t) => acc + (t.valor_liquido || 0), 0) || 0;
      const saldoCaixa = saldoAtual?.reduce((acc, c) => acc + (c.saldo_atual || 0), 0) || 0;
      const saldoProjetado = saldoCaixa + totalReceber - totalPagar;
      
      return {
        saldoCaixa,
        totalReceber,
        totalPagar,
        saldoProjetado,
        periodoAnalise: periodo,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
