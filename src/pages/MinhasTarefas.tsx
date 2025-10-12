import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TrelloStyleTaskModal } from '@/components/TrelloStyleTaskModal';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Search,
  Filter,
  Calendar,
  User,
  List,
  Kanban,
  CalendarDays,
  Clock3,
  AlertCircle,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para tarefas unificadas
interface MyTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'alta' | 'media' | 'baixa';
  data_inicio?: string;
  data_prazo?: string;
  horas_estimadas?: number;
  horas_trabalhadas?: number;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  projeto_id?: string;
  projeto_nome?: string;
  cliente_nome?: string;
  observacoes?: string;
  anexos?: string[];
  created_at: string;
  updated_at: string;
  aprovacao_status?: string;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  comments?: Array<{
    id: string;
    user: string;
    text: string;
    date: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

// Componente de Lista de Tarefas
const TaskListView = ({ 
  tasks, 
  onTaskClick 
}: { 
  tasks: MyTask[], 
  onTaskClick: (task: MyTask) => void 
}) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baixa': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'em_revisao': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onTaskClick(task)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{getPriorityIcon(task.prioridade)}</span>
                  <h3 className="font-semibold text-foreground">{task.titulo}</h3>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {task.projeto_nome && (
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {task.projeto_nome}
                    </span>
                  )}
                  {task.cliente_nome && (
                    <span>{task.cliente_nome}</span>
                  )}
                  {task.data_prazo && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(task.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.horas_estimadas && (
                  <Badge variant="outline">
                    {task.horas_trabalhadas || 0}h / {task.horas_estimadas}h
                  </Badge>
                )}
                {task.data_prazo && new Date(task.data_prazo) < new Date() && task.status !== 'concluido' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Componente de Calendário de Tarefas
const TaskCalendarView = ({ 
  tasks, 
  onTaskClick 
}: { 
  tasks: MyTask[], 
  onTaskClick: (task: MyTask) => void 
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { locale: ptBR });
  const weekEnd = endOfWeek(currentWeek, { locale: ptBR });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.data_prazo) return false;
      return isSameDay(parseISO(task.data_prazo), day);
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'border-l-red-500 bg-red-50';
      case 'media': return 'border-l-yellow-500 bg-yellow-50';
      case 'baixa': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'dd', { locale: ptBR })} - {format(weekEnd, 'dd MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
          >
            Anterior
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(new Date())}
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
          >
            Próxima
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={day.toISOString()} className={isToday ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center">
                  <div className={`${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={`text-lg ${isToday ? 'text-primary font-bold' : ''}`}>
                    {format(day, 'dd')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[200px]">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2 rounded border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(task.prioridade)}`}
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="text-xs font-medium text-foreground truncate">
                      {task.titulo}
                    </div>
                    {task.cliente_nome && (
                      <div className="text-xs text-muted-foreground truncate">
                        {task.cliente_nome}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default function MinhasTarefas() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeView, setActiveView] = useState('kanban');
  
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

  // Configuração de colunas baseada no papel do usuário
  const getModuleColumns = () => {
    switch (role) {
      case 'grs':
        return [
          { id: 'backlog', titulo: 'A Fazer', cor: 'bg-gray-100', tasks: [], icon: 'Clock', ordem: 1 },
          { id: 'em_andamento', titulo: 'Em Andamento', cor: 'bg-blue-100', tasks: [], icon: 'Play', ordem: 2 },
          { id: 'em_revisao', titulo: 'Em Revisão', cor: 'bg-yellow-100', tasks: [], icon: 'Eye', ordem: 3 },
          { id: 'aprovado', titulo: 'Aprovado', cor: 'bg-green-100', tasks: [], icon: 'CheckCircle', ordem: 4 },
          { id: 'concluido', titulo: 'Concluído', cor: 'bg-green-200', tasks: [], icon: 'Check', ordem: 5 }
        ];
      case 'designer':
        return [
          { id: 'briefing', titulo: 'Briefing', cor: 'bg-purple-100', tasks: [], icon: 'FileText', ordem: 1 },
          { id: 'conceito', titulo: 'Conceito', cor: 'bg-blue-100', tasks: [], icon: 'Lightbulb', ordem: 2 },
          { id: 'producao', titulo: 'Produção', cor: 'bg-orange-100', tasks: [], icon: 'Palette', ordem: 3 },
          { id: 'revisao', titulo: 'Revisão', cor: 'bg-yellow-100', tasks: [], icon: 'Eye', ordem: 4 },
          { id: 'aprovado', titulo: 'Aprovado', cor: 'bg-green-100', tasks: [], icon: 'CheckCircle', ordem: 5 },
          { id: 'entregue', titulo: 'Entregue', cor: 'bg-green-200', tasks: [], icon: 'Check', ordem: 6 }
        ];
      default:
        return [
          { id: 'backlog', titulo: 'A Fazer', cor: 'bg-gray-100', tasks: [], icon: 'Clock', ordem: 1 },
          { id: 'em_andamento', titulo: 'Em Andamento', cor: 'bg-blue-100', tasks: [], icon: 'Play', ordem: 2 },
          { id: 'em_revisao', titulo: 'Em Revisão', cor: 'bg-yellow-100', tasks: [], icon: 'Eye', ordem: 3 },
          { id: 'concluido', titulo: 'Concluído', cor: 'bg-green-100', tasks: [], icon: 'Check', ordem: 4 }
        ];
    }
  };

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
        .from('tarefa')
        .select('*')
        .eq('responsavel_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar dados relacionados para cada tarefa
      const formattedTasks = await Promise.all((data || []).map(async (task) => {
        let responsavel_nome = '';
        let cliente_nome = '';
        let projeto_nome = '';

        // Buscar nome do responsável
        if (task.responsavel_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nome')
            .eq('id', task.responsavel_id)
            .single();
          responsavel_nome = profile?.nome || '';
        }

        // Buscar dados do projeto e cliente
        if (task.projeto_id) {
          const { data: projeto } = await supabase
            .from('projetos')
            .select('titulo, cliente_id')
            .eq('id', task.projeto_id)
            .single();
          
          if (projeto) {
            projeto_nome = projeto.titulo;
            
            // Buscar cliente separadamente
            if (projeto.cliente_id) {
              const { data: cliente } = await supabase
                .from('clientes')
                .select('nome')
                .eq('id', projeto.cliente_id)
                .single();
              cliente_nome = cliente?.nome || '';
            }
          }
        }

        return {
          ...task,
          prioridade: task.prioridade as 'alta' | 'media' | 'baixa',
          setor_responsavel: 'grs',
          responsavel_nome,
          cliente_nome,
          projeto_nome,
          observacoes: '',
          labels: [], // Placeholder para labels futuras
          checklist: [], // Placeholder para checklist futuro
          comments: [], // Placeholder para comentários futuros
          attachments: [] // Placeholder para anexos futuros
        };
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
    
    // Calcular tarefas vencidas
    const now = new Date();
    const vencidas = tasks.filter(t => {
      if (!t.data_prazo || t.status === 'concluido') return false;
      return new Date(t.data_prazo) < now;
    }).length;

    // Calcular concluídas na semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const concluidas_semana = tasks.filter(t => {
      if (t.status !== 'concluido') return false;
      return new Date(t.updated_at) >= oneWeekAgo;
    }).length;

    setStats({ total, em_andamento, vencidas, concluidas_semana });
  };

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ status: newStatus as any })
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
        .from('tarefa')
        .update(updates as any)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      toast({
        title: "Tarefa atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
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
    setShowTaskModal(true);
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projeto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando suas tarefas...</p>
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
            <User className="h-8 w-8 text-primary" />
            Minhas Tarefas
          </h1>
          <p className="text-muted-foreground">
            Dashboard personalizado com suas atribuições • {role ? role.toUpperCase() : 'Especialista'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
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
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
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
                <SelectItem value="em_revisao">Em Revisão</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
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

      {/* Views Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <UniversalKanbanBoard
            tasks={filteredTasks}
            moduleColumns={getModuleColumns()}
            moduleType="geral"
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            onTaskCreate={() => {}} // Não aplicável para visualização pessoal
            showSearch={false}
            showFilters={false}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa encontrada
                </div>
              ) : (
                <TaskListView tasks={filteredTasks} onTaskClick={handleTaskClick} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskCalendarView tasks={filteredTasks} onTaskClick={handleTaskClick} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Modal */}
      <TrelloStyleTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}