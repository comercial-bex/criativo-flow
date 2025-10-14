import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/introjs-theme.ts";
import { registerServiceWorker } from "./lib/sw-register";
import { syncManager } from "./lib/sync-manager";

createRoot(document.getElementById("root")!).render(<App />);

// Registrar Service Worker e iniciar monitoramento de sync
if (import.meta.env.PROD) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log('🚀 PWA ativo! Service Worker registrado');
      syncManager.startMonitoring();
    }
  }).catch(error => {
    console.error('❌ Erro ao ativar PWA:', error);
  });
} else {
  console.log('🔧 Modo desenvolvimento - Service Worker desativado');
  syncManager.startMonitoring();
}
