import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { UniversalKanbanBoard, moduleConfigurations } from "@/components/UniversalKanbanBoard";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Search, 
  Calendar,
  CheckCircle2,
  Clock,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface ClienteTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  horas_trabalhadas?: number;
  projeto_nome?: string;
  created_at?: string;
  updated_at?: string;
  anexos?: any[];
  comentarios?: any[];
  etiquetas?: string[];
  checklist?: any[];
}

interface ClienteStats {
  total: number;
  emAndamento: number;
  concluidas: number;
  porProjeto: { [key: string]: number };
}

export default function ClienteTarefas() {
  const { user } = useAuth();
  const { startTutorial, hasSeenTutorial } = useTutorial('cliente-tarefas');
  const [tasks, setTasks] = useState<ClienteTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ClienteTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<ClienteStats>({
    total: 0,
    emAndamento: 0,
    concluidas: 0,
    porProjeto: {}
  });
  const { toast } = useToast();

  // Buscar tarefas do cliente
  const fetchClienteTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar perfil do cliente para obter cliente_id
      const { data: profile } = await supabase
        .from('pessoas')
        .select('cliente_id')
        .eq('id', user.id)
        .single();

      if (!profile?.cliente_id) {
        console.log('Cliente ID não encontrado');
        return;
      }

      // Buscar projetos do cliente
      const { data: projetos } = await supabase
        .from('projetos')
        .select('id, titulo')
        .eq('cliente_id', profile.cliente_id);

      if (!projetos || projetos.length === 0) {
        setTasks([]);
        return;
      }

      const projetoIds = projetos.map(p => p.id);

      // Buscar tarefas dos projetos do cliente
      const { data: tarefasData, error: tarefasError } = await (supabase
        .from('tarefa')
        .select('*')
        .in('projeto_id', projetoIds)
        .order('created_at', { ascending: false }) as any);

      if (tarefasError) throw tarefasError;

      // Buscar dados dos responsáveis
      const responsavelIds = [...new Set(tarefasData?.map((t: any) => t.responsavel_id).filter(Boolean))] as string[];
      const { data: profilesData } = await supabase
        .from('pessoas')
        .select('id, nome')
        .in('id', responsavelIds);

      // Combinar dados
      const tasksWithDetails = tarefasData?.map((task: any) => {
        const responsavel = profilesData?.find((p: any) => p.id === task.responsavel_id);
        const projeto = projetos.find((p: any) => p.id === task.projeto_id);

        return {
          ...task,
          responsavel_nome: responsavel?.nome,
          projeto_nome: projeto?.titulo,
          prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
          anexos: [],
          comentarios: [],
          etiquetas: [],
          checklist: []
        };
      }) || [];

      setTasks(tasksWithDetails);
      calculateStats(tasksWithDetails, projetos);
    } catch (error) {
      console.error('Erro ao buscar tarefas do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas tarefas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = (tasks: ClienteTask[], projetos: any[]) => {
    const statusEmAndamento = ['em_andamento', 'a_fazer', 'em_revisao', 'em_analise', 'em_criacao', 'briefing'];
    const statusConcluido = ['concluido', 'entregue', 'fechado', 'convertido'];
    
    const total = tasks.length;
    const emAndamento = tasks.filter(t => statusEmAndamento.includes(t.status)).length;
    const concluidas = tasks.filter(t => statusConcluido.includes(t.status)).length;
    
    const porProjeto = projetos.reduce((acc, projeto) => {
      const count = tasks.filter(t => t.projeto_nome === projeto.nome).length;
      if (count > 0) {
        acc[projeto.nome] = count;
      }
      return acc;
    }, {} as { [key: string]: number });

    setStats({ total, emAndamento, concluidas, porProjeto });
  };

  // Abrir modal da tarefa
  const handleTaskClick = (task: ClienteTask) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleTaskCreate = (columnId?: string) => {
    setSelectedColumnId(columnId || 'backlog');
    setShowCreateModal(true);
  };

  const handleTaskCreated = async (taskData: any) => {
    await fetchClienteTasks();
    setShowCreateModal(false);
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projeto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Renderizar visualização de lista
  const TaskListView = () => (
    <div className="space-y-3">
      {filteredTasks.map(task => {
        const isOverdue = task.data_prazo && new Date(task.data_prazo) < new Date();
        const statusEmAndamento = ['em_andamento', 'a_fazer', 'em_revisao', 'em_analise', 'em_criacao', 'briefing'];
        const isInProgress = statusEmAndamento.includes(task.status);
        
        return (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTaskClick(task)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{task.titulo}</h4>
                    {isInProgress && <Badge variant="outline" className="text-xs">Em Andamento</Badge>}
                    {isOverdue && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                  </div>
                  
                  {task.descricao && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.projeto_nome && (
                      <span>📁 {task.projeto_nome}</span>
                    )}
                    {task.responsavel_nome && (
                      <span>👤 {task.responsavel_nome}</span>
                    )}
                    {task.data_prazo && (
                      <span className={isOverdue ? 'text-red-500' : ''}>
                        📅 {format(new Date(task.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                    {task.setor_responsavel && (
                      <span>🏢 {task.setor_responsavel}</span>
                    )}
                  </div>
                </div>
                
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma tarefa encontrada</p>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    fetchClienteTasks();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando suas tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Tarefas</h1>
          <p className="text-muted-foreground">Acompanhe o progresso dos seus projetos</p>
        </div>
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour="estatisticas">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emAndamento}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card data-tour="busca">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas, projetos, responsáveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="projetos">Por Projeto</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <TaskListView />
        </TabsContent>

        <TabsContent value="kanban">
          <UniversalKanbanBoard
            tasks={filteredTasks}
            moduleColumns={moduleConfigurations.geral.map(col => ({ ...col, tasks: [] }))}
            moduleType="geral"
            onTaskMove={() => {}} // Cliente não pode mover tarefas
            onTaskCreate={handleTaskCreate}
            onTaskClick={handleTaskClick}
            showFilters={false}
            showSearch={false}
          />
        </TabsContent>

        <TabsContent value="projetos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(stats.porProjeto).map(([projeto, count]) => (
              <Card key={projeto}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm">{projeto}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTasks
                      .filter(task => task.projeto_nome === projeto)
                      .slice(0, 5)
                      .map(task => (
                        <div 
                          key={task.id}
                          className="p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => handleTaskClick(task)}
                        >
                          <p className="text-sm font-medium truncate">{task.titulo}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{task.responsavel_nome}</span>
                            <span>{task.status}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal da tarefa */}
      {selectedTask && (
        <TaskDetailsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          task={selectedTask as any}
          onTaskUpdate={async () => {}} // Cliente não pode editar tarefas
        />
      )}

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onTaskCreate={handleTaskCreated}
        defaultStatus={selectedColumnId || 'backlog'}
      />
    </div>
  );
}