import { useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TaskWithDeadline } from '@/utils/statusUtils';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { useMinhasTarefas, useTarefasStats, useUpdateTarefa } from '@/hooks/useTarefasOptimized';

interface MyTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  prioridade: 'baixa' | 'media' | 'alta';
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
  
  // Use optimized hooks
  const { data, isLoading } = useMinhasTarefas(user?.id);
  const { data: statsData } = useTarefasStats(user?.id);
  const updateTarefaMutation = useUpdateTarefa();
  
  const tasks = data?.tarefas || [];
  const stats = statsData || {
    total: 0,
    em_andamento: 0,
    vencidas: 0,
    concluidas_semana: 0
  };
  
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      await updateTarefaMutation.mutateAsync({ 
        id: taskId, 
        updates: { status: newStatus as any }
      });

      toast({
        title: "Status atualizado!",
        description: "A tarefa foi movida com sucesso.",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await updateTarefaMutation.mutateAsync({ 
        id: taskId, 
        updates 
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projetos?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.projetos?.clientes && 
       typeof task.projetos.clientes === 'object' && 
       'nome' in task.projetos.clientes &&
       task.projetos.clientes.nome?.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      {isLoading ? (
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