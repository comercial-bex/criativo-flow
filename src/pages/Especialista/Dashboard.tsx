import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderKanban, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProjetoEspecialistasBadges } from "@/components/ProjetoEspecialistasBadges";

interface Projeto {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  mes_referencia: string | null;
  clientes?: {
    id: string;
    nome: string;
  };
  is_gerente: boolean;
}

interface Tarefa {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  data_prazo: string | null;
  projeto: {
    id: string;
    titulo: string;
    clientes?: {
      nome: string;
    };
  };
}

export default function EspecialistaDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjetosETarefas();
    }
  }, [user]);

  const fetchProjetosETarefas = async () => {
    if (!user) return;

    try {
      // Buscar projetos onde o usuário é especialista
      const { data: projetosData, error: projetosError } = await supabase
        .from('projeto_especialistas')
        .select(`
          is_gerente,
          projetos:projeto_id (
            id,
            titulo,
            descricao,
            status,
            mes_referencia,
            clientes (
              id,
              nome
            )
          )
        `)
        .eq('especialista_id', user.id);

      if (projetosError) throw projetosError;

      const projetosFormatados = (projetosData || []).map((item: any) => ({
        ...item.projetos,
        is_gerente: item.is_gerente
      }));

      setProjetos(projetosFormatados);

      // Buscar tarefas atribuídas ao usuário
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas_projeto')
        .select(`
          id,
          titulo,
          status,
          prioridade,
          data_prazo,
          projetos:projeto_id (
            id,
            titulo,
            clientes (nome)
          )
        `)
        .eq('responsavel_id', user.id)
        .order('data_prazo', { ascending: true });

      if (tarefasError) throw tarefasError;

      setTarefas(tarefasData as any || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus projetos e tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
  const projetosMembro = projetos.filter(p => !p.is_gerente);
  const tarefasPendentes = tarefas.filter(t => t.status !== 'done');

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <FolderKanban className="h-8 w-8 text-primary" />
          Meus Projetos
        </h1>
        <p className="text-muted-foreground">Projetos e tarefas atribuídas a você</p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projetos</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetos.length}</div>
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
            <div className="text-2xl font-bold">{tarefas.filter(t => t.status === 'done').length}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Gerenciados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetosGerente.length}</div>
            <p className="text-xs text-muted-foreground">Você é gerente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Projetos e Tarefas */}
      <Tabs defaultValue="projetos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projetos">Meus Projetos</TabsTrigger>
          <TabsTrigger value="tarefas">Minhas Tarefas</TabsTrigger>
        </TabsList>

        <TabsContent value="projetos" className="space-y-4">
          {projetos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Você ainda não está vinculado a nenhum projeto</p>
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

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/grs/projeto/${projeto.id}/tarefas`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
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
                <p className="text-muted-foreground">Nenhuma tarefa atribuída ainda</p>
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
