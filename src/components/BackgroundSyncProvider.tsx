import { useEffect } from 'react';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

/**
 * Componente wrapper para inicializar background sync
 * Deve estar dentro do QueryClientProvider
 */
export function BackgroundSyncProvider() {
  useBackgroundSync({ enabled: true });
  return null;
}
