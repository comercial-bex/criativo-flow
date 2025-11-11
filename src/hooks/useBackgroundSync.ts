import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Configuração de Background Sync por tipo de query
 */
const SYNC_CONFIG = {
  // Queries que devem ser atualizadas em background
  enabled: [
    'tarefas-optimized',
    'projetos-optimized',
    'clientes-optimized',
    'aprovacoes',
    'notificacoes',
  ],
  
  // Queries que NÃO devem ser atualizadas em background (muito grandes ou sensíveis)
  disabled: [
    'logs',
    'credenciais',
    'senhas',
  ],
  
  // Intervalo padrão: 5 minutos
  intervalMs: 5 * 60 * 1000,
  
  // Intervalo para queries prioritárias: 2 minutos
  priorityIntervalMs: 2 * 60 * 1000,
  
  // Queries prioritárias (atualizam mais frequentemente)
  priority: [
    'tarefas-optimized',
    'notificacoes',
  ],
};

/**
 * Hook para sincronização em background
 * Atualiza cache automaticamente sem bloquear UI
 */
export function useBackgroundSync(options?: {
  enabled?: boolean;
  intervalMs?: number;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isActiveRef = useRef(true);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const priorityIntervalRef = useRef<NodeJS.Timeout>();

  const enabled = options?.enabled !== false;
  const intervalMs = options?.intervalMs || SYNC_CONFIG.intervalMs;

  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Verificar se a página está visível
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (isActiveRef.current) {
        console.log('🔄 Background sync: Tab ativa, retomando atualizações');
        startSync();
      } else {
        console.log('⏸️ Background sync: Tab inativa, pausando atualizações');
        stopSync();
      }
    };

    // Sync de queries regulares
    const syncRegularQueries = async () => {
      if (!isActiveRef.current) return;

      console.log('🔄 Background sync: Atualizando queries regulares...');

      const queries = queryClient.getQueryCache().getAll();
      const queriesToSync = queries.filter(query => {
        const queryKey = query.queryKey[0] as string;
        
        // Verificar se está na lista de enabled
        const isEnabled = SYNC_CONFIG.enabled.some(key => 
          String(queryKey).includes(key)
        );
        
        // Verificar se NÃO está na lista de disabled
        const isDisabled = SYNC_CONFIG.disabled.some(key => 
          String(queryKey).includes(key)
        );
        
        // Verificar se NÃO é prioritária
        const isPriority = SYNC_CONFIG.priority.some(key => 
          String(queryKey).includes(key)
        );
        
        return isEnabled && !isDisabled && !isPriority && query.state.data;
      });

      // Invalidar queries em lote (mais eficiente)
      for (const query of queriesToSync) {
        await queryClient.invalidateQueries({
          queryKey: query.queryKey,
          refetchType: 'none', // Não refetch imediatamente
        });
      }

      // Refetch em background (sem bloquear UI)
      setTimeout(() => {
        queriesToSync.forEach(query => {
          queryClient.refetchQueries({
            queryKey: query.queryKey,
            type: 'active',
          });
        });
      }, 100);

      console.log(`✅ Background sync: ${queriesToSync.length} queries atualizadas`);
    };

    // Sync de queries prioritárias
    const syncPriorityQueries = async () => {
      if (!isActiveRef.current) return;

      console.log('⚡ Background sync: Atualizando queries prioritárias...');

      const queries = queryClient.getQueryCache().getAll();
      const priorityQueries = queries.filter(query => {
        const queryKey = query.queryKey[0] as string;
        
        return SYNC_CONFIG.priority.some(key => 
          String(queryKey).includes(key)
        ) && query.state.data;
      });

      // Refetch prioritárias imediatamente
      for (const query of priorityQueries) {
        queryClient.refetchQueries({
          queryKey: query.queryKey,
          type: 'active',
        });
      }

      console.log(`✅ Background sync: ${priorityQueries.length} queries prioritárias atualizadas`);
    };

    // Iniciar sync
    const startSync = () => {
      // Limpar intervalos existentes
      stopSync();

      // Sync regular a cada 5 minutos
      syncIntervalRef.current = setInterval(
        syncRegularQueries,
        intervalMs
      );

      // Sync prioritária a cada 2 minutos
      priorityIntervalRef.current = setInterval(
        syncPriorityQueries,
        SYNC_CONFIG.priorityIntervalMs
      );

      console.log('🚀 Background sync iniciado');
    };

    // Parar sync
    const stopSync = () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = undefined;
      }
      if (priorityIntervalRef.current) {
        clearInterval(priorityIntervalRef.current);
        priorityIntervalRef.current = undefined;
      }
    };

    // Listener de visibilidade
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Iniciar sync se página estiver visível
    if (!document.hidden) {
      startSync();
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopSync();
      console.log('🛑 Background sync parado');
    };
  }, [enabled, user?.id, intervalMs, queryClient]);

  // Função para forçar sync manual
  const forceSync = async () => {
    console.log('🔄 Background sync: Sincronização manual iniciada...');
    
    const queries = queryClient.getQueryCache().getAll();
    const validQueries = queries.filter(query => {
      const queryKey = query.queryKey[0] as string;
      
      const isEnabled = SYNC_CONFIG.enabled.some(key => 
        String(queryKey).includes(key)
      );
      
      const isDisabled = SYNC_CONFIG.disabled.some(key => 
        String(queryKey).includes(key)
      );
      
      return isEnabled && !isDisabled && query.state.data;
    });

    // Invalidar e refetch todas as queries válidas
    for (const query of validQueries) {
      await queryClient.invalidateQueries({
        queryKey: query.queryKey,
      });
    }

    console.log(`✅ Background sync manual: ${validQueries.length} queries atualizadas`);
  };

  return {
    forceSync,
    isEnabled: enabled && !!user?.id,
  };
}

/**
 * Hook para adicionar/remover queries da lista de sync
 */
export function useSyncConfig() {
  return {
    enableSync: (queryKey: string) => {
      if (!SYNC_CONFIG.enabled.includes(queryKey)) {
        SYNC_CONFIG.enabled.push(queryKey);
      }
    },
    disableSync: (queryKey: string) => {
      const index = SYNC_CONFIG.enabled.indexOf(queryKey);
      if (index > -1) {
        SYNC_CONFIG.enabled.splice(index, 1);
      }
    },
    setPriority: (queryKey: string, isPriority: boolean) => {
      const index = SYNC_CONFIG.priority.indexOf(queryKey);
      
      if (isPriority && index === -1) {
        SYNC_CONFIG.priority.push(queryKey);
      } else if (!isPriority && index > -1) {
        SYNC_CONFIG.priority.splice(index, 1);
      }
    },
    getConfig: () => ({ ...SYNC_CONFIG }),
  };
}
