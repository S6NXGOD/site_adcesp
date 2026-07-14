// Service worker do PWA do painel administrativo da ADCESP (escopo /admin).
// Mínimo e seguro: habilita a instalação do app sem cache agressivo, já que
// o painel é dinâmico e depende de rede para os dados.

const CACHE = "adcesp-admin-shell-v1";
const APP_SHELL = ["/admin/login", "/logo_pwa.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!url.pathname.startsWith("/admin")) return;

  // Navegações do painel: rede primeiro, com fallback para o cache (offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(
        () =>
          caches.match(req).then((r) => r || caches.match("/admin/login")) as
            | Promise<Response>
            | Response
      )
    );
  }
});
