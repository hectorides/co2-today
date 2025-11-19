const CACHE_NAME = "co2-app-shell-v1";
const FILES_TO_CACHE = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network first for everything, cache fallback for shell
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
