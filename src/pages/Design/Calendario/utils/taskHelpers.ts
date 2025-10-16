import { TarefaCalendario } from '../types';

export const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade?.toLowerCase()) {
    case 'alta':
      return 'bg-red-500';
    case 'média':
    case 'media':
      return 'bg-yellow-500';
    case 'baixa':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'concluída':
    case 'concluida':
      return 'bg-green-500';
    case 'em andamento':
    case 'em_andamento':
      return 'bg-blue-500';
    case 'pendente':
      return 'bg-yellow-500';
    case 'atrasada':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getTarefaData = (tarefa: TarefaCalendario): string | null => {
  // Prioridade: data_entrega_prevista > prazo_executor > data_inicio_prevista
  return tarefa.data_entrega_prevista || 
         tarefa.prazo_executor || 
         tarefa.data_inicio_prevista || 
         null;
};

export const sortTarefasByUrgency = (tarefas: TarefaCalendario[]) => {
  return [...tarefas].sort((a, b) => {
    const dateA = getTarefaData(a);
    const dateB = getTarefaData(b);
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
};

export const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'concluída':
    case 'concluida':
      return 'default';
    case 'em andamento':
    case 'em_andamento':
      return 'secondary';
    case 'atrasada':
      return 'destructive';
    default:
      return 'outline';
  }
};
