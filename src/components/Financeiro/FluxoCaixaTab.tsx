import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export function FluxoCaixaTab() {
  const [periodo, setPeriodo] = useState<'mensal' | 'trimestral' | 'anual'>('mensal');

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-financeiro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mv_dashboard_financeiro')
        .select('*')
        .order('mes', { ascending: true })
        .limit(12);
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Preparar dados para gráficos
  const chartData = (dashboardData || []).map((item: any) => ({
    mes: new Date(item.mes).toLocaleDateString('pt-BR', { month: 'short' }),
    entradas: item.total_receitas || 0,
    saidas: item.total_despesas || 0,
    saldo: (item.total_receitas || 0) - (item.total_despesas || 0),
  }));

  // Calcular totais
  const totalEntradas = (dashboardData || []).reduce((acc: number, item: any) => 
    acc + (item.total_receitas || 0), 0
  );
  const totalSaidas = (dashboardData || []).reduce((acc: number, item: any) => 
    acc + (item.total_despesas || 0), 0
  );
  const saldoLiquido = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entradas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Saídas</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(saldoLiquido)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${saldoLiquido >= 0 ? 'text-green-600' : 'text-destructive'}`} />
          </div>
        </Card>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Entradas vs Saídas (Mensal)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução do Saldo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
