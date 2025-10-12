import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Camera, Edit, Clock, Target, TrendingUp, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GamificationWidget } from "@/components/GamificationWidget";
import { useTutorial } from "@/hooks/useTutorial";
import { TutorialButton } from "@/components/TutorialButton";
import { PomodoroTimer } from "@/components/Produtividade/PomodoroTimer";
import { MetasSmart } from "@/components/Produtividade/MetasSmart";
import { InsightsIA } from "@/components/Produtividade/InsightsIA";

interface AudiovisualMeta {
  id: string;
  especialista_id: string;
  mes_ano: string;
  meta_projetos: number;
  meta_horas: number;
  projetos_concluidos: number;
  horas_trabalhadas: number;
}

interface ProjetoAudiovisual {
  id: string;
  titulo: string;
  tipo_projeto: string;
  deadline: string;
  status_review: string;
  especialista_id: string;
}

interface CaptacaoAgenda {
  id: string;
  titulo: string;
  data_captacao: string;
  local: string;
  status: string;
}

export default function AudiovisualDashboard() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [metas, setMetas] = useState<AudiovisualMeta | null>(null);
  const [projetos, setProjetos] = useState<ProjetoAudiovisual[]>([]);
  const [captacoes, setCaptacoes] = useState<CaptacaoAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const { startTutorial, hasSeenTutorial, isActive } = useTutorial('audiovisual-dashboard');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const currentMonth = format(new Date(), 'yyyy-MM-01');

      // Fetch metas do mês atual
      const { data: metasData } = await supabase
        .from('audiovisual_metas')
        .select('*')
        .eq('especialista_id', user?.id)
        .eq('mes_ano', currentMonth)
        .maybeSingle();

      setMetas(metasData);

      // Fetch projetos em andamento
      const { data: projetosData } = await supabase
        .from('projetos_audiovisual')
        .select('*')
        .eq('especialista_id', user?.id)
        .in('status_review', ['aguardando', 'em_andamento', 'review'])
        .order('deadline', { ascending: true })
        .limit(5);

      setProjetos(projetosData || []);

      // Fetch próximas captações
      const { data: captacoesData } = await supabase
        .from('captacoes_agenda')
        .select('*')
        .eq('especialista_id', user?.id)
        .gte('data_captacao', new Date().toISOString())
        .order('data_captacao', { ascending: true })
        .limit(3);

      setCaptacoes(captacoesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEspecialidadeIcon = () => {
    // Aqui você pode buscar a especialidade do usuário do perfil
    return <Video className="h-5 w-5" />;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const projetosProgress = metas ? (metas.projetos_concluidos / metas.meta_projetos) * 100 : 0;
  const horasProgress = metas ? (metas.horas_trabalhadas / metas.meta_horas) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {getEspecialidadeIcon()}
            Dashboard Audiovisual
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu desempenho e projetos em andamento
          </p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button data-tour="nova-captacao" className="gap-2">
            <Calendar className="h-4 w-4" />
            Nova Captação
          </Button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour="kpis-audiovisual">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Projetos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metas?.projetos_concluidos || 0}/{metas?.meta_projetos || 0}
            </div>
            <Progress 
              value={projetosProgress} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {projetosProgress.toFixed(1)}% da meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metas?.horas_trabalhadas || 0}h
            </div>
            <Progress 
              value={horasProgress} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              de {metas?.meta_horas || 0}h planejadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetos.length}</div>
            <p className="text-xs text-muted-foreground">
              em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Captações</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{captacoes.length}</div>
            <p className="text-xs text-muted-foreground">
              agendadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Widget */}
      <GamificationWidget setor="audiovisual" />

      {/* Kit de Produtividade */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Kit de Produtividade</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <PomodoroTimer setor="audiovisual" />
          <MetasSmart setor="audiovisual" />
          <InsightsIA setor="audiovisual" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projetos em Andamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Projetos em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projetos.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum projeto em andamento
              </p>
            ) : (
              projetos.map((projeto) => (
                <div key={projeto.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{projeto.titulo}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {projeto.tipo_projeto}
                      </Badge>
                      {projeto.deadline && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(projeto.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={projeto.status_review === 'aguardando' ? 'destructive' : 'default'}
                  >
                    {projeto.status_review}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Agenda de Captações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Captações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {captacoes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma captação agendada
              </p>
            ) : (
              captacoes.map((captacao) => (
                <div key={captacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{captacao.titulo}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(captacao.data_captacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    {captacao.local && (
                      <p className="text-xs text-muted-foreground">{captacao.local}</p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {captacao.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}