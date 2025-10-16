import { useEffect } from 'react';
import { ViewMode } from '../types';

interface UseKeyboardShortcutsProps {
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  onGoToToday: () => void;
}

export const useKeyboardShortcuts = ({
  onViewModeChange,
  onNavigateNext,
  onNavigatePrev,
  onGoToToday
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          onViewModeChange('month');
          break;
        case 'w':
          onViewModeChange('week');
          break;
        case 'l':
          onViewModeChange('list');
          break;
        case 'd':
          onViewModeChange('day');
          break;
        case 't':
          onGoToToday();
          break;
        case 'arrowright':
          onNavigateNext();
          break;
        case 'arrowleft':
          onNavigatePrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onViewModeChange, onNavigateNext, onNavigatePrev, onGoToToday]);
};
