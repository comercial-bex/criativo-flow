// ========================================
// SENTRY CONFIGURATION - FASE 3 MONITORING
// ========================================
// Configuração centralizada para error tracking e performance monitoring

import * as Sentry from "@sentry/react";

export const initializeSentry = () => {
  // Só inicializar em produção
  if (import.meta.env.MODE !== 'production') {
    console.log('🔍 Sentry desabilitado em desenvolvimento');
    return;
  }

  try {
    Sentry.init({
      // 🔒 SECURITY: DSN deve ser configurado via variável de ambiente
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      
      // Performance Monitoring (simplified - BrowserTracing requer @sentry/tracing)
      tracesSampleRate: 0.1, // 10% das transações
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: `bex-v4.0.7`,

      // Filtros de erro
      beforeSend(event, hint) {
        // Não enviar erros de network timeout (já monitorados via PWA)
        if (event.exception?.values?.[0]?.value?.includes('timeout')) {
          return null;
        }

        // Não enviar erros de chunk loading (usuário pode estar offline)
        if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
          return null;
        }

        // Log local antes de enviar
        console.error('🚨 Erro capturado pelo Sentry:', hint.originalException || event);
        
        return event;
      },

      // Ignore lista de erros conhecidos
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'canvas.contentDocument',
        // Network errors já tratados
        'NetworkError',
        'Failed to fetch',
        // ResizeObserver (não crítico)
        'ResizeObserver loop limit exceeded',
      ],
    });

    console.log('✅ Sentry inicializado com sucesso');
  } catch (error) {
    console.error('❌ Falha ao inicializar Sentry:', error);
  }
};

// ========================================
// HELPERS PARA LOGGING CUSTOMIZADO
// ========================================

export const logUserAction = (action: string, metadata?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data: metadata,
  });
};

export const logPerformance = (metric: string, value: number, unit: string = 'ms') => {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric}: ${value}${unit}`,
    level: 'info',
    data: { metric, value, unit },
  });
};

export const logApiCall = (endpoint: string, status: number, duration: number) => {
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${endpoint} - ${status}`,
    level: status >= 400 ? 'error' : 'info',
    data: { endpoint, status, duration },
  });
};

export const setUserContext = (userId: string, email?: string, role?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};
