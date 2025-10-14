// Componente Card com suporte a swipe
// Permite arrastar cards para ações (deletar, arquivar, etc)

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Archive, Check } from 'lucide-react';

export interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  className?: string;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  className,
  leftAction,
  rightAction,
  threshold = 80,
  disabled = false
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isActionTriggered, setIsActionTriggered] = useState(false);
  const touchStart = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || touchStart.current === 0) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStart.current;

    // Limitar swipe baseado nas ações disponíveis
    const maxSwipe = 120;
    let limitedDiff = diff;

    if (diff > 0 && !leftAction) limitedDiff = 0;
    if (diff < 0 && !rightAction) limitedDiff = 0;
    if (Math.abs(diff) > maxSwipe) {
      limitedDiff = diff > 0 ? maxSwipe : -maxSwipe;
    }

    setSwipeOffset(limitedDiff);

    // Verificar se passou do threshold
    if (Math.abs(limitedDiff) >= threshold) {
      setIsActionTriggered(true);
    } else {
      setIsActionTriggered(false);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    if (isActionTriggered) {
      // Executar ação
      if (swipeOffset > 0 && leftAction) {
        leftAction.onAction();
      } else if (swipeOffset < 0 && rightAction) {
        rightAction.onAction();
      }
    }

    // Reset
    setSwipeOffset(0);
    setIsActionTriggered(false);
    touchStart.current = 0;
  };

  const showLeftAction = swipeOffset > 0 && leftAction;
  const showRightAction = swipeOffset < 0 && rightAction;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Actions */}
      {showLeftAction && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center px-6 transition-opacity',
            leftAction.color,
            isActionTriggered ? 'opacity-100' : 'opacity-70'
          )}
        >
          <leftAction.icon className="h-5 w-5 text-white" />
        </div>
      )}

      {showRightAction && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center px-6 transition-opacity',
            rightAction.color,
            isActionTriggered ? 'opacity-100' : 'opacity-70'
          )}
        >
          <rightAction.icon className="h-5 w-5 text-white" />
        </div>
      )}

      {/* Card Content */}
      <div
        ref={cardRef}
        className="relative bg-background transition-transform touch-pan-y"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: touchStart.current === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Preset actions comuns
export const SWIPE_ACTIONS = {
  delete: {
    icon: Trash2,
    label: 'Deletar',
    color: 'bg-destructive'
  },
  archive: {
    icon: Archive,
    label: 'Arquivar',
    color: 'bg-orange-500'
  },
  complete: {
    icon: Check,
    label: 'Concluir',
    color: 'bg-green-500'
  }
};
