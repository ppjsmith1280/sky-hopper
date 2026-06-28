const CACHE_NAME = "flap-tap-v1.0.5";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/background_clouds.png",
  "./assets/background_mountains_day.png",
  "./assets/background_mountains_sunset.png",
  "./assets/background_mountains_night.png",
  "./assets/background_mountains_sunrise.png",
  "./assets/background_trees_day.png",
  "./assets/background_trees_sunset.png",
  "./assets/background_trees_night.png",
  "./assets/background_trees_sunrise.png",
  "./assets/background_plants.png",
  "./assets/title.png",
  "./assets/CRASH.png",
  "./assets/feathers.png",
  "./assets/bird_sheet_day.png",
  "./assets/bird_sheet_sunset.png",
  "./assets/bird_sheet_night.png",
  "./assets/bird_sheet_sunrise.png",
  "./assets/ground.png",
  "./assets/pillar_cap.png",
  "./assets/pillar_base.png",
  "./assets/pillar_column.png",
  "./assets/audio/music.mp3",
  "./assets/audio/flap.mp3",
  "./assets/audio/Crash_main.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const freshResponse = await fetch(request);
    if (freshResponse && freshResponse.ok) {
      await cache.put(request, freshResponse.clone());
    }
    return freshResponse;
  } catch (err) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || cache.match(fallbackUrl);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) return cachedResponse;

  const freshResponse = await fetch(request);

  if (freshResponse && freshResponse.ok) {
    await cache.put(request, freshResponse.clone());
  }

  return freshResponse;
}
