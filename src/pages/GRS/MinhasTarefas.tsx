import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskKanbanBoard } from '@/components/TaskKanbanBoard';
import { SmartStatusBadge } from '@/components/SmartStatusBadge';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TaskWithDeadline } from '@/utils/statusUtils';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface MyTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  prioridade: 'baixa' | 'media' | 'alta';
  horas_estimadas?: number;
  horas_trabalhadas?: number;
  observacoes?: string;
  projetos?: {
    titulo: string;
    clientes?: {
      nome: string;
    };
  };
}

export default function MinhasTarefas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-minhas-tarefas');
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    em_andamento: 0,
    vencidas: 0,
    concluidas_semana: 0
  });

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tarefas_projeto')
        .select(`
          *,
          responsavel:profiles!responsavel_id (nome),
          projetos!projeto_id (
            titulo,
            clientes (nome)
          )
        `)
        .eq('responsavel_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = (data || []).map(task => ({
        ...task,
        responsavel_nome: task.responsavel?.nome || 'Não atribuído',
        prioridade: task.prioridade as 'baixa' | 'media' | 'alta'
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Erro ao carregar minhas tarefas:', error);
      toast({
        title: "Erro ao carregar tarefas",
        description: "Não foi possível carregar suas tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = tasks.length;
    const em_andamento = tasks.filter(t => t.status === 'em_andamento').length;
    
    // Calculate overdue tasks
    const now = new Date();
    const vencidas = tasks.filter(t => {
      if (!t.data_prazo || t.status === 'concluido') return false;
      return new Date(t.data_prazo) < now;
    }).length;

    // Calculate completed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const concluidas_semana = tasks.filter(t => {
      if (t.status !== 'concluido') return false;
      return new Date(t.created_at) >= oneWeekAgo;
    }).length;

    setStats({ total, em_andamento, vencidas, concluidas_semana });
  };

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefas_projeto')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: "Status atualizado!",
        description: "A tarefa foi movida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive",
      });
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<MyTask>) => {
    try {
      const { error } = await supabase
        .from('tarefas_projeto')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      fetchMyTasks(); // Refresh to get updated data
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive",
      });
    }
  };

  const handleTaskClick = (task: MyTask) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projetos?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projetos?.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.prioridade === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statsCards = [
    {
      title: "Total de Tarefas",
      value: stats.total.toString(),
      icon: CheckSquare,
      description: "Atribuídas a você",
      color: "text-blue-600"
    },
    {
      title: "Em Andamento",
      value: stats.em_andamento.toString(),
      icon: Clock,
      description: "Sendo executadas",
      color: "text-orange-500"
    },
    {
      title: "Vencidas",
      value: stats.vencidas.toString(),
      icon: AlertTriangle,
      description: "Precisam de atenção",
      color: "text-red-500"
    },
    {
      title: "Concluídas (7 dias)",
      value: stats.concluidas_semana.toString(),
      icon: TrendingUp,
      description: "Sua produtividade",
      color: "text-green-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Minhas Tarefas
          </h1>
          <p className="text-muted-foreground">Dashboard personalizado com suas atribuições</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tarefa, projeto ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="backlog">A Fazer</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="alta">🔴 Alta</SelectItem>
                <SelectItem value="media">🟡 Média</SelectItem>
                <SelectItem value="baixa">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Kanban */}
      {loading ? (
        <div className="text-center py-8">Carregando suas tarefas...</div>
      ) : (
        <TaskKanbanBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onTaskCreate={() => {}} // Not applicable for personal tasks
          onTaskClick={handleTaskClick}
          projetoId="" // Not applicable for personal view
        />
      )}

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={showTaskDetails}
        onOpenChange={setShowTaskDetails}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}