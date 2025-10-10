import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#EF4444", "#F59E0B", "#F97316", "#DC2626", "#EA580C", "#B91C1C"];

interface ComposicaoDespesasChartProps {
  data: any[];
  loading: boolean;
  onExport?: () => void;
}

export function ComposicaoDespesasChart({ data, loading, onExport }: ComposicaoDespesasChartProps) {
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
    <Card id="chart-composicao-despesas">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-['Montserrat']">Composição de Despesas</CardTitle>
          <CardDescription>Distribuição por categoria</CardDescription>
        </div>
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.categoria}: ${entry.percentual.toFixed(1)}%`}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="valor"
              animationBegin={0}
              animationDuration={1000}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
              <Label
                value="Despesas"
                position="center"
                fill="hsl(var(--foreground))"
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat"
                }}
              />
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
