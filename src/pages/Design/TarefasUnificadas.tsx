import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UniversalKanbanBoard, moduleConfigurations } from '@/components/UniversalKanbanBoard';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Palette, 
  Layers, 
  Clock, 
  TrendingUp,
  Filter,
  Calendar,
  BarChart3,
  Eye,
  CheckCircle
} from 'lucide-react';

interface DesignTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  horas_trabalhadas?: number;
  anexos?: any[];
  comentarios?: any[];
  etiquetas?: string[];
  checklist?: any[];
  cliente_id?: string;
  cliente_nome?: string;
  projeto_id?: string;
  observacoes?: string;
  tipo_criativo?: string;
  formato?: string;
  dimensoes?: string;
  created_at?: string;
  updated_at?: string;
  capa_anexo_id?: string | null;
}

export default function TarefasUnificadasDesign() {
  const [tasks, setTasks] = useState<DesignTask[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DesignTask | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar tarefas de Design
      const { data: tasksData, error: tasksError } = await (supabase
        .from('tarefa')
        .select('*, capa_anexo_id')
        .order('created_at', { ascending: false }) as any);

      if (tasksError) throw tasksError;

      // Processar tarefas
      const processedTasks = tasksData?.map((task: any) => ({
        ...task,
        prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
        setor_responsavel: 'design',
        observacoes: task.observacoes || ''
      })) || [];

      setTasks(processedTasks as any);

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome');

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Buscar projetos
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select('id, titulo, cliente_id')
        .order('titulo');

      if (projetosError) throw projetosError;
      setProjetos(projetosData || []);

      // Buscar designers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, especialidade')
        .in('especialidade', ['design', 'gestor'])
        .order('nome');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: string, observations?: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Validações específicas do fluxo de design
      if (newStatus === 'aprovacao_cliente' && task.status !== 'revisao_interna') {
        toast({
          title: "Fluxo inválido",
          description: "A tarefa deve passar pela revisão interna antes da aprovação do cliente.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tarefa')
        .update({ 
          status: newStatus as any,
          observacoes: observations ? `${task.observacoes || ''}\n${observations}` : task.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado!",
      });

    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleTaskCreate = (columnId?: string) => {
    setSelectedColumnId(columnId || 'briefing');
    setShowCreateModal(true);
  };

  const handleTaskCreated = async () => {
    await fetchData();
    setShowCreateModal(false);
  };

  const handleTaskClick = (task: DesignTask) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const mappedUpdates = { ...updates };
      if (updates.data_prazo) {
        mappedUpdates.prazo_executor = updates.data_prazo;
        delete mappedUpdates.data_prazo;
      }
      
      const { error } = await supabase
        .from('tarefa')
        .update({ ...mappedUpdates, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa.",
        variant: "destructive",
      });
    }
  };

  // Estatísticas
  const stats = {
    total: tasks.length,
    briefing: tasks.filter(t => t.status === 'briefing').length,
    emCriacao: tasks.filter(t => t.status === 'em_criacao').length,
    aprovacaoCliente: tasks.filter(t => t.status === 'aprovacao_cliente').length,
    entregues: tasks.filter(t => t.status === 'entregue').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
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
            Kanban Design
          </h1>
          <p className="text-muted-foreground">Gestão visual da produção criativa</p>
        </div>
        
        <Button onClick={() => handleTaskCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Briefing</p>
              <p className="text-2xl font-bold">{stats.briefing}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Palette className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Criação</p>
              <p className="text-2xl font-bold">{stats.emCriacao}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entregues</p>
              <p className="text-2xl font-bold">{stats.entregues}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <UniversalKanbanBoard
        tasks={tasks}
        moduleColumns={moduleConfigurations.design.map(col => ({ ...col, tasks: [] }))}
        moduleType="design"
        onTaskMove={handleTaskMove}
        onTaskCreate={handleTaskCreate}
        onTaskClick={handleTaskClick}
        showFilters={true}
        showSearch={true}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailsModal
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask as any}
          onTaskUpdate={async (taskId, updates) => {
            await handleTaskUpdate(taskId, updates);
            fetchData();
          }}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onTaskCreate={handleTaskCreated}
        defaultStatus={selectedColumnId || 'briefing'}
      />
    </div>
  );
}
