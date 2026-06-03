const CACHE_VERSION = 2;
const CACHE_NAME = `cgra-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `cgra-runtime-v${CACHE_VERSION}`;

// Precache manifest: essential assets for offline functionality
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json'
];

// BATCH 2: Lifecycle and Cases data + modules
const BATCH2_ASSETS = [
  '/pwa/js/data/lifecycle-data.json',
  '/pwa/js/data/cases-data.json',
  '/pwa/js/data/cases-indexes.json',
  '/pwa/js/modules/lifecycle.js',
  '/pwa/js/modules/cases.js'
];

// Combined precache list
const ALL_PRECACHE_ASSETS = [...ASSETS_TO_CACHE, ...BATCH2_ASSETS];

// Install event: cache essential assets and BATCH 2 content
self.addEventListener('install', (event) => {
  console.log('[SW] Install event fired - cache version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching precache manifest:', ALL_PRECACHE_ASSETS.length, 'assets');
        return cache.addAll(ALL_PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Precache complete - skipping waiting');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache install failed:', err);
      })
  );
});

// Activate event: clean up old cache versions and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event fired - cache version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[SW] Cleaning up old caches, current version:', CACHE_VERSION);
        return Promise.all(
          cacheNames
            .filter((name) => {
              const isOld = name !== CACHE_NAME &&
                           name !== RUNTIME_CACHE &&
                           !name.includes(`cgra-v${CACHE_VERSION}`);
              if (isOld) {
                console.log('[SW] Marking for deletion:', name);
              }
              return isOld;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache version:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Cache cleanup complete - claiming clients');
        return self.clients.claim();
      })
      .catch((err) => {
        console.error('[SW] Activation failed:', err);
      })
  );
});

// Helper: check if URL is a BATCH 2 data file
function isBatch2DataFile(url) {
  return url.includes('/pwa/js/data/') && url.endsWith('.json');
}

// Helper: check if URL is a BATCH 2 module
function isBatch2Module(url) {
  return url.includes('/pwa/js/modules/') &&
         (url.includes('lifecycle.js') || url.includes('cases.js'));
}

// Fetch event: multi-strategy caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Cache-first for BATCH 2 data files (lifecycle/cases JSON)
  if (isBatch2DataFile(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] BATCH2 data cache hit:', request.url);
            return response;
          }
          console.log('[SW] BATCH2 data fetching from network:', request.url);
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('[SW] BATCH2 data cached:', request.url);
                  cache.put(request, responseClone);
                });
              return response;
            })
            .catch(() => {
              console.warn('[SW] BATCH2 data fetch failed, serving from cache:', request.url);
              return caches.match(request) || new Response('Offline - BATCH2 data unavailable', { status: 503 });
            });
        })
    );
    return;
  }

  // Cache-first for BATCH 2 modules (lifecycle.js, cases.js)
  if (isBatch2Module(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] BATCH2 module cache hit:', request.url);
            return response;
          }
          console.log('[SW] BATCH2 module fetching from network:', request.url);
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('[SW] BATCH2 module cached:', request.url);
                  cache.put(request, responseClone);
                });
              return response;
            })
            .catch(() => {
              console.warn('[SW] BATCH2 module fetch failed, serving from cache:', request.url);
              return caches.match(request) || new Response('Offline - BATCH2 module unavailable', { status: 503 });
            });
        })
    );
    return;
  }

  // Cache-first for static assets (CSS, JS, fonts)
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] Static asset cache hit:', request.url);
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
              console.warn('[SW] Static asset fetch failed, offline:', request.url);
              return caches.match(request) || new Response('Offline', { status: 503 });
            });
        })
    );
    return;
  }

  // Network-first for documents and other requests
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

// Message handler for cache updates and control commands
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);

  if (!event.data) return;

  // Update control: skip waiting for new version
  if (event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING command received');
    self.skipWaiting();
  }

  // Cache invalidation: remove specific BATCH 2 cache entries
  if (event.data.type === 'INVALIDATE_BATCH2') {
    console.log('[SW] INVALIDATE_BATCH2 command received');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          const urlsToInvalidate = [
            '/pwa/js/data/lifecycle-data.json',
            '/pwa/js/data/cases-data.json',
            '/pwa/js/data/cases-indexes.json'
          ];
          return Promise.all(
            urlsToInvalidate.map((url) => {
              console.log('[SW] Invalidating cache entry:', url);
              return cache.delete(url);
            })
          );
        })
        .then(() => {
          console.log('[SW] BATCH2 cache invalidation complete');
        })
    );
  }

  // Cache cleanup: delete all old cache versions
  if (event.data.type === 'CLEANUP_OLD_CACHES') {
    console.log('[SW] CLEANUP_OLD_CACHES command received');
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
              .map((name) => {
                console.log('[SW] Deleting cache during cleanup:', name);
                return caches.delete(name);
              })
          );
        })
    );
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
