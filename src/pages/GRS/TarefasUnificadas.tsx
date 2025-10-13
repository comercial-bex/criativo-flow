import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UniversalKanbanBoard, moduleConfigurations } from '@/components/UniversalKanbanBoard';
import { TrelloStyleTaskModal } from '@/components/TrelloStyleTaskModal';
import { AudiovisualScheduleModal } from '@/components/AudiovisualScheduleModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOperationalPermissions } from '@/hooks/useOperationalPermissions';
import { 
  Plus, 
  Target, 
  Users, 
  Clock, 
  TrendingUp,
  Filter,
  Calendar,
  BarChart3,
  Video
} from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';

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
  const [tasks, setTasks] = useState<GRSTask[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GRSTask | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string>('');
  const [lastCreatedCapture, setLastCreatedCapture] = useState<any>(null); // FASE 3

  const { user } = useAuth();
  const { toast } = useToast();
  const { permissions, loading: permissionsLoading } = useOperationalPermissions();
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-tarefas-unificadas');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // @ts-ignore - Evitar erro de tipo recursivo do Supabase
      const { data, error } = await supabase
        .from('tarefa')
        .select('*, capa_anexo_id')
        .or('executor_area.is.null,executor_area.eq.Criativo')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar tarefas
      const processedTasks = (data || []).map((task: any) => ({
        id: task.id,
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status,
        prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
        data_prazo: task.prazo_executor,
        responsavel_id: task.responsavel_id,
        executor_area: task.executor_area || 'Criativo',
        cliente_id: task.cliente_id,
        projeto_id: task.projeto_id,
        observacoes: task.observacoes || '',
        created_at: task.created_at,
        updated_at: task.updated_at
      }));

      setTasks(processedTasks);

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

      // Buscar profiles GRS
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, especialidade')
        .in('especialidade', ['grs', 'gestor', 'atendimento'])
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
      // Validar se precisa de observações para mudança de status
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Aqui você pode adicionar validações específicas do GRS
      if (newStatus === 'em_analise' && !observations) {
        toast({
          title: "Observação necessária",
          description: "É necessário adicionar observações ao mover para análise.",
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

      // Atualizar estado local
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

  const handleTaskCreate = async (taskData: any) => {
    try {
      const payload = sanitizeTaskPayload(taskData);
      const { data, error } = await supabase
        .from('tarefa')
        .insert(payload as any)
        .select()
        .single();

      if (error) throw error;

      // Buscar nomes relacionados
      let responsavel_nome = '';
      let cliente_nome = '';

      if (data.responsavel_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome')
          .eq('id', data.responsavel_id)
          .single();
        responsavel_nome = profile?.nome || '';
      }

      if (taskData.cliente_id) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('nome')
          .eq('id', taskData.cliente_id)
          .single();
        cliente_nome = cliente?.nome || '';
      }

      const processedTask: GRSTask = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        status: data.status,
        prioridade: data.prioridade as 'baixa' | 'media' | 'alta',
        data_prazo: (data as any).prazo_executor,
        responsavel_id: data.responsavel_id,
        responsavel_nome,
        executor_area: (data as any).executor_area || 'Criativo',
        cliente_id: taskData.cliente_id,
        cliente_nome,
        projeto_id: data.projeto_id,
        observacoes: (data as any).observacoes || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTasks(prev => [processedTask, ...prev]);

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
      const { error } = await supabase
        .from('tarefa')
        .update({ ...updates, updated_at: new Date().toISOString() })
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

  // Estatísticas rápidas
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
        </div>
      </div>

      {/* FASE 3: Alerta de sugestão de criar tarefa após captação */}
      {lastCreatedCapture && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <Video className="h-4 w-4 text-orange-600" />
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="font-medium">Captação criada com sucesso! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">
                Deseja criar uma tarefa relacionada agora?
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button 
                size="sm"
                onClick={() => {
                  setIsCreateModalOpen(true);
                  setLastCreatedCapture(null);
                }}
              >
                ✅ Criar Tarefa
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setLastCreatedCapture(null)}
              >
                ❌ Agora não
              </Button>
            </div>
          </div>
        </Alert>
      )}
      
      {/* Modal de Criação de Tarefa */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onTaskCreate={handleTaskCreate}
        defaultStatus={createColumnId || 'todo'}
      />

      {/* Modal de Agendamento Audiovisual */}
      <AudiovisualScheduleModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        onScheduleCreated={(captureData) => {
          setLastCreatedCapture(captureData); // FASE 3: Capturar dados
          fetchData();
        }}
      />

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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.emAndamento}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Revisão</p>
              <p className="text-2xl font-bold">{stats.emRevisao}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold">{stats.atrasadas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <UniversalKanbanBoard
        tasks={tasks}
        moduleColumns={moduleConfigurations.grs.map(col => ({ ...col, tasks: [] }))}
        moduleType="grs"
        onTaskMove={handleTaskMove}
        onTaskCreate={handleTaskCreate}
        onTaskClick={handleTaskClick}
        showFilters={true}
        showSearch={true}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TrelloStyleTaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onTaskUpdate={handleTaskUpdate}
          profiles={profiles}
          moduleType="grs"
        />
      )}
    </div>
  );
}