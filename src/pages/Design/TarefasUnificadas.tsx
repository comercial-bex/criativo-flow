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
import { useTarefas } from '@/hooks/useTarefas';
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
  const [selectedTask, setSelectedTask] = useState<DesignTask | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ Hook otimizado com filtro de área
  const { tarefas, loading, updateTarefa, refetch } = useTarefas({
    executorArea: 'Criativo',
    includeRelations: true
  });

  // Mapear tarefas para formato do componente
  const tasks: DesignTask[] = (tarefas || []).map(t => ({
    ...t,
    prioridade: t.prioridade as 'baixa' | 'media' | 'alta',
    setor_responsavel: 'design',
    observacoes: ''
  }));


  const handleTaskMove = async (taskId: string, newStatus: string, observations?: string) => {
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

    const updates: any = { status: newStatus as any };
    if (observations) {
      updates.kpis = {
        ...(task as any).kpis,
        observacoes_gerais: `${task.observacoes || ''}\n${observations}`
      };
    }

    await updateTarefa(taskId, updates);
  };

  const handleTaskCreate = (columnId?: string) => {
    setSelectedColumnId(columnId || 'briefing');
    setShowCreateModal(true);
  };

  const handleTaskCreated = async () => {
    await refetch();
    setShowCreateModal(false);
  };

  const handleTaskClick = (task: DesignTask) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    const mappedUpdates = { ...updates };
    if (updates.data_prazo) {
      mappedUpdates.prazo_executor = updates.data_prazo;
      delete mappedUpdates.data_prazo;
    }
    
    await updateTarefa(taskId, mappedUpdates);
    await refetch();
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
            refetch();
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
