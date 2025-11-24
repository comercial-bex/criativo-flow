import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      console.log('🔔 Nova versão disponível!');
      setShowUpdate(true);
      
      // Também mostrar toast para garantir que o usuário veja
      toast({
        title: 'Nova versão disponível',
        description: 'Uma nova versão do aplicativo está pronta.',
      });
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    return () => window.removeEventListener('sw-update-available', handleUpdateAvailable);
  }, []);

  const handleUpdate = async () => {
    console.log('🔄 Atualizando aplicativo...');
    setShowUpdate(false);
    
    try {
      // 1. Limpar todos os caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // 2. Pedir ao novo Service Worker para assumir controle
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // 3. Aguardar o novo SW tomar controle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('✅ Novo Service Worker ativo, recarregando...');
        window.location.reload();
      }, { once: true });
      
      // 4. Se não houver controllerchange em 2s, forçar reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
      // Forçar reload mesmo em caso de erro
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Nova versão disponível
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Clique em "Atualizar Agora" para usar a versão mais recente do aplicativo.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar Agora
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
