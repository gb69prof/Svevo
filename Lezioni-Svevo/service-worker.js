const CACHE_NAME = 'svevo-pwa-v1';
const PRECACHE_URLS = [
  "./",
  "./assets/css/app.css",
  "./assets/img/Alberta.PNG",
  "./assets/img/Deflagrazione.PNG",
  "./assets/img/Donne.PNG",
  "./assets/img/Dottor-S.PNG",
  "./assets/img/Immagine-mondo.PNG",
  "./assets/img/Influenze.PNG",
  "./assets/img/Lettera.PNG",
  "./assets/img/Manzoni-Svevo.PNG",
  "./assets/img/Padre.PNG",
  "./assets/img/Svevo-foto.PNG",
  "./assets/img/icon-128.png",
  "./assets/img/icon-144.png",
  "./assets/img/icon-152.png",
  "./assets/img/icon-180.png",
  "./assets/img/icon-192.png",
  "./assets/img/icon-384.png",
  "./assets/img/icon-512.png",
  "./assets/img/icon-72.png",
  "./assets/img/icon-96.png",
  "./assets/js/app.js",
  "./assets/js/pwa.js",
  "./assets/pdf/1-Svevo-biografia.pdf",
  "./assets/pdf/10-ZENO E IL PADRE.pdf",
  "./assets/pdf/11-ALBERTA.pdf",
  "./assets/pdf/12-Zeno e le donne.pdf",
  "./assets/pdf/13-LaDeflagrazioneFinale.pdf",
  "./assets/pdf/2-Svevo, studi e immagine del mondo.pdf",
  "./assets/pdf/3-LETTERA DI SVEVO.pdf",
  "./assets/pdf/4-Introduzione alla Coscienza di Zeno.pdf",
  "./assets/pdf/5-RiassuntoCoscienza.pdf",
  "./assets/pdf/6-PrefazioneDotS.pdf",
  "./assets/pdf/7-Manzoni - manoscritto.pdf",
  "./assets/pdf/8-Le due prefazioni a confronto.pdf",
  "./assets/pdf/9-I personaggi principali.pdf",
  "./index.html",
  "./lezione-01.html",
  "./lezione-02.html",
  "./lezione-03.html",
  "./lezione-04.html",
  "./lezione-05.html",
  "./lezione-06.html",
  "./lezione-07.html",
  "./lezione-08.html",
  "./lezione-09.html",
  "./lezione-10.html",
  "./lezione-11.html",
  "./lezione-12.html",
  "./lezione-13.html",
  "./manifest.json",
  "./offline.html",
  "./service-worker.js"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isNavigation(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // HTML: network-first (fresh), fallback to cache/offline
  if (isNavigation(req)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone());
        return net;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || caches.match('./offline.html');
      }
    })());
    return;
  }

  // PDFs, images, css/js: cache-first, then network
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});