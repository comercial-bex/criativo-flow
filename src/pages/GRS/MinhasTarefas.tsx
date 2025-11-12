import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  User,
  Grid3X3,
  List
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TaskWithDeadline } from '@/utils/statusUtils';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { useMinhasTarefas, useTarefasStats, useUpdateTarefa } from '@/hooks/useTarefasOptimized';
import { VirtualizedTable } from '@/components/VirtualizedTable';
import { shouldUseVirtualScroll, VIRTUAL_SCROLL_CONFIG } from '@/lib/virtual-scroll-config';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>(() => {
    return (localStorage.getItem('tarefasViewMode') as 'kanban' | 'table') || 'kanban';
  });
  
  // Consolidação de filtros em um único estado
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    priority: 'all'
  });

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

  const toggleViewMode = () => {
    const newMode = viewMode === 'kanban' ? 'table' : 'kanban';
    setViewMode(newMode);
    localStorage.setItem('tarefasViewMode', newMode);
  };

  // Debounce do searchTerm para evitar re-renders excessivos
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
  
  // Filter tasks based on search and filters com useMemo
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = debouncedSearchTerm === '' || 
        task.titulo.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.projetos?.titulo?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.cliente_nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority = filters.priority === 'all' || task.prioridade === filters.priority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, debouncedSearchTerm, filters.status, filters.priority]);

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
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={toggleViewMode}>
            {viewMode === 'kanban' ? (
              <>
                <List className="h-4 w-4 mr-2" />
                Tabela
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Kanban
              </>
            )}
          </Button>
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
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
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status} onValueChange={(status) => setFilters(prev => ({ ...prev, status }))}>
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

            <Select value={filters.priority} onValueChange={(priority) => setFilters(prev => ({ ...prev, priority }))}>
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

      {/* Tasks View - Kanban or Table */}
      {isLoading ? (
        <div className="text-center py-8">Carregando suas tarefas...</div>
      ) : viewMode === 'kanban' ? (
        <TaskKanbanBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onTaskCreate={() => {}} // Not applicable for personal tasks
          onTaskClick={handleTaskClick}
          projetoId="" // Not applicable for personal view
        />
      ) : shouldUseVirtualScroll(filteredTasks.length) ? (
        <VirtualizedTable
          data={filteredTasks}
          height={700}
          rowHeight={VIRTUAL_SCROLL_CONFIG.ROW_HEIGHT_COMFORTABLE}
          columns={[
            {
              header: 'Tarefa',
              width: 300,
              render: (task) => (
                <div className="flex flex-col">
                  <span className="font-medium">{task.titulo}</span>
                  {task.projetos?.titulo && (
                    <span className="text-xs text-muted-foreground">
                      {task.projetos.titulo}
                    </span>
                  )}
                </div>
              )
            },
            {
              header: 'Cliente',
              width: 200,
              render: (task: any) => (
                <span className="text-sm">
                  {task.clientes?.nome || task.cliente_nome || '-'}
                </span>
              )
            },
            {
              header: 'Status',
              width: 150,
              align: 'center',
              render: (task) => <SmartStatusBadge task={task} />
            },
            {
              header: 'Prioridade',
              width: 120,
              align: 'center',
              render: (task) => {
                const priorityColors = {
                  alta: 'bg-red-100 text-red-800',
                  media: 'bg-yellow-100 text-yellow-800',
                  baixa: 'bg-green-100 text-green-800'
                };
                return (
                  <Badge className={priorityColors[task.prioridade] || ''}>
                    {task.prioridade}
                  </Badge>
                );
              }
            },
            {
              header: 'Prazo',
              width: 130,
              align: 'center',
              render: (task) => task.data_prazo ? (
                <span className="text-sm">
                  {format(new Date(task.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )
            },
            {
              header: 'Horas',
              width: 100,
              align: 'center',
              render: (task) => (
                <span className="text-sm font-medium">
                  {task.horas_trabalhadas || 0}h
                </span>
              )
            }
          ]}
          onRowClick={(task) => handleTaskClick(task)}
          emptyMessage="Nenhuma tarefa encontrada com os filtros aplicados"
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tarefa</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Prioridade</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Prazo</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Horas</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr 
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{task.titulo}</span>
                      {task.projetos?.titulo && (
                        <span className="text-xs text-muted-foreground">
                          {task.projetos.titulo}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.clientes?.nome || task.cliente_nome || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SmartStatusBadge task={task} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={
                      task.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                      task.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {task.prioridade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {task.data_prazo ? format(new Date(task.data_prazo), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    {task.horas_trabalhadas || 0}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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