# AGENT LOG — Phase 7: SEO + QA
**Tarih:** 2026-06-05
**Sorumlu:** Claude Code (mimar / QA / DevOps)

## Ne yapıldı
1. **`Date.now()` purity hatası (app/page.tsx) düzeltildi.** `react-hooks/purity` kuralı
   component gövdesindeki her `Date.now()` çağrısını işaretliyor (konum fark etmez).
   Çözüm: saat okuması `lib/f1/mrdata.ts` içine `nowMs()` plain helper'a taşındı (component
   olmadığı için kural kapsamı dışı). Homepage `const renderNowMs = nowMs()` ile request-time
   saatini alıp `formatRaceCountdown`'a veriyor.
2. **SEO SSOT modülü:** `lib/seo.ts` — `SITE_NAME`, `SITE_TAGLINE`, `siteUrl()`, `absoluteUrl()`,
   `websiteJsonLd()`, `articleJsonLd()`. URL tek kaynaktan (`getSiteUrl`, prod fallback baked-in).
3. **`app/layout.tsx`:** `metadataBase` (= siteUrl) + title template (`%s — Project Anthology`) +
   default openGraph/twitter + root canonical. `<script type="application/ld+json">` ile global
   **WebSite** schema body'ye gömüldü.
4. **Eksik metadata tamamlandı:** `/season`, `/circuits`, `/radio`, `/news` — her birine static
   `metadata` export (bare title → template, description, openGraph url+type, twitter card,
   canonical). Mevcut `/anthology` + `/tech-glossary` başlıkları template ile uyumlu hale getirildi
   (suffix temizlendi).
5. **Article JSON-LD:** `/anthology/[slug]` render'ına `articleJsonLd(...)` script bloğu eklendi
   (headline/description/image/section/publisher). `generateMetadata`'ya canonical + og url eklendi,
   manuel og image kaldırıldı (artık dinamik OG dosyası sağlıyor).
6. **`app/sitemap.ts`:** 7 statik rota + `getStorySlugs()` ile 17 dinamik hikaye rotası
   (changeFrequency/priority ile). DB boşsa tolere eder.
7. **`app/robots.ts`:** `allow: /`, `disallow: /api/cron/ + /api/`, sitemap + host (prod URL).
8. **next/og dinamik OG image:**
   - `app/opengraph-image.tsx` — site default kart (1200×630, #0a0a0a + #ff1801 accent bar,
     "ANTHOLOGY" + tagline). Sistem fontu (harici font fetch yok → build/runtime sağlam).
   - `app/anthology/[slug]/opengraph-image.tsx` — hikaye başlığı + `category · year` eyebrow +
     marka footer. Uzun başlıkta font-size ölçekleniyor. DB miss'te generic fallback.

## Değiştirilen / eklenen dosyalar
- YENİ: `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`,
  `app/anthology/[slug]/opengraph-image.tsx`
- DEĞİŞ: `app/page.tsx` (nowMs), `lib/f1/mrdata.ts` (nowMs helper), `app/layout.tsx`
  (metadataBase + template + WebSite JSON-LD), `app/season|circuits|radio|news/page.tsx` (metadata),
  `app/anthology/page.tsx` + `app/tech-glossary/page.tsx` (title template uyumu),
  `app/anthology/[slug]/page.tsx` (Article JSON-LD + canonical), `app/api/cron/sync-f1/route.ts`
  (kullanılmayan `upsertF1Snapshot` importu temizlendi → lint warning sıfırlandı)

## Çalıştırılan komutlar
```
npx eslint app/page.tsx lib/f1/mrdata.ts     # purity fix doğrulama → temiz
npm run lint                                  # 0 error, 3 warning (hepsi old-versions-valuable-files/)
npm run build                                 # exit 0, 30/30 sayfa
npm run start -- -p 3210                       # prod server (smoke)
curl … (12 rota)                              # hepsi 200
curl --plan+text … (PostgREST EXPLAIN)        # PGRST107 — hosted'da kapalı
```

## Karşılaşılan hatalar ve çözümleri
1. **purity kuralı `Date.now()`'u her yerde flag'liyor** (sadece JSX inline değil) → saat okuması
   non-component lib helper `nowMs()`'e taşındı.
2. **title template çakışması** — mevcut sayfa başlıkları (`Anthology — F1 Stories`) template ile
   birleşince uzuyordu → bare title'a indirildi (`Anthology`), template suffix'i ekliyor.
3. **OG image çifte tanım riski** — file-convention `opengraph-image.tsx` otomatik metadata'ya
   ekleniyor; story `generateMetadata`'daki manuel `images` kaldırıldı (dinamik kart tek kaynak).
4. **`/qa` skill bu ortamda yok** → headless smoke doğrudan prod server + curl ile yapıldı.
5. **lint: kullanılmayan `upsertF1Snapshot`** (Phase 3 artığı) → import temizlendi.

## Doğrulama (DoD)
- [x] `npm run build` exit 0 (30/30 sayfa; `/sitemap.xml`, `/robots.txt`, `/opengraph-image`,
      `/anthology/-/opengraph-image` route'ları üretildi)
- [x] `npm run lint` 0 error (kalan 3 warning yalnız `old-versions-valuable-files/`)
- [x] 12 rota smoke → hepsi **200** (sayfalar + sitemap + robots + 2 OG image endpoint)
- [x] WebSite JSON-LD (home) + Article JSON-LD (story) HTML'de mevcut
- [x] canonical link prod URL ile doğru, title template çalışıyor (`Season — Project Anthology`)
- [x] robots.txt: `/api/cron/` + `/api/` disallow, sitemap+host satırları
- [x] sitemap.xml: 24 `<loc>` (7 statik + 17 hikaye)
- [x] hydration / error-boundary marker = 0 (home, story, glossary); server log temiz
- [x] OG image: story sayfasında dinamik `opengraph-image?<hash>` referansı

## Index doğrulama (kısmi — manuel aksiyon notu)
- `idx_f1_snapshots_season_type` migration'da TANIMLI (`20260603000001_initial_schema.sql:129`),
  ayrıca `UNIQUE(season, round, type)` ikinci kullanılabilir index sağlıyor.
- Hot query (`season=eq.2026 & type=eq.calendar`) index'in leading kolonlarıyla **birebir** eşleşiyor.
- Tablo **219 satır** → planner için index anlamlı; sorgu ~160ms (çoğu network RTT).
- **EXPLAIN ANALYZE doğrudan alınamadı:** PostgREST plan media-type kapalı (`PGRST107`) ve projede
  doğrudan Postgres connection string (DATABASE_URL) yok.

## ⚠️ MANUEL AKSİYON GEREKLİ
Index'in fiilen kullanıldığını `EXPLAIN ANALYZE` ile kesin doğrulamak için Supabase Dashboard →
SQL Editor'de şunu çalıştır:
```sql
explain analyze
select data from public.f1_snapshots
where season = 2026 and type = 'calendar';
```
Plan'da `Index Scan using idx_f1_snapshots_season_type` (veya unique constraint index) bekleniyor.

## Sonraki adım
- Phase 8 (Production Deploy & Doğrulama): Vercel prod deploy teyidi, cron prod davranışı,
  canlı rota smoke + Lighthouse.
- (Ops.) Lighthouse skor ölçümü ve Sentry release tag.
