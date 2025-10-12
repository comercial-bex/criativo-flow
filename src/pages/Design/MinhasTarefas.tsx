import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TrelloStyleTaskModal } from '@/components/TrelloStyleTaskModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Palette, 
  Layers, 
  Clock, 
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

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
  horas_estimadas?: number;
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
}

export default function MinhasTarefasDesign() {
  const [tasks, setTasks] = useState<DesignTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DesignTask | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('design-minhas-tarefas');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Buscar APENAS tarefas atribuídas ao executor atual (design)
      const { data: tasksData, error: tasksError } = await supabase
        .from('tarefa')
        .select('*')
        .eq('executor_id', user.id) // FILTRO CRÍTICO: apenas tarefas do executor
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Processar tarefas
      const processedTasks = tasksData?.map(task => ({
        ...task,
        prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
        setor_responsavel: 'design',
        observacoes: (task as any).observacoes || ''
      })) || [];

      setTasks(processedTasks);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas tarefas.",
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

  const handleTaskClick = (task: DesignTask) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      // Bloquear edição de campos críticos (apenas execução permitida)
      const allowedFields = ['status', 'horas_trabalhadas', 'observacoes', 'anexos'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      const { error } = await supabase
        .from('tarefa')
        .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...filteredUpdates } : task
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
      {/* Header - SEM botão Nova Tarefa */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            Design - Minhas Tarefas
          </h1>
          <p className="text-muted-foreground">Tarefas atribuídas para execução</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Briefing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.briefing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Criação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.emCriacao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.entregues}</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board - SEM botão de criação (executores não criam) */}
      <UniversalKanbanBoard
        tasks={tasks}
        moduleType="design"
        moduleColumns={[]}
        onTaskMove={handleTaskMove}
        onTaskClick={handleTaskClick}
        onTaskCreate={() => {
          toast({
            title: "⛔ Sem Permissão",
            description: "Apenas GRS e Administradores podem criar tarefas.",
            variant: "destructive"
          });
        }}
        showSearch={true}
        showFilters={true}
      />

      {/* Modal de Detalhes */}
      {selectedTask && (
        <TrelloStyleTaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}
