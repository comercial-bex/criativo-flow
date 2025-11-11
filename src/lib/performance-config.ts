/**
 * Configurações globais de performance para o BEX Flow
 * Centraliza constantes e thresholds de otimização
 */

export const PERFORMANCE_CONFIG = {
  // Query/Cache Configuration
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutos
  QUERY_GC_TIME: 15 * 60 * 1000, // 15 minutos
  QUERY_RETRY_ATTEMPTS: 3,
  QUERY_RETRY_DELAY_BASE: 1000, // ms
  QUERY_RETRY_DELAY_MAX: 30000, // ms
  
  // Debounce Delays
  DEBOUNCE_SEARCH: 300, // ms
  DEBOUNCE_FILTER: 500, // ms
  DEBOUNCE_INPUT: 400, // ms
  
  // Cache Persistence
  CACHE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 dias
  
  // Background Sync
  SYNC_INTERVAL_HIGH_PRIORITY: 2 * 60 * 1000, // 2 min
  SYNC_INTERVAL_NORMAL: 5 * 60 * 1000, // 5 min
  
  // Prefetch
  PREFETCH_HOVER_DELAY: 100, // ms
  
  // Thresholds
  SLOW_QUERY_THRESHOLD: 1000, // ms
  NETWORK_TIMEOUT: 30000, // ms
  
  // Circuit Breaker
  CIRCUIT_BREAKER_THRESHOLD: 5, // falhas consecutivas
  CIRCUIT_BREAKER_RESET_TIMEOUT: 60000, // 1 min
  
  // Metrics
  METRICS_SAMPLE_SIZE: 100, // últimas N queries
  METRICS_UPDATE_INTERVAL: 2000, // ms
} as const;

/**
 * Helper para calcular exponential backoff
 */
export function calculateRetryDelay(attemptIndex: number): number {
  return Math.min(
    PERFORMANCE_CONFIG.QUERY_RETRY_DELAY_BASE * 2 ** attemptIndex,
    PERFORMANCE_CONFIG.QUERY_RETRY_DELAY_MAX
  );
}

/**
 * Helper para determinar se uma query está lenta
 */
export function isSlowQuery(duration: number): boolean {
  return duration > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD;
}
