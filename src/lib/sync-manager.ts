// Sync Manager
// Coordena sincronização entre IndexedDB e Supabase

import { offlineQueue, QueueItem } from './offline-queue';

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

export interface Conflict {
  id: string;
  table: string;
  localData: any;
  remoteData: any;
  timestamp: number;
}

class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    this.setupConnectionListeners();
  }

  private setupConnectionListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Conexão restaurada');
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Conexão perdida');
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  startMonitoring(): void {
    console.log('👀 Monitoramento de conexão iniciado');
    
    // Verificar conexão a cada 30 segundos
    setInterval(() => {
      const wasOnline = this.isOnline;
      this.isOnline = navigator.onLine;
      
      if (wasOnline !== this.isOnline) {
        this.notifyListeners(this.isOnline);
        
        if (this.isOnline) {
          this.syncNow();
        }
      }
    }, 30000);
  }

  onConnectionChange(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback);
    
    // Retornar função de cleanup
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(callback => callback(online));
  }

  async syncNow(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('⏳ Sincronização já em andamento');
      return { synced: 0, failed: 0, conflicts: 0, errors: [] };
    }

    if (!this.isOnline) {
      console.log('📡 Offline - sincronização adiada');
      return { synced: 0, failed: 0, conflicts: 0, errors: [] };
    }

    this.syncInProgress = true;
    console.log('🔄 Iniciando sincronização');

    try {
      await offlineQueue.init();
      const result = await offlineQueue.processQueue();
      
      const syncResult: SyncResult = {
        synced: result.success,
        failed: result.failed,
        conflicts: 0,
        errors: []
      };

      console.log('✅ Sincronização concluída:', syncResult);
      
      // Notificar usuário se houver resultados
      if (syncResult.synced > 0) {
        this.notifyUser(`${syncResult.synced} item(s) sincronizado(s)`);
      }
      
      if (syncResult.failed > 0) {
        this.notifyUser(`${syncResult.failed} item(s) falharam`, 'error');
      }

      return syncResult;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      
      return {
        synced: 0,
        failed: 0,
        conflicts: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  async scheduleSync(operation: Omit<QueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    console.log('📝 Agendando operação offline:', operation.table);
    
    await offlineQueue.init();
    await offlineQueue.add(operation);

    // Se online, tentar sincronizar imediatamente
    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => this.syncNow(), 100);
    } else {
      // Registrar Background Sync se disponível
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // @ts-ignore - Background Sync API
          if ('sync' in registration) {
            // @ts-ignore
            await registration.sync.register('bex-sync-queue');
            console.log('📮 Background Sync registrado');
          }
        } catch (error) {
          console.error('❌ Erro ao registrar Background Sync:', error);
        }
      }
    }
  }

  async checkConflicts(): Promise<Conflict[]> {
    // Implementar detecção de conflitos
    // Por enquanto retornar array vazio
    return [];
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async getQueueSize(): Promise<number> {
    await offlineQueue.init();
    const stats = await offlineQueue.getStats();
    return stats.total;
  }

  private notifyUser(message: string, type: 'success' | 'error' = 'success'): void {
    // Emitir evento customizado que pode ser capturado pela UI
    window.dispatchEvent(new CustomEvent('sync-notification', {
      detail: { message, type }
    }));
  }
}

// Singleton instance
export const syncManager = new SyncManager();
