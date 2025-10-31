import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProdutividade } from '@/hooks/useProdutividade';
import { Activity, Clock, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProdutividadeWidgetProps {
  colaboradorId?: string;
  titulo?: string;
}

export function ProdutividadeWidget({ colaboradorId, titulo = "Produtividade (7 dias)" }: ProdutividadeWidgetProps) {
  const { data: produtividade, isLoading } = useProdutividade(colaboradorId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalTarefas = produtividade?.reduce((acc, p) => acc + p.tarefas_concluidas, 0) || 0;
  const mediaLeadTime = produtividade?.length 
    ? produtividade.reduce((acc, p) => acc + p.lead_time_medio_dias, 0) / produtividade.length
    : 0;

  const chartData = produtividade?.map(p => ({
    nome: p.responsavel_nome.split(' ')[0],
    tarefas: p.tarefas_concluidas,
    leadTime: p.lead_time_medio_dias
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {titulo}
        </CardTitle>
        <CardDescription>
          Tarefas concluídas e lead time médio por responsável
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalTarefas}</p>
              <p className="text-xs text-muted-foreground">Tarefas concluídas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mediaLeadTime.toFixed(1)} dias</p>
              <p className="text-xs text-muted-foreground">Lead time médio</p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="nome" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="tarefas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado de produtividade disponível
          </p>
        )}
      </CardContent>
    </Card>
  );
}
