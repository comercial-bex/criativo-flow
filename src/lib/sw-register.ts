// Service Worker Registration
// Registra e gerencia o Service Worker avançado

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker não suportado neste navegador');
    return null;
  }

  try {
    // Desregistrar Service Workers antigos
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      const wasUnregistered = await registration.unregister();
      if (wasUnregistered) {
        console.log('🧹 Service Worker antigo desregistrado');
      }
    }

    // Aguardar um pouco antes de registrar o novo
    await new Promise(resolve => setTimeout(resolve, 100));

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

          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão instalada e há um SW ativo anterior
            console.log('🆕 Nova versão do app disponível!');
            
            // Perguntar ao usuário se deseja atualizar
            const shouldUpdate = confirm(
              'Uma nova versão do BEX está disponível! Deseja atualizar agora?'
            );

            if (shouldUpdate) {
              // Pedir ao novo SW para pular a espera
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Recarregar a página quando o novo SW estiver ativo
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Recarregando para aplicar atualização...');
                window.location.reload();
              });
            }
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
