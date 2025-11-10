import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/introjs-theme.ts";
import { registerServiceWorker } from "./lib/sw-register";
import { syncManager } from "./lib/sync-manager";
import { initializeSentry } from "./lib/sentry-config";
import { setupSessionRefresh } from "./lib/supabase-session-handler";

// 🔍 FASE 3: Initialize Sentry (production only)
initializeSentry();

// 🔐 Setup Supabase session refresh handler
setupSessionRefresh();

// 🛡️ Signal React is starting
(window as any).__reactStarted = true;
console.log('🚀 React starting...');

// 🛡️ Global error handlers (captura erros antes do React montar)
window.onerror = (msg, src, line, col, err) => {
  console.error('[GLOBAL ERROR]', { msg, src, line, col, err });
  return false;
};

// ✅ FASE 4: Proteção contra VersionError de IndexedDB
window.onunhandledrejection = (e) => {
  console.error('[UNHANDLED REJECTION]', e.reason || e);
  
  // Se for VersionError, tentar recuperar automaticamente
  if (e.reason?.name === 'VersionError' || String(e.reason).includes('VersionError')) {
    console.warn('⚠️ VersionError detectado no IndexedDB, limpando banco...');
    
    // Prevenir propagação do erro
    e.preventDefault();
    
    // Limpar IndexedDB completamente
    try {
      const dbName = 'bex-flow-offline';
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('✅ IndexedDB limpo com sucesso, recarregando em 1s...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      };
      
      deleteRequest.onerror = () => {
        console.error('❌ Erro ao limpar IndexedDB, recarregando mesmo assim...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      };
    } catch (err) {
      console.error('❌ Erro ao tentar limpar IndexedDB:', err);
      // Recarregar mesmo em caso de erro
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
};

// 🚀 Render com proteção contra crash
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('❌ ERRO CRÍTICO ao montar React:', error);
  
  // Fallback visual em caso de erro crítico
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0a;
        color: #fff;
        font-family: system-ui;
        padding: 2rem;
      ">
        <div style="max-width: 500px; text-align: center;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Erro ao Carregar</h1>
          <p style="margin-bottom: 2rem; color: #888;">
            Ocorreu um erro ao iniciar o aplicativo. 
            Por favor, recarregue a página ou limpe o cache do navegador.
          </p>
          <button 
            onclick="window.location.href = window.location.origin + '?force-refresh=1'"
            style="
              background: #6366f1;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            🔄 Recarregar e Limpar Cache
          </button>
          <details style="margin-top: 2rem; text-align: left; background: #1a1a1a; padding: 1rem; border-radius: 0.5rem;">
            <summary style="cursor: pointer; font-weight: bold;">Ver Detalhes do Erro</summary>
            <pre style="margin-top: 1rem; font-size: 0.875rem; overflow-x: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
          </details>
        </div>
      </div>
    `;
  }
}

// Detecção de versão antiga e limpeza automática
if (import.meta.env.PROD) {
  const APP_VERSION = '4.0.4';
  const storedVersion = localStorage.getItem('app-version');
  
  if (storedVersion && storedVersion !== APP_VERSION) {
    console.log(`🔄 Nova versão detectada (${storedVersion} → ${APP_VERSION}), limpando cache antigo...`);
    caches.keys().then(keys => 
      Promise.all(keys.map(k => {
        if (k.includes('bex-v3') || k.includes('bex-v2') || k.includes('bex-v4.0.2') || k.includes('bex-v4.0.3')) {
          console.log(`🧹 Removendo cache antigo: ${k}`);
          return caches.delete(k);
        }
        return Promise.resolve();
      }))
    );
  }
  
  localStorage.setItem('app-version', APP_VERSION);
  console.log(`🎮 BEX Flow v${APP_VERSION} - Performance Fix`);
  
  // 🔍 Detectar ambiente Lovable preview
  const isLovablePreview = window.location.hostname.includes('lovable.dev') || 
                           window.location.hostname.includes('lovable.app') ||
                           window.location.hostname.includes('lovableproject.com');
  
  if (isLovablePreview) {
    console.log('🔧 Lovable preview detectado - SW desativado para evitar CORS');
    syncManager.startMonitoring();
  } else {
    // ✅ Service Worker ATIVADO apenas em produção real
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('✅ Service Worker ativo');
        syncManager.startMonitoring();
      }
    }).catch(error => {
      console.error('❌ Erro ao registrar SW:', error);
      syncManager.startMonitoring();
    });
  }

  // 📊 Diagnóstico de performance no boot
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      const metrics = {
        'DNS': perfData.domainLookupEnd - perfData.domainLookupStart,
        'TCP': perfData.connectEnd - perfData.connectStart,
        'TTFB': perfData.responseStart - perfData.requestStart,
        'Download': perfData.responseEnd - perfData.responseStart,
        'DOM Processing': perfData.domComplete - perfData.domContentLoadedEventStart,
        'Total Load': perfData.loadEventEnd - perfData.fetchStart
      };
      
      console.log('📊 [BOOT METRICS]', {
        'DNS': `${metrics.DNS}ms`,
        'TCP': `${metrics.TCP}ms`,
        'TTFB': `${metrics.TTFB}ms`,
        'Download': `${metrics.Download}ms`,
        'DOM Processing': `${metrics['DOM Processing']}ms`,
        'Total Load': `${metrics['Total Load']}ms`
      });
      
      // Calcular saúde estimada
      const health = {
        ttfb: metrics.TTFB < 600 ? 'good' : metrics.TTFB < 1000 ? 'ok' : 'poor',
        total: metrics['Total Load'] < 3000 ? 'good' : metrics['Total Load'] < 5000 ? 'ok' : 'poor',
        estimatedScore: metrics.TTFB < 600 && metrics['Total Load'] < 3000 ? 90 :
                       metrics.TTFB < 1000 && metrics['Total Load'] < 5000 ? 65 : 35
      };
      
      console.log('💚 [HEALTH]', health);
    }
  });
} else {
  console.log('🔧 Modo desenvolvimento - Service Worker desativado');
  syncManager.startMonitoring();
}
