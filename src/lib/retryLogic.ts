/**
 * Retry Logic com Exponential Backoff
 * Implementa tentativas progressivamente mais lentas em caso de falha
 */

import { useMetricsStore } from '@/store/metricsStore';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Retry em erros de rede ou servidor
    if (error?.message?.includes('Failed to fetch')) return true;
    if (error?.message?.includes('Network request failed')) return true;
    if (error?.status >= 500) return true;
    if (error?.status === 429) return true; // Rate limit
    return false;
  },
};

/**
 * Calcula o delay para a próxima tentativa usando exponential backoff
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Adiciona jitter (0-30% do delay)
  const delayWithJitter = exponentialDelay + jitter;
  
  return Math.min(delayWithJitter, config.maxDelay);
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa uma função com retry e exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // Registrar sucesso nas métricas
      if (attempt > 0) {
        const retryTime = Date.now() - startTime;
        useMetricsStore.getState().recordRetry('general', true, retryTime);
        console.log(`✅ Retry bem-sucedido após ${attempt} tentativa(s)`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Registrar erro nas métricas
      useMetricsStore.getState().recordNetworkError('general', String(error));
      
      // Verificar se deve fazer retry
      const shouldRetry = finalConfig.shouldRetry(error, attempt);
      const hasRetriesLeft = attempt < finalConfig.maxRetries;
      
      if (!shouldRetry || !hasRetriesLeft) {
        // Registrar falha final
        if (attempt > 0) {
          const retryTime = Date.now() - startTime;
          useMetricsStore.getState().recordRetry('general', false, retryTime);
        }
        console.error(`❌ Falha após ${attempt + 1} tentativa(s):`, error);
        throw error;
      }
      
      // Calcular delay e aguardar
      const delay = calculateDelay(attempt, finalConfig);
      console.warn(
        `⚠️ Tentativa ${attempt + 1}/${finalConfig.maxRetries + 1} falhou. ` +
        `Aguardando ${Math.round(delay / 1000)}s antes de tentar novamente...`,
        error
      );
      
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Versão otimizada para queries do React Query
 * Usa configurações específicas para diferentes tipos de queries
 */
export async function withQueryRetry<T>(
  queryKey: string,
  fn: () => Promise<T>,
  options?: {
    priority?: 'high' | 'normal' | 'low';
  }
): Promise<T> {
  const priority = options?.priority || 'normal';
  const startTime = Date.now();
  
  // Configurações por prioridade
  const configs = {
    high: {
      maxRetries: 4,
      baseDelay: 500,
      maxDelay: 10000,
    },
    normal: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 20000,
    },
    low: {
      maxRetries: 2,
      baseDelay: 2000,
      maxDelay: 30000,
    },
  };

  try {
    const result = await withRetry(fn, configs[priority]);
    
    // Registrar tempo de query nas métricas
    const queryTime = Date.now() - startTime;
    useMetricsStore.getState().recordQueryTime(queryKey, queryTime);
    
    return result;
  } catch (error) {
    // Registrar erro específico da query
    useMetricsStore.getState().recordNetworkError(queryKey, String(error));
    throw error;
  }
}

/**
 * Batch retry - executa múltiplas operações com retry
 * Falhas individuais não impedem outras operações
 */
export async function withBatchRetry<T>(
  operations: Array<{
    key: string;
    fn: () => Promise<T>;
    priority?: 'high' | 'normal' | 'low';
  }>
): Promise<Array<{ key: string; result?: T; error?: any }>> {
  const results = await Promise.allSettled(
    operations.map(async (op) => {
      try {
        const result = await withQueryRetry(op.key, op.fn, { priority: op.priority });
        return { key: op.key, result };
      } catch (error) {
        return { key: op.key, error };
      }
    })
  );

  return results.map((result) => 
    result.status === 'fulfilled' 
      ? result.value 
      : { key: '', error: result.reason }
  );
}

/**
 * Circuit breaker - previne tentativas excessivas quando sistema está falhando
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minuto
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Verificar se deve tentar half-open
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        console.log('🔄 Circuit breaker: tentando recuperação (half-open)');
      } else {
        throw new Error('Circuit breaker está aberto - sistema temporariamente indisponível');
      }
    }

    try {
      const result = await fn();
      
      // Sucesso - resetar circuit breaker
      if (this.state === 'half-open') {
        console.log('✅ Circuit breaker: recuperado com sucesso (closed)');
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      // Abrir circuit se atingir threshold
      if (this.failures >= this.threshold) {
        this.state = 'open';
        console.error(
          `🔴 Circuit breaker aberto após ${this.failures} falhas. ` +
          `Bloqueando requisições por ${this.timeout / 1000}s`
        );
      }
      
      throw error;
    }
  }

  reset() {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Circuit breaker global para requisições
export const globalCircuitBreaker = new CircuitBreaker();

/**
 * Wrapper que combina retry + circuit breaker
 */
export async function withResilientRetry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  return globalCircuitBreaker.execute(() => withRetry(fn, config));
}
