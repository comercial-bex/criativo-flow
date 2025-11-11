import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Persister usando localStorage para cache de queries
 */
export const createLocalStoragePersister = () => {
  const CACHE_KEY = 'bex-query-cache';
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias

  return {
    persistClient: async (client: PersistedClient) => {
      try {
        const data = {
          ...client,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to persist cache to localStorage:', error);
      }
    },
    restoreClient: async () => {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (!stored) return undefined;

        const data = JSON.parse(stored);
        
        // Verificar se o cache não está muito antigo
        if (data.timestamp && Date.now() - data.timestamp > MAX_AGE) {
          localStorage.removeItem(CACHE_KEY);
          return undefined;
        }

        return data as PersistedClient;
      } catch (error) {
        console.warn('Failed to restore cache from localStorage:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      localStorage.removeItem(CACHE_KEY);
    },
  } as Persister;
};

/**
 * Função para limpar cache antigo
 */
export const clearOldCache = () => {
  try {
    const CACHE_KEY = 'bex-query-cache';
    const stored = localStorage.getItem(CACHE_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias
      
      if (data.timestamp && Date.now() - data.timestamp > MAX_AGE) {
        localStorage.removeItem(CACHE_KEY);
        console.log('Old cache cleared');
      }
    }
  } catch (error) {
    console.warn('Failed to clear old cache:', error);
  }
};

/**
 * Queries que NÃO devem ser persistidas (dados sensíveis ou muito dinâmicos)
 */
export const shouldDehydrateQuery = (query: any) => {
  const queryKey = query.queryKey[0];
  
  // Não persistir queries de dados sensíveis
  const sensitiveKeys = [
    'credenciais',
    'senhas',
    'tokens',
    'auth',
  ];
  
  // Não persistir queries de dados em tempo real
  const realtimeKeys = [
    'logs',
    'metrics-realtime',
    'dashboard-stats',
  ];
  
  // Não persistir queries com erro
  if (query.state.status === 'error') {
    return false;
  }
  
  // Não persistir dados sensíveis
  if (sensitiveKeys.some(key => String(queryKey).toLowerCase().includes(key))) {
    return false;
  }
  
  // Não persistir dados em tempo real
  if (realtimeKeys.some(key => String(queryKey).toLowerCase().includes(key))) {
    return false;
  }
  
  return true;
};
