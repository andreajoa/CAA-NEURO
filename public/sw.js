const CACHE = "caa-neuro-v8";

// Imagens pré-cacheadas na instalação — usuário nunca vê loading
const CARDS_IMAGES = [
  "/cards/level-1/sim.webp?v=20260521-optimized",
  "/cards/level-1/nao.webp?v=20260521-optimized",
  "/cards/level-1/ajuda.webp?v=20260521-optimized",
  "/cards/level-1/mais.webp?v=20260521-optimized",
  "/cards/level-1/agua.webp?v=20260521-optimized",
  "/cards/level-1/comer.webp?v=20260521-optimized",
  "/cards/level-1/banheiro.webp?v=20260521-optimized",
  "/cards/level-1/dormir.webp?v=20260521-optimized",
  "/cards/level-1/feliz.webp?v=20260521-optimized",
  "/cards/level-1/triste.webp?v=20260521-optimized",
  "/cards/level-1/medo.webp?v=20260521-optimized",
  "/cards/level-1/bravo.webp?v=20260521-optimized",
  "/cards/level-1/brincar.webp?v=20260521-optimized",
  "/cards/level-1/parar.webp?v=20260521-optimized",
  "/cards/level-1/esperar.webp?v=20260521-optimized",
  "/cards/level-1/dor.webp?v=20260521-optimized",
  "/cards/level-1/remedio.webp?v=20260521-optimized",
  "/cards/level-1/escola.webp?v=20260521-optimized",
  "/cards/level-1/tomar-banho.webp?v=20260521-optimized",
  "/cards/level-1/sair.webp?v=20260521-optimized",
  "/cards/level-1/passear.webp?v=20260521-optimized",
  "/cards/level-1/cansado.webp?v=20260521-optimized",
  "/cards/level-1/acabou.webp?v=20260521-optimized",
  "/cards/level-1/me-da.webp?v=20260521-optimized",
  "/cards/level-1/nao-quero.webp?v=20260521-optimized",
];

const STATIC = [
  "/manifest.json",
  "/icon-192-v2.png",
  "/icon-512-v2.png",
];

// Install: pré-cacheia tudo em paralelo
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // Static primeiro (pequeno, rápido)
      await cache.addAll(STATIC);
      // Imagens em paralelo — não bloqueia se uma falhar
      await Promise.allSettled(
        CARDS_IMAGES.map(url =>
          fetch(url).then(res => {
            if (res.ok) cache.put(url, res);
          }).catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: limpa caches antigos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first para imagens, network-first para o resto
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  if (url.origin !== self.location.origin) return;
  if (url.protocol === "chrome-extension:" || url.protocol === "moz-extension:") return;
  if (e.request.method !== "GET") return;

  // APIs e páginas autenticadas: nunca são armazenadas no dispositivo.
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: "offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  // Imagens dos cards: cache-first (instantâneo após primeira visita)
  if (url.pathname.startsWith("/cards/")) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => new Response("", { status: 404 }));
      })
    );
    return;
  }

  // Assets imutáveis do Next e arquivos do PWA podem usar cache-first.
  if (url.pathname.startsWith("/_next/static/") || STATIC.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        return res;
      }))
    );
    return;
  }

  // Documentos e demais respostas seguem somente pela rede para não manter
  // informações clínicas de outra conta no cache compartilhado do navegador.
  e.respondWith(fetch(e.request));
});
