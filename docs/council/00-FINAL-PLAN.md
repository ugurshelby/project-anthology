# Council Final Plan — Apex F1 Arşiv Platformu

> **Sentez tarihi:** 2026-06-11  
> **Kaynak raporlar:** `01-security` · `02-performance` · `03-seo` · `04-architecture` · `05-ux-design` · `06-roadmap`  
> **Prod:** https://project-anthology-five.vercel.app

## Yönetici Özeti

Council altı boyutta değerlendirme yaptı. **Güvenlikte kritik bulgu yok**; temel mimari (DB-first snapshot, fail-closed cron, service-role izolasyonu) sağlam. En acil işler üç kümeye toplanıyor: **(1) operasyonel güvenilirlik** (cron secret hizalama, fallback testleri), **(2) kullanıcıya görünür değer** (ingest edilmiş qualifying/results verisini UI'ya açma), **(3) kalite borcu** (anasayfa SEO, AA kontrast, LCP `priority`). Uzun vadede platform, F1.com klonu değil **sinematik arşiv + anthology + radio** nişinde derinleşmeli; canlı timing/telemetri XL yatırım gerektirir.

---

## KRİTİK (hemen düzeltilmeli)

| Madde | Etki (1-10) | Efor | Çözüm |
|-------|:-----------:|:----:|-------|
| Cron secret adı uyumsuzluğu — Vercel `CRON_SECRET` enjekte eder, kod `CRON_SECRET_KEY` bekler; günlük sync 401 riski | 9 | S | Vercel env'e `CRON_SECRET` ekle veya route auth'u `CRON_SECRET` ile hizala; tek isim standardı |
| Anasayfa `/` metadata eksik — canonical, OG URL, Twitter card yok | 8 | S | `app/page.tsx`'e `metadata` export: title, description, `alternates.canonical: '/'`, openGraph + twitter |
| Mikro-etiket kontrastı AA altında — `rgba(255,24,1,0.7)` ~2.9:1 (StoryCard, EntityDrawer, SeasonExplorer vb.) | 8 | S | Etiketlerde tam `#ff1801` veya min 4.5:1 kontrast; opaklığı yalnızca dekoratif öğelerde tut |
| `lib/data/f1.ts` fallback/staleness testi yok — arşiv doğruluğu korunmuyor | 8 | M | DB → static → live, stale bypass ve content-invalid guard için unit testler |
| Round sonuç sayfası yok — `results`/`qualifying`/`sprint` ingest ediliyor, UI yalnızca pole gösteriyor | 9 | S | `/season/[year]/round/[n]` — Results + Qualifying + Sprint sekmeleri; mevcut snapshot'ları kullan |
| `Article` JSON-LD'de `datePublished` / `author` eksik | 7 | S | `lib/seo.ts` `articleJsonLd()` genişlet; story modeline tam tarih + yazar ekle |

---

## ÖNEMLİ (sonraki sprint)

| Madde | Etki (1-10) | Efor | Çözüm |
|-------|:-----------:|:----:|-------|
| `/api/news` rate limit atlanabilir — XFF taklidi + bellek-içi Map serverless'te etkisiz | 7 | M | Güvenilir IP (`request.ip` / `x-real-ip`); Upstash Redis / Vercel KV dağıtık sayaç |
| LCP: `BentoLeaderTile` görselinde `priority` yok | 7 | S | `components/home/BentoLeaderTile.tsx` — `priority` + tutarlı `sizes` |
| `getRacesForStaleness` aynı request'te tekrar çağrılıyor | 7 | M | Request-scope memoize (`lib/data/f1.ts`) |
| `/anthology` ve `/tech-glossary` canonical + OG URL eksik | 6 | S | Her iki sayfaya `alternates.canonical` ve `openGraph.url` |
| HSTS ve Permissions-Policy başlıkları yok | 6 | S | `next.config.ts` SECURITY_HEADERS'a ekle |
| Cron route testleri yok (auth, env guard, hata response) | 7 | M | `sync-f1`, `sync-news`, `sync-radio` için Vitest/integration testleri |
| Mobil nav spec uygulanmamış — bottom nav + hamburger yok; 10px linkler ~20px touch target | 7 | L | Spec kararı netleştir: bottom nav implement et veya DESIGN_SYSTEM'i gerçek IA'ya güncelle; min 24px touch |
| RSS feed yok — anthology dağıtım kanalı eksik | 6 | M | `app/feed.xml/route.ts` — published stories Atom/RSS; robots/sitemap'e ekle |
| `getOnThisDay` tüm `results` snapshot'larını çekip filtreliyor | 6 | M | DB tarafında tarih filtresi veya önceden türetilmiş cache |
| `sync-f1` scope adı yanıltıcı; Jolpica seri fetch 300s marjını zayıflatıyor | 6 | M | Terminoloji düzelt; `runBounded` concurrency uygula; worst-case süre ölç |
| `StoryCard` / `GlossaryCard` reduced-motion atlıyor | 5 | S | Expand/rotate animasyonlarına RM gate; ortak `usePrefersReducedMotion` |
| `PageTransition` exit fazı yok — spec maskeleme akışı çalışmıyor | 5 | M | Exit varyantı + ilk yüklemede sweep atla |
| Past Winners / F1DB seed prod doğrulama | 6 | S | `seed:f1db` prod checklist; boş pist uyarısı |

---

## İYİLEŞTİRME (backlog)

| Madde | Değer | Efor |
|-------|:-----:|:----:|
| CSP nonce tabanlı politika — `unsafe-inline`/`unsafe-eval` kaldırma yol haritası | 6 | L |
| Cron token `crypto.timingSafeEqual()` + jenerik hata yanıtları | 4 | S |
| `sitemap.ts` `lastModified` gerçek `updated_at` kullanmalı | 5 | S |
| `/circuits/[id]` Twitter card + rota bazlı OG görselleri | 5 | M |
| Skip-to-content linki (`app/layout.tsx`) | 5 | S |
| `SeasonExplorer` `<tr role="button">` → satır içi gerçek buton | 5 | S |
| `getSeasonData` round fan-out üst sınırı / incremental cache | 7 | L |
| `SafeImage` client yüzeyini daralt (kritik olmayan yerlerde server `Image`) | 5 | L |
| `fetchSiteJson` explicit cache politikası | 4 | S |
| `sync-news` batch upsert + `summary`/`description` alan tutarlılığı | 4 | S |
| `sync-radio` round eşlemesi doldur | 4 | M |
| Navbar scrolled state / aktif link / hero ölçeği — kod↔DESIGN_SYSTEM hizala | 4 | M |
| Preview deploy `X-Robots-Tag: noindex` middleware | 3 | S |
| CSP `img-src https:` daraltma, `connect-src data:` kaldırma | 3 | S |
| `jsonb` üzerinden ağır analitik → materialized read model (gözlemle) | 5 | L |
| Ölü `--mobile-nav-height` token temizliği | 2 | S |

---

## YOL HARİTASI (uzun vadeli)

| Özellik | Değer | Bağımlılık |
|---------|:-----:|------------|
| Pilot & takım profil sayfaları (`/drivers/[id]`, `/teams/[id]`) | 9 | F1DB çok sezon aggregate; EntityDrawer'dan promote |
| Global arama (cmd+K) — pilot, pist, hikâye, radio, glossary | 8 | Statik index + RSC search API |
| Sezon arşiv UI 2000–2017 | 7 | F1DB seed genişletme; UI pill'leri |
| Head-to-head pilot karşılaştırma | 7 | `results` DB aggregate |
| Anthology ↔ yarış verisi embed | 7 | Story metadata + snapshot join |
| Radio filtre & playlist | 7 | `radio_moments` client UI |
| Tarihsel pist layout seçici (GeoJSON yıl varyantları) | 6 | `assets/f1-circuits/` + SVG picker |
| Session schedule (FP/Q/S/R) home + circuit tile | 6 | `CalendarRace` sessions typed |
| GitHub Actions `workflow_dispatch` live sync | 6 | Secret + Hobby cron boşluğu |
| Türkçe i18n | 7 | next-intl; çeviri + routing |
| Hafta sonu canlı mod (OpenF1 leaderboard) | 9 | Vercel Pro cron; rate limit; SSE/WebSocket |
| Telemetri / sector viz | 8 | OpenF1 extended; canvas/WebGL |
| Kullanıcı katmanı (favoriler, kayıtlı radio) | 5 | Supabase Auth + RLS |
| Vercel Pro geçişi (15 dk cron) | 6 | Billing; `data-ingestion-plan` orijinal tasarım |

---

## Council Boyut Özeti

| Boyut | Durum | Ana mesaj |
|-------|-------|-----------|
| **Güvenlik** | İyi (0 kritik) | Service-role izole, cron fail-closed, SSRF korumalı proxy; rate limit + CSP sertleştirme gerekli |
| **Performans** | Orta | `/circuits` ISR doğru; `/` ve `/season` tekrarlı sorgu + client hydration maliyeti; LCP `priority` eksik |
| **SEO** | Orta-iyi temel | Merkezi `lib/seo.ts` güçlü; anasayfa metadata, Article schema, RSS ve rota OG'leri eksik |
| **Mimari** | Sağlam | DB-first snapshot ölçeklenebilir; `news_cache` artık aktif; test ve cron gözlemlenebilirliği zayıf |
| **UX** | Güçlü temel, spec kayması | Token/radius/RM/EntityDrawer mükemmel; mobil nav, kontrast ve PageTransition sapmaları |
| **Ürün** | Niş net | Sinematik arşiv farkı var; veriyi yüzeye çıkarma (round grid, profiller, arama) en hızlı değer |

---

## Önerilen Uygulama Sırası (ilk 2 hafta)

1. **Gün 1:** Cron secret hizalama + anasayfa metadata + anthology/glossary canonical (S×3)
2. **Gün 2–3:** Round detay sayfası + AA kontrast düzeltmeleri (S+M)
3. **Gün 4–5:** `f1.ts` fallback testleri + cron auth testleri + LCP `priority` (M+S)
4. **Hafta 2:** Staleness memoize + RSS feed + HSTS/Permissions-Policy + rate limit (M)
5. **Paralel:** Mobil nav kararı (spec güncelle veya bottom nav — L)

---

## Uygulama Durumu (2026-06-11 — finalize)

Uygulama planı: `docs/plans/PLAN_COUNCIL_FINAL_2026-06-11.md`

| Küme | Madde | Durum |
|------|-------|-------|
| KRİTİK | Cron secret hizalama (kod tarafı: `CRON_SECRET` birincil + timing-safe) | ✅ Kod tamam — **manuel:** Vercel env `CRON_SECRET` |
| KRİTİK | Anasayfa metadata | ✅ |
| KRİTİK | Mikro-etiket AA kontrast | ✅ |
| KRİTİK | `f1.ts` fallback testleri | ✅ |
| KRİTİK | Round detay sayfası `/season/[year]/round/[n]` | ✅ |
| KRİTİK | Article JSON-LD `datePublished`/`author` | ✅ |
| ÖNEMLİ | News rate limit XFF güveni | ✅ (dağıtık sayaç → Upstash, manuel) |
| ÖNEMLİ | LCP `priority` + staleness memoize | ✅ |
| ÖNEMLİ | HSTS + Permissions-Policy | ✅ |
| ÖNEMLİ | Cron auth testleri | ✅ |
| ÖNEMLİ | anthology/glossary canonical + OG | ✅ |
| ÖNEMLİ | RSS feed | ✅ |
| ÖNEMLİ | StoryCard/GlossaryCard reduced-motion | ✅ |
| ÖNEMLİ | Mobil nav kararı | ⏳ Backlog (tasarım kararı) |
| ÖNEMLİ | PageTransition exit fazı | ⏳ Backlog |
| İYİLEŞTİRME | Skip-link, sitemap `lastModified`, cron timing-safe + jenerik hata, circuits twitter card, `connect-src data:` kaldırma | ✅ |
| İYİLEŞTİRME | CSP nonce, `img-src` daraltma, fan-out cache, vb. | ⏳ Backlog |

*Bu plan, altı bağımsız council raporunun çapraz sentezidir. Detaylar için ilgili `docs/council/0X-*.md` dosyalarına bakın.*
