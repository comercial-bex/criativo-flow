// BEX 4.0 - Advanced Service Worker
// Version: 4.0.4

const CACHE_VERSION = 'bex-v4.0.4';
const STATIC_CACHE = 'bex-static-v3';
const API_CACHE = 'bex-api-v3';
const PAGES_CACHE = 'bex-pages-v3';
const IMAGE_CACHE = 'bex-images-v3';

// Assets que devem ser cacheados na instalação
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Patterns para diferentes estratégias de cache
const CACHE_PATTERNS = {
  static: [
    /\.(js|css|woff2?|ttf|eot)$/,
    /\/assets\//,
    /\/fonts\//
  ],
  images: [
    /\.(png|jpg|jpeg|svg|gif|webp|ico)$/
  ],
  api: [
    /^https:\/\/xvpqgwbktpfodbuhwqhh\.supabase\.co\/rest/,
    /^https:\/\/xvpqgwbktpfodbuhwqhh\.supabase\.co\/storage/
  ]
};

// ============================================================================
// INSTALL EVENT
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Skip waiting para ativar imediatamente
      return self.skipWaiting();
    })
  );
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Deletar caches antigos
          if (cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== PAGES_CACHE &&
              cacheName !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar controle de todas as páginas imediatamente
      return self.clients.claim();
    })
  );
});

// ============================================================================
// FETCH EVENT - Roteamento de estratégias
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignorar requisições de navegação para auth (deixar o browser resolver)
  if (request.mode === 'navigate' && url.pathname.includes('/auth/')) {
    return;
  }

  // Determinar estratégia baseada no tipo de recurso
  if (matchesPattern(request.url, CACHE_PATTERNS.static)) {
    // ESTRATÉGIA 1: Network-First para JS/CSS, Cache-First para outros
    if (request.url.match(/\.(js|css)$/)) {
      event.respondWith(networkFirst(request, STATIC_CACHE, 500));
    } else {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
  } else if (matchesPattern(request.url, CACHE_PATTERNS.images)) {
    // Cache-First para imagens
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (matchesPattern(request.url, CACHE_PATTERNS.api)) {
    // ESTRATÉGIA 2: Network-First com Fallback para APIs
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (request.mode === 'navigate') {
    // ESTRATÉGIA 3: Network-First para páginas HTML (com fallback)
    event.respondWith(networkFirst(request, PAGES_CACHE, 800));
  } else {
    // Default: Network-First
    event.respondWith(networkFirst(request, API_CACHE));
  }
});

// ============================================================================
// BACKGROUND SYNC EVENT
// ============================================================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync triggered:', event.tag);
  
  if (event.tag === 'bex-sync-queue') {
    event.waitUntil(processOfflineQueue());
  }
});

// ============================================================================
// MESSAGE EVENT - Comunicação com a aplicação
// ============================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

// ============================================================================
// ESTRATÉGIA 1: Cache-First
// Ideal para: assets estáticos, fontes, imagens
// ============================================================================
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  console.log('[SW] Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);
    
    // Cachear apenas respostas válidas
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // Retornar fallback offline page se disponível
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    throw error;
  }
}

// ============================================================================
// ESTRATÉGIA 2: Network-First com Fallback
// Ideal para: APIs, dados dinâmicos
// ============================================================================
async function networkFirst(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    // Tentar buscar da rede com timeout
    const response = await fetchWithTimeout(request, timeout);
    
    // Cachear resposta bem-sucedida
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback para cache
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Returning cached response');
      return cached;
    }
    
    // Se não tem cache, retornar erro
    console.error('[SW] No cache available');
    throw error;
  }
}

// ============================================================================
// ESTRATÉGIA 3: Stale-While-Revalidate
// Ideal para: páginas HTML, conteúdo que pode ser levemente desatualizado
// ============================================================================
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch em background para atualizar cache
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignorar erros de network silenciosamente
  });
  
  // Retornar cache imediatamente se disponível, senão esperar fetch
  return cached || fetchPromise;
}

// ============================================================================
// HELPERS
// ============================================================================

function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url));
}

function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);
    
    fetch(request).then(
      (response) => {
        clearTimeout(timeoutId);
        resolve(response);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

async function processOfflineQueue() {
  console.log('[SW] Processing offline queue');
  
  try {
    // Abrir IndexedDB e processar fila
    const db = await openDB();
    const tx = db.transaction(['offline-queue'], 'readonly');
    const store = tx.objectStore('offline-queue');
    const items = await store.getAll();
    
    console.log(`[SW] Found ${items.length} items in queue`);
    
    for (const item of items) {
      try {
        await syncItem(item);
        
        // Remover item da fila após sucesso
        const deleteTx = db.transaction(['offline-queue'], 'readwrite');
        const deleteStore = deleteTx.objectStore('offline-queue');
        await deleteStore.delete(item.id);
      } catch (error) {
        console.error('[SW] Failed to sync item:', error);
        // Incrementar retry count
      }
    }
    
    return true;
  } catch (error) {
    console.error('[SW] Queue processing failed:', error);
    return false;
  }
}

async function syncItem(item) {
  // Implementar lógica de sincronização com Supabase
  const response = await fetch('https://xvpqgwbktpfodbuhwqhh.supabase.co/rest/v1/' + item.table, {
    method: item.operation === 'INSERT' ? 'POST' : 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto',
      'Authorization': 'Bearer ' + item.token
    },
    body: JSON.stringify(item.data)
  });
  
  if (!response.ok) {
    throw new Error('Sync failed');
  }
  
  return response;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bex-flow-offline', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
  console.log('[SW] All caches cleared');
}

async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage;
  }
  return 0;
}

console.log('[SW] Service Worker loaded v' + CACHE_VERSION);
