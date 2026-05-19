const CACHE = "caa-neuro-v2";
const STATIC = [
  "/app",
  "/pacientes",
  "/planos",
  "/manifest.json",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Ignorar tudo que não seja da própria origem (Clerk, extensões, externos)
  if (url.origin !== self.location.origin) return;

  // Ignorar extensões de browser
  if (url.protocol === "chrome-extension:" || url.protocol === "moz-extension:") return;

  // APIs sempre vão para rede — nunca cache
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: "offline" }), {
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  // Ignorar POST e outros métodos não-GET
  if (e.request.method !== "GET") return;

  // Imagens dos cards: cache first
  if (url.pathname.startsWith("/cards/")) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => new Response("", { status: 404 }));
      })
    );
    return;
  }

  // Páginas e assets: network first, fallback cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
