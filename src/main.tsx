import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/introjs-theme.ts";
import { registerServiceWorker } from "./lib/sw-register";
import { syncManager } from "./lib/sync-manager";

// 🛡️ Global error handlers (captura erros antes do React montar)
window.onerror = (msg, src, line, col, err) => {
  console.error('[GLOBAL ERROR]', { msg, src, line, col, err });
  return false;
};

window.onunhandledrejection = (e) => {
  console.error('[UNHANDLED REJECTION]', e.reason || e);
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

// Registrar Service Worker APENAS para mobile/PWA instalado
if (import.meta.env.PROD) {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  
  if (isStandalone || isMobileUA) {
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('🚀 PWA ativo! Service Worker registrado (Mobile/Standalone)');
        syncManager.startMonitoring();
      }
    }).catch(error => {
      console.error('❌ Erro ao ativar PWA:', error);
    });
  } else {
    console.log('🌐 Desktop/Tablet Web - PWA desativado, modo navegador padrão');
    syncManager.startMonitoring();
  }
} else {
  console.log('🔧 Modo desenvolvimento - Service Worker desativado');
  syncManager.startMonitoring();
}
