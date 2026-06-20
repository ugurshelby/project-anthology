# PLAN — Faz 0: Launch Hazırlığı (2026-06-12)

> Kaynak: `docs/plans/APEX_MASTER_PLAN.md` §2 (Faz 0).
> Kapsam: SADECE Faz 0. Diğer fazlara geçilmeyecek.

## Hedef
APEX_MASTER_PLAN Faz 0'ı tamamla: hukuki hijyen, haber görsel stratejisi
doğrulaması, ve Lighthouse'un Faz 0'a işaretlediği iki bug (noindex sızıntısı +
CSP `data:` ihlali). Manuel/env gerektiren işler (Upstash) ertelenecek.

## İş Kalemleri

### 1. Footer — hukuki disclaimer + attribution (2.1)
- **Durum:** Projede footer YOK. Yeni component oluşturulacak.
- `components/ui/SiteFooter.tsx` (RSC, client gerekmiyor):
  - "Not affiliated with Formula 1®" satırı
  - "Historical data: F1DB (CC-BY-4.0)" + F1DB GitHub linkine bağ
  - Telif yılı + APEX wordmark, DESIGN_SYSTEM tokenları (--muted, --border,
    IBM Plex Mono 9px label dili)
  - 0 radius / 0 shadow, accent-only kuralı
- `app/layout.tsx`: `<SiteFooter />` `</PageTransition>` sonrası, `<Analytics/>`
  öncesi mount.
- `.site-footer` CSS `app/globals.css`'e (border-top, padding, mono label).
- Commit: `chore: legal disclaimer and attribution footer`

### 2. Haber görsel stratejisi (2.2) — M6 = doğrula, kod değişikliği yok
- M6 kararı: RSS kaynaklarından gelen görsel URL'leri aynen kullan.
- Mevcut durum: `app/news/page.tsx` + `SafeImage` + `lib/data/news.ts`
  `hasRealImage()` ile placeholder fallback zaten bu stratejiyi uyguluyor.
- Aksiyon: kod değişikliği YOK. Log'da "M6 mevcut implementasyonla karşılanıyor"
  notu.

### 3. Preview noindex middleware (Lighthouse SEO-69 fix + backlog madde)
- **Kök neden:** Preview URL'de `x-robots-tag: noindex` Lighthouse SEO skorunu
  69'a düşürüyor. Production'da bu header OLMAMALI, preview'da OLMALI.
- `middleware.ts` (proje kökü) oluştur:
  - `VERCEL_ENV === 'preview'` → `X-Robots-Tag: noindex, nofollow`
  - production/development → header eklenmez (indekslenebilir)
  - `matcher` ile statik asset/_next hariç tut
- Commit: `fix: noindex only on preview deploys (SEO)`

### 4. CSP `data:` ihlali (Lighthouse Best Practices 92 fix)
- Lighthouse `data:` URI CSP violation raporladı.
- `img-src`/`font-src` zaten `data:` içeriyor → ihlal `connect-src`'de
  (council sprintinde kaldırılmıştı; bir beacon/report-uri `data:` kullanıyor).
- `next.config.ts` CSP `connect-src`'ye `data:` geri ekle.
- Commit: CSP fix yukarıdaki noindex commit'iyle birlikte (`fix: ...`) ya da ayrı.

### 5. Upstash rate limit (2.3) — ⚠️ ERTELE
- Manuel env gerektirir (`UPSTASH_REDIS_REST_URL` + `TOKEN`). Kullanıcı env'i
  sağlamadan implement edilemez → ⚠️ MANUEL AKSİYON olarak raporla, kod yazma.

## Doğrulama
- `npm run build` → 0 TS hatası
- `npm test` → mevcut testler yeşil (yeni test gerekmiyor; middleware ve footer
  saf presentational/header mantığı)
- `npm run lint` → değişen dosyalarda hata yok

## Kapsam Dışı (bilinçli)
- Faz 1+ (mobil nav, PWA, profil sayfaları) — bu plana dahil DEĞİL.
- Upstash kodu — env bekliyor.
- Eski council dosyalarının arşivlenmesi (§11) — Faz 0 değil, ayrı temizlik işi.
