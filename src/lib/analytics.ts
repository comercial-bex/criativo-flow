// Analytics & User Behavior Tracking
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface PageView {
  path: string;
  title: string;
  referrer?: string;
}

class Analytics {
  private sessionId: string;
  private userId: string | null = null;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private initializeSession() {
    // Salvar session ID
    sessionStorage.setItem('analytics_session', this.sessionId);
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  trackEvent(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.events.push(enrichedEvent);
    
    console.log('[Analytics Event]', enrichedEvent);

    // Enviar para servidor se batch estiver cheio
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  trackPageView(pageView: PageView) {
    this.trackEvent({
      category: 'page_view',
      action: 'view',
      label: pageView.path,
      metadata: {
        title: pageView.title,
        referrer: pageView.referrer || document.referrer
      }
    });
  }

  trackClick(elementId: string, elementType: string) {
    this.trackEvent({
      category: 'interaction',
      action: 'click',
      label: elementId,
      metadata: { elementType }
    });
  }

  trackFormSubmit(formName: string, success: boolean) {
    this.trackEvent({
      category: 'form',
      action: 'submit',
      label: formName,
      metadata: { success }
    });
  }

  trackError(error: Error, context?: string) {
    this.trackEvent({
      category: 'error',
      action: 'exception',
      label: error.message,
      metadata: {
        stack: error.stack,
        context
      }
    });
  }

  trackTiming(category: string, variable: string, time: number) {
    this.trackEvent({
      category: 'timing',
      action: variable,
      label: category,
      value: time
    });
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Aqui você enviaria para seu backend ou serviço de analytics
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Recolocar eventos na fila em caso de erro
      this.events.unshift(...eventsToSend);
    }
  }

  // Flush ao sair da página
  setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      if (this.events.length > 0) {
        // Usar sendBeacon para garantir envio
        const blob = new Blob(
          [JSON.stringify({ events: this.events })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/analytics', blob);
      }
    });
  }
}

export const analytics = new Analytics();

// Auto-inicializar
if (typeof window !== 'undefined') {
  analytics.setupBeforeUnload();
}

// Helper hooks
export function useAnalytics() {
  return {
    trackEvent: (event: AnalyticsEvent) => analytics.trackEvent(event),
    trackPageView: (pageView: PageView) => analytics.trackPageView(pageView),
    trackClick: (id: string, type: string) => analytics.trackClick(id, type),
    trackFormSubmit: (name: string, success: boolean) => 
      analytics.trackFormSubmit(name, success),
    trackError: (error: Error, context?: string) => 
      analytics.trackError(error, context),
    setUserId: (userId: string) => analytics.setUserId(userId)
  };
}
