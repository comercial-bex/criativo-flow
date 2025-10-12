// BEX 3.0 - Utilitários para Sistema de Tarefas

import { StatusPrazo, StatusTarefa, PrioridadeTarefa, TimeRemaining } from '@/types/tarefa';

// Re-export para facilitar imports
export type { TimeRemaining };

/**
 * Calcula o status de prazo e tempo restante
 */
export function calcularStatusPrazo(prazoExecutor?: string | null): {
  status: StatusPrazo;
  timeRemaining?: TimeRemaining;
} {
  if (!prazoExecutor) {
    return { status: 'cinza' };
  }

  const now = new Date();
  const deadline = new Date(prazoExecutor);
  const diffMs = deadline.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 0) {
    return {
      status: 'vermelho',
      timeRemaining: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total_seconds: diffSeconds,
        status: 'vermelho',
      },
    };
  }

  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  // Regras de cor
  let status: StatusPrazo = 'verde';
  if (diffSeconds <= 86400) {
    // ≤ 24h
    status = 'amarelo';
  }
  if (diffSeconds > 86400) {
    status = 'verde';
  }

  return {
    status,
    timeRemaining: {
      days,
      hours,
      minutes,
      seconds,
      total_seconds: diffSeconds,
      status,
    },
  };
}

/**
 * Formata tempo restante para exibição DD:HH:MM:SS
 */
export function formatarTempoRestante(timeRemaining?: TimeRemaining): string {
  if (!timeRemaining) return '--:--:--:--';

  const { days, hours, minutes, seconds, total_seconds } = timeRemaining;

  if (total_seconds < 0) {
    // Vencido - mostrar tempo ultrapassado em vermelho
    const absDays = Math.abs(days);
    const absHours = Math.abs(hours);
    const absMinutes = Math.abs(minutes);
    const absSeconds = Math.abs(seconds);
    return `-${String(absDays).padStart(2, '0')}:${String(absHours).padStart(2, '0')}:${String(absMinutes).padStart(2, '0')}:${String(absSeconds).padStart(2, '0')}`;
  }

  return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Retorna classes Tailwind para cor de status de prazo
 */
export function getStatusPrazoClasses(status: StatusPrazo): {
  border: string;
  bg: string;
  text: string;
  badge: string;
} {
  switch (status) {
    case 'vermelho':
      return {
        border: 'border-red-500 dark:border-red-400',
        bg: 'bg-red-50 dark:bg-red-950',
        text: 'text-red-700 dark:text-red-300',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      };
    case 'amarelo':
      return {
        border: 'border-yellow-500 dark:border-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        text: 'text-yellow-700 dark:text-yellow-300',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      };
    case 'verde':
      return {
        border: 'border-green-500 dark:border-green-400',
        bg: 'bg-green-50 dark:bg-green-950',
        text: 'text-green-700 dark:text-green-300',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      };
    default:
      return {
        border: 'border-gray-300 dark:border-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-900',
        text: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      };
  }
}

/**
 * Verifica se deve mostrar alerta de urgência (≤ 4h)
 */
export function mostrarAlertatUrgencia(timeRemaining?: TimeRemaining): boolean {
  if (!timeRemaining) return false;
  return timeRemaining.total_seconds <= 14400 && timeRemaining.total_seconds > 0; // 4 horas
}

/**
 * Config de prioridade
 */
export function getPrioridadeConfig(prioridade: PrioridadeTarefa) {
  switch (prioridade) {
    case 'critica':
      return {
        color: 'bg-red-600',
        badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
        icon: '🔴',
        label: 'Crítica',
      };
    case 'alta':
      return {
        color: 'bg-orange-500',
        badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
        icon: '🟠',
        label: 'Alta',
      };
    case 'media':
      return {
        color: 'bg-yellow-500',
        badge: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300',
        icon: '🟡',
        label: 'Média',
      };
    case 'baixa':
      return {
        color: 'bg-green-500',
        badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
        icon: '🟢',
        label: 'Baixa',
      };
    default:
      return {
        color: 'bg-gray-400',
        badge: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
        icon: '⚪',
        label: 'Normal',
      };
  }
}

/**
 * Config de status
 */
export function getStatusConfig(status: StatusTarefa) {
  const configs = {
    backlog: { label: 'Backlog', color: 'bg-gray-500', icon: '📋' },
    briefing: { label: 'Briefing', color: 'bg-blue-500', icon: '📝' },
    em_producao: { label: 'Em Produção', color: 'bg-purple-500', icon: '⚡' },
    em_revisao: { label: 'Em Revisão', color: 'bg-indigo-500', icon: '👀' },
    aprovacao_cliente: { label: 'Aprovação Cliente', color: 'bg-yellow-500', icon: '⏳' },
    aprovado: { label: 'Aprovado', color: 'bg-emerald-500', icon: '✅' },
    agendado: { label: 'Agendado', color: 'bg-cyan-500', icon: '📅' },
    publicado: { label: 'Publicado', color: 'bg-green-600', icon: '🚀' },
    pausado: { label: 'Pausado', color: 'bg-orange-500', icon: '⏸' },
    cancelado: { label: 'Cancelado', color: 'bg-red-500', icon: '❌' },
  };

  return configs[status] || configs.backlog;
}

/**
 * Colunas do Kanban por status
 */
export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog', statuses: ['backlog'] },
  { id: 'briefing', title: 'Briefing', statuses: ['briefing'] },
  { id: 'em_producao', title: 'Em Produção', statuses: ['em_producao'] },
  { id: 'em_revisao', title: 'Em Revisão', statuses: ['em_revisao'] },
  { id: 'aprovacao_cliente', title: 'Aprovação', statuses: ['aprovacao_cliente'] },
  { id: 'aprovado', title: 'Aprovado', statuses: ['aprovado'] },
  { id: 'agendado', title: 'Agendado', statuses: ['agendado'] },
  { id: 'publicado', title: 'Publicado', statuses: ['publicado'] },
];

// === Mapeamento centralizado de executor_area ===
export type ExecutorAreaEnum = 'Audiovisual' | 'Criativo';

export function mapExecutorArea(valor?: string | null): ExecutorAreaEnum | null {
  const mapeamento: Record<string, ExecutorAreaEnum> = {
    audiovisual: 'Audiovisual',
    design: 'Criativo',
    grs: 'Criativo',
    atendimento: 'Criativo',
  };
  if (!valor) return null;
  const key = String(valor).toLowerCase();
  return mapeamento[key] ?? null;
}

// Remove propriedades circulares e garante apenas campos válidos do banco
export function sanitizeTaskPayload<T extends Record<string, any>>(p: T): any {
  if (!p) return p;
  
  // Lista de campos válidos para a tabela tarefa (atualizada - sem setor_responsavel)
  const validFields = [
    'id',
    'projeto_id',
    'cliente_id',
    'titulo',
    'descricao',
    'tipo',
    'status',
    'prioridade',
    'executor_area',
    'responsavel_id',
    'executor_id',
    'data_inicio',
    'prazo_executor',
    'horas_estimadas',
    'horas_trabalhadas',
    'tags',
    'metadata',
    'campanha_id',
    'pacote_id',
    'origem',
    'grs_action_id',
    'kpis',
    'trace_id',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at'
  ];
  
  // Criar objeto limpo apenas com campos válidos
  const cleanPayload: any = {};
  validFields.forEach(field => {
    if (p[field] !== undefined) {
      cleanPayload[field] = p[field];
    }
  });
  
  // Mapear executor_area corretamente se ainda não estiver mapeado
  if (cleanPayload.executor_area && typeof cleanPayload.executor_area === 'string') {
    const ea = mapExecutorArea(cleanPayload.executor_area);
    if (ea) {
      cleanPayload.executor_area = ea;
    }
  }
  
  // Remover explicitamente setor_responsavel se existir (proteção extra)
  delete cleanPayload.setor_responsavel;
  
  return cleanPayload;
}
