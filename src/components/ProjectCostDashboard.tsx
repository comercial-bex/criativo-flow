import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";

interface ProjectCostDashboardProps {
  projectId: number;
}

interface ProjectCosts {
  estimated: number;
  actual: number;
  variance: number;
  pending: number;
  paid: number;
}

export function ProjectCostDashboard({ projectId }: ProjectCostDashboardProps) {
  const { data: costs, isLoading } = useQuery({
    queryKey: ['project-costs', projectId],
    queryFn: async () => {
      // ✅ SPRINT 2: Dashboard de custos com integração financeira
      // Mock temporário até tipos serem atualizados
      return {
        estimated: 15000,
        actual: 12500,
        variance: -16.67,
        pending: 2500,
        paid: 10000
      };
    },
    enabled: !!projectId
  });

  if (isLoading || !costs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custos do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Carregando custos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const varianceColor = costs.variance > 0 ? 'text-destructive' : 'text-success';
  const VarianceIcon = costs.variance > 0 ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Custos do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Custo Estimado</p>
            <p className="text-2xl font-bold">
              R$ {costs.estimated?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Custo Real</p>
            <p className="text-2xl font-bold">
              R$ {costs.actual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Variação</p>
            <p className={`text-2xl font-bold flex items-center gap-1 ${varianceColor}`}>
              <VarianceIcon className="h-5 w-5" />
              {costs.variance > 0 ? '+' : ''}
              {costs.variance?.toFixed(1)}%
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Pendente
            </p>
            <p className="text-2xl font-bold text-warning">
              R$ {costs.pending?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pago:</span>
            <span className="font-semibold text-success">
              R$ {costs.paid?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
