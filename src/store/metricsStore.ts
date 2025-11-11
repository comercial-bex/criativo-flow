import { create } from 'zustand';

/**
 * Store de métricas de cache e performance
 */

export interface CacheMetrics {
  hits: number;
  misses: number;
  size: number;
  queries: Record<string, {
    hits: number;
    misses: number;
    lastAccess: number;
    avgLoadTime: number;
  }>;
}

export interface RetryMetrics {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  byQuery: Record<string, {
    attempts: number;
    successes: number;
    failures: number;
    avgRetryTime: number;
  }>;
}

export interface PerformanceMetrics {
  queryTimes: Record<string, number[]>;
  slowQueries: Array<{
    queryKey: string;
    time: number;
    timestamp: number;
  }>;
  networkErrors: Array<{
    queryKey: string;
    error: string;
    timestamp: number;
  }>;
}

interface MetricsStore {
  cache: CacheMetrics;
  retry: RetryMetrics;
  performance: PerformanceMetrics;
  circuitBreakerState: {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    lastFailureTime: number;
  };
  
  // Actions
  recordCacheHit: (queryKey: string) => void;
  recordCacheMiss: (queryKey: string) => void;
  recordRetry: (queryKey: string, success: boolean, time: number) => void;
  recordQueryTime: (queryKey: string, time: number) => void;
  recordNetworkError: (queryKey: string, error: string) => void;
  updateCircuitBreakerState: (state: any) => void;
  resetMetrics: () => void;
  getMetricsSummary: () => any;
}

const INITIAL_STATE = {
  cache: {
    hits: 0,
    misses: 0,
    size: 0,
    queries: {},
  },
  retry: {
    totalRetries: 0,
    successfulRetries: 0,
    failedRetries: 0,
    byQuery: {},
  },
  performance: {
    queryTimes: {},
    slowQueries: [],
    networkErrors: [],
  },
  circuitBreakerState: {
    state: 'closed' as const,
    failures: 0,
    lastFailureTime: 0,
  },
};

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  ...INITIAL_STATE,

  recordCacheHit: (queryKey: string) => {
    set((state) => {
      const queryMetrics = state.cache.queries[queryKey] || {
        hits: 0,
        misses: 0,
        lastAccess: Date.now(),
        avgLoadTime: 0,
      };

      return {
        cache: {
          ...state.cache,
          hits: state.cache.hits + 1,
          queries: {
            ...state.cache.queries,
            [queryKey]: {
              ...queryMetrics,
              hits: queryMetrics.hits + 1,
              lastAccess: Date.now(),
            },
          },
        },
      };
    });
  },

  recordCacheMiss: (queryKey: string) => {
    set((state) => {
      const queryMetrics = state.cache.queries[queryKey] || {
        hits: 0,
        misses: 0,
        lastAccess: Date.now(),
        avgLoadTime: 0,
      };

      return {
        cache: {
          ...state.cache,
          misses: state.cache.misses + 1,
          queries: {
            ...state.cache.queries,
            [queryKey]: {
              ...queryMetrics,
              misses: queryMetrics.misses + 1,
              lastAccess: Date.now(),
            },
          },
        },
      };
    });
  },

  recordRetry: (queryKey: string, success: boolean, time: number) => {
    set((state) => {
      const queryRetries = state.retry.byQuery[queryKey] || {
        attempts: 0,
        successes: 0,
        failures: 0,
        avgRetryTime: 0,
      };

      const newAvgTime = 
        (queryRetries.avgRetryTime * queryRetries.attempts + time) / 
        (queryRetries.attempts + 1);

      return {
        retry: {
          totalRetries: state.retry.totalRetries + 1,
          successfulRetries: success 
            ? state.retry.successfulRetries + 1 
            : state.retry.successfulRetries,
          failedRetries: !success 
            ? state.retry.failedRetries + 1 
            : state.retry.failedRetries,
          byQuery: {
            ...state.retry.byQuery,
            [queryKey]: {
              attempts: queryRetries.attempts + 1,
              successes: success ? queryRetries.successes + 1 : queryRetries.successes,
              failures: !success ? queryRetries.failures + 1 : queryRetries.failures,
              avgRetryTime: newAvgTime,
            },
          },
        },
      };
    });
  },

  recordQueryTime: (queryKey: string, time: number) => {
    set((state) => {
      const times = state.performance.queryTimes[queryKey] || [];
      const newTimes = [...times, time].slice(-20); // Manter últimas 20

      // Marcar como slow query se > 2s
      const slowQueries = time > 2000
        ? [
            ...state.performance.slowQueries,
            { queryKey, time, timestamp: Date.now() },
          ].slice(-50) // Manter últimas 50
        : state.performance.slowQueries;

      return {
        performance: {
          ...state.performance,
          queryTimes: {
            ...state.performance.queryTimes,
            [queryKey]: newTimes,
          },
          slowQueries,
        },
      };
    });
  },

  recordNetworkError: (queryKey: string, error: string) => {
    set((state) => ({
      performance: {
        ...state.performance,
        networkErrors: [
          ...state.performance.networkErrors,
          { queryKey, error, timestamp: Date.now() },
        ].slice(-100), // Manter últimos 100
      },
    }));
  },

  updateCircuitBreakerState: (cbState: any) => {
    set({ circuitBreakerState: cbState });
  },

  resetMetrics: () => {
    set(INITIAL_STATE);
  },

  getMetricsSummary: () => {
    const state = get();
    
    const totalCacheRequests = state.cache.hits + state.cache.misses;
    const hitRatio = totalCacheRequests > 0 
      ? (state.cache.hits / totalCacheRequests) * 100 
      : 0;

    const totalRetries = state.retry.totalRetries;
    const retrySuccessRate = totalRetries > 0
      ? (state.retry.successfulRetries / totalRetries) * 100
      : 0;

    const avgQueryTime = Object.values(state.performance.queryTimes)
      .flat()
      .reduce((sum, time) => sum + time, 0) / 
      (Object.values(state.performance.queryTimes).flat().length || 1);

    return {
      cache: {
        hitRatio: hitRatio.toFixed(1),
        hits: state.cache.hits,
        misses: state.cache.misses,
        totalQueries: Object.keys(state.cache.queries).length,
      },
      retry: {
        total: totalRetries,
        successRate: retrySuccessRate.toFixed(1),
        successful: state.retry.successfulRetries,
        failed: state.retry.failedRetries,
      },
      performance: {
        avgQueryTime: avgQueryTime.toFixed(0),
        slowQueriesCount: state.performance.slowQueries.length,
        networkErrorsCount: state.performance.networkErrors.length,
      },
      circuitBreaker: state.circuitBreakerState,
    };
  },
}));
