import { useCallback } from 'react';
import { haptics, HapticPattern } from '@/lib/haptics';

export function useHapticFeedback() {
  const vibrate = useCallback((pattern: HapticPattern | number | number[]) => {
    return haptics.vibrate(pattern);
  }, []);

  const tap = useCallback(() => haptics.tap(), []);
  const buttonPress = useCallback(() => haptics.buttonPress(), []);
  const notification = useCallback(() => haptics.notification(), []);
  const success = useCallback(() => haptics.success(), []);
  const warning = useCallback(() => haptics.warning(), []);
  const error = useCallback(() => haptics.error(), []);

  return {
    vibrate,
    tap,
    buttonPress,
    notification,
    success,
    warning,
    error,
    isSupported: haptics.isAvailable()
  };
}

// Hook para adicionar haptic feedback a buttons
export function useHapticButton(pattern: HapticPattern = 'light') {
  const { vibrate } = useHapticFeedback();

  const handleClick = useCallback((e: React.MouseEvent) => {
    vibrate(pattern);
  }, [vibrate, pattern]);

  return { onClick: handleClick };
}
