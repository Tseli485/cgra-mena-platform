/* Service Worker — Plateforme MENA Tuteur
   Stratégie : network-first pour HTML/JSON (toujours à jour, fallback hors ligne),
   cache-first pour les assets statiques. Version bumpée pour purger les anciens caches. */
const CACHE = 'mena-v20';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './icon-192.png',
  './icon-512.png',
  './js/nl-fr-dict.js',
  './js/data/guide-data.json',
  './js/data/intervenants-data.json',
  './js/data/hebergements-data.json',
  './data/lifecycle-data.json',
  './js/data/cases-data.json',
  './data/resources.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Cache chaque asset individuellement : un 404 ne fait pas échouer tout le precache
      Promise.allSettled(CORE.map((u) => cache.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin || request.method !== 'GET') return;

  const isHTML = request.mode === 'navigate' || request.destination === 'document';
  const isJSON = url.pathname.endsWith('.json');

  if (isHTML || isJSON) {
    // network-first : on récupère toujours la dernière version si en ligne
    event.respondWith(
      fetch(request)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // cache-first pour le reste (CSS, JS, images, polices)
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((resp) => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return resp;
      }).catch(() => cached)
    )
  );
});
