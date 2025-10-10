import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Clock, 
  CheckCircle2, 
  Target, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Users,
  Eye,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface DashboardStats {
  tarefasAbertas: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tempoMedioProducao: number;
  proximosDeadlines: any[];
  projetosAtivos: number;
}

export default function DesignDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    tarefasAbertas: 0,
    tarefasEmAndamento: 0,
    tarefasConcluidas: 0,
    tempoMedioProducao: 0,
    proximosDeadlines: [],
    projetosAtivos: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('design-dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar tarefas de design
      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('tipo', 'design');

      if (tarefasError) throw tarefasError;

      // Calcular estatísticas
      const tarefasAbertas = tarefas?.filter(t => ['backlog', 'to_do'].includes(t.status)).length || 0;
      const tarefasEmAndamento = tarefas?.filter(t => ['em_andamento', 'em_revisao'].includes(t.status)).length || 0;
      const tarefasConcluidas = tarefas?.filter(t => t.status === 'concluida').length || 0;

      // Próximos deadlines (próximos 7 dias)
      const proximosDeadlines = tarefas?.filter(t => {
        if (!t.data_prazo || t.status === 'concluida') return false;
        const prazo = new Date(t.data_prazo);
        const hoje = new Date();
        const diasDiff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        return diasDiff <= 7 && diasDiff >= 0;
      }).sort((a, b) => new Date(a.data_prazo).getTime() - new Date(b.data_prazo).getTime()) || [];

      // Buscar projetos ativos com tarefas de design
      const { data: projetos, error: projetosError } = await supabase
        .from('projetos')
        .select('id')
        .eq('status', 'ativo');

      if (projetosError) throw projetosError;

      const projetosAtivos = projetos?.length || 0;

      setStats({
        tarefasAbertas,
        tarefasEmAndamento,
        tarefasConcluidas,
        tempoMedioProducao: 2.5, // Placeholder - calcular baseado em dados reais
        proximosDeadlines,
        projetosAtivos
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "default" }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color === 'primary' ? 'text-primary' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Design</h1>
            <p className="text-muted-foreground">Visão geral da produção criativa</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            Dashboard Design
          </h1>
          <p className="text-muted-foreground">Visão geral da produção criativa</p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button asChild variant="outline">
            <Link to="/design/kanban">
              <Clock className="h-4 w-4 mr-2" />
              Kanban
            </Link>
          </Button>
          <Button asChild>
            <Link to="/design/calendario">
              <Calendar className="h-4 w-4 mr-2" />
              Calendário
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="kpis">
        <StatCard
          title="Tarefas Abertas"
          value={stats.tarefasAbertas}
          icon={AlertTriangle}
          trend="+12% vs. semana passada"
          color="primary"
        />
        <StatCard
          title="Em Produção"
          value={stats.tarefasEmAndamento}
          icon={Clock}
          trend="3 em revisão"
        />
        <StatCard
          title="Concluídas"
          value={stats.tarefasConcluidas}
          icon={CheckCircle2}
          trend="+8% este mês"
        />
        <StatCard
          title="Projetos Ativos"
          value={stats.projetosAtivos}
          icon={Users}
          trend="5 com alta prioridade"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximos Deadlines */}
        <Card className="lg:col-span-2" data-tour="deadlines">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Próximos Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.proximosDeadlines.length > 0 ? (
                stats.proximosDeadlines.slice(0, 5).map((tarefa) => {
                  const prazo = new Date(tarefa.data_prazo);
                  const diasRestantes = Math.ceil((prazo.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <div key={tarefa.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(prazo, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant={diasRestantes <= 1 ? "destructive" : diasRestantes <= 3 ? "default" : "secondary"}>
                        {diasRestantes === 0 ? 'Hoje' : diasRestantes === 1 ? 'Amanhã' : `${diasRestantes} dias`}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum deadline próximo
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card data-tour="acoes-rapidas">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/design/kanban">
                <Palette className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/design/aprovacoes">
                <Eye className="h-4 w-4 mr-2" />
                Revisar Aprovações
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/design/biblioteca">
                <BarChart3 className="h-4 w-4 mr-2" />
                Biblioteca de Assets
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/design/metas">
                <Target className="h-4 w-4 mr-2" />
                Ver Metas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtividade Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Gráfico de produtividade em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Posts Redes Sociais</span>
                <span className="text-sm font-medium">2.5h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Banners</span>
                <span className="text-sm font-medium">3.2h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Materiais Impressos</span>
                <span className="text-sm font-medium">4.8h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Identidade Visual</span>
                <span className="text-sm font-medium">12.5h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}