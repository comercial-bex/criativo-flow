import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMetasVisualizacao, StatusMeta } from '@/hooks/useMetasVisualizacao';
import { Loader2, Target, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { MetaCard } from './MetaCard';
import { MetasAlerts } from './MetasAlerts';
import { MetasProgressChart } from './MetasProgressChart';
import { Badge } from '@/components/ui/badge';

interface MetasDashboardProps {
  clienteId?: string;
}

export function MetasDashboard({ clienteId }: MetasDashboardProps) {
  const [tipoFiltro, setTipoFiltro] = useState<string>('todas');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('all');

  // Calcular período baseado no filtro
  const periodo = periodoFiltro === 'all' ? undefined : (() => {
    const fim = new Date();
    const inicio = new Date();
    
    switch (periodoFiltro) {
      case '30d':
        inicio.setDate(inicio.getDate() - 30);
        break;
      case '60d':
        inicio.setDate(inicio.getDate() - 60);
        break;
      case '90d':
        inicio.setDate(inicio.getDate() - 90);
        break;
    }
    
    return { inicio, fim };
  })();

  const { data, isLoading } = useMetasVisualizacao({
    clienteId,
    tipoMeta: tipoFiltro === 'todas' ? undefined : tipoFiltro as any,
    periodo,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { metas = [], stats } = data || { stats: { total: 0, em_dia: 0, em_risco: 0, atrasadas: 0, concluidas: 0, progresso_medio: 0 } };

  // Filtrar metas críticas (atrasadas ou em risco)
  const metasCriticas = metas.filter(m => 
    m.status_calculado === 'atrasada' || m.status_calculado === 'em_risco'
  );

  const statusConfig: Record<StatusMeta, { label: string; color: string; icon: any }> = {
    em_dia: { label: 'Em Dia', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
    em_risco: { label: 'Em Risco', color: 'bg-warning/10 text-warning border-warning/20', icon: AlertTriangle },
    atrasada: { label: 'Atrasadas', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: Clock },
    concluida: { label: 'Concluídas', color: 'bg-primary/10 text-primary border-primary/20', icon: Target },
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Metas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso e desempenho das metas
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os tipos</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="alcance">Alcance</SelectItem>
              <SelectItem value="engajamento">Engajamento</SelectItem>
              <SelectItem value="trafego">Tráfego</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="60d">Últimos 60 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Progresso médio: {stats.progresso_medio.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {(['em_dia', 'em_risco', 'atrasada', 'concluida'] as StatusMeta[]).map(status => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const count = stats[status] || 0;

          return (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <Badge className={`mt-2 ${config.color} border`} variant="outline">
                  {((count / stats.total) * 100 || 0).toFixed(0)}%
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas de Metas Críticas */}
      {metasCriticas.length > 0 && (
        <MetasAlerts metas={metasCriticas} />
      )}

      {/* Gráfico de Progresso Geral */}
      {metas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução das Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetasProgressChart metas={metas} />
          </CardContent>
        </Card>
      )}

      {/* Lista de Metas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Todas as Metas ({metas.length})</h2>
        
        {metas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma meta encontrada com os filtros selecionados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metas.map(meta => (
              <MetaCard key={meta.id} meta={meta} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
