import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, isToday, isWithinInterval, addDays } from 'date-fns';

export function useGestaoContasAnalytics(tipo: 'pagar' | 'receber') {
  return useQuery({
    queryKey: ['gestao-contas-analytics', tipo],
    queryFn: async () => {
      const hoje = new Date();
      const ultimos30Dias = format(subDays(hoje, 30), 'yyyy-MM-dd');
      
      // Buscar todos os títulos do tipo
      const { data: titulos } = await supabase
        .from('titulos_financeiros')
        .select(`
          *,
          clientes(nome),
          fornecedores(razao_social)
        `)
        .eq('tipo', tipo)
        .gte('data_vencimento', ultimos30Dias)
        .order('data_vencimento', { ascending: true });
      
      if (!titulos) {
        return {
          totalPendente: 0,
          totalVencido: 0,
          totalPago: 0,
          venceHoje: 0,
          vence7Dias: 0,
          countPendente: 0,
          countVencido: 0,
          countVenceHoje: 0,
          evolucaoDiaria: [],
          titulosVencendoHoje: [],
          topEntidades: [],
        };
      }
      
      // Calcular métricas
      const totalPendente = titulos.filter(t => t.status === 'pendente').reduce((acc, t) => acc + (t.valor_liquido || 0), 0);
      const totalVencido = titulos.filter(t => t.status === 'vencido').reduce((acc, t) => acc + (t.valor_liquido || 0), 0);
      const totalPago = titulos.filter(t => t.status === 'pago').reduce((acc, t) => acc + (t.valor_pago || 0), 0);
      
      const titulosVencendoHoje = titulos.filter(t => isToday(new Date(t.data_vencimento)) && t.status === 'pendente');
      const venceHoje = titulosVencendoHoje.reduce((acc, t) => acc + (t.valor_liquido || 0), 0);
      
      const vence7Dias = titulos.filter(t => 
        isWithinInterval(new Date(t.data_vencimento), { start: hoje, end: addDays(hoje, 7) }) && 
        t.status === 'pendente'
      ).reduce((acc, t) => acc + (t.valor_liquido || 0), 0);
      
      // Agrupar por data para gráficos (últimos 30 dias)
      const porData: Record<string, { data: string; previsto: number; realizado: number }> = {};
      
      for (let i = 0; i < 30; i++) {
        const data = subDays(hoje, 29 - i);
        const dataFormatada = format(data, 'dd/MM');
        porData[dataFormatada] = { data: dataFormatada, previsto: 0, realizado: 0 };
      }
      
      titulos.forEach(t => {
        const dataVencimento = new Date(t.data_vencimento);
        if (isWithinInterval(dataVencimento, { start: subDays(hoje, 29), end: hoje })) {
          const data = format(dataVencimento, 'dd/MM');
          if (porData[data]) {
            porData[data].previsto += t.valor_liquido || 0;
            if (t.status === 'pago') {
              porData[data].realizado += t.valor_pago || 0;
            }
          }
        }
      });
      
      // Top 5 entidades (clientes ou fornecedores)
      const porEntidade: Record<string, number> = {};
      titulos.forEach(t => {
        if (t.status !== 'pago') {
      const nome = tipo === 'receber' 
        ? (t.clientes as any)?.nome || 'Não identificado'
        : (t.fornecedores as any)?.razao_social || 'Não identificado';
          porEntidade[nome] = (porEntidade[nome] || 0) + (t.valor_liquido || 0);
        }
      });
      
      const topEntidades = Object.entries(porEntidade)
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
      
      return {
        totalPendente,
        totalVencido,
        totalPago,
        venceHoje,
        vence7Dias,
        countPendente: titulos.filter(t => t.status === 'pendente').length,
        countVencido: titulos.filter(t => t.status === 'vencido').length,
        countVenceHoje: titulosVencendoHoje.length,
        evolucaoDiaria: Object.values(porData),
        titulosVencendoHoje,
        topEntidades,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
