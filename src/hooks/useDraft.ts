import { useState, useEffect } from 'react';
import { useDebounce } from './use-debounce';

export function useDraft<T>(key: string, initialValue: T) {
  const [draft, setDraft] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const debouncedDraft = useDebounce(draft, 400);

  useEffect(() => {
    if (JSON.stringify(debouncedDraft) !== JSON.stringify(initialValue)) {
      localStorage.setItem(`draft_${key}`, JSON.stringify(debouncedDraft));
    }
  }, [debouncedDraft, key]);

  const clearDraft = () => {
    localStorage.removeItem(`draft_${key}`);
    setDraft(initialValue);
  };

  return { draft, setDraft, clearDraft };
}
