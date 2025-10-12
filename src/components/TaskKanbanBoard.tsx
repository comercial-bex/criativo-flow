import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SmartStatusBadge } from '@/components/SmartStatusBadge';
import { 
  Plus, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { TaskWithDeadline } from '@/utils/statusUtils';

interface KanbanTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  prioridade: 'baixa' | 'media' | 'alta';
  
  horas_trabalhadas?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color: string;
}

interface TaskKanbanBoardProps {
  tasks: KanbanTask[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskCreate: (status?: string) => void;
  onTaskClick: (task: KanbanTask) => void;
  projetoId: string;
}

function SortableTaskCard({ task, onTaskClick }: { task: KanbanTask; onTaskClick: (task: KanbanTask) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow mb-3"
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Priority indicator */}
        <div className="flex items-start justify-between">
          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.prioridade)}`} />
          <SmartStatusBadge task={task} showIcon={false} />
        </div>

        {/* Task title */}
        <h4 className="font-medium text-sm leading-tight">{task.titulo}</h4>

        {/* Task details */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {task.setor_responsavel}
            </Badge>
          </div>

          {task.responsavel_nome && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.responsavel_nome}</span>
            </div>
          )}

          {task.data_prazo && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.data_prazo).toLocaleDateString('pt-BR')}</span>
            </div>
          )}

        </div>

        {/* Additional indicators */}
        <div className="flex items-center justify-between">
          {task.descricao && (
            <FileText className="h-3 w-3 text-muted-foreground" />
          )}
          
          {/* Show alert if near deadline */}
          {task.data_prazo && (
            (() => {
              const now = new Date();
              const deadline = new Date(task.data_prazo);
              const remainingDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              return remainingDays <= 2 && remainingDays >= 0 ? (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              ) : null;
            })()
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumnComponent({ 
  column, 
  onTaskCreate, 
  onTaskClick 
}: { 
  column: KanbanColumn; 
  onTaskCreate: (columnId: string) => void;
  onTaskClick: (task: KanbanTask) => void;
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              {column.title}
              <Badge variant="secondary" className="ml-2">
                {column.tasks.length}
              </Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTaskCreate(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <SortableTaskCard 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick}
              />
            ))}
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma tarefa</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => onTaskCreate(column.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TaskKanbanBoard({ tasks, onTaskMove, onTaskCreate, onTaskClick, projetoId }: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  // Organize tasks into columns
  const columns: KanbanColumn[] = [
    {
      id: 'a_fazer',
      title: 'A Fazer',
      tasks: tasks.filter(task => task.status === 'backlog' || task.status === 'a_fazer'),
      color: 'bg-gray-500'
    },
    {
      id: 'em_andamento',
      title: 'Em Andamento', 
      tasks: tasks.filter(task => task.status === 'em_andamento' || task.status === 'em_progresso'),
      color: 'bg-blue-500'
    },
    {
      id: 'concluido',
      title: 'Concluído',
      tasks: tasks.filter(task => task.status === 'concluido' || task.status === 'finalizado'),
      color: 'bg-green-500'
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newColumnId = over.id as string;
    
    // Map column IDs to status values
    const statusMapping = {
      'a_fazer': 'backlog',
      'em_andamento': 'em_andamento',
      'concluido': 'concluido'
    };

    const newStatus = statusMapping[newColumnId as keyof typeof statusMapping] || newColumnId;
    onTaskMove(taskId, newStatus);
    setActiveTask(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            onTaskCreate={onTaskCreate}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <SortableTaskCard task={activeTask} onTaskClick={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}