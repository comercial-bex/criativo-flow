// Offline Queue Manager
// Gerencia fila de operações quando offline

export interface QueueItem {
  id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
  userId: string;
  token?: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  failed: number;
}

class OfflineQueue {
  private dbName = 'bex-flow-offline';
  private storeName = 'offline-queue';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('retries', 'retries', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async add(item: Omit<QueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const db = await this.ensureDB();
    
    const queueItem: QueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(queueItem);

      request.onsuccess = () => {
        console.log('✅ Item adicionado à fila:', queueItem.id);
        resolve(queueItem.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<QueueItem[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getByUser(userId: string): Promise<QueueItem[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async remove(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Item removido da fila:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async incrementRetry(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries += 1;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async processQueue(): Promise<{ success: number; failed: number }> {
    const items = await this.getAll();
    let success = 0;
    let failed = 0;

    console.log(`🔄 Processando ${items.length} itens da fila`);

    for (const item of items) {
      try {
        // Máximo de 3 tentativas
        if (item.retries >= 3) {
          console.warn('⚠️ Item excedeu tentativas máximas:', item.id);
          failed++;
          continue;
        }

        await this.syncItem(item);
        await this.remove(item.id);
        success++;
      } catch (error) {
        console.error('❌ Erro ao sincronizar item:', error);
        await this.incrementRetry(item.id);
        failed++;
      }
    }

    console.log(`✅ Sincronização concluída: ${success} sucesso, ${failed} falhas`);
    return { success, failed };
  }

  private async syncItem(item: QueueItem): Promise<void> {
    const endpoint = `https://xvpqgwbktpfodbuhwqhh.supabase.co/rest/v1/${item.table}`;
    
    const method = item.operation === 'INSERT' ? 'POST' : 
                   item.operation === 'UPDATE' ? 'PATCH' : 'DELETE';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto',
        'Authorization': `Bearer ${item.token}`,
        'Prefer': 'return=minimal'
      },
      body: item.operation !== 'DELETE' ? JSON.stringify(item.data) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sync failed: ${error}`);
    }
  }

  async clear(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🧹 Fila limpa');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<QueueStats> {
    const items = await this.getAll();
    
    return {
      total: items.length,
      pending: items.filter(i => i.retries === 0).length,
      failed: items.filter(i => i.retries >= 3).length
    };
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();
