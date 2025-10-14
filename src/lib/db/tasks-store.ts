// Tasks Store - IndexedDB operations for tasks

import { openDatabase, OfflineTask } from './indexeddb';

export interface TaskFilters {
  cliente_id?: string;
  status?: string;
  responsavel_id?: string;
  synced?: boolean;
}

export class TasksStore {
  private storeName = 'tasks';

  async addTask(task: OfflineTask): Promise<string> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(task);

      request.onsuccess = () => {
        console.log('✅ Tarefa adicionada offline:', task.id);
        resolve(task.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTask(id: string): Promise<OfflineTask | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTasks(filters?: TaskFilters): Promise<OfflineTask[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      let request: IDBRequest;

      if (filters?.cliente_id) {
        const index = store.index('by-cliente');
        request = index.getAll(filters.cliente_id);
      } else if (filters?.status) {
        const index = store.index('by-status');
        request = index.getAll(filters.status);
      } else if (filters?.responsavel_id) {
        const index = store.index('by-user');
        request = index.getAll(filters.responsavel_id);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let tasks = request.result || [];

        // Aplicar filtros adicionais
        if (filters?.synced !== undefined) {
          tasks = tasks.filter(t => t.synced === filters.synced);
        }

        resolve(tasks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTasksByCliente(clienteId: string): Promise<OfflineTask[]> {
    return this.getAllTasks({ cliente_id: clienteId });
  }

  async getUnsyncedTasks(): Promise<OfflineTask[]> {
    return this.getAllTasks({ synced: false });
  }

  async updateTask(id: string, updates: Partial<OfflineTask>): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const task = getRequest.result;
        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const updatedTask = {
          ...task,
          ...updates,
          updated_at: new Date().toISOString()
        };

        const putRequest = store.put(updatedTask);
        putRequest.onsuccess = () => {
          console.log('✅ Tarefa atualizada:', id);
          resolve();
        };
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    return this.updateTask(id, { synced: true });
  }

  async deleteTask(id: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Tarefa deletada:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedTasks(olderThan: Date): Promise<number> {
    const db = await openDatabase();
    const tasks = await this.getAllTasks({ synced: true });
    
    let deleted = 0;
    const timestamp = olderThan.getTime();

    for (const task of tasks) {
      const taskDate = new Date(task.updated_at).getTime();
      if (taskDate < timestamp) {
        await this.deleteTask(task.id);
        deleted++;
      }
    }

    console.log(`🧹 ${deleted} tarefas antigas removidas`);
    return deleted;
  }

  async getCount(): Promise<number> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
