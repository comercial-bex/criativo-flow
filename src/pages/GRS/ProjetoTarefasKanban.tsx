import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskKanbanBoard } from '@/components/TaskKanbanBoard';
import { ProjectStatusIndicator } from '@/components/ProjectStatusIndicator';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { EditProjetoModal } from '@/components/EditProjetoModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  DollarSign,
  Plus,
  Settings
} from 'lucide-react';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';
interface Cliente {
  id: string;
  nome: string;
}

interface Projeto {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  data_inicio?: string;
  data_fim?: string;
  orcamento?: number;
  responsavel_id?: string;
  responsavel_nome?: string;
  cliente_id: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  data_inicio?: string;
  horas_trabalhadas?: number;
  executor_area?: string;
  setor_responsavel?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  projeto_id: string;
  created_at: string;
  updated_at: string;
}

export default function ProjetoTarefasKanban() {
  const { clienteId, projetoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);

  useEffect(() => {
    if (clienteId && projetoId) {
      fetchData();
    }
  }, [clienteId, projetoId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch client data
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('id', clienteId)
        .single();

      if (clienteError) throw clienteError;
      setCliente(clienteData);

      // Fetch project data with responsible person
      const { data: projetoData, error: projetoError } = await supabase
        .from('projetos')
        .select('*')
        .eq('id', projetoId)
        .single();

      if (projetoError) throw projetoError;

      // Buscar nome do responsável
      let responsavel_nome = undefined;
      if (projetoData.responsavel_id) {
        const { data: pessoa } = await supabase
          .from('pessoas')
          .select('nome')
          .eq('profile_id', projetoData.responsavel_id)
          .maybeSingle();
        responsavel_nome = pessoa?.nome;
      }

      setProjeto({
        ...projetoData,
        responsavel_nome
      });

      // Fetch tasks with responsible person
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefa')
        .select(`
          *,
          kpis,
          responsavel:profiles!tarefa_responsavel_id_fkey(nome)
        `)
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (tarefasError) throw tarefasError;
      
      const transformedTarefas = (tarefasData || []).map((tarefa: any) => ({
        ...tarefa,
        responsavel_nome: tarefa.responsavel?.nome,
        prioridade: (tarefa.prioridade as 'baixa' | 'media' | 'alta') || 'media',
        executor_area: tarefa.executor_area,
        setor_responsavel: tarefa.setor_responsavel
      }));
      
      setTarefas(transformedTarefas as Tarefa[]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ status: newStatus as any })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTarefas(prev => prev.map(tarefa => 
        tarefa.id === taskId 
          ? { ...tarefa, status: newStatus as any }
          : tarefa
      ));

      toast({
        title: "Tarefa movida",
        description: `Tarefa movida para ${newStatus}`,
      });
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover a tarefa",
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

      fetchData();
      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      setTarefas(tarefas.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      ));
      
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const handleTaskClick = (task: Tarefa) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleProjectUpdate = async (projetoId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('projetos')
        .update(updates)
        .eq('id', projetoId);

      if (error) throw error;

      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas com sucesso",
      });

      // Recarregar dados do projeto
      fetchData();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto",
        variant: "destructive",
      });
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bex-green"></div>
      </div>
    );
  }

  if (!cliente || !projeto) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/grs/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Projeto não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/grs/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard GRS
        </Button>
        <span className="text-muted-foreground">/</span>
        <Button 
          variant="link" 
          onClick={() => navigate(`/grs/cliente/${clienteId}/projetos`)}
        >
          {cliente.nome}
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{projeto.titulo}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Tarefas</span>
      </div>

      {/* Informações do Projeto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                {projeto.titulo}
                <ProjectStatusIndicator 
                  project={{ 
                    ...projeto, 
                    tarefas 
                  }} 
                />
              </CardTitle>
              {projeto.descricao && (
                <p className="text-muted-foreground">{projeto.descricao}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowEditProject(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {projeto.responsavel_nome && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Responsável: {projeto.responsavel_nome}</span>
              </div>
            )}
            
            {projeto.data_inicio && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            
            {projeto.orcamento && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Orçamento: {projeto.orcamento.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{tarefas.length} tarefa{tarefas.length !== 1 ? 's' : ''} total</span>
            <span>
              {tarefas.filter(t => t.status === 'concluido').length} concluída{tarefas.filter(t => t.status === 'concluido').length !== 1 ? 's' : ''}
            </span>
            <span>
              {tarefas.filter(t => t.status === 'em_andamento').length} em andamento
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <Card>
        <CardHeader>
          <CardTitle>Quadro de Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
        <TaskKanbanBoard
          tasks={tarefas}
          onTaskMove={handleTaskMove}
          onTaskCreate={handleTaskCreate}
          onTaskClick={handleTaskClick}
          projetoId={projetoId!}
        />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onTaskCreate={handleTaskCreate}
        projetoId={projetoId!}
        clienteId={clienteId!}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={showTaskDetails}
        onOpenChange={setShowTaskDetails}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdate}
      />

      {/* Edit Project Modal */}
      <EditProjetoModal
        open={showEditProject}
        onOpenChange={setShowEditProject}
        projeto={projeto ? {
          id: projeto.id,
          titulo: projeto.titulo,
          descricao: projeto.descricao || null,
          status: projeto.status || null,
          data_inicio: projeto.data_inicio || null,
          data_fim: projeto.data_fim || null,
          orcamento: projeto.orcamento || null,
          responsavel_id: projeto.responsavel_id || null,
        } : null}
        onSave={handleProjectUpdate}
      />
        </CardContent>
      </Card>
    </div>
  );
}