import React, { useState } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { useClientesAtivos } from '@/hooks/useClientesOptimized';
import { useProjetosOptimized } from '@/hooks/useProjetosOptimized';
import { useTarefas, useUpdateTarefa, useTarefasStats } from '@/hooks/useTarefasOptimized';

// Interface para tarefas do Audiovisual
interface AudiovisualTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  cliente_nome?: string;
  projeto_nome?: string;
  setor_responsavel: string;
  created_at: string;
  updated_at: string;
  anexos?: string[];
  observacoes?: string;
  tipo_tarefa?: string;
  projeto_id?: string;
}

const MinhasTarefasAudiovisual: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('audiovisual-minhas-tarefas');
  
  // ✅ Hooks otimizados
  const { data: clients = [] } = useClientesAtivos();
  const { data: projectsData } = useProjetosOptimized({ includeRelations: true });
  const { data: tarefasData, isLoading } = useTarefas({ 
    executorId: user?.id,
    includeRelations: true 
  });
  const { data: statsData } = useTarefasStats(user?.id);
  const updateTarefaMutation = useUpdateTarefa();
  
  const projects = projectsData?.projetos || [];
  const tasks = tarefasData?.tarefas || [];
  const stats = statsData || {
    total: 0,
    em_andamento: 0,
    concluidas_semana: 0,
    vencidas: 0
  };
  
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const handleTaskCreate = (columnId?: string) => {
    toast({
      title: "⛔ Sem Permissão",
      description: "Apenas GRS e Administradores podem criar tarefas.",
      variant: "destructive"
    });
  };

  const handleTaskCreated = async () => {
    setShowCreateModal(false);
  };

  // Mover tarefa entre colunas
  const handleTaskMove = async (taskId: string, newStatus: string, observation?: string) => {
    try {
      await updateTarefaMutation.mutateAsync({
        id: taskId,
        updates: {
          status: newStatus as any,
          ...(observation && { observacoes: observation })
        }
      });

      toast({
        title: "✅ Sucesso",
        description: `Tarefa movida para ${newStatus}`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Atualizar tarefa
  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await updateTarefaMutation.mutateAsync({
        id: taskId,
        updates
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const inProgressTasks = stats.em_andamento;
  const completedWeekTasks = stats.concluidas_semana;
  const overdueTasks = stats.vencidas;
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - SEM botão Nova Tarefa */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audiovisual - Minhas Tarefas</h1>
          <p className="text-muted-foreground">Tarefas atribuídas para execução</p>
        </div>
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-tour="estatisticas">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pós-Produção</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.revisao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atrasadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.reduce((sum, t: any) => sum + (t.horas_trabalhadas || 0), 0)}h
            </div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board - SEM botão de criação (executores não criam) */}
      <div data-tour="kanban">
        <UniversalKanbanBoard
          tasks={tasks}
          moduleType="audiovisual"
          moduleColumns={[]}
          onTaskMove={handleTaskMove}
          onTaskClick={(task: any) => {
            setSelectedTask(task);
            setShowTaskModal(true);
          }}
          onTaskCreate={handleTaskCreate}
          showSearch={true}
          showFilters={true}
        />
      </div>

      {/* Modal de Detalhes */}
      {showTaskModal && selectedTask && (
        <TaskDetailsModal
          open={showTaskModal}
          onOpenChange={(open) => {
            setShowTaskModal(open);
            if (!open) setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdate={async (taskId, updates) => {
            await handleTaskUpdate(taskId, updates);
            fetchData();
          }}
        />
      )}

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onTaskCreate={handleTaskCreated}
        defaultStatus={selectedColumnId || 'roteiro'}
      />
    </div>
  );
};

export default MinhasTarefasAudiovisual;
