// Cache Manager para dados de autenticação
const CACHE_PREFIX = 'bex_auth_';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos (reduzido para evitar cache desatualizado)

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const authCache = {
  set<T>(key: string, data: T): void {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Cache: Error setting cache', error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age > CACHE_TTL) {
        console.log('⏰ Cache: Expired', key);
        this.remove(key);
        return null;
      }

      console.log('✅ Cache: Hit', key, `(${Math.round(age / 1000)}s old)`);
      return cacheData.data;
    } catch (error) {
      console.error('❌ Cache: Error getting cache', error);
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('❌ Cache: Error removing cache', error);
    }
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
      console.log('🧹 Cache: Cleared all auth cache');
    } catch (error) {
      console.error('❌ Cache: Error clearing cache', error);
    }
  },

  clearRoleCache(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${CACHE_PREFIX}user_role_`))
        .forEach(key => localStorage.removeItem(key));
      console.log('🧹 Cache: Cleared all role cache');
    } catch (error) {
      console.error('❌ Cache: Error clearing role cache', error);
    }
  },
};
