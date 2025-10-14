// Legacy SW cleaner to migrate from old /sw.js to /sw-advanced.js
const LEGACY_CACHE = 'legacy-bex-cleaner';

self.addEventListener('install', () => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {}

    try {
      await self.clients.claim();
    } catch (e) {}

    try {
      await self.registration.unregister();
    } catch (e) {}

    try {
      const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsArr) {
        try { client.navigate(client.url); } catch (e) {}
      }
    } catch (e) {}
  })());
});

self.addEventListener('fetch', (event) => {
  // Always go to network to break stale cache loops
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
