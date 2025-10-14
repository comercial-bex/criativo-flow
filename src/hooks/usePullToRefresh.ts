// Hook para Pull-to-Refresh
// Detecta gesto de puxar para baixo e dispara callback de refresh

import { useEffect, useRef, useState } from 'react';

export interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number; // Distância para disparar refresh (px)
  resistance?: number; // Resistência ao arrastar (0-1)
  enabled?: boolean;
}

export interface PullState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

export function usePullToRefresh(config: PullToRefreshConfig) {
  const {
    onRefresh,
    threshold = 80,
    resistance = 0.5,
    enabled = true
  } = config;

  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false
  });

  const touchStart = useRef<number>(0);
  const scrollTop = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled) return;
    
    const target = e.target as HTMLElement;
    const scrollElement = target.closest('[data-pull-to-refresh-container]') || document.documentElement;
    
    scrollTop.current = scrollElement.scrollTop;
    
    // Só permitir pull-to-refresh se estiver no topo
    if (scrollTop.current === 0) {
      touchStart.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!enabled || touchStart.current === 0 || scrollTop.current > 0) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStart.current;

    // Só permitir puxar para baixo
    if (distance > 0) {
      // Aplicar resistência
      const pullDistance = distance * resistance;

      setPullState({
        isPulling: true,
        pullDistance: Math.min(pullDistance, threshold * 1.5),
        isRefreshing: false,
        canRefresh: pullDistance >= threshold
      });

      // Prevenir scroll padrão se estiver puxando
      if (pullDistance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!enabled || !pullState.isPulling) return;

    if (pullState.canRefresh && !pullState.isRefreshing) {
      setPullState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Erro ao fazer refresh:', error);
      } finally {
        setPullState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
          canRefresh: false
        });
      }
    } else {
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false
      });
    }

    touchStart.current = 0;
  };

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  return { handlers, pullState };
}
