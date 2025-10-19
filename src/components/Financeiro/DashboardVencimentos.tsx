import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardVencimentos } from "@/hooks/useTitulosFinanceiros";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardVencimentos() {
  const { data: dashboard, isLoading } = useDashboardVencimentos();

  const pagar = dashboard?.find(d => d.tipo === 'pagar');
  const receber = dashboard?.find(d => d.tipo === 'receber');

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Contas a Pagar - Vencidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Contas Vencidas (Pagar)
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(pagar?.valor_vencidos || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {pagar?.total_vencidos || 0} título(s)
          </p>
        </CardContent>
      </Card>

      {/* Contas a Pagar - Próximos 7 dias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Vencendo em 7 dias (Pagar)
          </CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(pagar?.valor_vencendo_7d || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {pagar?.total_vencendo_7d || 0} título(s)
          </p>
        </CardContent>
      </Card>

      {/* Contas a Receber - Inadimplentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inadimplentes (Receber)
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(receber?.valor_vencidos || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {receber?.total_vencidos || 0} título(s)
          </p>
        </CardContent>
      </Card>

      {/* Contas a Receber - Total Pendente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            A Receber (Total)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(receber?.valor_total_pendente || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Próximos 30 dias: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(receber?.valor_vencendo_7d || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
