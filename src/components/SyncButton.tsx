import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Botão para sincronização manual de cache
 * Útil para forçar atualização de dados sem esperar o background sync
 */
export function SyncButton() {
  const { forceSync, isEnabled } = useBackgroundSync();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await forceSync();
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  if (!isEnabled) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSync}
      disabled={isSyncing}
      className="relative"
      title="Sincronizar dados"
    >
      <RefreshCw 
        className={cn(
          "h-4 w-4",
          isSyncing && "animate-spin"
        )} 
      />
      {isSyncing && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </Button>
  );
}
