import { useEffect, useState } from 'react';
import { webVitals, WebVitalMetric } from '@/lib/web-vitals';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = webVitals.onMetric((metric) => {
      setMetrics(prev => {
        const index = prev.findIndex(m => m.name === metric.name);
        if (index >= 0) {
          const newMetrics = [...prev];
          newMetrics[index] = metric;
          return newMetrics;
        }
        return [...prev, metric];
      });
      setIsLoading(false);
    });

    // Timeout para parar loading
    const timeout = setTimeout(() => setIsLoading(false), 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const getMetric = (name: WebVitalMetric['name']) => {
    return metrics.find(m => m.name === name);
  };

  const getOverallRating = (): 'good' | 'needs-improvement' | 'poor' => {
    if (metrics.length === 0) return 'good';
    
    const ratings = metrics.map(m => m.rating);
    if (ratings.some(r => r === 'poor')) return 'poor';
    if (ratings.some(r => r === 'needs-improvement')) return 'needs-improvement';
    return 'good';
  };

  return {
    metrics,
    isLoading,
    getMetric,
    overallRating: getOverallRating()
  };
}

// Hook para medir performance de componentes
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      console.log(`[Performance] ${componentName} mounted for ${duration.toFixed(2)}ms`);
    };
  }, [componentName]);
}

// Hook para medir tempo de renderização
export function useRenderTime(label: string) {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    setRenderCount(prev => prev + 1);

    return () => {
      const duration = performance.now() - start;
      console.log(`[Render] ${label} #${renderCount}: ${duration.toFixed(2)}ms`);
    };
  });
}

// Hook para navigation timing
export function useNavigationTiming() {
  const [timing, setTiming] = useState<PerformanceNavigationTiming | null>(null);

  useEffect(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const [navigationTiming] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      setTiming(navigationTiming);
    }
  }, []);

  return {
    timing,
    dnsTime: timing ? timing.domainLookupEnd - timing.domainLookupStart : 0,
    tcpTime: timing ? timing.connectEnd - timing.connectStart : 0,
    requestTime: timing ? timing.responseStart - timing.requestStart : 0,
    responseTime: timing ? timing.responseEnd - timing.responseStart : 0,
    domProcessingTime: timing ? timing.domComplete - timing.domInteractive : 0,
    totalLoadTime: timing ? timing.loadEventEnd - timing.fetchStart : 0
  };
}
