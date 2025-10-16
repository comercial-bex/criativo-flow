import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Clock, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VisaoGeralProps {
  planejamento: {
    id: string;
    titulo: string;
    status: string;
    descricao?: string;
    data_envio_cliente?: string;
    data_aprovacao_cliente?: string;
    responsavel_grs_id?: string;
  };
  clienteId: string;
  projetoId: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  status: string;
  data_prazo?: string;
  responsavel_id?: string;
  prioridade?: string;
  tipo?: string;
}

interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
}

export function VisaoGeral({ planejamento, clienteId, projetoId }: VisaoGeralProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [responsavel, setResponsavel] = useState<Profile | null>(null);
  const [equipe, setEquipe] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [planejamento.id, clienteId, projetoId]);

  const fetchData = async () => {
    try {
      // Buscar tarefas relacionadas ao planejamento
      const { data: tarefasData } = await supabase
        .from('tarefa')
        .select('*, kpis')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      setTarefas(tarefasData || []);

      // Buscar responsável do planejamento
      if (planejamento.responsavel_grs_id) {
        const { data: responsavelData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', planejamento.responsavel_grs_id)
          .single();

        setResponsavel(responsavelData);
      }

      // Buscar equipe envolvida (responsáveis únicos das tarefas)
      if (tarefasData && tarefasData.length > 0) {
        const responsaveisIds = [...new Set(tarefasData
          .map(t => t.responsavel_id)
          .filter(id => id))] as string[];

        if (responsaveisIds.length > 0) {
          const { data: equipeData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', responsaveisIds);

          setEquipe(equipeData || []);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados da visão geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;
    const emAndamento = tarefas.filter(t => t.status === 'em_andamento').length;
    const pendentes = tarefas.filter(t => t.status === 'backlog' || t.status === 'to_do').length;
    const atrasadas = tarefas.filter(t => {
      if (!t.data_prazo || t.status === 'concluida') return false;
      return new Date(t.data_prazo) < new Date();
    }).length;

    return { total, concluidas, emAndamento, pendentes, atrasadas };
  };

  const getPrioridadeStats = () => {
    const alta = tarefas.filter(t => t.prioridade === 'alta').length;
    const media = tarefas.filter(t => t.prioridade === 'media').length;
    const baixa = tarefas.filter(t => t.prioridade === 'baixa').length;
    return { alta, media, baixa };
  };

  const getProgressPercentage = () => {
    const stats = getStatusStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.concluidas / stats.total) * 100);
  };

  const stats = getStatusStats();
  const prioridadeStats = getPrioridadeStats();
  const progress = getProgressPercentage();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo do Plano */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Resumo do Planejamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Progresso Geral</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{progress}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={progress} className="mt-2" />
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Tarefas Concluídas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.concluidas}/{stats.total}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Em Andamento</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.emAndamento}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {planejamento.descricao && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{planejamento.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linha do Tempo e Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {planejamento.data_envio_cliente && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-sm">Enviado para Cliente</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(planejamento.data_envio_cliente), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {planejamento.data_aprovacao_cliente && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/50">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-sm">Aprovado pelo Cliente</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(planejamento.data_aprovacao_cliente), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {stats.atrasadas > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="font-medium text-sm text-red-700 dark:text-red-400">
                      {stats.atrasadas} tarefa(s) atrasada(s)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Equipe e Responsáveis */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Equipe do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {responsavel && (
              <div className="p-3 rounded-lg bg-primary/5">
                <p className="text-sm font-medium text-primary mb-2">Gerente de Projeto</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={responsavel.avatar_url} />
                    <AvatarFallback>{responsavel.nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{responsavel.nome}</span>
                  <Badge variant="secondary" className="ml-auto">GRS</Badge>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-3">Profissionais Envolvidos</p>
              <div className="space-y-2">
                {equipe.map((membro) => (
                  <div key={membro.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={membro.avatar_url} />
                      <AvatarFallback>{membro.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{membro.nome}</span>
                  </div>
                ))}
                {equipe.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum membro atribuído ainda</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Prioridade */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            Distribuição por Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/50">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{prioridadeStats.alta}</p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">Alta Prioridade</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/50">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{prioridadeStats.media}</p>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">Média Prioridade</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{prioridadeStats.baixa}</p>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Baixa Prioridade</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}