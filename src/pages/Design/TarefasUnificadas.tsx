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

export default function TarefasUnificadasDesign() {
  const [tasks, setTasks] = useState<DesignTask[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DesignTask | null>(null);
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
    horas_estimadas: '',
    tipo_criativo: '',
    formato: '',
    dimensoes: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Tipos de conteúdo criativo
  const tiposCreativos = [
    'post-feed',
    'stories',
    'reels',
    'banner',
    'flyer',
    'logo',
    'identidade-visual',
    'website',
    'material-grafico'
  ];

  const formatos = [
    'quadrado-1080x1080',
    'retrato-1080x1350',
    'stories-1080x1920',
    'banner-facebook-1200x630',
    'banner-instagram-1080x566',
    'a4-210x297mm',
    'custom'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar tarefas de Design
      const { data: tasksData, error: tasksError } = await (supabase
        .from('tarefa')
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (tasksError) throw tasksError;

      // Processar tarefas
      const processedTasks = tasksData?.map((task: any) => ({
        ...task,
        prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
        setor_responsavel: 'design',
        observacoes: task.observacoes || ''
      })) || [];

      setTasks(processedTasks as any);

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

      // Buscar designers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, especialidade')
        .in('especialidade', ['design', 'gestor'])
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

  const handleTaskCreate = (status?: string) => {
    setCreateColumnId(status || 'briefing');
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
          setor_responsavel: 'design',
          status: createColumnId,
          tipo_tarefa: 'design',
          observacoes: `Tipo: ${newTask.tipo_criativo} | Formato: ${newTask.formato} | Dimensões: ${newTask.dimensoes}`
        })
        .select()
        .single();

      if (error) throw error;

      // Buscar nomes relacionados separadamente
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

      if (newTask.cliente_id) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('nome')
          .eq('id', newTask.cliente_id)
          .single();
        cliente_nome = cliente?.nome || '';
      }

      const processedTask: DesignTask = {
        ...data,
        prioridade: data.prioridade as 'baixa' | 'media' | 'alta',
        responsavel_nome,
        cliente_nome,
        observacoes: data.observacoes || ''
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
        horas_estimadas: '',
        tipo_criativo: '',
        formato: '',
        dimensoes: ''
      });
      
      setIsCreateModalOpen(false);

      toast({
        title: "Sucesso",
        description: "Tarefa de design criada com sucesso!",
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

  const handleTaskClick = (task: DesignTask) => {
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
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleTaskCreate()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Tarefa de Design</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={newTask.titulo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Post Instagram - Campanha Verão"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_criativo">Tipo de Conteúdo</Label>
                  <Select value={newTask.tipo_criativo} onValueChange={(value) => setNewTask(prev => ({ ...prev, tipo_criativo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposCreativos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo.replace('-', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Briefing</Label>
                <Textarea
                  id="descricao"
                  value={newTask.descricao}
                  onChange={(e) => setNewTask(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Detalhe o briefing: conceito, cores, estilo, referências..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="formato">Formato</Label>
                  <Select value={newTask.formato} onValueChange={(value) => setNewTask(prev => ({ ...prev, formato: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {formatos.map(formato => (
                        <SelectItem key={formato} value={formato}>
                          {formato}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dimensoes">Dimensões Customizadas</Label>
                  <Input
                    id="dimensoes"
                    value={newTask.dimensoes}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dimensoes: e.target.value }))}
                    placeholder="Ex: 1920x1080px"
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
                  <Label htmlFor="responsavel">Designer</Label>
                  <Select value={newTask.responsavel_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, responsavel_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar designer" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.filter(p => p.especialidade === 'designer').map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_prazo">Prazo de Entrega</Label>
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
                    placeholder="Ex: 4"
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Briefing</p>
              <p className="text-2xl font-bold">{stats.briefing}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Criação</p>
              <p className="text-2xl font-bold">{stats.emCriacao}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aprovação</p>
              <p className="text-2xl font-bold">{stats.aprovacaoCliente}</p>
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
        <TrelloStyleTaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onTaskUpdate={handleTaskUpdate}
          profiles={profiles}
          moduleType="design"
        />
      )}
    </div>
  );
}