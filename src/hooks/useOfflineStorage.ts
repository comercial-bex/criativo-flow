// Hook React para IndexedDB
// Facilita uso de armazenamento offline em componentes

import { useMemo, useCallback } from 'react';
import { TasksStore, TaskFilters } from '@/lib/db/tasks-store';
import { ApprovalsStore, ApprovalFilters } from '@/lib/db/approvals-store';
import { OfflineTask, OfflineApproval } from '@/lib/db/indexeddb';
import { syncManager } from '@/lib/sync-manager';
import { cacheStore, CacheOptions } from '@/lib/db/cache-store';

export function useOfflineStorage() {
  const tasksStore = useMemo(() => new TasksStore(), []);
  const approvalsStore = useMemo(() => new ApprovalsStore(), []);

  // ============================================================================
  // TASKS
  // ============================================================================

  const saveTask = useCallback(async (task: OfflineTask): Promise<string> => {
    const id = await tasksStore.addTask(task);
    
    // Agendar sincronização se não estiver marcado como local_only
    if (!task.local_only && !task.synced) {
      await syncManager.scheduleSync({
        operation: 'INSERT',
        table: 'tarefa',
        data: task,
        userId: task.responsavel_id || ''
      });
    }
    
    return id;
  }, [tasksStore]);

  const getTasks = useCallback(async (filters?: TaskFilters): Promise<OfflineTask[]> => {
    return tasksStore.getAllTasks(filters);
  }, [tasksStore]);

  const updateTask = useCallback(async (id: string, updates: Partial<OfflineTask>): Promise<void> => {
    await tasksStore.updateTask(id, updates);
    
    // Agendar sincronização da atualização
    const task = await tasksStore.getTask(id);
    if (task && !task.synced) {
      await syncManager.scheduleSync({
        operation: 'UPDATE',
        table: 'tarefa',
        data: { id, ...updates },
        userId: task.responsavel_id || ''
      });
    }
  }, [tasksStore]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    const task = await tasksStore.getTask(id);
    await tasksStore.deleteTask(id);
    
    // Agendar sincronização da exclusão
    if (task && !task.local_only) {
      await syncManager.scheduleSync({
        operation: 'DELETE',
        table: 'tarefa',
        data: { id },
        userId: task.responsavel_id || ''
      });
    }
  }, [tasksStore]);

  // ============================================================================
  // APPROVALS
  // ============================================================================

  const saveApproval = useCallback(async (approval: OfflineApproval): Promise<string> => {
    return approvalsStore.addApproval(approval);
  }, [approvalsStore]);

  const getApprovals = useCallback(async (filters?: ApprovalFilters): Promise<OfflineApproval[]> => {
    return approvalsStore.getAllApprovals(filters);
  }, [approvalsStore]);

  const updateApprovalStatus = useCallback(async (
    id: string,
    status: 'pendente' | 'aprovado' | 'reprovado',
    feedback?: string
  ): Promise<void> => {
    await approvalsStore.updateApprovalStatus(id, status, feedback);
    
    // Agendar sincronização da aprovação
    const approval = await approvalsStore.getApproval(id);
    if (approval) {
      await syncManager.scheduleSync({
        operation: 'UPDATE',
        table: 'aprovacoes_cliente',
        data: { id, status, feedback },
        userId: approval.cliente_id
      });
    }
  }, [approvalsStore]);

  const deleteApproval = useCallback(async (id: string): Promise<void> => {
    await approvalsStore.deleteApproval(id);
  }, [approvalsStore]);

  // ============================================================================
  // SYNC
  // ============================================================================

  const syncAll = useCallback(async () => {
    return syncManager.syncNow();
  }, []);

  const getUnsyncedCount = useCallback(async (): Promise<number> => {
    return syncManager.getQueueSize();
  }, []);

  const isOnline = useCallback((): boolean => {
    return syncManager.getOnlineStatus();
  }, []);

  // ============================================================================
  // STATS
  // ============================================================================

  const getStats = useCallback(async () => {
    const tasksCount = await tasksStore.getCount();
    const approvalsCount = await approvalsStore.getCount();
    const unsyncedCount = await getUnsyncedCount();

    return {
      tasks: tasksCount,
      approvals: approvalsCount,
      unsynced: unsyncedCount
    };
  }, [tasksStore, approvalsStore, getUnsyncedCount]);

  // ============================================================================
  // CACHE (FASE 5)
  // ============================================================================

  const setCache = useCallback(async <T = any>(
    key: string, 
    data: T, 
    options?: CacheOptions
  ): Promise<void> => {
    return cacheStore.set(key, data, options);
  }, []);

  const getCache = useCallback(async <T = any>(key: string): Promise<T | null> => {
    return cacheStore.get<T>(key);
  }, []);

  const invalidateCache = useCallback(async (tag: string): Promise<number> => {
    return cacheStore.invalidateByTag(tag);
  }, []);

  const clearExpiredCache = useCallback(async (): Promise<number> => {
    return cacheStore.clearExpired();
  }, []);

  return {
    // Tasks
    saveTask,
    getTasks,
    updateTask,
    deleteTask,
    
    // Approvals
    saveApproval,
    getApprovals,
    updateApprovalStatus,
    deleteApproval,
    
    // Sync
    syncAll,
    getUnsyncedCount,
    isOnline,
    
    // Stats
    getStats,
    
    // Cache (FASE 5)
    setCache,
    getCache,
    invalidateCache,
    clearExpiredCache
  };
}
