import { useEspecialistaProjects } from "@/hooks/useEspecialistaProjects";
import { useEspecialistaTasks } from "@/hooks/useEspecialistaTasks";
import { useEspecialistaMetrics } from "@/hooks/useEspecialistaMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderKanban, CheckCircle, Clock, Eye } from "lucide-react";
import { ProjetoEspecialistasBadges } from "@/components/ProjetoEspecialistasBadges";

interface EspecialistaDashboardMirrorProps {
  especialistaId: string;
}

export function EspecialistaDashboardMirror({ especialistaId }: EspecialistaDashboardMirrorProps) {
  const { data: projetos = [], isLoading: loadingProjetos } = useEspecialistaProjects(especialistaId);
  const { data: tarefas = [], isLoading: loadingTarefas } = useEspecialistaTasks(especialistaId);
  const { data: metricas } = useEspecialistaMetrics(especialistaId);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      em_andamento: { variant: "default", label: "Em Andamento" },
      concluido: { variant: "success", label: "Concluído" },
      pausado: { variant: "secondary", label: "Pausado" },
      pendente: { variant: "outline", label: "Pendente" }
    };
    
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      alta: { color: "text-red-600", label: "Alta" },
      media: { color: "text-yellow-600", label: "Média" },
      baixa: { color: "text-green-600", label: "Baixa" }
    };
    
    const config = variants[prioridade] || { color: "text-gray-600", label: prioridade };
    return <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getTarefaStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      todo: { variant: "outline", label: "A Fazer" },
      in_progress: { variant: "default", label: "Em Progresso" },
      done: { variant: "success", label: "Concluído" },
      blocked: { variant: "destructive", label: "Bloqueado" }
    };
    
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const projetosGerente = projetos.filter(p => p.is_gerente);
  const tarefasPendentes = tarefas.filter(t => t.status !== 'done');
  const loading = loadingProjetos || loadingTarefas;

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Carregando dashboard do especialista...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projetos</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.projetosAtribuidos || 0}</div>
            <p className="text-xs text-muted-foreground">
              {projetosGerente.length} como gerente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasPendentes.length}</div>
            <p className="text-xs text-muted-foreground">A fazer ou em progresso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.tarefasConcluidas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {metricas?.taxaConclusao || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Gerenciados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetosGerente.length}</div>
            <p className="text-xs text-muted-foreground">
              {metricas?.isGerente ? 'É gerente' : 'Não é gerente'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Projetos e Tarefas */}
      <Tabs defaultValue="projetos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projetos">Projetos ({projetos.length})</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas ({tarefas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projetos" className="space-y-4">
          {projetos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum projeto vinculado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projetos.map((projeto) => (
                <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{projeto.titulo}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {projeto.clientes?.nome || 'Cliente não definido'}
                        </p>
                      </div>
                      {projeto.is_gerente && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Gerente
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {projeto.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {projeto.descricao}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {getStatusBadge(projeto.status)}
                      <ProjetoEspecialistasBadges projetoId={projeto.id} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>Modo visualização</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tarefas" className="space-y-4">
          {tarefas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma tarefa atribuída</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {tarefas.map((tarefa) => (
                    <div key={tarefa.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{tarefa.titulo}</h4>
                            {getPrioridadeBadge(tarefa.prioridade)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tarefa.projeto?.titulo} • {tarefa.projeto?.clientes?.nome}
                          </p>
                          {tarefa.data_prazo && (
                            <p className="text-xs text-muted-foreground">
                              Prazo: {new Date(tarefa.data_prazo).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getTarefaStatusBadge(tarefa.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
