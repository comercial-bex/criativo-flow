// Web Vitals tracking (CLS, FID, LCP, FCP, TTFB)
export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type MetricCallback = (metric: WebVitalMetric) => void;

const thresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

function getRating(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

class WebVitalsTracker {
  private callbacks: MetricCallback[] = [];
  private metrics: Map<string, WebVitalMetric> = new Map();

  constructor() {
    if (typeof window === 'undefined') return;
    this.initTracking();
  }

  private initTracking() {
    // Lazy load web-vitals library
    import('web-vitals').then((vitals) => {
      const report = (metric: any) => {
        const vitalMetric: WebVitalMetric = {
          name: metric.name,
          value: metric.value,
          rating: getRating(metric.name, metric.value),
          delta: metric.delta,
          id: metric.id
        };

        this.metrics.set(metric.name, vitalMetric);
        this.callbacks.forEach(cb => cb(vitalMetric));
      };

      vitals.onCLS(report);
      vitals.onLCP(report);
      vitals.onFCP(report);
      vitals.onTTFB(report);
      if (vitals.onINP) vitals.onINP(report);
    }).catch(err => {
      console.warn('Failed to load web-vitals:', err);
    });
  }

  onMetric(callback: MetricCallback) {
    this.callbacks.push(callback);
    
    // Enviar métricas já coletadas
    this.metrics.forEach(metric => callback(metric));

    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  getMetric(name: WebVitalMetric['name']) {
    return this.metrics.get(name);
  }

  // Enviar métricas para analytics
  async sendToAnalytics(endpoint: string) {
    const metrics = this.getMetrics();
    
    if (metrics.length === 0) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to send web vitals:', error);
    }
  }
}

export const webVitals = new WebVitalsTracker();

// Helper para logging
export function logWebVitals() {
  webVitals.onMetric((metric) => {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta)
    });
  });
}
