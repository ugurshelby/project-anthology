# AGENT LOG — Phase 3 (Veri Katmanı / Ingestion Devamı)

**Tarih:** 2026-06-04
**Ajan:** Claude Code (Sonnet 4.6)
**Kapsam:** Masterplan Phase 3 ingestion dilimi — adapter katmanı, cron route'ları, seed script, vercel.json, news aggregate.

---

## Ne yapıldı (maddeler)

- **lib/f1/sources/f1db.ts** — F1DB GitHub Release adapter: `loadF1Db()` (in-memory, no disk), `toMRDataCalendar/Results/Qualifying/Sprint/DriverStandings/ConstructorStandings()`. Her biri Ergast-şekilli `MRData` döndürür. Disk I/O yok; tarihsel seed için tek-seferlik indirme.
- **lib/f1/sources/jolpica.ts** — Jolpica adapter: `fetchJolpica(path)` retry/backoff (1.2s floor, 6 retry, exp backoff), timeout 10s. `fetchCalendar/DriverStandings/ConstructorStandings/Results/Qualifying/Sprint()` convenience fonksiyonları + `hasRaces/hasDriverStandings/...` shape helper'ları.
- **lib/f1/sources/openf1.ts** — OpenF1 adapter: 350ms inter-request floor (3 req/s guard), retry/backoff. `fetchRaceSessions/TeamRadio/SessionDrivers/Meeting()`. Rate-limit masterplan Karar D'ye tam uyumlu.
- **lib/f1Ingest.ts** — Kaynak-bağımsız ingestion çekirdeği: `roundSuffixToSnapshotType()` (kanonik küme normaliser; eski disk path artefact'larını null'a map eder), `upsertF1Snapshot()` (tek yazım yolu, `as any` cast gerekti — bkz. hatalar), `runBounded()` (in-house bounded concurrency; p-limit yoktur), `ingestSeasonSnapshot/ingestRoundSnapshot()` istat yardımcıları.
- **lib/news/aggregate.ts** — `old-versions-valuable-files/route.ts` RSS mantığı çıkarıldı: F1 keyword filtre, canonical URL dedupe, Jaccard title clustering (0.55), per-feed AbortController timeout, JSDOM polyfill. `aggregate(opts)` public API; `processFeeds()` saf fonksiyon (test edilebilir).
- **app/api/cron/sync-f1/route.ts** — Karar B tam: `CRON_SECRET_KEY` Bearer auth, `getSupabaseAdmin()` service guard, `maxDuration=300`, scope `live|season`, `isRaceWeekend` short-circuit, calendar+standings+round results/qualifying/sprint upsert.
- **app/api/cron/sync-news/route.ts** — `aggregate()` → `news_cache` upsert (onConflict 'url') + 30 gün retention delete.
- **app/api/cron/sync-radio/route.ts** — OpenF1 `team_radio` → `radio_moments` upsert (onConflict 'slug'); driver roster lookup; GP name meeting API.
- **vercel.json** — 3 cron: `sync-f1` her 15dk, `sync-news` her 30dk, `sync-radio` her saat.
- **scripts/seed-f1-history.ts** — F1DB release → 2018..currentYear tarihsel seed; `--from/--to/--dry-run` argümanları; `runBounded(CONCURRENCY=5)`; disk I/O yok.
- **package.json** — `jsdom + @types/jsdom` bağımlılığı eklendi (news aggregate Node polyfill), `seed:f1db` script eklendi.
- **types/database.ts** — `Relationships: never[]` her tabloya eklendi (supabase-js v2 `GenericTable` uyumu); `NewsCacheInsert.tags` `unknown` olarak düzeltildi (supabase-js generic çakışma — bkz. hatalar).

---

## Değişen / oluşan dosyalar

```
lib/f1/sources/f1db.ts       (yeni)
lib/f1/sources/jolpica.ts    (yeni)
lib/f1/sources/openf1.ts     (yeni)
lib/f1Ingest.ts              (yeni)
lib/news/aggregate.ts        (yeni)
app/api/cron/sync-f1/route.ts   (yeni)
app/api/cron/sync-news/route.ts (yeni)
app/api/cron/sync-radio/route.ts (yeni)
vercel.json                  (yeni)
scripts/seed-f1-history.ts   (yeni)
package.json                 (jsdom + seed:f1db eklendi)
types/database.ts            (Relationships: never[] + tags: unknown)
logs/AGENT_PHASE2_INGESTION_2026-06-04.md (bu dosya)
```

---

## Çalıştırılan komutlar

- `npm install --save jsdom && npm install --save-dev @types/jsdom`
- `npm run build` → ✅ exit 0, sıfır TS hatası

---

## Karşılaşılan hatalar ve çözümleri

1. **`upsert()` "Argument of type X is not assignable to parameter of type 'never[]'"** — supabase-js v2'nin `PostgrestQueryBuilder.upsert()` overload'u, `Database['public']['Tables'][name]` tipini `GenericTable extends { Relationships: GenericRelationship[] }` ile doğruluyor. Custom `Database` tipinde `Relationships` key yoktu → tüm tablolar `never` çözümleniyordu. **Çözüm A:** `types/database.ts`'e `Relationships: never[]` eklendi. **Çözüm B (fallback):** `data: Json` (recursive union) ve `tags: string[] | null` gibi kompleks alan tipleri hâlâ supabase-js generic chain'ini kırıyordu. Çözüm: upsert çağrılarına `(db.from('...') as any).upsert(...)` cast eklendi — 3 yerde (`f1Ingest.ts`, `sync-news/route.ts`, `sync-radio/route.ts`). Bu salt tip sorunudur; runtime davranışını etkilemez.

2. **`NewsCacheInsert.tags: string[] | null`** — `string[]` tipi supabase-js generic'inin `Record<string, unknown>` constraint'ini karşılamıyordu. **Çözüm:** `tags: unknown` olarak değiştirildi (`NewsCacheRow.tags: string[] | null` okunurken doğru kalır).

3. **`npm run build` "Another next build process is already running"** — Önceki başarısız build `.next/BUILD_ID` bıraktı. **Çözüm:** `Remove-Item .next/BUILD_ID` + yeniden `npm run build`.

---

## Doğrulama

- `npm run build` → exit 0, sıfır TS hatası.
- Rotalar: `/api/cron/sync-f1` (ƒ), `/api/cron/sync-news` (ƒ), `/api/cron/sync-radio` (ƒ) hepsi dynamic olarak listelendi.
- Tüm adapter dosyaları tip-güvenli (runtime cast hariç, bkz. hata 1).

---

## ⚠️ MANUEL AKSİYON GEREKLİ

- `CRON_SECRET_KEY` Vercel env'e girilmeli (cron auth için zorunlu). Yoksa cron route'ları 401 döner.
- `vercel env pull .env.local` ile local'e çekilmeli.
- İlk tarihsel seed için: `npm run seed:f1db` (Vercel'da değil, local'de çalıştır; `.env.local`'de `SUPABASE_SERVICE_ROLE_KEY` olmalı).

---

## Sonraki adım

- **Phase 4 (Cursor):** UI shell + sayfalar. Veri katmanı hazır: `lib/data/f1.ts` 3-tier okuma; `lib/news/aggregate.ts`; cron route'ları mevcut. Cursor `DESIGN_SYSTEM.md` + `pre-plans/CURSOR.md`'yi okuyarak başlar.
- **Seed çalıştırma (User):** `npm run seed:f1db` ile 2018–2025 tarihsel veri DB'ye yüklenebilir. `--dry-run` ile önce kontrol edilmeli.
- **Cron prod doğrulama (Phase 8):** deploy sonrası `curl -H "Authorization: Bearer $CRON_SECRET_KEY" .../api/cron/sync-f1` ile manuel tetikle.
