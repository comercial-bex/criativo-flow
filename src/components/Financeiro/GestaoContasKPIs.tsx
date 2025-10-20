import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGestaoContasAnalytics } from "@/hooks/useGestaoContasAnalytics";

interface GestaoContasKPIsProps {
  tipo: 'pagar' | 'receber';
}

export function GestaoContasKPIs({ tipo }: GestaoContasKPIsProps) {
  const { data, isLoading } = useGestaoContasAnalytics(tipo);
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  const labels = {
    receber: {
      total: 'Total a Receber',
      realizado: 'Recebido Hoje',
      previsto: 'Previsto Hoje',
      vencido: 'Inadimplentes'
    },
    pagar: {
      total: 'Total a Pagar',
      realizado: 'Pago Hoje',
      previsto: 'Vence Hoje',
      vencido: 'Vencidas'
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      {/* Card 1: Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{labels[tipo].total}</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data?.totalPendente || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {data?.countPendente || 0} títulos pendentes
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Realizado Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{labels[tipo].realizado}</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(data?.totalPago || 0)}</div>
          <p className="text-xs text-muted-foreground">
            Últimos 30 dias
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Previsto para Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{labels[tipo].previsto}</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data?.venceHoje || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {data?.countVenceHoje || 0} títulos vencem hoje
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Vencidos/Inadimplentes */}
      <Card className={data?.totalVencido ? "border-destructive" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{labels[tipo].vencido}</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(data?.totalVencido || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {data?.countVencido || 0} títulos vencidos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
