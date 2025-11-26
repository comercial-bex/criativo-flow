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
import { SecaoProdutividade } from "@/components/Produtividade/SecaoProdutividade";
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('[Design/Dashboard] ⚠️ Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('[Design/Dashboard] 🔍 Iniciando busca de dados...');
      console.log('[Design/Dashboard] 👤 User ID:', user.id);

      // Buscar tarefas de design
      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefa')
        .select('*')
        .eq('executor_id', user.id)
        .in('executor_area', ['Criativo', 'Audiovisual']);

      console.log('[Design/Dashboard] ✅ Tarefas:', tarefas?.length, 'itens');
      console.log('[Design/Dashboard] 📋 Tarefas completas:', tarefas);
      console.log('[Design/Dashboard] ❌ Erro:', tarefasError);

      if (tarefasError) throw tarefasError;

      // Calcular estatísticas
      const tarefasAbertas = tarefas?.filter(t => 
        ['backlog', 'a_fazer', 'briefing'].includes(t.status)
      ).length || 0;

      const tarefasEmAndamento = tarefas?.filter(t => 
        ['em_andamento', 'em_revisao', 'em_criacao', 'em_producao', 'revisao_interna'].includes(t.status)
      ).length || 0;

      const tarefasConcluidas = tarefas?.filter(t => 
        ['concluido', 'entregue', 'publicado'].includes(t.status)
      ).length || 0;

      // Próximos deadlines (próximos 7 dias)
      const proximosDeadlines = tarefas?.filter(t => {
        const dataTarefa = t.data_entrega_prevista || t.prazo_executor;
        if (!dataTarefa || ['concluido', 'entregue', 'publicado'].includes(t.status)) return false;
        const prazo = new Date(dataTarefa);
        const hoje = new Date();
        const diasDiff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        return diasDiff <= 7 && diasDiff >= 0;
      }).sort((a, b) => {
        const dateA = new Date(a.data_entrega_prevista || a.prazo_executor || 0);
        const dateB = new Date(b.data_entrega_prevista || b.prazo_executor || 0);
        return dateA.getTime() - dateB.getTime();
      }) || [];

      // Remover query de projetos (não relevante para o designer individual)
      const projetosAtivos = 0;

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
          Meus Jobs
        </h1>
        <p className="text-muted-foreground">Suas tarefas de design em um só lugar</p>
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

      {/* Seção de Produtividade Pessoal */}
      <SecaoProdutividade setor="design" defaultExpanded={false} />

      {/* Indicador de dados carregados */}
      {!loading && (
        <div className="text-xs text-muted-foreground px-4 py-2 bg-muted/30 rounded-lg border border-border/50 flex items-center gap-2">
          <span className="font-medium">📊 Dados carregados:</span>
          <span className="text-primary font-semibold">{stats.tarefasAbertas + stats.tarefasEmAndamento + stats.tarefasConcluidas}</span>
          <span>tarefa(s) total</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="kpis">
        <StatCard
          title="Tarefas de Hoje"
          value={stats.tarefasAbertas}
          icon={Clock}
          trend="Com prazo para hoje"
          color="primary"
        />
        <StatCard
          title="Em Criação"
          value={stats.tarefasEmAndamento}
          icon={Palette}
          trend="Jobs em produção"
        />
        <StatCard
          title="Em Revisão"
          value={stats.tarefasConcluidas}
          icon={Eye}
          trend="Aguardando aprovação"
        />
        <StatCard
          title="Esta Semana"
          value={stats.proximosDeadlines.length}
          icon={Calendar}
          trend="Próximos 7 dias"
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
                  const prazo = new Date(tarefa.data_entrega_prevista || tarefa.prazo_executor);
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