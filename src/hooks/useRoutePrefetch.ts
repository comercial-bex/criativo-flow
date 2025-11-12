/**
 * Route-based Prefetching Hook
 * Detecta hover em links e prefetcha dados necessários
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePrefetchData } from '@/hooks/usePrefetchData';
import { useAuth } from '@/hooks/useAuth';

type PrefetchableRoute = 
  | '/clientes'
  | '/grs/painel'
  | '/grs/projetos'
  | '/financeiro/dashboard'
  | '/dashboard';

export const useRoutePrefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { 
    prefetchClientes, 
    prefetchProjetos,
    prefetchDashboardGRS,
    prefetchDashboardSetor
  } = usePrefetchData();
  
  const prefetchRoute = useCallback((path: string) => {
    if (!user) return;
    
    // Map de rotas para funções de prefetch
    const prefetchMap: Record<string, () => void> = {
      '/clientes': () => prefetchClientes(),
      '/grs/painel': () => prefetchDashboardGRS(user.id),
      '/grs/projetos': () => prefetchProjetos(),
      '/financeiro/dashboard': () => {
        // Prefetch financeiro dashboard data
        queryClient.prefetchQuery({
          queryKey: ['financeiro', 'dashboard'],
          staleTime: 2 * 60 * 1000,
        });
      },
      '/dashboard': () => {
        // Prefetch main dashboard
        queryClient.prefetchQuery({
          queryKey: ['dashboard', 'stats'],
          staleTime: 2 * 60 * 1000,
        });
      },
    };
    
    const prefetchFn = prefetchMap[path];
    if (prefetchFn) {
      // Executar prefetch em idle time
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => prefetchFn(), { timeout: 2000 });
      } else {
        setTimeout(prefetchFn, 100);
      }
    }
  }, [queryClient, user]);
  
  const prefetchOnHover = useCallback((path: string) => {
    // Pequeno delay para evitar prefetch excessivo
    const timeoutId = setTimeout(() => {
      prefetchRoute(path);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [prefetchRoute]);
  
  return {
    prefetchRoute,
    prefetchOnHover,
  };
};
