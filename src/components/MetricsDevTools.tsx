import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMetricsStore } from '@/store/metricsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  RefreshCw,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import { globalCircuitBreaker } from '@/lib/retryLogic';

/**
 * Painel de métricas DevTools
 * Mostra cache hit/miss, retry stats, performance
 */
export function MetricsDevTools() {
  const queryClient = useQueryClient();
  const metrics = useMetricsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  // Atualizar summary a cada 2 segundos
  useEffect(() => {
    if (!isOpen) return;

    const updateSummary = () => {
      setSummary(metrics.getMetricsSummary());
      
      // Atualizar estado do circuit breaker
      metrics.updateCircuitBreakerState(globalCircuitBreaker.getState());
    };

    updateSummary();
    const interval = setInterval(updateSummary, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        size="icon"
        title="Abrir Métricas DevTools"
      >
        <BarChart3 className="h-5 w-5" />
      </Button>
    );
  }

  const circuitBreakerColor = 
    metrics.circuitBreakerState.state === 'open' ? 'destructive' :
    metrics.circuitBreakerState.state === 'half-open' ? 'warning' :
    'success';

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[600px] max-h-[80vh] bg-background border border-border rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Métricas DevTools</h3>
          <Badge variant={circuitBreakerColor as any} className="ml-2">
            {metrics.circuitBreakerState.state}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              metrics.resetMetrics();
              queryClient.clear();
            }}
            title="Limpar métricas e cache"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="retry">Retry</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-4 space-y-4">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 gap-4">
              {/* Cache Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Cache Hit Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {summary?.cache.hitRatio || '0'}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {summary?.cache.hits || 0} hits / {summary?.cache.misses || 0} misses
                  </p>
                </CardContent>
              </Card>

              {/* Retry Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-warning" />
                    Retry Success
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">
                    {summary?.retry.successRate || '0'}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {summary?.retry.successful || 0} / {summary?.retry.total || 0} tentativas
                  </p>
                </CardContent>
              </Card>

              {/* Avg Query Time */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Tempo Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">
                    {summary?.performance.avgQueryTime || '0'}ms
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    por query
                  </p>
                </CardContent>
              </Card>

              {/* Network Errors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Erros de Rede
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {summary?.performance.networkErrorsCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    erros registrados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Circuit Breaker Status */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Circuit Breaker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estado:</span>
                    <Badge variant={circuitBreakerColor as any}>
                      {metrics.circuitBreakerState.state}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Falhas:</span>
                    <span className="font-mono">{metrics.circuitBreakerState.failures}</span>
                  </div>
                  {metrics.circuitBreakerState.lastFailureTime > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Última falha:</span>
                      <span className="text-xs">
                        {new Date(metrics.circuitBreakerState.lastFailureTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* Cache Tab */}
        <TabsContent value="cache" className="p-4">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2">
              {Object.entries(metrics.cache.queries).map(([key, data]: [string, any]) => (
                <Card key={key}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate">{key}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {data.hits} hits
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            {data.misses} misses
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {((data.hits / (data.hits + data.misses)) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Retry Tab */}
        <TabsContent value="retry" className="p-4">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2">
              {Object.entries(metrics.retry.byQuery).map(([key, data]: [string, any]) => (
                <Card key={key}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate">{key}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>✅ {data.successes}</span>
                          <span>❌ {data.failures}</span>
                          <span>⏱️ {data.avgRetryTime.toFixed(0)}ms</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {data.attempts} tentativas
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="p-4">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {/* Slow Queries */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  Queries Lentas (&gt;2s)
                </h4>
                <div className="space-y-2">
                  {metrics.performance.slowQueries.slice(-10).reverse().map((query, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-mono truncate flex-1">
                            {query.queryKey}
                          </p>
                          <Badge variant="destructive" className="ml-2">
                            {query.time.toFixed(0)}ms
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(query.timestamp).toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Network Errors */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Erros de Rede
                </h4>
                <div className="space-y-2">
                  {metrics.performance.networkErrors.slice(-10).reverse().map((error, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <p className="text-xs font-mono truncate">
                          {error.queryKey}
                        </p>
                        <p className="text-xs text-destructive mt-1">{error.error}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
