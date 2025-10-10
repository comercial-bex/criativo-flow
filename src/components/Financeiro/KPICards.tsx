import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, PieChart, AlertCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPIData } from "@/hooks/useFinancialAnalytics";
import CountUp from "react-countup";
import { motion } from "framer-motion";

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

  const getBorderColor = (title: string) => {
    if (title.includes("Receita")) return "border-t-emerald-500";
    if (title.includes("Despesa")) return "border-t-red-500";
    if (title.includes("Lucro")) return "border-t-primary";
    if (title.includes("Margem")) return "border-t-blue-500";
    if (title.includes("Inadimplência")) return "border-t-orange-500";
    return "border-t-primary";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {kpis.map((kpi, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={`hover:shadow-lg transition-all duration-300 border-t-4 ${getBorderColor(kpi.title)} hover:-translate-y-1`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-['Inter'] text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <kpi.icon className="h-5 w-5 text-primary" />
              </motion.div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-['Montserrat'] text-foreground">
                    {kpi.format === "currency" ? (
                      <>
                        R${" "}
                        <CountUp
                          end={kpi.value || 0}
                          duration={1.5}
                          separator="."
                          decimals={2}
                          decimal=","
                        />
                      </>
                    ) : (
                      <>
                        <CountUp
                          end={kpi.value || 0}
                          duration={1.5}
                          decimals={2}
                          decimal=","
                        />
                        %
                      </>
                    )}
                  </div>
                  {kpi.variation !== undefined && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-xs text-muted-foreground mt-1 flex items-center gap-1"
                    >
                      <motion.div
                        animate={{ y: kpi.variation >= 0 ? [0, -3, 0] : [0, 3, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {kpi.variation >= 0 ? (
                          <ArrowUp className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600" />
                        )}
                      </motion.div>
                      <span className={kpi.variation >= 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                        {Math.abs(kpi.variation).toFixed(2)}%
                      </span>
                      <span>vs mês anterior</span>
                    </motion.p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
