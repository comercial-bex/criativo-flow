// FASE 5: Cache Store - Gerencia cache de dados em IndexedDB
// Armazena responses de queries para acesso offline

import { openDatabase, CacheEntry } from './indexeddb';

export interface CacheOptions {
  ttl?: number; // Time to live em ms (padrão: 5 minutos)
  tags?: string[]; // Tags para invalidação em grupo
}

export class CacheStore {
  private storeName = 'cache_metadata';
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  async set(key: string, data: any, options?: CacheOptions): Promise<void> {
    const db = await openDatabase();
    const ttl = options?.ttl || this.defaultTTL;
    
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      tags: options?.tags || []
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => {
        console.log('💾 Cache salvo:', key);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry = request.result;
        
        if (!entry) {
          console.log('💾 Cache miss:', key);
          resolve(null);
          return;
        }

        // Verificar expiração
        if (Date.now() > entry.expiresAt) {
          console.log('💾 Cache expirado:', key);
          this.delete(key); // Limpar cache expirado
          resolve(null);
          return;
        }

        console.log('💾 Cache hit:', key);
        resolve(entry.data as T);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async invalidateByTag(tag: string): Promise<number> {
    const db = await openDatabase();
    let invalidated = 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result || [];
        
        entries.forEach(entry => {
          if (entry.tags.includes(tag)) {
            store.delete(entry.key);
            invalidated++;
          }
        });

        console.log(`🧹 Cache invalidado (tag: ${tag}): ${invalidated} entradas`);
        resolve(invalidated);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpired(): Promise<number> {
    const db = await openDatabase();
    const now = Date.now();
    let cleared = 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result || [];
        
        entries.forEach(entry => {
          if (now > entry.expiresAt) {
            store.delete(entry.key);
            cleared++;
          }
        });

        console.log(`🧹 Cache expirado limpo: ${cleared} entradas`);
        resolve(cleared);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<{ total: number; expired: number; size: number }> {
    const db = await openDatabase();
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result || [];
        const expired = entries.filter(e => now > e.expiresAt).length;
        const size = JSON.stringify(entries).length;

        resolve({
          total: entries.length,
          expired,
          size
        });
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const cacheStore = new CacheStore();
