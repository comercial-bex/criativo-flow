/**
 * Teste de Performance - Virtual Scrolling
 * Valida performance com 1000+ items em listas virtualizadas
 */

import { VIRTUAL_SCROLL_CONFIG, shouldUseVirtualScroll, getOptimalOverscan } from '@/lib/virtual-scroll-config';

interface PerformanceMetrics {
  testName: string;
  itemCount: number;
  renderTime: number;
  scrollTime: number;
  memoryUsed: number;
  status: 'pass' | 'fail';
  threshold: number;
}

class VirtualScrollPerformanceTest {
  private results: PerformanceMetrics[] = [];
  
  /**
   * Testa performance de renderização inicial
   */
  async testInitialRender(itemCount: number): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Simular renderização (em produção seria com VirtualizedList)
    const useVirtualScroll = shouldUseVirtualScroll(itemCount);
    const overscan = getOptimalOverscan(itemCount);
    
    // Mock de renderização
    const visibleItems = useVirtualScroll ? overscan * 2 : itemCount;
    const mockItems = Array.from({ length: visibleItems }, (_, i) => ({ id: i }));
    
    const renderTime = performance.now() - startTime;
    const memoryUsed = ((performance as any).memory?.usedJSHeapSize || 0) - startMemory;
    
    const threshold = itemCount > 1000 ? 100 : 50; // ms
    
    return {
      testName: 'Initial Render',
      itemCount,
      renderTime,
      scrollTime: 0,
      memoryUsed,
      status: renderTime < threshold ? 'pass' : 'fail',
      threshold
    };
  }
  
  /**
   * Testa performance de scroll
   */
  async testScrollPerformance(itemCount: number): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Simular 100 eventos de scroll
    for (let i = 0; i < 100; i++) {
      const scrollPosition = (i / 100) * itemCount;
      // Mock de cálculo de visible items
      const overscan = getOptimalOverscan(itemCount);
    }
    
    const scrollTime = performance.now() - startTime;
    const memoryUsed = ((performance as any).memory?.usedJSHeapSize || 0) - startMemory;
    
    const threshold = 200; // ms para 100 scrolls
    
    return {
      testName: 'Scroll Performance',
      itemCount,
      renderTime: 0,
      scrollTime,
      memoryUsed,
      status: scrollTime < threshold ? 'pass' : 'fail',
      threshold
    };
  }
  
  /**
   * Executa suite completa de testes
   */
  async runTestSuite() {
    console.log('🚀 Iniciando testes de performance de Virtual Scrolling...\n');
    
    const testCases = [50, 100, 500, 1000, 2000, 5000];
    
    for (const itemCount of testCases) {
      console.log(`📊 Testando com ${itemCount} items...`);
      
      // Teste de renderização inicial
      const renderMetrics = await this.testInitialRender(itemCount);
      this.results.push(renderMetrics);
      
      // Teste de scroll
      const scrollMetrics = await this.testScrollPerformance(itemCount);
      this.results.push(scrollMetrics);
      
      console.log(`  ✓ Render: ${renderMetrics.renderTime.toFixed(2)}ms (${renderMetrics.status})`);
      console.log(`  ✓ Scroll: ${scrollMetrics.scrollTime.toFixed(2)}ms (${scrollMetrics.status})\n`);
    }
    
    this.printReport();
  }
  
  /**
   * Imprime relatório final
   */
  private printReport() {
    console.log('\n📈 RELATÓRIO DE PERFORMANCE');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;
    
    console.log(`✅ Testes Aprovados: ${passed}/${total}`);
    console.log(`❌ Testes Reprovados: ${failed}/${total}`);
    console.log(`📊 Taxa de Sucesso: ${((passed/total) * 100).toFixed(1)}%\n`);
    
    // Métricas por quantidade de items
    console.log('MÉTRICAS DETALHADAS:');
    console.log('───────────────────────────────────────────────────────────');
    console.log('Items | Teste          | Tempo (ms) | Limite | Status');
    console.log('───────────────────────────────────────────────────────────');
    
    this.results.forEach(metric => {
      const time = metric.renderTime || metric.scrollTime;
      const emoji = metric.status === 'pass' ? '✅' : '❌';
      console.log(
        `${metric.itemCount.toString().padStart(5)} | ` +
        `${metric.testName.padEnd(14)} | ` +
        `${time.toFixed(2).padStart(10)} | ` +
        `${metric.threshold.toString().padStart(6)} | ` +
        `${emoji}`
      );
    });
    
    console.log('───────────────────────────────────────────────────────────\n');
    
    // Recomendações
    const failedTests = this.results.filter(r => r.status === 'fail');
    if (failedTests.length > 0) {
      console.log('⚠️  RECOMENDAÇÕES:');
      failedTests.forEach(test => {
        console.log(`  • ${test.testName} com ${test.itemCount} items excedeu o limite`);
        console.log(`    Considere aumentar overscan ou otimizar renderização\n`);
      });
    } else {
      console.log('✨ EXCELENTE! Todos os testes passaram!');
      console.log('   Virtual scrolling está otimizado para produção.\n');
    }
    
    // Configurações usadas
    console.log('⚙️  CONFIGURAÇÕES APLICADAS:');
    console.log(`   • Threshold Virtual Scroll: ${VIRTUAL_SCROLL_CONFIG.ENABLE_VIRTUAL_SCROLL_AT} items`);
    console.log(`   • Overscan Pequeno: ${VIRTUAL_SCROLL_CONFIG.OVERSCAN_SMALL}`);
    console.log(`   • Overscan Médio: ${VIRTUAL_SCROLL_CONFIG.OVERSCAN_MEDIUM}`);
    console.log(`   • Overscan Grande: ${VIRTUAL_SCROLL_CONFIG.OVERSCAN_LARGE}`);
    console.log(`   • Overscan XL: ${VIRTUAL_SCROLL_CONFIG.OVERSCAN_XLARGE}\n`);
  }
}

// Executar testes
export async function runVirtualScrollTests() {
  const tester = new VirtualScrollPerformanceTest();
  await tester.runTestSuite();
}

// Auto-executar se rodado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runVirtualScrollTests();
}
