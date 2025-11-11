import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useToast } from '@/hooks/use-toast';
import { sanitizeTaskPayload, calcularStatusPrazo } from '@/utils/tarefaUtils';
import { useClientesAtivos } from '@/hooks/useClientesOptimized';
import { useProjetosOptimized } from '@/hooks/useProjetosOptimized';

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
  capa_anexo_id?: string | null;
}

const TarefasUnificadasAudiovisual: React.FC = () => {
  const [tasks, setTasks] = useState<AudiovisualTask[]>([]);
  
  // ✅ Hooks otimizados para clientes e projetos
  const { data: clients = [] } = useClientesAtivos();
  const { data: projectsData } = useProjetosOptimized({ includeRelations: true });
  const projects = projectsData?.projetos || [];
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<AudiovisualTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  // Fetch inicial dos dados
  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar perfis
      const { data: profilesData } = await supabase.from('pessoas').select('*');
      setProfiles(profilesData || []);

      // FASE 2: Buscar apenas tarefas do setor audiovisual
      const { data: audiovisualTasksData, error: audiovisualTasksError } = await (supabase
        .from('tarefa')
        .select(`
          *,
          capa_anexo_id,
          profiles!responsavel_id (id, nome)
        `)
        .eq('executor_area', 'Audiovisual')
        .order('created_at', { ascending: false }) as any);

      if (audiovisualTasksError) {
        console.error('Erro ao buscar tarefas:', audiovisualTasksError);
        toast({
          title: "Erro",
          description: "Erro ao carregar tarefas",
          variant: "destructive"
        });
      } else {
        const formattedTasks = audiovisualTasksData?.map((task: any) => ({
          ...task,
          prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
          responsavel_nome: task.profiles?.nome || 'Não atribuído',
          cliente_nome: clients.find(c => c.id === task.projeto_id)?.nome || 'Sem cliente',
          projeto_nome: projects.find(p => p.id === task.projeto_id)?.titulo || 'Sem projeto',
          setor_responsavel: task.setor_responsavel || (task.area && task.area[0]) || 'audiovisual'
        })) || [];
        
        setTasks(formattedTasks);
      }

    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mover tarefa entre colunas
  const handleTaskMove = async (taskId: string, newStatus: string, observation?: string) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ 
          status: newStatus as any,
          ...(observation && { observacoes: observation }),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Atualizar estado local
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, ...(observation && { observacoes: observation }) }
          : task
      ));

      toast({
        title: "Sucesso",
        description: "Tarefa movida com sucesso",
      });

    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover tarefa",
        variant: "destructive"
      });
    }
  };

  // Criar nova tarefa
  const handleTaskCreate = (columnId?: string) => {
    setShowCreateModal(true);
  };

  const handleTaskCreated = async () => {
    await fetchData();
    setShowCreateModal(false);
  };

  // Atualizar tarefa
  const handleTaskUpdate = async (taskId: string, updates: Partial<AudiovisualTask>) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ ...updates as any, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso",
      });

    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
    }
  };

  // Calcular estatísticas
  const stats = {
    total: tasks.length,
    emAndamento: tasks.filter(t => ['pre_producao', 'gravacao', 'pos_producao'].includes(t.status)).length,
    revisao: tasks.filter(t => t.status === 'pos_producao').length,
    atrasadas: tasks.filter(t => {
      if (!t.data_prazo || t.status === 'entregue') return false;
      const { status } = calcularStatusPrazo(t.data_prazo);
      return status === 'vermelho';
    }).length,
    urgentes: tasks.filter(t => {
      if (!t.data_prazo || t.status === 'entregue') return false;
      const { status, timeRemaining } = calcularStatusPrazo(t.data_prazo);
      return status === 'amarelo' && timeRemaining && timeRemaining.total_seconds <= 86400;
    }).length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audiovisual - Minhas Tarefas</h1>
          <p className="text-muted-foreground">Gerencie todas as tarefas de produção audiovisual</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Urgentes (≤24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.urgentes}</div>
            <p className="text-xs text-muted-foreground">deadline próximo</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <UniversalKanbanBoard
        tasks={tasks}
        moduleType="audiovisual"
        moduleColumns={[]}
        onTaskMove={handleTaskMove}
        onTaskClick={(task: any) => {
          setSelectedTask(task);
          setShowTaskModal(true);
        }}
        onTaskCreate={() => setShowCreateModal(true)}
        showSearch={true}
        showFilters={true}
      />

      {/* Modais */}
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
        defaultStatus="roteiro"
      />
    </div>
  );
};

export default TarefasUnificadasAudiovisual;