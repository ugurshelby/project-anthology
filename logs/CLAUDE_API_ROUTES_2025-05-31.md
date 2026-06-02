# AGENT LOG — Core API Routes

Tarih: 2025-05-31
Konu: Next.js App Router çekirdek API route'ları (news, f1-season, f1-live, health)

## Ne yapıldı
- Görev tanımındaki yolların repoyla uyuşmadığı tespit edildi ve buna göre uyarlandı (aşağıda "Sapmalar").
- Plan dosyası yazıldı: `docs/plans/PLAN_API_ROUTES_2025-05-31.md`.
- Paylaşılan Next-safe yardımcılar oluşturuldu:
  - `lib/apiLogger.ts` — `logRequest()` (method, path, status, duration konsola).
  - `lib/f1Proxy.ts` — `api/proxy-helpers.ts`'ten SSRF/CORS saf fonksiyonlarının portu: `sanitizeProxyPath`, `assertProxyUrlWithinLimit`, `isOpenF1LiveForCacheControl`, `appendPassthroughParams`, `getAllowedOrigin(NextRequest)`, `corsHeaders`.
- 4 route App Router formatında yazıldı (`export async function GET`, `NextRequest`/`NextResponse`):
  - `app/api/news/route.ts` — çok kaynaklı RSS, F1 filtre, dedupe + başlık kümeleme, rate limit (30/dk/IP), CORS. Cache `s-maxage=300, stale-while-revalidate=600`.
  - `app/api/f1-season/route.ts` — Ergast (Jolpica) proxy + path allowlist. Sezon farkındalıklı cache: `getF1Context()` ile current sezon → `s-maxage=300`, historical → `s-maxage=86400`.
  - `app/api/f1-live/route.ts` — OpenF1 proxy + path allowlist. Canlı seans → `no-store`, değilse `s-maxage=30, stale-while-revalidate=60`.
  - `app/api/health/route.ts` — `{ status:'ok', timestamp, version:'2.0.0' }`, `no-store`.
- Tüm route'lar: try/catch + JSON hata; her isteği konsola logluyor; `runtime='nodejs'`, `dynamic='force-dynamic'`.

## Sapmalar (görev tanımı vs gerçek repo)
- `src/` yok → route'lar `app/api/` altına (kökte App Router).
- `migration-source/api/*` yok (sadece story/radio içeriği) → kaynak mantık kökteki `api/` klasöründen alındı.
- `src/lib/logger.ts` yok; `utils/logger.ts` Vite (`import.meta.env`) tabanlı, Next sunucusunda çalışmaz → yerine `lib/apiLogger.ts` yazıldı.
- `@vercel/node` kurulu değil + tsconfig `api` ve `utils`'i exclude ediyor → eski handler'lar import edilmedi, saf yardımcılar `lib/f1Proxy.ts`'e yeniden yazıldı.

## Değişen / eklenen dosyalar
- + `docs/plans/PLAN_API_ROUTES_2025-05-31.md`
- + `lib/apiLogger.ts`
- + `lib/f1Proxy.ts`
- + `app/api/news/route.ts`
- + `app/api/f1-season/route.ts`
- + `app/api/f1-live/route.ts`
- + `app/api/health/route.ts`
- + `logs/CLAUDE_API_ROUTES_2025-05-31.md`

## Çalıştırılan komutlar
- `npx tsc --noEmit` → exit 0 (sıfır hata)
- `npm run build` → exit 0 (4 route ƒ Dynamic olarak listelendi)

## Karşılaşılan hatalar ve çözümleri
1. Build type hatası: route dosyasından `processFeeds`/`NewsItem` export edilmesi App Router'da yasak ("does not satisfy the constraint { [x:string]: never }"). → Bu iki sembolden `export` kaldırıldı (route içinde local kullanılıyor).
2. `ENOENT pages-manifest.json` ve `.next/types/.../route.ts not found`: bayat `.next` + `tsconfig.tsbuildinfo` kaynaklı. → `rm -rf .next tsconfig.tsbuildinfo` sonrası build temiz geçti.

## Sonraki adım
- Route'ları çağıran frontend/util'leri yeni `/api/*` uçlarına bağlamak (örn. `utils/newsService.ts`, `lib/f1Calendar.ts` zaten `/api/f1-season` kullanıyor).
- İsteğe bağlı: eski kök `api/` (Vercel handler) dosyalarının kaldırılması/arşivlenmesi.
