# AGENT — Apex Faz 2: Estetik İyileştirme + Güvenlik (2026-06-22)

Kullanıcı görsel geri bildirimi (home/driver/grid'de boş alan + asset az kullanımı) + backend
güvenlik/SEO/reverse-eng sertleştirme talebi. `ui-ux-pro-max` ile gözden geçirildi.

## Frontend (estetik + public/ asset kullanımı)

- **DriverAvatar** (`components/bento/DriverAvatar.tsx`): portre yoksa monogram fallback (boş daire bitti).
  Uygulandı: `GridCards` (DriverCard), `StandingsRow` (DriverRow), `DriverLineup`.
- **Home** (`app/page.tsx`): hero circuit outline belirginleşti + accent glow; Championship Leader kartı
  lider portresi + araç SVG silueti + puan farkı + tıklanabilir; Featured Story kartı (anthology foto);
  kart yükseklik dengesi (`min-h` + `justify-center`).
- **Driver profili** (`app/drivers/[driverId]/page.tsx`): "2026 CAR" kartı eklendi (araç SVG ilk kez
  driver'da kullanıldı) + takım logosu + team-glow; stat kartlarına `min-h-40`.
- **Drivers grid** (`GridCards.tsx`): takım-rengi blur wash (boşluk dolgusu).

## Backend (güvenlik / SEO / mimari)

- `lib/rateLimit.ts`: `getClientIP(headers)` paylaşılan export'a çıkarıldı (IP-spoofing korumalı).
- Rate limiting: `/api/f1-season` (60/dk) ve `/api/season/[year]` (60/dk) eklendi; `/api/news`
  paylaşılan helper'a refactor edildi.
- `next.config.ts`: CSP'ye `worker-src`/`manifest-src`/`media-src`/`upgrade-insecure-requests` eklendi;
  `poweredByHeader: false` (X-Powered-By gizlendi).
- Dokunulmadı (zaten sağlam): SSRF whitelist, robots `/api/` disallow, HSTS, X-Frame-Options,
  Referrer-Policy, Permissions-Policy, preview noindex, cron Bearer auth.

## Çalıştırıldı
- `npx tsc --noEmit` → sıfır hata.
- `npm test` → 52/52 yeşil.
- `npm run build` → başarılı (13 route).

## Kalan / not
- `frame-ancestors` hâlâ `*.vercel.app` içeriyor (portfolio preview embed için gerekli) — clickjacking
  açısından geniş ama bilinçli tercih; daraltmak preview'i kırar.
