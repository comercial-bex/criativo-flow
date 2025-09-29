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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Target, 
  Users, 
  Clock, 
  TrendingUp,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';

interface GRSTask {
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
  created_at?: string;
  updated_at?: string;
}

export default function TarefasUnificadasGRS() {
  const [tasks, setTasks] = useState<GRSTask[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GRSTask | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string>('');
  const [newTask, setNewTask] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    data_prazo: '',
    responsavel_id: '',
    cliente_id: '',
    projeto_id: '',
    horas_estimadas: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar tarefas GRS
      const { data: tasksData, error: tasksError } = await supabase
        .from('tarefas_projeto')
        .select('*')
        .eq('setor_responsavel', 'grs')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Processar tarefas
      const processedTasks = tasksData?.map(task => ({
        ...task,
        prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
        observacoes: task.observacoes || ''
      })) || [];

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
        .from('tarefas_projeto')
        .update({ 
          status: newStatus,
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

  const handleTaskCreate = (status?: string) => {
    setCreateColumnId(status || 'em_cadastro');
    setIsCreateModalOpen(true);
  };

  const createTask = async () => {
    if (!newTask.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tarefas_projeto')
        .insert({
          titulo: newTask.titulo,
          descricao: newTask.descricao || null,
          prioridade: newTask.prioridade,
          data_prazo: newTask.data_prazo || null,
          responsavel_id: newTask.responsavel_id || null,
          cliente_id: newTask.cliente_id || null,
          projeto_id: newTask.projeto_id || null,
          horas_estimadas: newTask.horas_estimadas ? parseInt(newTask.horas_estimadas) : null,
          setor_responsavel: 'grs',
          status: createColumnId
        })
        .select()
        .single();

      if (error) throw error;

      // Buscar dados relacionados para a nova tarefa
      const { data: taskWithRelations } = await supabase
        .from('tarefas_projeto')
        .select(`
          *,
          profiles:responsavel_id(nome),
          clientes:cliente_id(nome),
          projetos:projeto_id(titulo)
        `)
        .eq('id', data.id)
        .single();

      const processedTask = {
        ...taskWithRelations,
        responsavel_nome: taskWithRelations?.profiles?.nome,
        cliente_nome: taskWithRelations?.clientes?.nome,
        projeto_nome: taskWithRelations?.projetos?.titulo
      };

      setTasks(prev => [processedTask, ...prev]);
      
      // Reset form
      setNewTask({
        titulo: '',
        descricao: '',
        prioridade: 'media',
        data_prazo: '',
        responsavel_id: '',
        cliente_id: '',
        projeto_id: '',
        horas_estimadas: ''
      });
      
      setIsCreateModalOpen(false);

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleTaskClick = (task: GRSTask) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('tarefas_projeto')
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
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleTaskCreate()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Tarefa GRS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={newTask.titulo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Planejamento Janeiro - Cliente X"
                  />
                </div>
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={newTask.prioridade} onValueChange={(value) => setNewTask(prev => ({ ...prev, prioridade: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={newTask.descricao}
                  onChange={(e) => setNewTask(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva os objetivos e requisitos da tarefa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={newTask.cliente_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, cliente_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Select value={newTask.responsavel_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, responsavel_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.nome} ({profile.especialidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_prazo">Prazo</Label>
                  <Input
                    id="data_prazo"
                    type="date"
                    value={newTask.data_prazo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, data_prazo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="horas_estimadas">Horas Estimadas</Label>
                  <Input
                    id="horas_estimadas"
                    type="number"
                    value={newTask.horas_estimadas}
                    onChange={(e) => setNewTask(prev => ({ ...prev, horas_estimadas: e.target.value }))}
                    placeholder="Ex: 8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createTask}>
                  Criar Tarefa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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