// Service worker : permet à l'app de fonctionner hors ligne.
// Si tu modifies index.html, change V (ex : indices-v2) pour forcer la mise à jour.
const V = 'indices-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réponse immédiate depuis le cache, mise à jour en arrière-plan.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(r => {
        if (r.ok && new URL(e.request.url).origin === location.origin) {
          const copy = r.clone();
          caches.open(V).then(c => c.put(e.request, copy));
        }
        return r;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
