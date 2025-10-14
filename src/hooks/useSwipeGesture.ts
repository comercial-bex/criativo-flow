// Hook para gestos de swipe
// Detecta swipes horizontais e verticais com threshold configurável

import { useEffect, useRef, useState } from 'react';

export interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Distância mínima para considerar swipe (px)
  velocity?: number; // Velocidade mínima (px/ms)
}

export interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

export function useSwipeGesture(config: SwipeGestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocity = 0.3
  } = config;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0
  });

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    };

    setSwipeState({
      isSwiping: true,
      direction: null,
      distance: 0
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart.current) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;

    const diffX = touchStart.current.x - currentX;
    const diffY = touchStart.current.y - currentY;

    // Determinar direção predominante
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;
    let distance = 0;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Swipe horizontal
      direction = diffX > 0 ? 'left' : 'right';
      distance = Math.abs(diffX);
    } else {
      // Swipe vertical
      direction = diffY > 0 ? 'up' : 'down';
      distance = Math.abs(diffY);
    }

    setSwipeState({
      isSwiping: true,
      direction,
      distance
    });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;

    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const diffX = touchStart.current.x - touchEnd.current.x;
    const diffY = touchStart.current.y - touchEnd.current.y;
    const timeDiff = touchEnd.current.time - touchStart.current.time;

    // Calcular velocidade
    const velocityX = Math.abs(diffX) / timeDiff;
    const velocityY = Math.abs(diffY) / timeDiff;

    // Verificar se é um swipe válido
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Swipe horizontal
      if (Math.abs(diffX) > threshold && velocityX > velocity) {
        if (diffX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (diffX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      // Swipe vertical
      if (Math.abs(diffY) > threshold && velocityY > velocity) {
        if (diffY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (diffY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    setSwipeState({
      isSwiping: false,
      direction: null,
      distance: 0
    });

    touchStart.current = null;
    touchEnd.current = null;
  };

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  return { handlers, swipeState };
}

// Hook simplificado para swipe-back (voltar)
export function useSwipeBack(onBack: () => void) {
  return useSwipeGesture({
    onSwipeRight: onBack,
    threshold: 100,
    velocity: 0.5
  });
}
