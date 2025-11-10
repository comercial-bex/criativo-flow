import { useMemo } from "react";
import { useFinancialAnalytics, FinancialFilters } from "./useFinancialAnalytics";
import { useComercialAnalytics } from "./useComercialAnalytics";
import { useMapaDividas } from "./useMapaDividas";
import { useKPIDashboard } from "./useKPIDashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedFilters {
  startDate: string;
  endDate: string;
  type?: 'receita' | 'despesa' | 'all';
}

export function useUnifiedFinancialData(filters: UnifiedFilters) {
  // Dados financeiros (contábeis)
  const {
    kpis,
    receitasDespesas,
    composicaoReceitas,
    composicaoDespesas,
    receitaPorCliente,
    loadingKPIs,
    loadingReceitasDespesas,
    loadingComposicaoReceitas,
    loadingComposicaoDespesas,
    loadingReceitaCliente
  } = useFinancialAnalytics({
    startDate: new Date(filters.startDate),
    endDate: new Date(filters.endDate),
    type: filters.type || 'all'
  } as FinancialFilters);

  // Dados comerciais (vendas)
  const {
    stats: comercialStats,
    orcamentosRecentes,
    propostasRecentes,
    loading: loadingComercial
  } = useComercialAnalytics({
    startDate: filters.startDate,
    endDate: filters.endDate
  });

  // Mapa de dívidas (a pagar e a receber)
  const {
    mapaDividas,
    isLoading: loadingDividas,
    totais: totaisDividas
  } = useMapaDividas();

  // KPIs gerais do dashboard
  const {
    data: kpiDashboard,
    isLoading: loadingKPIDashboard,
    error: errorKPIDashboard
  } = useKPIDashboard();

  // Folha de pagamento do mês atual
  const { data: folhaPagamento, isLoading: loadingFolha } = useQuery({
    queryKey: ['folha-pagamento-mes-atual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financeiro_folha')
        .select('total_liquido, status');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 min - folha não muda com frequência
    gcTime: 15 * 60 * 1000,
  });

  // Calcular totais de folha
  const totalFolha = useMemo(() => {
    if (!folhaPagamento) return 0;
    return folhaPagamento.reduce((acc, f) => acc + Number(f.total_liquido || 0), 0);
  }, [folhaPagamento]);

  // Dividir dívidas em a pagar e a receber
  const dividasPorTipo = useMemo(() => {
    const aPagar = mapaDividas.filter(d => d.tipo === 'pagar');
    const aReceber = mapaDividas.filter(d => d.tipo === 'receber');
    
    return {
      aPagar: {
        itens: aPagar,
        total: aPagar.reduce((acc, d) => acc + d.valor_restante, 0),
        vencidas: aPagar.filter(d => d.parcelas_vencidas_count > 0).length
      },
      aReceber: {
        itens: aReceber,
        total: aReceber.reduce((acc, d) => acc + d.valor_restante, 0),
        vencidas: aReceber.filter(d => d.parcelas_vencidas_count > 0).length
      }
    };
  }, [mapaDividas]);

  // Estado de carregamento geral
  const loading = useMemo(() => {
    return loadingKPIs || 
           loadingReceitasDespesas || 
           loadingComposicaoReceitas || 
           loadingComposicaoDespesas || 
           loadingReceitaCliente ||
           loadingComercial ||
           loadingDividas ||
           loadingKPIDashboard ||
           loadingFolha;
  }, [
    loadingKPIs, 
    loadingReceitasDespesas, 
    loadingComposicaoReceitas, 
    loadingComposicaoDespesas, 
    loadingReceitaCliente,
    loadingComercial,
    loadingDividas,
    loadingKPIDashboard,
    loadingFolha
  ]);

  return {
    // Dados financeiros (contábeis)
    financeiro: {
      kpis,
      receitasDespesas,
      composicaoReceitas,
      composicaoDespesas,
      receitaPorCliente,
      dividas: {
        mapa: mapaDividas,
        totais: totaisDividas,
        porTipo: dividasPorTipo
      },
      folha: {
        total: totalFolha,
        detalhes: folhaPagamento || []
      }
    },
    // Dados comerciais
    comercial: {
      stats: comercialStats,
      orcamentosRecentes,
      propostasRecentes
    },
    // KPIs gerais
    kpiDashboard,
    errorKPIDashboard,
    // Estado
    loading
  };
}
