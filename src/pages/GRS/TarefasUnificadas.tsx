import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UniversalKanbanBoard, moduleConfigurations } from '@/components/UniversalKanbanBoard';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { AudiovisualScheduleModal } from '@/components/AudiovisualScheduleModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOperationalPermissions } from '@/hooks/useOperationalPermissions';
import { 
  Plus, 
  Target, 
  Users, 
  Clock, 
  TrendingUp,
  Video
} from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';
import { useTarefas, useCreateTarefa, useUpdateTarefa } from '@/hooks/useTarefasOptimized';
import { useClientes } from '@/hooks/useClientes';
import { useProjetosOptimized } from '@/hooks/useProjetosOptimized';

interface GRSTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  executor_area?: string;
  horas_trabalhadas?: number;
  anexos?: any[];
  comentarios?: any[];
  etiquetas?: string[];
  checklist?: any[];
  cliente_id?: string;
  cliente_nome?: string;
  projeto_id?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  capa_anexo_id?: string | null;
}

export default function TarefasUnificadasGRS() {
  // Usar hooks otimizados com cache
  const { data: tarefasData, isLoading: loadingTarefas } = useTarefas({ 
    executorArea: null, // null = Criativo ou null
    includeRelations: true 
  });
  const { data: clientesData, isLoading: loadingClientes } = useClientes();
  const { data: projetosData, isLoading: loadingProjetos } = useProjetosOptimized();
  
  const createTarefa = useCreateTarefa();
  const updateTarefa = useUpdateTarefa();

  const tasks = (tarefasData?.tarefas || []).map((t: any) => ({
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao,
    status: t.status,
    prioridade: t.prioridade as 'baixa' | 'media' | 'alta',
    data_prazo: t.prazo_executor || t.data_prazo,
    responsavel_id: t.responsavel_id,
    responsavel_nome: t.responsavel_nome,
    executor_area: t.executor_area || 'Criativo',
    cliente_id: t.cliente_id,
    cliente_nome: t.cliente_nome,
    projeto_id: t.projeto_id,
    observacoes: t.observacoes || '',
    created_at: t.created_at,
    updated_at: t.updated_at,
    capa_anexo_id: t.capa_anexo_id
  })) as GRSTask[];

  const clientes = clientesData || [];
  const projetos = projetosData?.projetos || [];
  const loading = loadingTarefas || loadingClientes || loadingProjetos;

  const [selectedTask, setSelectedTask] = useState<GRSTask | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string>('');
  const [lastCreatedCapture, setLastCreatedCapture] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { permissions, loading: permissionsLoading } = useOperationalPermissions();
  const { startTutorial } = useTutorial('grs-tarefas-unificadas');

  const handleTaskMove = async (taskId: string, newStatus: string, observations?: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Validação específica do GRS
      if (newStatus === 'em_analise' && !observations) {
        toast({
          title: "Observação necessária",
          description: "É necessário adicionar observações ao mover para análise.",
          variant: "destructive",
        });
        return;
      }

      await updateTarefa.mutateAsync({ 
        id: taskId, 
        updates: { 
          status: newStatus,
          observacoes: observations ? `${task.observacoes || ''}\n${observations}` : task.observacoes
        } 
      });

    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      const payload = sanitizeTaskPayload(taskData);
      await createTarefa.mutateAsync(payload);
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const handleTaskClick = (task: GRSTask) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await updateTarefa.mutateAsync({ id: taskId, updates });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  // Estatísticas calculadas do cache
  const stats = {
    total: tasks.length,
    emAndamento: tasks.filter(t => t.status === 'em_andamento').length,
    emRevisao: tasks.filter(t => t.status === 'em_revisao').length,
    atrasadas: tasks.filter(t => t.data_prazo && new Date(t.data_prazo) < new Date()).length
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
            <Target className="h-8 w-8 text-primary" />
            Gestão de Tarefas GRS
          </h1>
          <p className="text-muted-foreground">Planejamento estratégico e gestão de redes sociais</p>
        </div>
        
        <div className="flex gap-2">
          {permissions.showCreateButton && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsScheduleModalOpen(true)}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                Agendar Captação
              </Button>
              
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </>
          )}
          
          <TutorialButton 
            onStart={() => startTutorial()}
            hasSeenTutorial={false}
          />
        </div>
      </div>

      {/* Alerta de sugestão após captação */}
      {lastCreatedCapture && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <Video className="h-4 w-4 text-orange-600" />
          <div className="ml-2">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">
              Captação agendada com sucesso!
            </h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Deseja criar uma tarefa de edição relacionada a esta captação?
            </p>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(true);
                  setLastCreatedCapture(null);
                }}
              >
                Criar Tarefa de Edição
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setLastCreatedCapture(null)}
              >
                Agora não
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{stats.emAndamento}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold">{stats.emRevisao}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <UniversalKanbanBoard
        tasks={tasks as any}
        moduleColumns={moduleConfigurations.grs as any}
        moduleType="grs"
        onTaskMove={handleTaskMove}
        onTaskCreate={(status) => {
          setCreateColumnId(status || '');
          setIsCreateModalOpen(true);
        }}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
        showFilters={true}
        showSearch={true}
      />

      {/* Modals */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onTaskCreate={handleTaskCreate}
        defaultStatus={createColumnId}
      />

      <AudiovisualScheduleModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        onScheduleCreated={(capture) => {
          setLastCreatedCapture(capture);
          setIsScheduleModalOpen(false);
        }}
      />

      {selectedTask && (
        <TaskDetailsModal
          task={{
            ...selectedTask,
            created_at: selectedTask.created_at || new Date().toISOString(),
            updated_at: selectedTask.updated_at || new Date().toISOString()
          } as any}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}
