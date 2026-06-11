# AGENT LOG — Council Final Plan Implementation (2026-06-11)

## Ne yapıldı

### Güvenlik / Operasyon
- `lib/cronAuth.ts` oluşturuldu: `CRON_SECRET` (Vercel standardı) birincil,
  `CRON_SECRET_KEY` legacy fallback; `crypto.timingSafeEqual` ile sabit-zamanlı
  karşılaştırma; fail-closed. Üç cron route'u (`sync-f1`, `sync-news`, `sync-radio`)
  bu helper'a geçirildi.
- Cron catch blokları: ham `err.message` yerine jenerik `'Sync failed'` +
  `console.error` (Sentry yakalar).
- `next.config.ts`: `Strict-Transport-Security` (2y, preload) + `Permissions-Policy`
  eklendi; CSP `connect-src`'den gereksiz `data:` kaldırıldı.
- `/api/news` `getClientIP`: spoof edilebilir `x-forwarded-for[0]` güveni kaldırıldı;
  Vercel'in altyapı-set `x-real-ip`'i birincil (dağıtık sayaç Upstash'e bırakıldı — manuel).

### SEO
- Anasayfa `metadata` (canonical `/`, OG url, twitter) eklendi.
- `/anthology` + `/tech-glossary`: canonical + OG url + twitter card.
- `/circuits/[id]`: twitter card.
- `articleJsonLd()`: `datePublished`/`dateModified` (stories `created_at`/`updated_at`)
  + `author` (Organization). `Story` tipine `createdAt`/`updatedAt` eklendi.
- `app/feed.xml/route.ts`: published stories için RSS 2.0; layout
  `alternates.types` ile duyuruluyor; 15 dk revalidate.
- `app/sitemap.ts`: story rotaları gerçek `updated_at` ile `lastModified`.

### Ürün — Round Detay Sayfası
- `app/season/[year]/round/[n]/page.tsx`: Race Result (grid/laps/time/pts/FL),
  Qualifying (Q1-Q3), Sprint tabloları; takım rengi border, podyum vurgusu,
  devre görseli; `generateMetadata` canonical/OG; geçersiz yıl/round → 404.
- `lib/f1/mrdata.ts`: `getRaceResultRows` / `getQualifyingRows` /
  `getSprintResultRows` / `getRoundRaceInfo` extractor'ları.
- `SeasonExplorer`: biten yarış takvim kartları round sayfasına linklenir;
  Last Race Recap'e "Full Results →".

### UX / A11y / Performans
- AA kontrast: 12 dosyada `rgba(255,24,1,0.7/0.8)` mikro-etiketler → `var(--accent)`.
- Reduced-motion: `StoryCard` expand ve `GlossaryCard` expand + "+" rotate ortak
  `usePrefersReducedMotion` hook'una bağlandı; `EntityDrawer`'daki kopya hook silindi.
- Skip-to-content linki (`app/layout.tsx` + `.skip-link` CSS) + `#main-content`.
- `BentoLeaderTile` LCP görseline `priority`.
- `getRacesForStaleness`: 60s TTL + in-flight dedupe memo (aynı render'daki
  tekrarlı calendar sorguları tek sorguya indi).
- Vercel Speed Insights mount edildi (kullanıcının başlattığı değişiklik tamamlandı).

### Test
- `tests/cronAuth.test.ts` (5 test), `tests/f1-read-fallback.test.ts` (10 test —
  DB→static→proxy sırası, historical asla proxy'e gitmez, stale bypass,
  content-invalid guard, stale>null davranışı), `tests/mrdata-round.test.ts` (6 test).

## Değişen dosyalar
Yeni: `lib/cronAuth.ts`, `app/season/[year]/round/[n]/page.tsx`, `app/feed.xml/route.ts`,
`tests/cronAuth.test.ts`, `tests/f1-read-fallback.test.ts`, `tests/mrdata-round.test.ts`,
`docs/plans/PLAN_COUNCIL_FINAL_2026-06-11.md`.
Güncellenen: 3 cron route, `next.config.ts`, `app/api/news/route.ts`, `lib/seo.ts`,
`lib/data/stories.ts`, `lib/data/f1.ts`, `lib/f1/mrdata.ts`, `app/sitemap.ts`,
`app/layout.tsx`, `app/page.tsx`, `app/globals.css`, anthology/tech-glossary/circuits
sayfaları, `SeasonExplorer`, `StoryCard`, `GlossaryCard`, `EntityDrawer`,
`RaceHeroPanels`, `BentoLeaderTile`, `BentoTyreTile`, `BentoOnThisDayTile`,
`RadioMomentCard`, `docs/council/00-FINAL-PLAN.md`, `package.json`.

## Çalıştırılan komutlar
- `npm test` → 6 dosya / 43 test yeşil
- `npm run build` → başarılı, TS hatası 0, yeni rotalar üretildi
  (`/feed.xml` static 15m, `/season/[year]/round/[n]` dynamic)
- `npm run lint` → değiştirilen dosyalarda hata yok (4 hata önceden var:
  `CircuitLapLine`, `FlipDigit` setState-in-effect, untracked audit script)

## Karşılaşılan hatalar ve çözümleri
- Vitest'te `lib/data/f1.ts` modül-seviyesi staleness memo'su test izolasyonunu
  bozuyordu → her testte `vi.resetModules()` + dinamik import.
- AA düzeltmesinde `RadioMomentCard` hem class (`text-accent/70`) hem inline style
  taşıyordu → ikisi de tam accent'e indirildi.

## Sonraki adım
1. ⚠️ MANUEL: Vercel'e `CRON_SECRET` env var ekle (cron otomasyonu için zorunlu).
2. (Ops.) Upstash Redis ile `/api/news` dağıtık rate limit.
3. Backlog: mobil bottom nav kararı, PageTransition exit fazı, CSP nonce,
   `getSeasonData` fan-out cache, `<tr role="button">` refactor'u.
