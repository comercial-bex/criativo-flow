import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TrelloStyleTaskModal } from '@/components/TrelloStyleTaskModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

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
  horas_estimadas?: number;
  created_at: string;
  updated_at: string;
  anexos?: string[];
  observacoes?: string;
  tipo_tarefa?: string;
  projeto_id?: string;
}

const MinhasTarefasAudiovisual: React.FC = () => {
  const [tasks, setTasks] = useState<AudiovisualTask[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<AudiovisualTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { startTutorial, hasSeenTutorial } = useTutorial('audiovisual-minhas-tarefas');

  // Fetch inicial dos dados - APENAS tarefas atribuídas ao usuário
  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

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

      // Buscar APENAS tarefas atribuídas ao executor atual (audiovisual)
      const { data: audiovisualTasksData, error: audiovisualTasksError } = await supabase
        .from('tarefas_projeto')
        .select(`
          *,
          profiles!responsavel_id (id, nome)
        `)
        .eq('setor_responsavel', 'audiovisual')
        .eq('responsavel_id', user.id) // FILTRO CRÍTICO: apenas tarefas do executor
        .order('created_at', { ascending: false });

      if (audiovisualTasksError) {
        console.error('Erro ao buscar tarefas:', audiovisualTasksError);
        toast({
          title: "Erro",
          description: "Erro ao carregar tarefas",
          variant: "destructive"
        });
      } else {
        const formattedTasks = audiovisualTasksData?.map(task => ({
          ...task,
          prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
          responsavel_nome: task.profiles?.nome || 'Não atribuído',
          cliente_nome: (clientsData || []).find(c => c.id === task.projeto_id)?.nome || 'Sem cliente',
          projeto_nome: (projectsData || []).find(p => p.id === task.projeto_id)?.nome || 'Sem projeto'
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
  }, [user?.id]);

  // Mover tarefa entre colunas (permitido para execução)
  const handleTaskMove = async (taskId: string, newStatus: string, observation?: string) => {
    try {
      const { error } = await supabase
        .from('tarefas_projeto')
        .update({ 
          status: newStatus,
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
        description: "Status atualizado com sucesso",
      });

    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  // Atualizar tarefa (apenas campos de execução, não escopo/SLA)
  const handleTaskUpdate = async (taskId: string, updates: Partial<AudiovisualTask>) => {
    try {
      // Bloquear edição de campos críticos (apenas execução permitida)
      const allowedFields = ['status', 'horas_trabalhadas', 'observacoes', 'anexos'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key as keyof AudiovisualTask];
          return obj;
        }, {});

      const { error } = await supabase
        .from('tarefas_projeto')
        .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...filteredUpdates } : task
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
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

      {/* Kanban Board - SEM botão de criação (executores não criam) */}
      <UniversalKanbanBoard
        tasks={tasks}
        moduleType="audiovisual"
        moduleColumns={[]}
        onTaskMove={handleTaskMove}
        onTaskClick={(task: any) => {
          setSelectedTask(task);
          setShowTaskModal(true);
        }}
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
    </div>
  );
};

export default MinhasTarefasAudiovisual;
