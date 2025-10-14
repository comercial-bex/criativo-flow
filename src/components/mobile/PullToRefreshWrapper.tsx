// Wrapper para Pull-to-Refresh
// Adiciona indicador visual e controla estado de refresh

import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  className?: string;
}

export function PullToRefreshWrapper({
  children,
  onRefresh,
  enabled = true,
  className
}: PullToRefreshWrapperProps) {
  const { handlers, pullState } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    resistance: 0.5,
    enabled
  });

  const pullProgress = Math.min(pullState.pullDistance / 80, 1);
  const rotation = pullProgress * 360;

  // Converter handlers de TouchEvent para React.TouchEvent
  const reactHandlers = {
    onTouchStart: (e: React.TouchEvent) => handlers.onTouchStart(e.nativeEvent),
    onTouchMove: (e: React.TouchEvent) => handlers.onTouchMove(e.nativeEvent),
    onTouchEnd: () => handlers.onTouchEnd()
  };

  return (
    <div
      data-pull-to-refresh-container
      className={cn('relative overflow-auto', className)}
      {...reactHandlers}
    >
      {/* Indicador de Pull */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10',
          pullState.isPulling || pullState.isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: pullState.pullDistance,
          transform: `translateY(${pullState.isPulling ? 0 : -100}%)`
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <RefreshCw
            className={cn(
              'h-6 w-6 transition-all',
              pullState.isRefreshing && 'animate-spin',
              pullState.canRefresh ? 'text-primary' : 'text-muted-foreground'
            )}
            style={{
              transform: pullState.isRefreshing ? '' : `rotate(${rotation}deg)`
            }}
          />
          <span className="text-xs text-muted-foreground">
            {pullState.isRefreshing
              ? 'Atualizando...'
              : pullState.canRefresh
              ? 'Solte para atualizar'
              : 'Puxe para atualizar'}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          transform: pullState.isPulling
            ? `translateY(${pullState.pullDistance}px)`
            : pullState.isRefreshing
            ? 'translateY(60px)'
            : 'translateY(0)',
          transition: pullState.isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
