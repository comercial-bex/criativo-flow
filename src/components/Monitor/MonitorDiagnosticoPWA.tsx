import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Zap,
  Clock,
  Download,
  Package
} from 'lucide-react';
import { collectPWAMetrics, getPerformanceGrade, type PWAMetrics } from '@/lib/pwa-metrics';
import { webVitals, type WebVitalMetric } from '@/lib/web-vitals';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';

interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  waiting: boolean;
  cacheSize: number;
  version: string;
}

export function MonitorDiagnosticoPWA() {
  const [pwaMetrics, setPwaMetrics] = useState<PWAMetrics | null>(null);
  const [webVitalsData, setWebVitalsData] = useState<WebVitalMetric[]>([]);
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    registered: false,
    active: false,
    waiting: false,
    cacheSize: 0,
    version: 'N/A'
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  const { connections, criticalEvents } = useSystemMonitor();

  // Coletar métricas PWA
  const collectMetrics = async () => {
    setLoading(true);
    try {
      const metrics = await collectPWAMetrics();
      setPwaMetrics(metrics);
    } catch (error) {
      console.error('Erro ao coletar métricas PWA:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar status do Service Worker
  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        setSwStatus({
          registered: true,
          active: !!registration.active,
          waiting: !!registration.waiting,
          cacheSize: 0,
          version: 'bex-flow-v2'
        });

        // Tentar obter tamanho do cache
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          setSwStatus(prev => ({
            ...prev,
            cacheSize: estimate.usage || 0
          }));
        }
      } else {
        setSwStatus({
          registered: false,
          active: false,
          waiting: false,
          cacheSize: 0,
          version: 'N/A'
        });
      }
    }
  };

  useEffect(() => {
    collectMetrics();
    checkServiceWorker();

    // Monitorar Web Vitals
    const unsubscribe = webVitals.onMetric((metric) => {
      setWebVitalsData(prev => {
        const filtered = prev.filter(m => m.name !== metric.name);
        return [...filtered, metric];
      });
    });

    // Monitorar status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    collectMetrics();
    checkServiceWorker();
  };

  const getHealthScore = (): number => {
    if (!pwaMetrics) return 0;
    
    const grade = getPerformanceGrade(pwaMetrics);
    const scores = {
      good: 100,
      'needs-improvement': 60,
      poor: 30
    };
    
    return scores[grade.overall];
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Header com Score Geral */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className={`h-8 w-8 ${getHealthColor(healthScore)}`} />
            <div>
              <h2 className="text-2xl font-bold">Diagnóstico PWA</h2>
              <p className="text-sm text-muted-foreground">
                Análise completa de performance e conectividade
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saúde Geral</span>
              <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
                {healthScore}%
              </span>
            </div>
            <Progress value={healthScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conexões Ativas</span>
              <span className="text-2xl font-bold">
                {connections?.filter(c => c.status === 'healthy').length || 0}
                <span className="text-sm text-muted-foreground">
                  /{connections?.length || 0}
                </span>
              </span>
            </div>
            <Progress 
              value={connections?.length ? (connections.filter(c => c.status === 'healthy').length / connections.length) * 100 : 0} 
              className="h-2" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-500">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Worker Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Worker
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Registrado</span>
              {swStatus.registered ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Inativo
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Worker Ativo</span>
              {swStatus.active ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Versão</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {swStatus.version}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Cache</span>
              <span className="text-sm">
                {(swStatus.cacheSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        </Card>

        {/* Web Vitals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Core Web Vitals
          </h3>
          
          <div className="space-y-3">
            {webVitalsData.length > 0 ? (
              webVitalsData.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge 
                      variant={
                        metric.rating === 'good' ? 'default' : 
                        metric.rating === 'needs-improvement' ? 'secondary' : 
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {metric.rating}
                    </Badge>
                  </div>
                  <span className="text-sm font-mono">
                    {metric.name === 'CLS' 
                      ? metric.value.toFixed(3)
                      : `${Math.round(metric.value)}ms`
                    }
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Coletando métricas...
              </div>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        {pwaMetrics && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Tempo de Carregamento</span>
                <span className="text-sm font-mono">
                  {pwaMetrics.loadTime.toFixed(0)}ms
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Bundle Size</span>
                <span className="text-sm font-mono">
                  {(pwaMetrics.bundleSize / 1024).toFixed(2)} KB
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Cache Hit Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={pwaMetrics.cacheHitRate * 100} className="h-2 w-20" />
                  <span className="text-sm font-mono">
                    {(pwaMetrics.cacheHitRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">TTFB</span>
                <span className="text-sm font-mono">
                  {pwaMetrics.ttfb ? `${pwaMetrics.ttfb.toFixed(0)}ms` : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* System Connections Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status de Conexões
          </h3>
          
          <div className="space-y-3">
            {connections && connections.length > 0 ? (
              connections.slice(0, 5).map((conn) => (
                <div key={conn.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{conn.name}</span>
                  {conn.status === 'healthy' ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      OK
                    </Badge>
                  ) : conn.status === 'degraded' ? (
                    <Badge variant="secondary" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Degradado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Erro
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Nenhuma conexão configurada
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Critical Events */}
      {criticalEvents && criticalEvents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Eventos Críticos Recentes
          </h3>
          
          <div className="space-y-2">
            {criticalEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={event.event_type === 'error' ? 'destructive' : 'secondary'}>
                      {event.event_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{event.payload ? JSON.stringify(event.payload) : 'Evento crítico'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
