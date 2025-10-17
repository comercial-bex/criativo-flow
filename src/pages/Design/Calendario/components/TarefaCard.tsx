import { ModernKanbanCard, KanbanTask } from '@/components/ModernKanbanCard';
import { TarefaCalendario } from '../types';
import { getTarefaData } from '../utils/taskHelpers';

interface TarefaCardProps {
  tarefa: TarefaCalendario;
  onClick?: () => void;
  compact?: boolean;
}

// Adapter: converte TarefaCalendario para KanbanTask
const convertToKanbanTask = (tarefa: TarefaCalendario): KanbanTask => {
  const prazo = getTarefaData(tarefa);
  
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    title: tarefa.titulo,
    descricao: tarefa.descricao,
    description: tarefa.descricao,
    status: tarefa.status || 'backlog',
    prioridade: (tarefa.prioridade?.toLowerCase() || 'baixa') as 'baixa' | 'media' | 'alta',
    priority: (tarefa.prioridade?.toLowerCase() || 'baixa') as 'alta' | 'média' | 'baixa',
    prazo_executor: prazo,
    executor_nome: tarefa.executor_nome,
    responsavel_nome: tarefa.executor_nome,
    executor_area: tarefa.executor_area,
    horas_trabalhadas: 0,
    horas_estimadas: 0,
    anexos_count: tarefa.anexos_count || 0,
  };
};

export const TarefaCard = ({ tarefa, onClick, compact = false }: TarefaCardProps) => {
  const kanbanTask = convertToKanbanTask(tarefa);
  
  return (
    <div className={compact ? 'scale-90 origin-top-left' : ''}>
      <ModernKanbanCard
        task={kanbanTask}
        onTaskClick={() => onClick?.()}
        isDragging={false}
      />
    </div>
  );
};
