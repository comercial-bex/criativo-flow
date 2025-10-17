import { useMemo } from "react";
import { useFinancialAnalytics } from "./useFinancialAnalytics";
import { useComercialAnalytics } from "./useComercialAnalytics";
import { logger } from "@/lib/logger";

interface DashboardFilters {
  startDate: string;
  endDate: string;
  type?: 'receita' | 'despesa' | 'all';
}

export function useGestaoDashboard(filters: DashboardFilters) {
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
  });

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

  // Estado de carregamento geral
  const loading = useMemo(() => {
    const isLoading = loadingKPIs || 
           loadingReceitasDespesas || 
           loadingComposicaoReceitas || 
           loadingComposicaoDespesas || 
           loadingReceitaCliente ||
           loadingComercial;
    
    if (isLoading) {
      logger.debug('Dashboard carregando dados', 'useGestaoDashboard');
    }
    
    return isLoading;
  }, [
    loadingKPIs, 
    loadingReceitasDespesas, 
    loadingComposicaoReceitas, 
    loadingComposicaoDespesas, 
    loadingReceitaCliente,
    loadingComercial
  ]);

  return {
    // Dados financeiros
    financeiro: {
      kpis,
      receitasDespesas,
      composicaoReceitas,
      composicaoDespesas,
      receitaPorCliente
    },
    // Dados comerciais
    comercial: {
      stats: comercialStats,
      orcamentosRecentes,
      propostasRecentes
    },
    // Estado
    loading
  };
}
