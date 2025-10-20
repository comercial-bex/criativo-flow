import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardMes {
  mes: string;
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  margem_lucro_percent: number;
  qtd_receitas: number;
  qtd_despesas: number;
}

export interface LancamentoOrigem {
  id: string;
  data_lancamento: string;
  descricao: string;
  tipo_origem: string;
  origem_id: string;
  valor: number;
  tarefa_titulo: string | null;
  projeto_titulo: string | null;
  cliente_nome: string | null;
  evento_titulo: string | null;
  tipo_transacao: string;
  percentual_projeto: number | null;
}

export function useFinanceiroDashboard() {
  const { data: dashboardData = [], isLoading: loadingDashboard } = useQuery({
    queryKey: ["dashboard-financeiro"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_dashboard_financeiro_data', {});

      if (error) throw error;
      return data as DashboardMes[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutos
  });

  const { data: lancamentosOrigem = [], isLoading: loadingLancamentos } = useQuery({
    queryKey: ["lancamentos-origem"],
    queryFn: async () => {
      // Retornar array vazio por enquanto até view ser criada
      return [] as LancamentoOrigem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Refresh manual da materialized view
  const refreshDashboard = async () => {
    const { error } = await supabase.rpc("refresh_dashboard_financeiro");
    if (error) throw error;
  };

  // Cálculos de métricas gerais
  const metricsAtual = dashboardData[0] || {
    total_receitas: 0,
    total_despesas: 0,
    saldo: 0,
    margem_lucro_percent: 0,
  };

  const receitasPorOrigem = lancamentosOrigem
    .filter(l => l.tipo_transacao === 'receita')
    .reduce((acc, l) => {
      const origem = l.tipo_origem || 'indefinido';
      acc[origem] = (acc[origem] || 0) + Number(l.valor);
      return acc;
    }, {} as Record<string, number>);

  const despesasPorOrigem = lancamentosOrigem
    .filter(l => l.tipo_transacao === 'despesa')
    .reduce((acc, l) => {
      const origem = l.tipo_origem || 'indefinido';
      acc[origem] = (acc[origem] || 0) + Number(l.valor);
      return acc;
    }, {} as Record<string, number>);

  return {
    dashboardData,
    lancamentosOrigem,
    loadingDashboard,
    loadingLancamentos,
    refreshDashboard,
    metrics: {
      atual: metricsAtual,
      receitasPorOrigem,
      despesasPorOrigem,
    },
  };
}