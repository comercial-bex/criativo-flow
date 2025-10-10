import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface FolhaEvolutionChartProps {
  data: Array<{
    mes: string;
    total_liquido: number;
    total_encargos: number;
    total_colaboradores: number;
  }>;
  loading?: boolean;
}

export function FolhaEvolutionChart({ data, loading }: FolhaEvolutionChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução da Folha de Pagamento</CardTitle>
        <CardDescription>Análise mensal de custos e colaboradores</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorEncargos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="mes" 
              className="text-sm fill-muted-foreground"
            />
            <YAxis 
              className="text-sm fill-muted-foreground"
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total_liquido" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Total Líquido"
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="total_encargos" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              name="Encargos"
              dot={{ fill: 'hsl(var(--destructive))', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
