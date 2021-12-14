const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/index.html"
];

// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME)
      .then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  const current = [CACHE_NAME, DATA_CACHE_NAME];
  evt.waitUntil(
    caches.keys().then((cacheName) => {
      return cacheName.filter((cacheName) => !current.includes(cacheName));
    })
      .then((deletedCaches) => {
        return Promise.all(
          deletedCaches.map((cachesToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      }),
    self.clients.claim()
  );
});

// fetch
self.addEventListener("fetch", function (evt) {
  if (evt.request.method !== "GET" || !evt.request.url.startsWith(self.location.origin)
  ) {
    evt.respondWith(
      fetch(evt.request));
    return;
  }
  if (evt.request.url.includes("/api/transaction")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then((response) => {
            cache.put(evt.request, response.clone());
            return response;
          })
          .catch(() => caches.match(evt.request));
      })
    );
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((cacheResponse) => {
      if (cacheResponse) {
        return cacheResponse;
      }

      return caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request).then((response) => {
          return cache.put(evt.request, response.clone()).then(() => {
            return response;
          })
        });
      });
    })
  );
});

