import { useClientDashboard } from '@/hooks/useClientDashboard';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Target, CheckCircle2, Clock, XCircle, Download, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors = {
  planejado: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  em_andamento: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  concluido: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelado: 'bg-red-500/10 text-red-600 border-red-500/20'
};

const statusLabels = {
  planejado: 'Planejado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

export default function ClientePlanos() {
  const { clientProfile, loading: clienteLoading } = useClientDashboard();
  const { plans, objectives, loading } = useStrategicPlans(clientProfile?.cliente_id);
  const { toast } = useToast();

  const handleExportPlan = (planId: string) => {
    // TODO: Implementar exportação de plano
    toast({
      title: 'Exportação em Desenvolvimento',
      description: 'A funcionalidade de exportação será implementada em breve.'
    });
  };

  if (clienteLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Plano Estratégico</h1>
          <p className="text-muted-foreground">
            Acompanhe os objetivos e metas estratégicas do seu negócio
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Plano Disponível</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Seu plano estratégico ainda está sendo elaborado pela nossa equipe.
              Assim que estiver pronto, você poderá acompanhar todos os objetivos e iniciativas aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activePlan = plans[0]; // Plano mais recente
  const planObjectives = objectives.filter(o => o.plano_id === activePlan.id);

  const statusCounts = {
    planejado: planObjectives.filter(o => o.status === 'planejado').length,
    em_andamento: planObjectives.filter(o => o.status === 'em_andamento').length,
    concluido: planObjectives.filter(o => o.status === 'concluido').length,
    cancelado: planObjectives.filter(o => o.status === 'cancelado').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Plano Estratégico</h1>
          <p className="text-muted-foreground">
            Acompanhe os objetivos e metas estratégicas do seu negócio
          </p>
        </div>
        <Button
          onClick={() => handleExportPlan(activePlan.id)}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Plano
        </Button>
      </div>

      {/* Header do Plano */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{activePlan.titulo}</CardTitle>
              <CardDescription className="mt-2">
                Período: {format(new Date(activePlan.periodo_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} até {format(new Date(activePlan.periodo_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-base">
              <TrendingUp className="h-4 w-4 mr-2" />
              {planObjectives.length} Objetivos
            </Badge>
          </div>
        </CardHeader>
        {(activePlan.missao || activePlan.visao) && (
          <CardContent className="space-y-4">
            {activePlan.missao && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Missão</h3>
                <p className="text-sm">{activePlan.missao}</p>
              </div>
            )}
            {activePlan.visao && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Visão</h3>
                <p className="text-sm">{activePlan.visao}</p>
              </div>
            )}
            {activePlan.valores && activePlan.valores.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Valores</h3>
                <div className="flex flex-wrap gap-2">
                  {activePlan.valores.map((valor, idx) => (
                    <Badge key={idx} variant="secondary">{valor}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Status dos Objetivos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Planejados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.planejado}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.em_andamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.concluido}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.cancelado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Objetivos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Objetivos Estratégicos</h2>
        <div className="grid gap-4">
          {planObjectives.map((objective) => (
            <Card key={objective.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{objective.objetivo}</CardTitle>
                    {objective.descricao && (
                      <CardDescription className="mt-2">{objective.descricao}</CardDescription>
                    )}
                  </div>
                  <Badge className={statusColors[objective.status]}>
                    {statusLabels[objective.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {objective.kpis && objective.kpis.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">KPIs</h4>
                    <ul className="space-y-1">
                      {objective.kpis.map((kpi, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{kpi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {objective.iniciativas && objective.iniciativas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Iniciativas</h4>
                    <ul className="space-y-1">
                      {objective.iniciativas.map((iniciativa, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{iniciativa}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  {objective.responsavel_nome && (
                    <span>Responsável: {objective.responsavel_nome}</span>
                  )}
                  {objective.prazo_conclusao && (
                    <span>Prazo: {format(new Date(objective.prazo_conclusao), "dd/MM/yyyy")}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
