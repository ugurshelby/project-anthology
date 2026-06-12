# AGENT LOG — Faz 0: Launch Hazırlığı (2026-06-12)

Kaynak plan: `docs/APEX_MASTER_PLAN.md` §2 · `docs/plans/PLAN_FAZ0_LAUNCH_2026-06-12.md`
Kapsam: SADECE Faz 0. Diğer fazlara geçilmedi.

## Ne yapıldı

### 1. Footer — hukuki disclaimer + F1DB attribution (2.1)
- Projede footer YOKTU → `components/ui/SiteFooter.tsx` oluşturuldu (RSC).
  - "Not affiliated with Formula 1®" + trademark notu
  - "Historical data: F1DB (CC-BY-4.0)" — F1DB GitHub + CC lisans linkleri
  - APEX wordmark + telif yılı (`new Date().getFullYear()`)
  - DESIGN_SYSTEM token dili: IBM Plex Mono label, --muted/--paper/--border,
    0 radius/shadow, accent-only.
- `app/layout.tsx`: `<SiteFooter />` PageTransition sonrası mount edildi.
- `app/globals.css`: `.site-footer*` stilleri eklendi (border-top + mono label).

### 2. Haber görsel stratejisi (2.2) — M6: kod değişikliği yok
- M6 kararı (RSS kaynak görsellerini aynen kullan) mevcut implementasyonla
  zaten karşılanıyor: `app/news/page.tsx` + `SafeImage` + `hasRealImage()`
  placeholder fallback. Kod değişikliği YAPILMADI; karar doğrulandı.

### 3. Preview noindex (Lighthouse SEO 69 fix + backlog madde)
- `proxy.ts` oluşturuldu (Next.js 16 `middleware`→`proxy` convention).
  - `VERCEL_ENV === 'preview'` → `X-Robots-Tag: noindex, nofollow`
  - production/development → header eklenmez → indekslenebilir.
  - matcher: `_next/`, `monitoring` tüneli ve uzantılı asset'ler hariç.
- Build çıktısı `ƒ Proxy (Middleware)` ile aktif olduğunu doğruladı.
- NOT: İlk denemede `middleware.ts` yazıldı; Next 16 deprecation uyarısı
  verdi → `proxy.ts`'e taşındı.

### 4. CSP `data:` ihlali (Lighthouse Best Practices 92 fix)
- `next.config.ts` CSP `connect-src`'ye `data:` geri eklendi (council sprintinde
  kaldırılmıştı; Analytics/Speed Insights beacon'ları data-URI kullanıyor).

### 5. Yan düzeltme — RaceCountdown build blocker
- `components/ui/RaceCountdown.tsx` (untracked, benim değilim) iki `className`
  attribute taşıyordu → TS build'i kırıyordu. İkisi tek koşullu className'e
  birleştirildi (davranış korundu). Bu olmadan build geçmiyordu.

## Değişen dosyalar
Yeni: `components/ui/SiteFooter.tsx`, `proxy.ts`,
`docs/plans/PLAN_FAZ0_LAUNCH_2026-06-12.md`.
Güncellenen: `app/layout.tsx`, `app/globals.css`, `next.config.ts`,
`components/ui/RaceCountdown.tsx`.

## Çalıştırılan komutlar
- `npm run build` → ✅ başarılı, 0 TS hatası, 49 sayfa üretildi, Proxy aktif.
  (Ara hata: killed-build'lerden kalan `.next/lock` + corrupt cache →
  `.next` silindi, temiz build geçti.)
- `npm test` → ✅ 6 dosya / 49 test yeşil.
- `npm run lint` → değişen YENİ dosyalarda (SiteFooter, proxy) 0 hata.
  RaceCountdown'da kalan `react-hooks/purity` + `set-state-in-effect` hataları
  ÖNCEDEN vardı (untracked dosya, Date.now() useState init + setInterval),
  Faz 0 kapsamı dışı, davranış-hassas → dokunulmadı.

## Karşılaşılan hatalar ve çözümleri
- `middleware.ts` deprecation (Next 16) → `proxy.ts`'e taşındı.
- Kesintiye uğrayan build'ler `.next/lock` bıraktı + `require-in-the-middle`
  hashed chunk cache'i bozuldu → `Remove-Item .next` + temiz rebuild.
- `RaceCountdown` duplicate `className` → tek koşullu ifadeye birleştirildi.

## Ek (2026-06-12, aynı gün) — Upstash rate limit (2.3) TAMAMLANDI
Kullanıcı env'leri `.env.local`'e ekledi (`UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`) → 2.3 implement edildi:
- `@upstash/ratelimit` + `@upstash/redis` kuruldu.
- `lib/rateLimit.ts`: sliding-window dağıtık limiter. Env varsa Upstash
  (instance'lar arası paylaşılan limit); env yoksa VEYA Upstash erişilemezse
  per-instance in-memory pencereye düşer (fail-open, route 500 olmaz).
- `app/api/news/route.ts`: yerel Map limiter kaldırıldı, `rateLimit()`
  helper'ına geçti (prefix 'news', 30 req/60s). Retry-After gerçek reset'ten.
- `tests/rateLimit.test.ts`: 3 test (in-memory fallback — limit aşımı,
  identifier izolasyonu, pencere reset). `npm test` → 7 dosya / 52 test yeşil.
- `npm run build` ✅, değişen dosyalarda lint temiz.
- NOT: `UPSTASH_REDIS_REST_TOKEN` doğru isim; kullanıcının bahsettiği
  `UPSTASH_REDIS_REST_UR` (eksik harf) .env.local'de YOK, doğru isimler mevcut.
- ⚠️ MANUEL: Bu üç env'i Vercel dashboard'a da ekle (Production) — yoksa
  prod'da in-memory fallback'e düşer (çalışır ama dağıtık değil).

## ⚠️ Manuel aksiyon (ertelendi — kullanıcı yapacak)
- **Upstash env'leri Vercel'e ekle:** `.env.local`'de var, Vercel dashboard'da
  da `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` tanımlanmalı.
- **Production noindex doğrulaması:** Deploy sonrası production URL'de
  `curl -I` ile `x-robots-tag` header'ının OLMADIĞINI doğrula (preview'da
  OLMALI). SEO skorunun 69→90+ çıkması beklenir.

## Sonraki adım
- Faz 0 tamamlandı. Faz 1 (mobil bottom nav + responsive) — Cursor'a bırakılmış.
- Bu plana dahil değil; kullanıcı talebi gelince başlanacak.
