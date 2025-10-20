import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useGestaoContasAnalytics } from "@/hooks/useGestaoContasAnalytics";

interface GraficoEvolucaoProps {
  tipo: 'pagar' | 'receber';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function GraficoEvolucao({ tipo }: GraficoEvolucaoProps) {
  const { data, isLoading } = useGestaoContasAnalytics(tipo);
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }
  
  const labels = {
    receber: {
      grafico: 'Recebimentos dos Últimos 30 Dias',
      distribuicao: 'Top 5 Clientes - A Receber'
    },
    pagar: {
      grafico: 'Pagamentos dos Últimos 30 Dias',
      distribuicao: 'Top 5 Fornecedores - A Pagar'
    }
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {/* Gráfico de Barras - Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{labels[tipo].grafico}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.evolucaoDiaria || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="data" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => 
                  new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="previsto" fill="hsl(var(--muted))" name="Previsto" />
              <Bar dataKey="realizado" fill="hsl(var(--success))" name="Realizado" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{labels[tipo].distribuicao}</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.topEntidades && data.topEntidades.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.topEntidades}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {data.topEntidades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => 
                    new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados para exibir
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
