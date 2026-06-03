# AGENT LOG — Phase 1: DB Şeması + Veri Katmanı Zemini

**Tarih:** 2026-06-03
**Ajan:** Claude Code (Opus 4.8)
**Kapsam:** Masterplan Phase 1-3 backend dilimi (temporal SSOT + şema + client + veri katmanı + proxy).

## Ne yapıldı (maddeler)
- **supabase/migrations/20260603000001_initial_schema.sql** — Masterplan Karar A: 5 tablo (`stories`, `radio_moments`, `circuits`, `f1_snapshots`, `news_cache`); kanonik `type` CHECK + `source` CHECK (`f1db/jolpica/openf1`); tüm composite/GIN index'ler; `updated_at` trigger; RLS (public read / service_role write); **table-level GRANT'ler** (anon/authenticated SELECT, service_role tüm yazma + sequence).
- **lib/supabase.ts** — `getSupabaseClient()` (anon, RLS'e tabi) + `getSupabaseAdmin()` (service_role; key yoksa **throw**, anon'a sessiz düşme yok). Database tipiyle generic.
- **lib/f1Calendar.ts** — Temporal SSOT, dependency-free leaf: `CURRENT_SEASON` (clock'tan), `F1_SEASON_MIN`, `getF1Context()`, `isRaceDone()`, `isRaceWeekend()`, `getNextRace()`, `getLastFinishedRace()`. Hardcode yok.
- **config/team-colors.ts** — eski `old-versions-valuable-files/team-colors.ts` birebir taşındı (değiştirilmedi).
- **types/database.ts** — 5 tablonun Row/Insert/Update tipleri + `Database` generic + `SnapshotType`/`SnapshotSource` kanonik union'ları. Şemayla tam uyumlu.
- **lib/data/f1.ts** — 3-katman okuma: DB (`f1_snapshots`) → static (`public/data/f1`) → Jolpica proxy (yalnız `season >= CURRENT_SEASON`). `fetchSeasonSnapshotTyped`, `fetchRoundSnapshot`, `fetchCurrentCalendar`.
- **lib/data/news.ts** — `news_cache` SELECT → `/api/news` → `public/news-fallback.json` fallback. `getLatestNews()`.
- **lib/data/{fs,siteUrl,logger,types}.ts** — yardımcılar: `readPublicJson` (path-traversal guard), `getSiteUrl`/`fetchSiteJson` (RSC mutlak fetch), structured logger, `NewsItem` tipi.
- **app/api/f1-season/route.ts** — SSRF-hardened Jolpica proxy: `path` query strict whitelist regex, host hardcoded (`api.jolpi.ca`), sezon-aware cache (tarihsel uzun, current kısa+SWR), 8s timeout, 404→`{MRData:{}}`.
- **.env.example** — `CRON_SECRET`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL` eklendi.

## Değişen / oluşan dosyalar
supabase/migrations/20260603000001_initial_schema.sql · lib/supabase.ts · lib/f1Calendar.ts · config/team-colors.ts · types/database.ts · lib/data/{f1,news,fs,siteUrl,logger,types}.ts · app/api/f1-season/route.ts · .env.example

## Çalıştırılan komutlar
- `npx supabase db push` (×3 — bkz. hatalar), `npx supabase migration repair`, `npx supabase migration list`
- `npm run build` → ✅ exit 0, sıfır TS hatası
- `npm run dev` + curl ile proxy smoke test

## Karşılaşılan hatalar ve çözümleri
1. **`db push` "Remote database is up to date" ama tablo yok** → migration adı `001_initial_schema.sql` Supabase'in `<timestamp>_name.sql` konvansiyonuna uymuyordu; CLI dosyayı atladı ama history'ye phantom `001` yazdı. **Çözüm:** `20260603000001_initial_schema.sql`'e yeniden adlandır.
2. **"Remote migration versions not found"** → phantom `001` remote history'de kaldı. **Çözüm:** `migration repair --status reverted 001`.
3. **`permission denied for table f1_snapshots` (42501)** → RLS policy var ama table-level GRANT yok; yeni tablolar anon/authenticated'a otomatik grant edilmez. **Çözüm:** migration'a `grant select ... to anon, authenticated` + `grant ... to service_role` eklendi; `repair --status reverted` + `db push` ile idempotent yeniden uygulandı.
4. **TS: `Property 'data' does not exist on type 'never'`** (lib/data/f1.ts) → `timed()` generic + `maybeSingle()` zincirinde tip inference `never`'a düştü. **Çözüm:** `maybeSingle<{ data: Json }>()` explicit tip.

## Doğrulama (çalıştığını gördük)
- `npx supabase migration list` → Local = Remote = `20260603000001` (senkron).
- Anon REST: `f1_snapshots` → `[]` (public read OK), `stories` → `[]` (RLS published-only OK).
- Proxy smoke: `?path=2026` → `MRData.RaceTable.season=2026` (200); `?path=2024/1/results` → 1 race, winner VER (200, **canlı Jolpica akıyor**); `?path=999` → 400; SSRF `169.254.169.254` → 400; no-path → 400.
- `npm run build` → exit 0, sıfır TS hatası. Rotalar: `/`, `/_not-found` (static), `/api/f1-season` (dynamic).

## Sonraki adım
- **Phase 3 devamı:** ingestion adapter katmanı (`lib/f1/sources/{f1db,jolpica,openf1}.ts`), `lib/f1Ingest.ts`, `lib/news/aggregate.ts`, cron route'ları (`sync-f1`, `sync-news`, `sync-radio`), `vercel.json` crons, seed script'leri (`seed-f1db`, `seed-stories`, `seed-radio`).
- **⚠️ MANUEL (User):** `CRON_SECRET` + `GEMINI_API_KEY` Vercel env'e gir → `vercel env pull`. migration-source eski HEAD'den kurtarma + içerik doğrulama.
- **Phase 4 (Cursor):** veri katmanı hazır; UI shell + sayfalar inşa edilebilir.

## ⚠️ Not — masterplan ile uyum
- Masterplan'da migration adı `001_initial_schema.sql` yazıyordu; Supabase CLI konvansiyonu gereği `20260603000001_initial_schema.sql` olarak uygulandı (fonksiyonel olarak aynı, isim düzeltmesi).
- `f1Calendar.ts` `CURRENT_DRIVERS`/`CURRENT_TEAMS` sabitleri bu dilimde EKLENMEDİ (pilot/takım listesi `team-colors.ts` + Ergast snapshot'larında; gerektiğinde Phase 4'te eklenecek). `getF1Context` temporal çekirdek tamam.
