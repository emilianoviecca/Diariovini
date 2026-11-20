// Service worker: l'app funziona anche offline (la ricerca dei codici richiede rete).
const CACHE = 'sorsi-v6';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/db.js', 'js/media.js', 'js/scanner.js', 'js/lookup.js', 'js/wine-knowledge.js', 'js/ai.js', 'js/version.js',
  'vendor/exifr.lite.umd.js', 'vendor/zxing.min.js', 'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'vendor/leaflet/images/marker-icon.png', 'vendor/leaflet/images/marker-icon-2x.png', 'vendor/leaflet/images/marker-shadow.png',
  'icons/icon.svg', 'img/paper.svg', 'img/empty.svg', 'img/stain-ring.svg', 'img/stain-rings.svg', 'img/stain-splash.svg', 'img/stain-drops.svg',
  'vendor/fonts/fraunces-latin-400-normal.woff2', 'vendor/fonts/fraunces-latin-600-normal.woff2', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // API esterne: sempre rete
  // Rete prima (così gli aggiornamenti arrivano subito), cache se offline.
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
