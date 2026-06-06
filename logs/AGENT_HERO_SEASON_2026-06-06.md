# AGENT LOG — AtmosphericHero büyütme + Season veri/UI onarımı
**Tarih:** 2026-06-06 · **Agent:** Claude Code · **Branch:** main

## Ne yapıldı
- **SORUN 1 (Hero):** `AtmosphericHero` sinematik hale getirildi.
  - `app/globals.css` `.atmospheric-hero`: `min-height: 100vh/100svh`, `display:flex; flex-direction:column; justify-content:flex-end` (içerik alt-orta). `.hero-content` `width:100%`.
  - `components/ui/AtmosphericHero.tsx`: content wrapper `flex flex-col justify-end pb-20 pt-24 md:pb-24`.
  - DESIGN_SYSTEM "Atmospheric Hero Layers" stack sırası korundu (grid→spotlight L/R→red glow→grain→streak→content). `prefers-reduced-motion` streak'te zaten var, bozulmadı.
  - 7 sayfada hero h1 ölçeği `clamp(4rem,14vw,10rem)`'a standardize: `/ /anthology /season /circuits /radio /news /tech-glossary`.
- **SORUN 2 (Season):** Kök neden = DB'de `(2026,NULL,standings_drivers/constructors/calendar)` DUPLİKAT satırlar (Postgres UNIQUE NULL'ları distinct sayıyor) → `lib/data/f1.ts` `.maybeSingle()` >1 satırda PostgREST hatası → null → "No standings".
  - `lib/data/f1.ts`: season + round okumalarına `.order('fetched_at',{ascending:false}).limit(1)` eklendi (en güncel satır, duplikatta patlamaz).
  - `scripts/dedupe-f1-snapshots.ts` yazıldı + çalıştırıldı → 6 duplikat silindi (2026 + 2018 × calendar/std_drivers/std_constructors). Her grup artık tek satır (doğrulandı).
  - `lib/f1/mrdata.ts`: `getConstructorStandings`, `getLastRaceResult` (P1/P2/P3 + fastest lap), `getQualifyingPole` helper'ları (gerçek DB shape'e göre).
  - `app/season/page.tsx` tam yeniden inşa (RSC): hero (lider sürücü eyebrow) + driver standings tablosu (sol border takım rengi, lider vurgu) + constructor pure-CSS bar chart (takım rengi, 0 radius) + last race recap (podium + pole + fastest lap) + yatay kaydırılabilir race calendar (done/upcoming durumu). Client component yok; yatay scroll saf CSS.

## Değişen dosyalar
- `app/globals.css`, `components/ui/AtmosphericHero.tsx`
- `app/page.tsx`, `app/anthology/page.tsx`, `app/circuits/page.tsx`, `app/radio/page.tsx`, `app/news/page.tsx`, `app/tech-glossary/page.tsx`, `app/season/page.tsx`
- `lib/data/f1.ts`, `lib/f1/mrdata.ts`
- `scripts/dedupe-f1-snapshots.ts` (yeni), `docs/plans/PLAN_HERO_SEASON_2026-06-06.md` (yeni)
- (Tutarlılık temizliği — paralel agent: `font-[family-name:...]`→`font-*` utility normalizasyonu, `.gitignore` `.vercel`)

## Çalıştırılan komutlar
- `npx tsx scripts/dedupe-f1-snapshots.ts --dry-run` → 6 duplikat tespit
- `npx tsx scripts/dedupe-f1-snapshots.ts` → 6 satır silindi
- `npx tsc --noEmit` → clean
- `npm run build` → exit 0, 30/30 sayfa. Build log'unda `/season` gerçek DB çağrıları görüldü (standings_drivers/constructors/calendar + round 5 results/qualifying).

## Hatalar + çözüm
- `npm run build` "Another next build process is already running" → çalışan `next dev`/`next start` (kullanıcı sunucuları) ve paralel agent build'i sebepti. Paralel agent bitince normal `npm run build` geçti.

## Sonraki adım
- Vercel prod deploy doğrulaması (push sonrası): `/season` prod'da standings/calendar/recap gösteriyor mu.
- Kalıcı çözüm önerisi (opsiyonel): migration ile `f1_snapshots` round-NULL duplikasyonunu engelle — partial unique index `UNIQUE(season,type) WHERE round IS NULL`. Şu an okuma katmanı + dedupe ile güvenli; ama ingestion tekrar duplikat yazabilir.
