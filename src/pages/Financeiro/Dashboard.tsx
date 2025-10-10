import { useState } from 'react';
import { startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { useFinancialAnalytics, FinancialFilters } from '@/hooks/useFinancialAnalytics';
import { useFinancialExports } from '@/hooks/useFinancialExports';
import { DashboardHeader } from '@/components/Financeiro/DashboardHeader';
import { KPICards } from '@/components/Financeiro/KPICards';
import { FilterBar, FilterValues } from '@/components/Financeiro/FilterBar';
import { ReceitasDespesasChart } from '@/components/Financeiro/Charts/ReceitasDespesasChart';
import { ComposicaoReceitasChart } from '@/components/Financeiro/Charts/ComposicaoReceitasChart';
import { ComposicaoDespesasChart } from '@/components/Financeiro/Charts/ComposicaoDespesasChart';
import { ReceitaClienteChart } from '@/components/Financeiro/Charts/ReceitaClienteChart';
import { useQueryClient } from '@tanstack/react-query';

export default function FinanceiroDashboard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FinancialFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    type: "all",
  });

  const {
    kpis,
    loadingKPIs,
    receitasDespesas,
    loadingReceitasDespesas,
    composicaoReceitas,
    loadingComposicaoReceitas,
    composicaoDespesas,
    loadingComposicaoDespesas,
    receitaPorCliente,
    loadingReceitaCliente,
  } = useFinancialAnalytics(filters);

  const { exportChartAsPNG, exportConsolidatedPDF } = useFinancialExports();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["financial-kpis"] });
    queryClient.invalidateQueries({ queryKey: ["receitas-despesas-mensal"] });
    queryClient.invalidateQueries({ queryKey: ["composicao-receitas"] });
    queryClient.invalidateQueries({ queryKey: ["composicao-despesas"] });
    queryClient.invalidateQueries({ queryKey: ["receita-cliente"] });
  };

  const handleExport = () => {
    const chartIds = [
      "chart-receitas-despesas",
      "chart-composicao-receitas",
      "chart-composicao-despesas",
      "chart-receita-cliente",
    ];
    exportConsolidatedPDF(kpis, chartIds);
  };

  const handleApplyFilters = (filterValues: FilterValues) => {
    let startDate: Date;
    let endDate: Date;

    switch (filterValues.periodo) {
      case "trimestre":
        startDate = subMonths(new Date(), 3);
        endDate = new Date();
        break;
      case "ano":
        startDate = startOfYear(new Date());
        endDate = new Date();
        break;
      default:
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
    }

    setFilters({
      ...filters,
      startDate,
      endDate,
      type: filterValues.tipo,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <DashboardHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onConfig={() => {}}
        isRefreshing={loadingKPIs}
      />

      <KPICards data={kpis} loading={loadingKPIs} />

      <FilterBar onApply={handleApplyFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReceitasDespesasChart
          data={receitasDespesas || []}
          loading={loadingReceitasDespesas}
          onExport={() => exportChartAsPNG("chart-receitas-despesas", "receitas-despesas")}
        />

        <ComposicaoReceitasChart
          data={composicaoReceitas || []}
          loading={loadingComposicaoReceitas}
          onExport={() => exportChartAsPNG("chart-composicao-receitas", "composicao-receitas")}
        />

        <ComposicaoDespesasChart
          data={composicaoDespesas || []}
          loading={loadingComposicaoDespesas}
          onExport={() => exportChartAsPNG("chart-composicao-despesas", "composicao-despesas")}
        />

        <ReceitaClienteChart
          data={receitaPorCliente || []}
          loading={loadingReceitaCliente}
          onExport={() => exportChartAsPNG("chart-receita-cliente", "receita-cliente")}
        />
      </div>
    </div>
  );
}