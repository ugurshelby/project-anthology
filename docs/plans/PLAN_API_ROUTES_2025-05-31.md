# PLAN — Core API Routes (Next.js App Router)

Tarih: 2025-05-31

## Bağlam / Sapma Notu
Görev tanımı `src/app/api/` + `migration-source/api/*.ts` yollarını söylüyor; bu repoda:
- `src/` YOK — App Router kökte: `app/`
- API kaynak mantığı kökteki `api/` klasöründe (`news.ts`, `f1-season.ts`, `f1-live.ts`, `health.ts`, `proxy-helpers.ts`). `migration-source/` sadece story/radio içeriği barındırıyor.
- Logger `utils/logger.ts`'de ama Vite (`import.meta.env`) tabanlı → Next sunucusunda çalışmaz. `lib/logger.ts` yok.
- `@vercel/node` kurulu DEĞİL → eski `api/*` dosyaları import edilemez (tsconfig'de `api` zaten exclude).

Karar: Route'lar **`app/api/`** altına yazılır; paylaşılan yardımcılar Next-safe olarak **`lib/`** altında yeniden yazılır.

## Adımlar
1. `lib/apiLogger.ts` — `logRequest(route, method, path, status, startedAt)` console logger (Node-safe).
2. `lib/f1Proxy.ts` — `proxy-helpers.ts`'ten saf fonksiyonların Next portu: `sanitizeProxyPath` (SSRF allowlist), `assertProxyUrlWithinLimit`, `isOpenF1LiveForCacheControl`, `getAllowedOrigin(NextRequest)`, `corsHeaders`.
3. `app/api/news/route.ts` — çok kaynaklı RSS, F1 filtre, dedupe/cluster, rate limit, CORS. Cache `s-maxage=300, stale-while-revalidate=600`.
4. `app/api/f1-season/route.ts` — Ergast proxy + path allowlist. Cache: `getF1Context()` ile sezon tespiti → current `s-maxage=300`, historical `s-maxage=86400`.
5. `app/api/f1-live/route.ts` — OpenF1 proxy + path allowlist. Canlı seans → `no-store`, değilse `s-maxage=30, stale-while-revalidate=60`.
6. `app/api/health/route.ts` — `{ status:'ok', timestamp, version:'2.0.0' }`, `no-store`.

## Ortak Kurallar
- `NextRequest`/`NextResponse`, `export async function GET`.
- Her route: try/catch + JSON error; console log (method, path, duration, status).
- `runtime='nodejs'`, dinamik route'larda `dynamic='force-dynamic'`.
- TS strict, `any` yok.

## Doğrulama
- `npx tsc --noEmit` → 0 hata
- `npm run build` → geçer
