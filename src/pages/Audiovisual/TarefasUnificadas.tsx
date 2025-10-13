import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TrelloStyleTaskModal } from '@/components/TrelloStyleTaskModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useToast } from '@/hooks/use-toast';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';

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
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

      // Buscar clientes, projetos e perfis primeiro
      const [
        { data: clientsData },
        { data: projectsData },
        { data: profilesData }
      ] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('projetos').select('*'),
        supabase.from('profiles').select('*')
      ]);

      setClients(clientsData || []);
      setProjects(projectsData || []);
      setProfiles(profilesData || []);

      // Agora buscar tarefas do setor audiovisual  
      const { data: audiovisualTasksData, error: audiovisualTasksError } = await (supabase
        .from('tarefa')
        .select(`
          *,
          capa_anexo_id,
          profiles!responsavel_id (id, nome)
        `)
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
          cliente_nome: (clientsData || []).find(c => c.id === task.projeto_id)?.nome || 'Sem cliente',
          projeto_nome: (projectsData || []).find(p => p.id === task.projeto_id)?.titulo || 'Sem projeto',
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
  const handleTaskCreate = async (taskData: any) => {
    try {
      const base = { ...taskData, setor_responsavel: 'audiovisual' };
      const payload = sanitizeTaskPayload(base);
      const { data, error } = await supabase
        .from('tarefa')
        .insert([{ ...payload, status: 'roteiro' as any }])
        .select()
        .single();

      if (error) throw error;

      const newTask: any = {
        ...data,
        prioridade: data.prioridade as 'baixa' | 'media' | 'alta',
        responsavel_nome: profiles.find(p => p.id === data.responsavel_id)?.nome || 'Não atribuído',
        cliente_nome: clients.find(c => c.id === data.projeto_id)?.nome || 'Sem cliente',
        projeto_nome: projects.find(p => p.id === data.projeto_id)?.nome || 'Sem projeto',
        setor_responsavel: 'audiovisual'
      };

      setTasks(prev => [newTask, ...prev]);
      setShowCreateModal(false);

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso",
      });

    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa",
        variant: "destructive"
      });
    }
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
    atrasadas: tasks.filter(t => 
      t.data_prazo && new Date(t.data_prazo) < new Date() && t.status !== 'entregue'
    ).length
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <TrelloStyleTaskModal
          task={selectedTask}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onTaskUpdate={(taskId, updates) => handleTaskUpdate(taskId, updates)}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          open={showCreateModal}
          onOpenChange={(open) => !open && setShowCreateModal(false)}
          onTaskCreate={handleTaskCreate}
          projetoId="audiovisual-tasks"
          defaultStatus="roteiro"
        />
      )}
    </div>
  );
};

export default TarefasUnificadasAudiovisual;