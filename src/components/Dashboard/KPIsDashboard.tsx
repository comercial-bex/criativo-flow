import { useKPIDashboard } from '@/hooks/useKPIDashboard';
import { useAlertasCriticos } from '@/hooks/useAlertasCriticos';
import { StatsGrid } from '@/components/StatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Wrench,
  UserCheck,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function KPIsDashboard() {
  const { data: kpis, isLoading } = useKPIDashboard();
  const { data: alertas } = useAlertasCriticos();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar KPIs</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os indicadores do dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  // Alertas Críticos
  const alertasCriticos = alertas?.filter(a => a.severidade === 'erro' && a.quantidade > 0) || [];
  const alertasAtencao = alertas?.filter(a => a.severidade === 'alerta' && a.quantidade > 0) || [];

  // KPIs Financeiros
  const statsFinanceiros = [
    {
      title: 'Receita Mês Atual',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.receita_mes_atual),
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Lucro Mês Atual',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.lucro_mes_atual),
      icon: kpis.lucro_mes_atual >= 0 ? TrendingUp : TrendingDown,
      color: kpis.lucro_mes_atual >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
    },
    {
      title: 'Inadimplência Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.inadimplencia_total),
      icon: AlertTriangle,
      color: kpis.inadimplencia_total > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Folha Prevista',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.folha_prevista_mes),
      icon: UserCheck,
      color: 'bg-blue-500/10 text-blue-500'
    }
  ];

  // KPIs Operacionais
  const statsOperacionais = [
    {
      title: 'Projetos Ativos',
      value: kpis.projetos_ativos,
      icon: FolderKanban,
      description: `${kpis.projetos_concluidos_mes} concluídos este mês`,
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      title: 'Tarefas Atrasadas',
      value: kpis.tarefas_atrasadas,
      icon: Clock,
      description: `${kpis.tarefas_pendentes} pendentes`,
      color: kpis.tarefas_atrasadas > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Clientes Ativos',
      value: kpis.clientes_ativos,
      icon: Users,
      description: `${kpis.novos_clientes_mes} novos este mês`,
      color: 'bg-cyan-500/10 text-cyan-500'
    },
    {
      title: 'Aprovações Pendentes',
      value: kpis.aprovacoes_pendentes,
      icon: FileCheck,
      color: kpis.aprovacoes_pendentes > 5 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
    }
  ];

  // KPIs Metas e Inventário
  const statsExtras = [
    {
      title: 'Metas Concluídas',
      value: kpis.metas_concluidas,
      icon: Target,
      description: `${kpis.metas_atrasadas} atrasadas`,
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      title: 'Progresso Médio Metas',
      value: `${kpis.progresso_medio_metas?.toFixed(0) || 0}%`,
      icon: TrendingUp,
      color: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      title: 'Equipamentos em Uso',
      value: `${kpis.equipamentos_em_uso}/${kpis.equipamentos_ativos}`,
      icon: Wrench,
      description: `${kpis.manutencoes_vencidas} manutenções vencidas`,
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: 'Colaboradores Ativos',
      value: kpis.colaboradores_ativos,
      icon: UserCheck,
      color: 'bg-teal-500/10 text-teal-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {alertasCriticos.length > 0 && (
        <div className="space-y-2">
          {alertasCriticos.map((alerta, idx) => (
            <Alert key={idx} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {getAlertTitle(alerta.tipo_alerta)}
                <Badge variant="destructive">{alerta.quantidade}</Badge>
              </AlertTitle>
              <AlertDescription>
                {getAlertDescription(alerta)}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Alertas de Atenção */}
      {alertasAtencao.length > 0 && (
        <div className="space-y-2">
          {alertasAtencao.map((alerta, idx) => (
            <Alert key={idx}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {getAlertTitle(alerta.tipo_alerta)}
                <Badge>{alerta.quantidade}</Badge>
              </AlertTitle>
              <AlertDescription>
                {getAlertDescription(alerta)}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Header com timestamp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dashboard de KPIs</span>
            <span className="text-sm font-normal text-muted-foreground">
              Atualizado {formatDistanceToNow(new Date(kpis.atualizado_em), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Métricas consolidadas do sistema • Atualização automática a cada 5 minutos
          </div>
        </CardContent>
      </Card>

      {/* KPIs Financeiros */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📊 Indicadores Financeiros</h3>
        <StatsGrid stats={statsFinanceiros} columns={4} />
      </div>

      {/* KPIs Operacionais */}
      <div>
        <h3 className="text-lg font-semibold mb-4">⚙️ Indicadores Operacionais</h3>
        <StatsGrid stats={statsOperacionais} columns={4} />
      </div>

      {/* KPIs Metas e Inventário */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🎯 Metas e Recursos</h3>
        <StatsGrid stats={statsExtras} columns={4} />
      </div>
    </div>
  );
}

function getAlertTitle(tipo: string): string {
  const titles: Record<string, string> = {
    manutencao_vencida: '🔧 Manutenções Vencidas',
    tarefas_atrasadas: '⚠️ Tarefas Atrasadas',
    metas_criticas: '🚨 Metas Críticas',
    aprovacoes_pendentes: '⏰ Aprovações Pendentes',
    inadimplencia_alta: '💰 Inadimplência Alta'
  };
  return titles[tipo] || tipo;
}

function getAlertDescription(alerta: AlertaCritico): string {
  const descriptions: Record<string, string> = {
    manutencao_vencida: 'Equipamentos precisam de manutenção urgente',
    tarefas_atrasadas: 'Tarefas com prazo vencido aguardando conclusão',
    metas_criticas: 'Metas com mais de 30 dias de atraso',
    aprovacoes_pendentes: 'Aprovações aguardando há mais de 48 horas',
    inadimplencia_alta: 'Clientes com inadimplência superior a R$ 10.000'
  };
  return descriptions[alerta.tipo_alerta] || 'Requer atenção imediata';
}
