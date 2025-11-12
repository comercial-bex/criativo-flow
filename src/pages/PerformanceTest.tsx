import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VirtualizedList } from '@/components/VirtualizedList';
import { VirtualizedTable, VirtualizedTableColumn } from '@/components/VirtualizedTable';
import { VIRTUAL_SCROLL_CONFIG, shouldUseVirtualScroll, getOptimalOverscan } from '@/lib/virtual-scroll-config';
import { Play, CheckCircle2, XCircle, Activity, Clock, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  test: string;
  items: number;
  time: number;
  status: 'pass' | 'fail';
  threshold: number;
}

export default function PerformanceTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [testData, setTestData] = useState<any[]>([]);

  // Buscar contagem de tarefas do banco
  useEffect(() => {
    const fetchTaskCount = async () => {
      const { count } = await supabase
        .from('tarefa')
        .select('*', { count: 'exact', head: true });
      
      setTaskCount(count || 0);
    };
    
    fetchTaskCount();
  }, []);

  // Gerar dados de teste
  const generateTestData = useCallback((count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-${i}`,
      titulo: `Tarefa de Teste #${i}`,
      status: ['backlog', 'em_andamento', 'concluido'][i % 3],
      prioridade: ['baixa', 'media', 'alta'][i % 3],
      cliente: `Cliente ${i % 10}`,
      horas: Math.floor(Math.random() * 40) + 1,
    }));
  }, []);

  // Teste de renderização
  const testRender = useCallback(async (itemCount: number) => {
    const startTime = performance.now();
    const data = generateTestData(itemCount);
    setTestData(data);
    
    // Aguardar próximo frame
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const renderTime = performance.now() - startTime;
    const threshold = itemCount > 1000 ? 100 : 50;
    
    return {
      test: 'Initial Render',
      items: itemCount,
      time: renderTime,
      status: renderTime < threshold ? 'pass' : 'fail',
      threshold
    } as PerformanceMetric;
  }, [generateTestData]);

  // Teste de scroll
  const testScroll = useCallback(async (itemCount: number) => {
    const startTime = performance.now();
    
    // Simular eventos de scroll
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    const scrollTime = performance.now() - startTime;
    const threshold = 100;
    
    return {
      test: 'Scroll Performance',
      items: itemCount,
      time: scrollTime,
      status: scrollTime < threshold ? 'pass' : 'fail',
      threshold
    } as PerformanceMetric;
  }, []);

  // Executar suite de testes
  const runTests = useCallback(async () => {
    setIsRunning(true);
    setMetrics([]);
    
    const testCases = [50, 100, 500, 1000, 2000];
    const newMetrics: PerformanceMetric[] = [];
    
    for (const itemCount of testCases) {
      // Teste de renderização
      const renderMetric = await testRender(itemCount);
      newMetrics.push(renderMetric);
      setMetrics([...newMetrics]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Teste de scroll
      const scrollMetric = await testScroll(itemCount);
      newMetrics.push(scrollMetric);
      setMetrics([...newMetrics]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
  }, [testRender, testScroll]);

  const columns: VirtualizedTableColumn<PerformanceMetric>[] = [
    {
      header: 'Teste',
      width: 200,
      render: (metric) => <span className="font-medium">{metric.test}</span>
    },
    {
      header: 'Items',
      width: 100,
      align: 'center',
      render: (metric) => <span>{metric.items}</span>
    },
    {
      header: 'Tempo (ms)',
      width: 120,
      align: 'right',
      render: (metric) => <span>{metric.time.toFixed(2)}ms</span>
    },
    {
      header: 'Limite (ms)',
      width: 120,
      align: 'right',
      render: (metric) => <span>{metric.threshold}ms</span>
    },
    {
      header: 'Status',
      width: 100,
      align: 'center',
      render: (metric) => (
        <Badge variant={metric.status === 'pass' ? 'default' : 'destructive'}>
          {metric.status === 'pass' ? (
            <><CheckCircle2 className="w-3 h-3 mr-1" /> Pass</>
          ) : (
            <><XCircle className="w-3 h-3 mr-1" /> Fail</>
          )}
        </Badge>
      )
    }
  ];

  const passedTests = metrics.filter(m => m.status === 'pass').length;
  const totalTests = metrics.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Testing</h1>
          <p className="text-muted-foreground mt-1">
            Testes de carga com Virtual Scrolling
          </p>
        </div>
        
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <><Activity className="w-4 h-4 mr-2 animate-spin" /> Testando...</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Executar Testes</>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="w-4 h-4 mr-2 text-primary" />
              Tarefas no Banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {shouldUseVirtualScroll(taskCount) ? 'Virtual Scroll Ativo' : 'Scroll Normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              Testes Executados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRunning ? 'Em execução...' : 'Completo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {passedTests}/{totalTests} aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              Overscan Config
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getOptimalOverscan(taskCount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items extras renderizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <VirtualizedTable
              data={metrics}
              columns={columns}
              height={400}
              rowHeight={60}
            />
          </CardContent>
        </Card>
      )}

      {/* Preview de Virtual Scroll */}
      {testData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview - Virtual Scroll ({testData.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <VirtualizedList
              items={testData}
              height={400}
              rowHeight={VIRTUAL_SCROLL_CONFIG.ROW_HEIGHT_DEFAULT}
              renderItem={({ item, index }) => (
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 border-b">
                  <div>
                    <div className="font-medium">{item.titulo}</div>
                    <div className="text-sm text-muted-foreground">{item.cliente}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{item.status}</Badge>
                    <Badge variant="outline">{item.prioridade}</Badge>
                    <Badge variant="outline">{item.horas}h</Badge>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Threshold Virtual Scroll:</span>
              <span className="ml-2 text-muted-foreground">
                {VIRTUAL_SCROLL_CONFIG.ENABLE_VIRTUAL_SCROLL_AT} items
              </span>
            </div>
            <div>
              <span className="font-medium">Altura Padrão de Lista:</span>
              <span className="ml-2 text-muted-foreground">
                {VIRTUAL_SCROLL_CONFIG.DEFAULT_LIST_HEIGHT}px
              </span>
            </div>
            <div>
              <span className="font-medium">Overscan Pequeno:</span>
              <span className="ml-2 text-muted-foreground">
                {VIRTUAL_SCROLL_CONFIG.OVERSCAN_SMALL} items
              </span>
            </div>
            <div>
              <span className="font-medium">Overscan Médio:</span>
              <span className="ml-2 text-muted-foreground">
                {VIRTUAL_SCROLL_CONFIG.OVERSCAN_MEDIUM} items
              </span>
            </div>
            <div>
              <span className="font-medium">Overscan Grande:</span>
              <span className="ml-2 text-muted-foreground">
                {VIRTUAL_SCROLL_CONFIG.OVERSCAN_LARGE} items
              </span>
            </div>
            <div>
              <span className="font-medium">Overscan XL:</span>
              <span className="ml-2 text-muted-foreground">
                {VIRTUAL_SCROLL_CONFIG.OVERSCAN_XLARGE} items
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
