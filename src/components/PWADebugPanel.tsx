// PWA Debug Panel - Apenas para desenvolvimento
// Exibe informações sobre cache, sync e performance

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { syncManager } from '@/lib/sync-manager';
import { getDatabaseSize } from '@/lib/db/indexeddb';
import { collectPWAMetrics, logMetrics, getPerformanceGrade } from '@/lib/pwa-metrics';
import { Wifi, WifiOff, RefreshCw, Trash2, BarChart3 } from 'lucide-react';

export function PWADebugPanel() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [dbSize, setDbSize] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      updateQueueSize();
      updateDbSize();
    };

    updateStatus();

    // Listener para mudanças de conexão
    const cleanup = syncManager.onConnectionChange((online) => {
      setIsOnline(online);
      updateQueueSize();
    });

    // Listener para notificações de sync
    const handleSyncNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Sync notification:', customEvent.detail);
      updateQueueSize();
    };

    window.addEventListener('sync-notification', handleSyncNotification);

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateStatus, 5000);

    return () => {
      cleanup();
      window.removeEventListener('sync-notification', handleSyncNotification);
      clearInterval(interval);
    };
  }, []);

  const updateQueueSize = async () => {
    try {
      const size = await syncManager.getQueueSize();
      setQueueSize(size);
    } catch (error) {
      console.error('Erro ao obter tamanho da fila:', error);
    }
  };

  const updateDbSize = async () => {
    try {
      const size = await getDatabaseSize();
      setDbSize(size);
    } catch (error) {
      console.error('Erro ao obter tamanho do DB:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncManager.syncNow();
      await updateQueueSize();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Tem certeza que deseja limpar o cache?')) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      alert('Cache limpo com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache');
    }
  };

  const handleShowMetrics = async () => {
    const metrics = await collectPWAMetrics();
    logMetrics(metrics);
    const grade = getPerformanceGrade(metrics);
    console.log('Performance Grade:', grade);
    setShowMetrics(true);
    setTimeout(() => setShowMetrics(false), 3000);
  };

  // Apenas mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 bg-background/95 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>PWA Debug Panel</span>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Status */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Fila de Sync</p>
            <p className="font-semibold">{queueSize} item(s)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tamanho DB</p>
            <p className="font-semibold">{(dbSize / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <Button
            onClick={handleSync}
            disabled={!isOnline || syncing || queueSize === 0}
            size="sm"
            className="w-full"
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar Agora
          </Button>

          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Limpar Cache
          </Button>

          <Button
            onClick={handleShowMetrics}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <BarChart3 className="h-3 w-3 mr-2" />
            {showMetrics ? 'Métricas no Console ✓' : 'Ver Métricas'}
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Service Worker: {navigator.serviceWorker?.controller ? '✓' : '✗'}</p>
          <p>IndexedDB: {typeof indexedDB !== 'undefined' ? '✓' : '✗'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
