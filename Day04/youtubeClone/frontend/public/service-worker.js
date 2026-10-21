const CACHE_NAME = "youtube-clone-app-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        const response = await fetch("/");
        if (!response.ok) throw new Error("Unable to cache the app shell.");
        const html = await response.clone().text();
        await cache.put("/", response);
        const assets = [
          ...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g),
        ].map((match) => match[1]);
        await cache.addAll(assets);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("youtube-clone-app-") &&
                cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    const networkResponse = fetch(request);
    event.waitUntil(
      networkResponse
        .then((response) =>
          response.ok
            ? caches
                .open(CACHE_NAME)
                .then((cache) => cache.put("/", response.clone()))
            : undefined,
        )
        .catch((error) => console.warn("Unable to cache the app shell.", error)),
    );
    event.respondWith(
      networkResponse.catch(async () => {
        const cachedPage = await caches.match("/");
        if (cachedPage) return cachedPage;
        return new Response("The app is not available offline yet.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
    );
    return;
  }

  if (!requestUrl.pathname.startsWith("/assets/")) return;

  const networkResponse = fetch(request);
  event.waitUntil(
    networkResponse
      .then((response) =>
        response.ok
          ? caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, response.clone()))
          : undefined,
      )
      .catch((error) => console.warn("Unable to cache an app asset.", error)),
  );
  event.respondWith(
    caches.match(request).then((cachedAsset) => {
      if (cachedAsset) return cachedAsset;
      return networkResponse;
    }),
  );
});
