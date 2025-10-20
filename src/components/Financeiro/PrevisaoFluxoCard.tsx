import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrevisaoFluxo } from "@/hooks/usePrevisaoFluxo";
import { useState } from "react";

export function PrevisaoFluxoCard() {
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('semana');
  const { data, isLoading } = usePrevisaoFluxo(periodo);
  
  if (isLoading) return <Skeleton className="h-[350px] w-full" />;
  
  const saldoPositivo = (data?.saldoProjetado || 0) >= 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  const periodoLabel = {
    hoje: 'Hoje',
    semana: '7 dias',
    mes: '30 dias'
  };
  
  return (
    <Card className={saldoPositivo ? '' : 'border-destructive'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Previsão de Fluxo</CardTitle>
          <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="hoje" className="text-xs">Hoje</TabsTrigger>
              <TabsTrigger value="semana" className="text-xs">7 dias</TabsTrigger>
              <TabsTrigger value="mes" className="text-xs">30 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saldo Atual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Saldo Atual em Caixa</span>
          </div>
          <span className="text-lg font-bold">
            {formatCurrency(data?.saldoCaixa || 0)}
          </span>
        </div>
        
        {/* Entradas Previstas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Entradas Previstas</span>
          </div>
          <span className="text-lg font-bold text-success">
            + {formatCurrency(data?.totalReceber || 0)}
          </span>
        </div>
        
        {/* Saídas Previstas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">Saídas Previstas</span>
          </div>
          <span className="text-lg font-bold text-destructive">
            - {formatCurrency(data?.totalPagar || 0)}
          </span>
        </div>
        
        <Separator />
        
        {/* Saldo Projetado */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium">Saldo Projetado ({periodoLabel[periodo]})</span>
          <span className={`text-2xl font-bold ${saldoPositivo ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(data?.saldoProjetado || 0)}
          </span>
        </div>
        
        {!saldoPositivo && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção: Saldo Negativo Projetado</AlertTitle>
            <AlertDescription>
              Com as entradas e saídas previstas, o saldo ficará negativo. Revise os pagamentos ou busque receitas adicionais.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
