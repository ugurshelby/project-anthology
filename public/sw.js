/* APEX service worker (Faz 2).
 *
 * Strategy:
 *  - Navigations (HTML pages): network-first, fall back to cache, then to the
 *    offline shell. Keeps content fresh online, usable offline.
 *  - Static assets (_next/static, /icons, fonts, images): cache-first.
 *  - API / cron / monitoring / RSS: never cached — always hit the network.
 *
 * Bump CACHE_VERSION to invalidate old caches on deploy.
 */
const CACHE_VERSION = 'apex-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const OFFLINE_URL = '/';

// Paths the worker must never touch — dynamic/sensitive endpoints.
const BYPASS = ['/api/', '/monitoring', '/feed.xml', '/sitemap.xml', '/robots.txt'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isBypassed(url) {
  return BYPASS.some((p) => url.pathname.startsWith(p));
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:js|css|woff2?|png|jpg|jpeg|webp|svg|ico|avif)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle same-origin; let cross-origin (news CDNs, Supabase, Vercel) pass.
  if (url.origin !== self.location.origin) return;
  if (isBypassed(url)) return;

  // Static assets → cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Navigations / HTML → network-first, fall back to cache, then offline shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, res.clone());
          }
          return res;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match(request)) || (await cache.match(OFFLINE_URL));
        }
      })(),
    );
  }
});
