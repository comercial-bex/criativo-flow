import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, PieChart, AlertCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPIData } from "@/hooks/useFinancialAnalytics";

interface KPICardsProps {
  data: KPIData | undefined;
  loading: boolean;
}

export function KPICards({ data, loading }: KPICardsProps) {
  const kpis = [
    {
      title: "Receita Total",
      value: data?.receitaTotal,
      variation: data?.receitaVariacao,
      icon: DollarSign,
      format: "currency",
    },
    {
      title: "Despesa Total",
      value: data?.despesaTotal,
      variation: data?.despesaVariacao,
      icon: TrendingDown,
      format: "currency",
    },
    {
      title: "Lucro Líquido",
      value: data?.lucroLiquido,
      variation: data?.lucroVariacao,
      icon: TrendingUp,
      format: "currency",
    },
    {
      title: "Margem de Lucro",
      value: data?.margemLucro,
      variation: undefined,
      icon: PieChart,
      format: "percent",
    },
    {
      title: "Inadimplência",
      value: data?.inadimplencia,
      variation: undefined,
      icon: AlertCircle,
      format: "percent",
    },
    {
      title: "Saldo em Caixa",
      value: data?.saldoCaixa,
      variation: undefined,
      icon: Wallet,
      format: "currency",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-['Inter']">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold font-['Montserrat']">
                  {kpi.format === "currency"
                    ? `R$ ${(kpi.value || 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `${(kpi.value || 0).toFixed(2)}%`}
                </div>
                {kpi.variation !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {kpi.variation >= 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={kpi.variation >= 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(kpi.variation).toFixed(2)}%
                    </span>
                    <span>vs mês anterior</span>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
