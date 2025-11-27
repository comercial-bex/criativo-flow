// PWA Metrics Collection
// Coleta métricas de performance e uso do PWA

export interface PWAMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  
  // PWA específico
  cacheHitRate: number;
  offlineOperations: number;
  syncSuccessRate: number;
  
  // Bundle e carregamento
  bundleSize: number;
  loadTime: number;
  
  // Timestamp
  timestamp: number;
}

export async function collectPWAMetrics(): Promise<PWAMetrics> {
  const metrics: PWAMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    cacheHitRate: 0,
    offlineOperations: 0,
    syncSuccessRate: 0,
    bundleSize: 0,
    loadTime: 0,
    timestamp: Date.now()
  };

  // Coletar Core Web Vitals usando Performance Observer
  try {
    // LCP - Largest Contentful Paint
    await new Promise<void>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
        observer.disconnect();
        resolve();
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Timeout após 5s
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 5000);
    });

    // FID - First Input Delay
    await new Promise<void>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.fid = entry.processingStart - entry.startTime;
        });
        observer.disconnect();
        resolve();
      });
      observer.observe({ entryTypes: ['first-input'] });
      
      // Timeout após 5s
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 5000);
    });

    // CLS - Cumulative Layout Shift
    await new Promise<void>((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.cls = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Desconectar após 5s
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 5000);
    });

    // Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.fcp = navigation.responseStart - navigation.fetchStart;
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
    }

  } catch (error) {
    console.error('Erro ao coletar métricas:', error);
  }

  // Coletar tamanho do bundle (melhorado)
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  let bundleSize = 0;
  
  resources.forEach(resource => {
    // Filtrar apenas JS/CSS do bundle
    if (resource.name.includes('/assets/') && 
        (resource.name.endsWith('.js') || resource.name.endsWith('.css'))) {
      bundleSize += resource.transferSize || resource.encodedBodySize || 0;
    }
  });
  
  // Se ainda for 0, estimar baseado em recursos JS/CSS
  if (bundleSize === 0 && resources.length > 0) {
    bundleSize = resources
      .filter(r => r.initiatorType === 'script' || r.initiatorType === 'link')
      .reduce((sum, r) => sum + (r.transferSize || r.encodedBodySize || 100000), 0);
  }
  
  metrics.bundleSize = bundleSize;

  // Cache hit rate (aproximado)
  const cachedResources = resources.filter(r => r.transferSize === 0).length;
  metrics.cacheHitRate = resources.length > 0 ? cachedResources / resources.length : 0;

  return metrics;
}

export function logMetrics(metrics: PWAMetrics): void {
  console.group('📊 PWA Metrics');
  console.log('LCP:', metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A');
  console.log('FID:', metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A');
  console.log('CLS:', metrics.cls ? metrics.cls.toFixed(4) : 'N/A');
  console.log('FCP:', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A');
  console.log('TTFB:', metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A');
  console.log('Load Time:', `${metrics.loadTime.toFixed(2)}ms`);
  console.log('Bundle Size:', `${(metrics.bundleSize / 1024).toFixed(2)} KB`);
  console.log('Cache Hit Rate:', `${(metrics.cacheHitRate * 100).toFixed(1)}%`);
  console.groupEnd();
}

export function getPerformanceGrade(metrics: PWAMetrics): {
  lcp: 'good' | 'needs-improvement' | 'poor';
  fid: 'good' | 'needs-improvement' | 'poor';
  cls: 'good' | 'needs-improvement' | 'poor';
  overall: 'good' | 'needs-improvement' | 'poor';
} {
  const lcpGrade = !metrics.lcp ? 'poor' :
    metrics.lcp <= 2500 ? 'good' :
    metrics.lcp <= 4000 ? 'needs-improvement' : 'poor';

  const fidGrade = !metrics.fid ? 'poor' :
    metrics.fid <= 100 ? 'good' :
    metrics.fid <= 300 ? 'needs-improvement' : 'poor';

  const clsGrade = !metrics.cls ? 'poor' :
    metrics.cls <= 0.1 ? 'good' :
    metrics.cls <= 0.25 ? 'needs-improvement' : 'poor';

  const grades = [lcpGrade, fidGrade, clsGrade];
  const poorCount = grades.filter(g => g === 'poor').length;
  const goodCount = grades.filter(g => g === 'good').length;

  const overall = poorCount > 0 ? 'poor' :
    goodCount >= 2 ? 'good' : 'needs-improvement';

  return { lcp: lcpGrade, fid: fidGrade, cls: clsGrade, overall };
}
