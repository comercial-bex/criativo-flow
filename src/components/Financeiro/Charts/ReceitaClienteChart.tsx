import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReceitaClienteChartProps {
  data: any[];
  loading: boolean;
  onExport?: () => void;
}

export function ReceitaClienteChart({ data, loading, onExport }: ReceitaClienteChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="chart-receita-cliente">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-['Montserrat']">Receita por Cliente</CardTitle>
          <CardDescription>Top 10 clientes por faturamento</CardDescription>
        </div>
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <defs>
              <linearGradient id="clientGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#C3F012" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              opacity={0.3}
              horizontal={false}
            />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              dataKey="clienteNome" 
              type="category" 
              width={120}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) =>
                `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(var(--primary) / 0.3)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
            <Bar 
              dataKey="valor" 
              fill="url(#clientGradient)"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
