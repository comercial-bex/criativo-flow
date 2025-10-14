// Approvals Store - IndexedDB operations for approvals

import { openDatabase, OfflineApproval } from './indexeddb';

export interface ApprovalFilters {
  cliente_id?: string;
  status?: string;
  tipo?: string;
  synced?: boolean;
}

export class ApprovalsStore {
  private storeName = 'approvals';

  async addApproval(approval: OfflineApproval): Promise<string> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(approval);

      request.onsuccess = () => {
        console.log('✅ Aprovação adicionada offline:', approval.id);
        resolve(approval.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getApproval(id: string): Promise<OfflineApproval | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllApprovals(filters?: ApprovalFilters): Promise<OfflineApproval[]> {
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
      } else if (filters?.tipo) {
        const index = store.index('by-type');
        request = index.getAll(filters.tipo);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let approvals = request.result || [];

        // Aplicar filtros adicionais
        if (filters?.synced !== undefined) {
          approvals = approvals.filter(a => a.synced === filters.synced);
        }

        resolve(approvals);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateApprovalStatus(
    id: string,
    status: 'pendente' | 'aprovado' | 'reprovado',
    feedback?: string
  ): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const approval = getRequest.result;
        if (!approval) {
          reject(new Error('Approval not found'));
          return;
        }

        const updatedApproval = {
          ...approval,
          status,
          feedback,
          updated_at: new Date().toISOString(),
          synced: false // Marcar como não sincronizado
        };

        const putRequest = store.put(updatedApproval);
        putRequest.onsuccess = () => {
          console.log('✅ Aprovação atualizada:', id, status);
          resolve();
        };
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getUnsyncedApprovals(): Promise<OfflineApproval[]> {
    return this.getAllApprovals({ synced: false });
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const approval = getRequest.result;
        if (!approval) {
          reject(new Error('Approval not found'));
          return;
        }

        const updatedApproval = { ...approval, synced: true };
        const putRequest = store.put(updatedApproval);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteApproval(id: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Aprovação deletada:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
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
