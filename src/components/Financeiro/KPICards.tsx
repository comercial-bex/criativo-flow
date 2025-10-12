import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, PieChart, AlertCircle, Wallet } from "lucide-react";
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from "@/components/ui/bex-card";
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
      value: data?.receitaTotal || 0,
      variation: data?.receitaVariacao,
      icon: DollarSign,
      isCurrency: true,
      isPercentage: false,
    },
    {
      title: "Despesa Total",
      value: data?.despesaTotal || 0,
      variation: data?.despesaVariacao,
      icon: TrendingDown,
      isCurrency: true,
      isPercentage: false,
    },
    {
      title: "Lucro Líquido",
      value: data?.lucroLiquido || 0,
      variation: data?.lucroVariacao,
      icon: TrendingUp,
      isCurrency: true,
      isPercentage: false,
    },
    {
      title: "Margem de Lucro",
      value: data?.margemLucro || 0,
      variation: undefined,
      icon: PieChart,
      isCurrency: false,
      isPercentage: true,
    },
    {
      title: "Inadimplência",
      value: data?.inadimplencia || 0,
      variation: undefined,
      icon: AlertCircle,
      isCurrency: false,
      isPercentage: true,
    },
    {
      title: "Saldo em Caixa",
      value: data?.saldoCaixa || 0,
      variation: undefined,
      icon: Wallet,
      isCurrency: true,
      isPercentage: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {loading ? (
        kpis.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <BexCard variant="glow" className="border-t-4 border-bex">
              <BexCardHeader className="pb-2">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-8 w-24" />
              </BexCardHeader>
              <BexCardContent>
                <Skeleton className="h-4 w-20" />
              </BexCardContent>
            </BexCard>
          </motion.div>
        ))
      ) : (
        kpis.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <BexCard variant="glow" className="border-t-4 border-bex">
              <BexCardHeader className="flex flex-row items-center justify-between pb-2">
                <BexCardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </BexCardTitle>
                <div className="h-8 w-8 rounded-full bg-bex/10 flex items-center justify-center">
                  <kpi.icon className="h-4 w-4 text-bex" />
                </div>
              </BexCardHeader>
              <BexCardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {kpi.isCurrency ? (
                      <CountUp 
                        end={parseFloat(kpi.value.toString())} 
                        duration={1.5}
                        decimals={2}
                        decimal=","
                        prefix="R$ "
                        separator="."
                      />
                    ) : kpi.isPercentage ? (
                      <>
                        <CountUp 
                          end={parseFloat(kpi.value.toString())} 
                          duration={1.5}
                          decimals={1}
                          decimal=","
                        />
                        %
                      </>
                    ) : (
                      <CountUp 
                        end={parseFloat(kpi.value.toString())} 
                        duration={1.5}
                        separator="."
                      />
                    )}
                  </div>
                  {kpi.variation !== undefined && (
                    <motion.div 
                      className={`flex items-center text-xs ${
                        kpi.variation > 0 ? 'text-bex' : 'text-red-500'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {kpi.variation > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      <span>{Math.abs(kpi.variation).toFixed(1)}% vs mês anterior</span>
                    </motion.div>
                  )}
                </div>
              </BexCardContent>
            </BexCard>
          </motion.div>
        ))
      )}
    </div>
  );
}
