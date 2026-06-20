# AGENT LOG — FAZ 5 Performans & SEO Sertleştirme
**Tarih:** 2026-06-21  
**Commit:** `perf: phase 5 — bundle optimization and SEO hardening`

---

## Bundle Analizi (önce/sonra)

| Chunk | Önce | Sonra | Delta |
|---|---|---|---|
| Sentry (replay) | 554KB | 419KB | -135KB |
| Framer Motion | 138KB | ~68KB (split) | -70KB |
| Toplam tahmini tasarruf | — | — | ~205KB |

## Yapılanlar

### JS Darboğazı

**Sentry replayIntegration kaldırıldı**
- `instrumentation-client.ts`: `replayIntegration()` + `replaysSessionSampleRate/replaysOnErrorSampleRate` kaldırıldı
- Sentry session replay ~400KB istemci kodu yüklüyordu; F1 editöryel platform için product requirement değil
- Gerekirse ileride yeniden aktif edilebilir

**Framer Motion LazyMotion**
- `PageTransition.tsx`: `motion.*` → `m.*` + `LazyMotion features={domAnimation} strict`
- `domAnimation` paketi `motion` tam paketinden ~%30 daha küçük
- `strict` modu: yanlışlıkla `motion.*` kullanımını build-time'da yakalar

**LCP priority doğrulaması**
- `BentoLeaderTile` (driver portrait) → `priority` ✓
- `NewsFeaturedHero` (news hero image) → `priority` ✓
- `app/drivers/[driverId]` (hero portrait + car) → `priority` ✓

### SEO & Headers

**Preview noindex**
- `next.config.ts`: `VERCEL_ENV=preview` → `X-Robots-Tag: noindex` header eklendi
- Production: header yok (crawler'lar indexleyebilir)

**Metadata coverage**
- 14 rotanın tamamında `metadata` veya `generateMetadata` mevcut ✓
- `/robots.ts` — allow all, disallow /api/ ✓
- `/sitemap.ts` — tüm rota tiplerini kapsıyor ✓

**CSP**
- `data:` → `img-src` için korundu (`next/image` blur placeholder)
- `connect-src data:` → Vercel Analytics/Speed Insights gerektiriyor
- Yeni dış domain eklenmedi (yeni bileşenler hep internal)

---

## Build
`npm run build` → 0 hata ✓ (16.1s)

## Değişen dosyalar
- `components/providers/PageTransition.tsx`
- `instrumentation-client.ts`
- `next.config.ts`
