// Service Worker Registration
// Registra e gerencia o Service Worker avançado

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker não suportado neste navegador');
    return null;
  }

  try {
    // 🆕 Hard refresh flag - force cache clear
    const urlParams = new URLSearchParams(window.location.search);
    const forceRefresh = urlParams.has('force-refresh');
    
    if (forceRefresh) {
      console.log('🔥 Force refresh detected - clearing all caches');
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Não desregistrar SWs antigos - deixar o novo assumir o controle
    // A versão do cache (CACHE_VERSION) vai invalidar os caches antigos automaticamente

    // Registrar novo Service Worker
    const registration = await navigator.serviceWorker.register('/sw-advanced.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('✅ Service Worker registrado com sucesso');
    console.log('📍 Scope:', registration.scope);

    // Verificar se há uma atualização disponível
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Nova versão do Service Worker encontrada');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('📊 Estado do novo SW:', newWorker.state);

          if (newWorker.state === 'installed') {
            // 🆕 FASE 3: Limpar TODOS os caches antes de atualizar
            console.log('🆕 Nova versão do app disponível! Limpando cache...');
            
            caches.keys().then(cacheNames => {
              return Promise.all(
                cacheNames.map(name => {
                  console.log('[SW] Deletando cache antigo:', name);
                  return caches.delete(name);
                })
              );
            }).then(() => {
              // Pedir ao novo SW para pular a espera
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Recarregar após limpar cache (usar 'once' para evitar loops)
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Cache limpo, recarregando...');
                window.location.reload();
              }, { once: true });
            });
          }
        });
      }
    });

    // Verificar atualizações periodicamente (a cada 1 hora)
    setInterval(() => {
      console.log('🔍 Verificando atualizações do Service Worker...');
      registration.update();
    }, 60 * 60 * 1000);

    // Forçar verificação de atualização ao ganhar foco
    window.addEventListener('focus', () => {
      registration.update();
    });

    return registration;
  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    return null;
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }

    console.log('🧹 Service Workers desregistrados');
    return true;
  } catch (error) {
    console.error('❌ Erro ao desregistrar Service Workers:', error);
    return false;
  }
}

export async function checkServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  active: boolean;
  waiting: boolean;
}> {
  const supported = 'serviceWorker' in navigator;
  
  if (!supported) {
    return { supported: false, registered: false, active: false, waiting: false };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  
  return {
    supported: true,
    registered: !!registration,
    active: !!registration?.active,
    waiting: !!registration?.waiting
  };
}
