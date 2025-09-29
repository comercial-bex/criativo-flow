export type TaskStatus = 'a_fazer' | 'em_andamento' | 'concluido' | 'vencido';
export type ProjectStatus = 'ativo' | 'pausado' | 'concluido' | 'cancelado';

export interface TaskWithDeadline {
  id: string;
  titulo: string;
  data_prazo?: string;
  status: string;
  created_at: string;
}

export interface ProjectWithTasks {
  id: string;
  titulo: string;
  status: string;
  tarefas?: TaskWithDeadline[];
}

// Calculate smart status based on remaining time
export const calculateTaskSmartStatus = (task: TaskWithDeadline): {
  status: TaskStatus;
  color: string;
  variant: 'default' | 'secondary' | 'destructive' | 'success';
} => {
  // If task is completed
  if (task.status === 'concluido' || task.status === 'finalizado') {
    return { status: 'concluido', color: 'bg-green-500', variant: 'success' };
  }

  // If no deadline, return in-progress or to-do based on status
  if (!task.data_prazo) {
    const status = task.status === 'em_andamento' ? 'em_andamento' : 'a_fazer';
    return { 
      status, 
      color: status === 'em_andamento' ? 'bg-blue-500' : 'bg-gray-500',
      variant: 'default'
    };
  }

  const now = new Date();
  const deadline = new Date(task.data_prazo);
  const createdAt = new Date(task.created_at);
  
  // Calculate total time and remaining time
  const totalTime = deadline.getTime() - createdAt.getTime();
  const remainingTime = deadline.getTime() - now.getTime();
  const remainingPercentage = (remainingTime / totalTime) * 100;

  // If already passed deadline
  if (remainingTime < 0) {
    return { status: 'vencido', color: 'bg-red-600', variant: 'destructive' };
  }

  // Less than 5% remaining (critical)
  if (remainingPercentage <= 5) {
    return { status: 'vencido', color: 'bg-red-500', variant: 'destructive' };
  }

  // Less than 30% remaining (warning)
  if (remainingPercentage <= 30) {
    return { status: 'em_andamento', color: 'bg-yellow-500', variant: 'secondary' };
  }

  // More than 30% remaining (good)
  return { status: 'a_fazer', color: 'bg-blue-500', variant: 'default' };
};

// Calculate project status based on tasks
export const calculateProjectStatus = (project: ProjectWithTasks): {
  status: ProjectStatus;
  color: string;
  criticalTasks: number;
} => {
  if (!project.tarefas || project.tarefas.length === 0) {
    return { status: 'ativo', color: 'bg-gray-500', criticalTasks: 0 };
  }

  const taskStatuses = project.tarefas.map(task => calculateTaskSmartStatus(task));
  
  // Count critical tasks
  const criticalTasks = taskStatuses.filter(t => 
    t.status === 'vencido' || t.variant === 'destructive'
  ).length;

  // If all tasks completed
  const allCompleted = taskStatuses.every(t => t.status === 'concluido');
  if (allCompleted) {
    return { status: 'concluido', color: 'bg-green-500', criticalTasks };
  }

  // If any critical tasks
  if (criticalTasks > 0) {
    return { status: 'ativo', color: 'bg-red-500', criticalTasks };
  }

  // If any warning tasks
  const warningTasks = taskStatuses.filter(t => t.variant === 'secondary').length;
  if (warningTasks > 0) {
    return { status: 'ativo', color: 'bg-yellow-500', criticalTasks };
  }

  // All good
  return { status: 'ativo', color: 'bg-blue-500', criticalTasks };
};

// Format status text
export const getStatusText = (status: TaskStatus | ProjectStatus): string => {
  const statusMap: Record<string, string> = {
    'a_fazer': 'A Fazer',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'vencido': 'Vencido',
    'ativo': 'Ativo',
    'pausado': 'Pausado',
    'cancelado': 'Cancelado'
  };
  
  return statusMap[status] || status;
};