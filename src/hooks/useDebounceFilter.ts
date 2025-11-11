import { useState, useEffect } from 'react';

/**
 * Hook de debounce genérico para filtros
 * Evita chamadas excessivas ao backend durante digitação
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (padrão: 500ms)
 * @returns Valor debounced
 */
export function useDebounceFilter<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
