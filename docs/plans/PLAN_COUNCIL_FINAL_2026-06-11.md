# PLAN — Council Final Implementation (2026-06-11)

> Kaynak: `docs/council/00-FINAL-PLAN.md` + 01-06 raporları.
> Kapsam: Tüm KRİTİK maddeler + manuel aksiyon gerektirmeyen ÖNEMLİ/S-efor maddeleri.
> Manuel işler (Vercel env, Upstash, prod doğrulama) kullanıcıya bırakıldı.

## Uygulanacaklar (bu sprint)

### A. Güvenlik / Operasyon
1. **`lib/cronAuth.ts`** — ortak cron auth helper:
   - `CRON_SECRET` (Vercel standardı) birincil, `CRON_SECRET_KEY` legacy fallback → B-5
   - `crypto.timingSafeEqual` sabit-zamanlı karşılaştırma → B-6
   - Üç cron route'u bu helper'a geçir; catch bloklarında ham `err.message` yerine
     jenerik mesaj + `console.error` (Sentry yakalar) → B-7
2. **`next.config.ts`** — `Strict-Transport-Security` + `Permissions-Policy` ekle (B-3, B-4);
   `connect-src`'den `data:` kaldır (B-9)
3. **`/api/news`** — `getClientIP` artık `x-forwarded-for`'a güvenmiyor; Vercel'in
   altyapı-set `x-real-ip` değeri kullanılıyor (B-1'in spoof yarısı). Dağıtık sayaç
   (Upstash) manuel kuruluma bağlı → backlog.

### B. SEO
4. **`app/page.tsx`** — anasayfa `metadata` (canonical `/`, OG url, twitter)
5. **`/anthology` + `/tech-glossary`** — `alternates.canonical` + `openGraph.url` + twitter
6. **`/circuits/[id]`** — twitter card
7. **`lib/seo.ts` `articleJsonLd()`** — `datePublished`/`dateModified` (stories
   `created_at`/`updated_at`) + `author` (Organization Apex); `lib/data/stories.ts`
   Story tipine `createdAt`/`updatedAt` eklenir
8. **RSS** — `app/feed.xml/route.ts` (published stories, RSS 2.0); layout
   `alternates.types`'a feed linki
9. **`app/sitemap.ts`** — story rotalarında gerçek `updated_at` `lastModified`

### C. Ürün — Round Detay Sayfası (KRİTİK #5)
10. **`app/season/[year]/round/[n]/page.tsx`** — RSC; `fetchRoundSnapshot` ile
    results / qualifying / sprint; mevcut tasarım dili (circuits/[id] deseni):
    header (round, yarış adı, tarih, devre) + Results tablosu + Qualifying (Q1/Q2/Q3)
    + Sprint (varsa). `generateMetadata` canonical/OG. Yıl aralığı season sayfası ile
    aynı (`max(F1_SEASON_MIN, 2018)..CURRENT_SEASON`), geçersiz parametre → 404.
11. **`lib/f1/mrdata.ts`** — `getRaceResultRows()` / `getQualifyingRows()` /
    `getSprintResultRows()` extractor'ları (test edilebilir)
12. **`SeasonExplorer`** — biten yarışların takvim kartı round sayfasına linklenir;
    Last Race Recap kartına "Full Results →" linki

### D. UX / A11y / Performans
13. **AA kontrast** — tüm `rgba(255,24,1,0.7)` / `0.8` mikro-etiketler → `var(--accent)`
    (StoryCard, GlossaryCard, EntityDrawer, SeasonExplorer, RaceHeroPanels,
    BentoTyreTile, BentoOnThisDayTile, RadioMomentCard, circuits, tech-glossary,
    anthology/[slug])
14. **Reduced motion** — StoryCard expand + GlossaryCard rotate/expand ortak
    `usePrefersReducedMotion` hook'una bağlanır; EntityDrawer'daki kopya hook silinir
15. **Skip-to-content** — layout'a skip link + `#main-content`; globals.css'e `.skip-link`
16. **LCP** — `BentoLeaderTile` görseline `priority`
17. **Staleness memoize** — `getRacesForStaleness` kısa-TTL (60s) modül-içi memo +
    in-flight dedupe (aynı request'te ve ardışık çağrılarda tek calendar sorgusu)

### E. Test
18. **`tests/cronAuth.test.ts`** — env yok → reddet; CRON_SECRET eşleşir → kabul;
    legacy CRON_SECRET_KEY → kabul; yanlış/kısa token → reddet
19. **`tests/f1-read-fallback.test.ts`** — `fetchSeasonSnapshotTyped` /
    `fetchRoundSnapshot`: DB hit, DB → static, static → proxy (live only),
    historical asla proxy'e gitmez, stale bypass, content-invalid guard
20. **`tests/mrdata-round.test.ts`** — yeni round extractor'ları

## Bilinçli kapsam dışı (backlog'da kalır)
- Mobil bottom nav / hamburger (L — tasarım kararı)
- PageTransition exit fazı (M — motion tasarım kararı)
- CSP nonce, `img-src` daraltma (L)
- `getOnThisDay` DB-side filtre, `getSeasonData` fan-out cache (L)
- Upstash dağıtık rate limit (manuel kurulum)
- `<tr role="button">` → satır-içi buton refactor'u (P2)

## Manuel aksiyonlar (kullanıcı)
1. **Vercel env:** `CRON_SECRET` ekle (Production; değer mevcut `CRON_SECRET_KEY` ile aynı
   olabilir). Vercel Cron yalnızca bu isimle Bearer header enjekte eder.
2. (Opsiyonel) Upstash Redis + `@upstash/ratelimit` → `/api/news` dağıtık sayaç.
3. Deploy sonrası: `curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/sync-f1?scope=season` → 200 doğrula.

## Doğrulama
- `npm run build` hatasız, TS hataları sıfır
- `npm test` tüm suite yeşil
- Her küme ayrı commit
