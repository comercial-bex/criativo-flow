import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { syncManager } from "@/lib/sync-manager";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function OfflineIndicator() {
  const { isOnline, getUnsyncedCount } = useOfflineStorage();
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const { toast } = useToast();

  useEffect(() => {
    // Atualizar contador a cada 5 segundos
    const updateCount = async () => {
      const count = await getUnsyncedCount();
      setUnsyncedCount(count);
    };

    updateCount();
    const interval = setInterval(updateCount, 5000);

    // Escutar mudanças de conexão
    const unsubscribe = syncManager.onConnectionChange((newStatus) => {
      setOnline(newStatus);
      
      if (newStatus) {
        toast({
          title: "Conexão restaurada",
          description: "Sincronizando dados...",
          duration: 2000,
        });
      } else {
        toast({
          title: "Você está offline",
          description: "Suas alterações serão salvas localmente",
          variant: "destructive",
          duration: 3000,
        });
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [getUnsyncedCount, toast]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncManager.syncNow();
      
      if (result.synced > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${result.synced} item(s) sincronizado(s) com sucesso`,
        });
      }
      
      if (result.failed > 0) {
        toast({
          title: "Alguns itens falharam",
          description: `${result.failed} item(s) não foram sincronizados`,
          variant: "destructive",
        });
      }

      // Atualizar contador
      const count = await getUnsyncedCount();
      setUnsyncedCount(count);
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Não mostrar nada se estiver online e sem itens pendentes
  if (online && unsyncedCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {!online && (
        <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1.5">
          <WifiOff className="h-3.5 w-3.5" />
          Offline
          {unsyncedCount > 0 && (
            <span className="ml-1 font-semibold">• {unsyncedCount}</span>
          )}
        </Badge>
      )}

      {online && unsyncedCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge 
              variant="outline" 
              className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-accent"
            >
              <Wifi className="h-3.5 w-3.5 text-primary" />
              {unsyncedCount} pendente(s)
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Dados não sincronizados</p>
                  <p className="text-sm text-muted-foreground">
                    {unsyncedCount} item(s) aguardando sincronização
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSync}
                disabled={syncing}
                className="w-full"
                size="sm"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar agora
                  </>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
