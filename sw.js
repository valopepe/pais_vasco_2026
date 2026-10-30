const CACHE_PREFIX = "pais-vasco-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const ASSETS = [
  "./",
  "index.html",
  "index.css",
  "app.js",
  "data.js",
  "manifest.json",
  "assets/images/icon-192.png",
  "assets/images/icon-512.png",
  "assets/images/bilbao_ria.jpg",
  "assets/images/bilbao_guggenheim.jpg",
  "assets/images/zumaia_flysch.jpg",
  "assets/images/donostia_concha.jpg",
  "assets/images/gaztelugatxe.jpg",
  "assets/images/vitoria_plaza.jpg",
  "assets/images/llanes_cubos.jpg"
];

// Install Event - Pre-cache assets (images included, for use without coverage) and skip waiting
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches of this app only: other trip apps may share the origin
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First, fallback to Cache (same-origin only)
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(response => {
        if (response.ok) {
          // Update cache with fresh copy
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("index.html");
        return Response.error();
      }))
  );
});
