/**
 * Configurações de Cache e Paginação para React Query
 * Centraliza políticas de staleTime, gcTime e refetch
 */

export const QUERY_CONFIG = {
  // Dados estáticos (mudam raramente)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Dados semi-estáticos (mudam ocasionalmente)
  semiStatic: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  
  // Dados dinâmicos (mudam frequentemente)
  dynamic: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  
  // Dados críticos (precisam estar sempre atualizados)
  critical: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
  },
  
  // Dados em tempo real (dashboards, métricas)
  realtime: {
    staleTime: 0, // Sempre stale
    gcTime: 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Refetch a cada 30s
  },
};

export const PAGINATION_CONFIG = {
  defaultPageSize: 50,
  pageSizeOptions: [20, 50, 100, 200],
};

/**
 * Aplica configuração de cache baseada no tipo de dado
 */
export function getQueryConfig(type: keyof typeof QUERY_CONFIG) {
  return QUERY_CONFIG[type];
}

/**
 * Configurações específicas por módulo
 */
export const MODULE_QUERY_CONFIG = {
  // Plano de Contas (raramente muda)
  planoContas: QUERY_CONFIG.static,
  
  // Clientes (muda ocasionalmente)
  clientes: QUERY_CONFIG.semiStatic,
  
  // Tarefas (muda frequentemente)
  tarefas: QUERY_CONFIG.dynamic,
  
  // Financeiro - Lançamentos (crítico)
  lancamentos: QUERY_CONFIG.critical,
  
  // Dashboard - Métricas (tempo real)
  metrics: QUERY_CONFIG.realtime,
  
  // RH - Folha de Ponto (crítico)
  folhaPonto: QUERY_CONFIG.critical,
  
  // Adiantamentos (dinâmico)
  adiantamentos: QUERY_CONFIG.dynamic,
  
  // Planejamentos (dinâmico)
  planejamentos: QUERY_CONFIG.dynamic,
  
  // Aprovações (crítico)
  aprovacoes: QUERY_CONFIG.critical,
};
