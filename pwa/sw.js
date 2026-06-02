const CACHE_NAME = 'cgra-v1';
const RUNTIME_CACHE = 'cgra-runtime-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json'
];

// Install event: cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event fired');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event fired');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event: network-first strategy with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Cache-first for static assets
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] Cache hit:', request.url);
            return response;
          }
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            })
            .catch(() => {
              console.warn('[SW] Fetch failed, returning offline response:', request.url);
              return caches.match(request) || new Response('Offline', { status: 503 });
            });
        })
    );
    return;
  }

  // Network-first for documents and API calls
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE)
          .then((cache) => {
            cache.put(request, responseClone);
          });
        return response;
      })
      .catch(() => {
        console.warn('[SW] Network failed, checking cache:', request.url);
        return caches.match(request)
          .then((response) => {
            if (response) {
              console.log('[SW] Serving from cache (offline):', request.url);
              return response;
            }
            console.warn('[SW] No cached response available:', request.url);
            return new Response('Offline - Page not cached', { status: 503 });
          });
      })
  );
});

// Message handler for cache updates
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync (optional)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              message: 'Background sync completed'
            });
          });
        })
    );
  }
});
