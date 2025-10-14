// IndexedDB Setup and Configuration
// Database: bex-flow-offline

export const DB_NAME = 'bex-flow-offline';
export const DB_VERSION = 1;

export interface OfflineTask {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prazo?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_only: boolean;
}

export interface OfflineApproval {
  id: string;
  cliente_id: string;
  tipo: 'post' | 'video' | 'design' | 'roteiro';
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  feedback?: string;
  arquivo_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface Draft {
  id: string;
  type: string;
  data: any;
  created_at: number;
  updated_at: number;
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('✅ IndexedDB aberto com sucesso');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('🔧 Criando/atualizando schema do IndexedDB');

      // Store: tasks
      if (!db.objectStoreNames.contains('tasks')) {
        const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
        tasksStore.createIndex('by-cliente', 'cliente_id', { unique: false });
        tasksStore.createIndex('by-status', 'status', { unique: false });
        tasksStore.createIndex('by-synced', 'synced', { unique: false });
        tasksStore.createIndex('by-user', 'responsavel_id', { unique: false });
        console.log('✅ Store "tasks" criado');
      }

      // Store: approvals
      if (!db.objectStoreNames.contains('approvals')) {
        const approvalsStore = db.createObjectStore('approvals', { keyPath: 'id' });
        approvalsStore.createIndex('by-cliente', 'cliente_id', { unique: false });
        approvalsStore.createIndex('by-status', 'status', { unique: false });
        approvalsStore.createIndex('by-synced', 'synced', { unique: false });
        approvalsStore.createIndex('by-type', 'tipo', { unique: false });
        console.log('✅ Store "approvals" criado');
      }

      // Store: drafts
      if (!db.objectStoreNames.contains('drafts')) {
        const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' });
        draftsStore.createIndex('by-type', 'type', { unique: false });
        draftsStore.createIndex('by-created', 'created_at', { unique: false });
        draftsStore.createIndex('by-updated', 'updated_at', { unique: false });
        console.log('✅ Store "drafts" criado');
      }

      // Store: cache_metadata
      if (!db.objectStoreNames.contains('cache_metadata')) {
        const cacheStore = db.createObjectStore('cache_metadata', { keyPath: 'key' });
        cacheStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        cacheStore.createIndex('by-ttl', 'ttl', { unique: false });
        console.log('✅ Store "cache_metadata" criado');
      }

      // Store: offline-queue (usado pelo OfflineQueue)
      if (!db.objectStoreNames.contains('offline-queue')) {
        const queueStore = db.createObjectStore('offline-queue', { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('userId', 'userId', { unique: false });
        queueStore.createIndex('retries', 'retries', { unique: false });
        console.log('✅ Store "offline-queue" criado');
      }
    };
  });
}

export async function clearDatabase(): Promise<void> {
  const db = await openDatabase();
  const storeNames = ['tasks', 'approvals', 'drafts', 'cache_metadata', 'offline-queue'];

  for (const storeName of storeNames) {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  console.log('🧹 Database limpo');
}

export async function getDatabaseSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}
