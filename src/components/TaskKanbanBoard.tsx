import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { BexButton } from '@/components/ui/bex-button';
import { ModernKanbanCard } from '@/components/ModernKanbanCard';
import { TaskWithDeadline } from '@/utils/statusUtils';

export interface KanbanTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  responsavel_avatar?: string;
  executor_area?: string;
  setor_responsavel?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  horas_trabalhadas?: number;
  horas_estimadas?: number;
  prazo_executor?: string | null;
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

// Removed - using ModernKanbanCard instead

function KanbanColumnComponent({ 
  column, 
  onTaskCreate, 
  onTaskClick 
}: { 
  column: KanbanColumn; 
  onTaskCreate: (columnId: string) => void;
  onTaskClick: (task: KanbanTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnGradient = {
    "a_fazer": "bg-gradient-to-r from-gray-500/10 to-transparent",
    "em_andamento": "bg-gradient-to-r from-blue-500/10 to-transparent",
    "concluido": "bg-gradient-to-r from-bex/10 to-transparent",
  }[column.id] || "bg-gradient-to-r from-gray-500/10 to-transparent";

  return (
    <div className="flex-1 min-w-[300px]">
      <BexCard variant="gaming">
        <BexCardHeader className={`pb-3 ${columnGradient}`}>
          <div className="flex items-center justify-between">
            <BexCardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              {column.title}
              <div className="px-2 py-0.5 bg-bex/20 border border-bex/30 rounded-full text-xs font-semibold text-bex">
                {column.tasks.length}
              </div>
            </BexCardTitle>
            <BexButton 
              variant="bexGhost" 
              size="sm"
              onClick={() => onTaskCreate(column.id)}
            >
              <Plus className="h-4 w-4" />
            </BexButton>
          </div>
        </BexCardHeader>
        <BexCardContent 
          ref={setNodeRef}
          className={`space-y-3 max-h-[600px] overflow-y-auto transition-colors ${
            isOver ? 'bg-bex/10 border-bex/50 shadow-bex' : ''
          }`}
        >
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence mode="popLayout">
              {column.tasks.map((task) => (
                <ModernKanbanCard 
                  key={task.id} 
                  task={task} 
                  onTaskClick={onTaskClick}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma tarefa</p>
              <BexButton 
                variant="bexGhost" 
                size="sm" 
                className="mt-2"
                onClick={() => onTaskCreate(column.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </BexButton>
            </div>
          )}
        </BexCardContent>
      </BexCard>
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
    
    console.log('🔍 Debug Drag End:', {
      activeId: active.id,
      overId: over?.id,
      columns: columns.map(c => ({ id: c.id, taskCount: c.tasks.length }))
    });
    
    if (!over) {
      console.log('❌ Nenhum drop zone detectado');
      setActiveTask(null);
      return;
    }
    
    const taskId = active.id as string;
    const newColumnId = over.id as string;
    
    console.log('🎯 Drag end:', { taskId, newColumnId });
    
    // Verificar se é uma coluna válida
    const validColumns = ['a_fazer', 'em_andamento', 'concluido'];
    if (!validColumns.includes(newColumnId)) {
      console.log('⚠️ Drop em tarefa, não em coluna. Ignorando.');
      setActiveTask(null);
      return;
    }
    
    // Map column IDs to status values
    const statusMapping = {
      'a_fazer': 'backlog',
      'em_andamento': 'em_andamento',
      'concluido': 'concluido'
    };

    const newStatus = statusMapping[newColumnId as keyof typeof statusMapping];
    console.log('✅ Movendo para status:', newStatus);
    
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
          <ModernKanbanCard 
            task={activeTask} 
            onTaskClick={onTaskClick}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}