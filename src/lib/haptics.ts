// Haptic Feedback API wrapper
export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 30, 10],
  warning: [15, 50, 15, 50],
  error: [30, 50, 30]
};

class HapticFeedback {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  vibrate(pattern: HapticPattern | number | number[]) {
    if (!this.isSupported) return false;

    try {
      if (typeof pattern === 'string') {
        navigator.vibrate(PATTERNS[pattern]);
      } else {
        navigator.vibrate(pattern);
      }
      return true;
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }
  }

  // Padrões comuns
  tap() {
    return this.vibrate('light');
  }

  buttonPress() {
    return this.vibrate('medium');
  }

  notification() {
    return this.vibrate('heavy');
  }

  success() {
    return this.vibrate('success');
  }

  warning() {
    return this.vibrate('warning');
  }

  error() {
    return this.vibrate('error');
  }

  cancel() {
    if (!this.isSupported) return false;
    navigator.vibrate(0);
    return true;
  }

  isAvailable() {
    return this.isSupported;
  }
}

export const haptics = new HapticFeedback();

// Helper para adicionar feedback tátil em eventos de clique
export function addHapticToElement(
  element: HTMLElement,
  pattern: HapticPattern = 'light'
) {
  const handler = () => haptics.vibrate(pattern);
  element.addEventListener('click', handler);
  
  return () => element.removeEventListener('click', handler);
}
