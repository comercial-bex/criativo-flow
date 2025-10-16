export interface TarefaCalendario {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  executor_id: string;
  executor_nome?: string;
  executor_area?: string;
  cliente_id?: string;
  prazo_executor?: string;
  data_inicio_prevista?: string;
  data_entrega_prevista?: string;
  anexos_count?: number;
}

export interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  responsavel_id: string;
  responsavel_nome?: string;
  cliente_id?: string;
}

export type ViewMode = 'month' | 'week' | 'list' | 'day';

export interface DayData {
  data: Date;
  tarefas: TarefaCalendario[];
  eventos: EventoCalendario[];
}

export interface CalendarFilters {
  designer: string;
  status: string[];
  prioridade: string[];
  cliente?: string;
}
