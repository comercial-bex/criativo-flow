/**
 * Módulo de Tarefas - Componente otimizado com TanStack Query
 * Substituído por hooks otimizados - veja useTarefasOptimized.ts
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Search,
  User,
  List,
  Kanban
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useMinhasTarefas, useTarefasStats, useUpdateTarefa } from '@/hooks/useTarefasOptimized';
import { useDebounceFilter } from '@/hooks/useDebounceFilter';

export default function MinhasTarefas() {
  const { user } = useAuth();
  const { role } = useUserRole();
  
  // Usar hooks otimizados
  const { data, isLoading } = useMinhasTarefas(user?.id);
  const { data: statsData } = useTarefasStats(user?.id);
  const updateTarefa = useUpdateTarefa();
  
  const tasks = data?.tarefas || [];
  const stats = statsData || {
    total: 0,
    em_andamento: 0,
    vencidas: 0,
    concluidas_semana: 0
  };
  
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeView, setActiveView] = useState('kanban');
  
  // Filters com debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const debouncedSearch = useDebounceFilter(searchTerm, 300);

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

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      await updateTarefa.mutateAsync({ id: taskId, updates: { status: newStatus } });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Filtrar tarefas com debounce
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = debouncedSearch === '' || 
      task.titulo?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      task.projeto_nome?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      task.cliente_nome?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
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

  if (isLoading) {
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
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="em_revisao">Em Revisão</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="kanban">
            <Kanban className="h-4 w-4 mr-2" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <UniversalKanbanBoard
            tasks={filteredTasks}
            columns={getModuleColumns()}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            module={role || 'grs'}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.projeto_nome} • {task.cliente_nome}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.prioridade === 'alta' ? 'destructive' : 'secondary'}>
                          {task.prioridade}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          open={showTaskModal}
          onOpenChange={setShowTaskModal}
          onTaskUpdate={() => {}}
        />
      )}
    </div>
  );
}
