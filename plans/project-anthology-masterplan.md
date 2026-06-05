# Project Anthology — Masterplan (Phase 0 → Production-Ready)

> **Amaç:** Bu doküman, projeyi mevcut temiz Next.js 16 iskeletinden production-ready seviyeye
> taşıyan tek ve canlı yol haritasıdır. `pre-plans/` ve `old-versions-valuable-files/` içindeki tüm
> kararlar, mimari seçimler ve anti-pattern uyarıları bu dosyaya **gömülmüştür** — bir agent yalnızca
> bu dosyayı okuyarak ne yapacağını anlayabilmelidir. Uzun kod örnekleri için
> `old-versions-valuable-files/{dosya}` referans gösterilir (kopyalanmaz, mantık referansı).

---

## 0. Nasıl kullanılır — Agent Protokolü (ÇOK-SESSION / ÇOK-AGENT)

Bu plana başlayan **her** agent, kod yazmadan önce şunları yapar:

1. `git log --oneline -8` → en son ne yapıldı?
2. `logs/` içindeki **en yeni** `AGENT_*.md` dosyasını oku → son phase çıktısı, blocker'lar, "sonraki adım".
3. Bu plandaki **ilk işaretsiz `[ ]` checkbox** → senin başlangıç noktan.
4. O phase'in **"▶ Başlamadan önce"** briefini oku. **ÖNKOŞUL** phase'i `✅` değilse DURMA — önce onu tamamla. Bağımsız çalışma yok; her adım öncekinin zeminine oturur.
5. `npm run build` çalıştır. Kırıksa **önce onu düzelt** (zemin sağlam olmadan üstüne inşa yok).

**Phase bitince (zorunlu):**
- Checkbox'ları işaretle.
- `logs/AGENT_{KONU}_{TARIH}.md` yaz: ne yapıldı (maddeler) / değişen dosyalar / çalıştırılan komutlar / hata+çözüm / sonraki adım.
- `git commit` (açıklayıcı mesaj). `npm run build` sıfır hata vermeden commit yok.

**Sorumluluk:** Her phase başlığında `[Sorumlu: Claude Code | Cursor | User]` var. **Sorumlusu User olan phase'e agent DOKUNMAZ** — yalnızca slot/placeholder hazırlar.

**Roller:**
- **Claude Code** = mimar / backend / veri / Supabase / API / Cron / güvenlik (CSO) / QA / DevOps.
- **Cursor** = frontend / UI / Tailwind / animasyon / sayfa inşası. Mimari hatayı çözmeye çalışma, Claude'a pasla.
- **User** = manuel aksiyonlar (env, login) + tüm görsel asset üretimi.

---

## 1. Okunan kaynaklar + özet

**pre-plans/**
- `pre-plan.md` — Phase 0-4 iş akışı, backend-first felsefe, sorumlu dağılımı (Claude/Cursor/User).
- `database-schema-plan.md` — 5 tablolu model referans gerçeklik; tek-tablo snapshot, jsonb ham veri, RLS (public read / service_role write), kanonik `type` CHECK, eksik composite index'ler, ölü `news_cache` yazım yolu.
- `data-ingestion-plan.md` — Eski disk-bağımlı sync'in kusurları; hedef in-memory Cron, bounded concurrency + backoff, `isRaceDone`, `upsert onConflict`, `CRON_SECRET` auth, service-role guard.
- `production-process-philosophy.md` — "Karardan Koda": gerçekliği önce öğren, veriyi baştan getir, kararları belgele, plan canlı belge, her adım doğrulanır ("çalışmalı" değil "çalıştığını gördük").
- `asset-production-by-user.md` — **User** görsel görevleri: takım SVG, pilot portre, 24 pist SVG, lastik ikon, anthology görsel.
- `DESIGN_SYSTEM.md` — Tasarım SSOT: tipografi (Bebas Neue / Barlow Condensed / Inter / IBM Plex Mono), tek accent `#ff1801`, atmospheric hero katmanları, kart/navbar/shimmer/transition spec, 0 radius/shadow.
- `CLAUDE.md` (pre) & `CURSOR.md` — rol anayasaları.

**old-versions-valuable-files/**
- `README.md` & `audit-raporu.md` — gold nuggets vs technical debt; KEEP/MODIFIED/SKIP envanteri. İyi: SWR/cache-warmup, proxy SSRF, health. Kötü: CSR/Vite, disk I/O, serverless uyumsuzluğu, monolit JS.
- `001_f1_snapshots.sql` — **superseded** iki-tablolu legacy şema (taşınmaz; mantığı `f1_snapshots`'ta yaşıyor).
- `sync-f1-snapshots.mjs` / `sync-f1-to-supabase.mjs` — eski disk-bağımlı sync; retry/backoff/`isRaceDone`/upsert/guard mantığı korunur, disk I/O atılır.
- `newsService.ts` — client SWR (`news_cache_v2` localStorage, `warmNewsOnLoad`, `FALLBACK_NEWS_URL`); mantık RSC+DB'ye taşınır.
- `route.ts` (news) — RSS aggregator: F1 filtre, canonical dedupe, Jaccard cluster (eşik 0.55), per-feed timeout, rate-limit, SSRF-safe. `lib/news/aggregate.ts`'e çıkarılır.
- `newsSummary.ts` — Gemini 2.0 Flash özet (timeout + fallback; anahtar yoksa null). Opsiyonel.
- `team-colors.ts` — 2026 takım renk SSOT (`getTeamByName`, `resolveTeamUiColor`, `teamColorsCssVars`). `config/`'e taşınır.
- `site-nav.tsx` / `shimmer.tsx` — taşınabilir UI (nav + skeleton).
- `tailwind.config.js` — v3 token referansı (Stitch palet, font scale, 0 radius); v4 `@theme`'e çevrilir.
- `news.test.ts` — `processFeeds` testleri (sort/dedupe/cluster/filter) → yeni aggregate için port edilir.

---

## 2. Mimari Kararlar (GÖMÜLÜ — agent dış dosyaya bakmadan uygular)

### A. Supabase şema — `supabase/migrations/001_initial_schema.sql`
5 tablo: `stories`, `radio_moments`, `circuits`, `f1_snapshots`, `news_cache`.

- **`f1_snapshots`**: `id bigint generated always as identity PK`, `season int not null`, `round int null`, `type text not null`, `data jsonb not null`, `source text not null`, `fetched_at timestamptz not null default now()`, `UNIQUE(season, round, type)`.
  - **Kanonik `type` CHECK:** `('calendar','standings_drivers','standings_constructors','results','qualifying','sprint','circuit')`. `driverStandings` / `results-1` / `qualifying-1` **asla** yazılmaz → `roundSuffixToSnapshotType` normalize eder.
  - **`source` CHECK:** `('f1db','jolpica','openf1')` (hangi kaynaktan — gözlemlenebilirlik, Karar E).
- **`stories`**: `id text PK` (veya bigint), `slug text UNIQUE not null`, `title`, `content jsonb`, `published boolean default false`, `sort_order int default 0`, `created_at timestamptz default now()`.
- **`radio_moments`**: `id`, `slug UNIQUE`, `driver text`, `team text`, `constructor_id text`, `year int`, `round int`, `gp_name text`, `transcript text`, **`audio_url text`** (OpenF1), **`source text`**, `published boolean default false`.
- **`circuits`**: `id text PK` (Ergast circuitId), `data jsonb`, `updated_at timestamptz` (trigger'lı).
- **`news_cache`**: `id`, `url text UNIQUE not null`, `source text`, `title`, `description`, `summary`, `image_url`, `published_at timestamptz`, `tags text[]`, `cached_at timestamptz default now()`.

**Index'ler (IF NOT EXISTS):**
```
f1_snapshots(season, type)              -- en sık erişim
f1_snapshots(season, round, type)       -- round bazlı
f1_snapshots(fetched_at)                -- staleness
stories(published, sort_order)
radio_moments(published, year DESC)
news_cache(published_at)
news_cache(cached_at)                   -- retention
news_cache USING GIN (tags)
```

**RLS (tüm tablolarda açık):**
- Public `SELECT`: `stories`/`radio_moments` → `published = true`; `circuits`/`f1_snapshots`/`news_cache` → `true`.
- `INSERT`/`UPDATE`/`DELETE`: yalnızca `auth.role() = 'service_role'`. anon asla yazamaz.

### B. Cron auth & runtime deseni (her cron route'ta)
```ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;            // Vercel default timeout 300s
// 1) Auth: Authorization: Bearer ${CRON_SECRET_KEY} doğrula → eşleşmezse 401
// 2) Admin: getSupabaseAdmin() — service key yoksa 500 (anon'a DÜŞME yok)
// 3) İş: in-memory fetch → guard → upsert → özet JSON { source, upserted, skipped, errors }
```

### C. Env değişkenleri (`.env.example`'a eklenecek)
Mevcut: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
**Eklenecek:** `CRON_SECRET_KEY` (cron auth — Vercel'daki env adı), `GEMINI_API_KEY` (opsiyonel haber özeti), `NEXT_PUBLIC_SITE_URL` (RSC mutlak fetch — Vercel'da TANIMSIZ; kod hardcoded prod fallback'e düşer: `https://project-anthology-three.vercel.app`). OpenF1 ve F1DB **auth gerektirmez** (anahtar yok).

### D. Anti-pattern guard (HER phase'de geçerli)
- İki-tablolu snapshot modeline dönüş **yok** (tek `f1_snapshots`).
- Diske yazıp DB'ye okuma **yok** (in-memory upsert).
- CSR / ham dış veriyi client'a çekme **yok** (RSC, server-side).
- `type` serbest metin **yok** (CHECK ile kanonik küme).
- `news_cache` okuyup hiç yazmama **yok** (cron besler).
- Yazım yolunda anon key'e sessizce düşme **yok** (service-role zorunlu).
- Sezon/pilot/takım **hardcode yok** → tek kaynak `@/lib/f1Calendar` (`getF1Context`).
- API key client'a expose **yok**.
- **Tek F1 kaynağına kilitlenme yok** (adapter + fallback — Karar E).
- **OpenF1 rate-limit aşımı yok** (3 req/s, 30 req/dk).

### E. ÇOK KAYNAKLI F1 veri mimarisi
Tek kaynak (Jolpica) riski: gönüllü ekip, ~$45/ay hosting, SLA yok. Üç kaynak, **her biri güçlü olduğu
yerde**; `data-ingestion-plan.md`'nin in-memory upsert mimarisi **korunur**. Tek değişiklik:
`fetchErgast`'in tek-kaynak çağrısı **kaynak-adapter katmanına** soyutlanır. Tüm kaynaklar Ergast-şekilli
`MRData` zarfına normalize edilir → tek yazım yolu `upsertF1Snapshot(season, round|null, type, data, source)`.

| Kaynak | Rol | Neden | Erişim | Kapsam |
|---|---|---|---|---|
| **F1DB** (github.com/f1db/f1db) | **Tarihsel seed** (1950 → geçen sezon) | Statik GitHub Release; uptime riski **0**; CC-BY-4.0; rate-limit yok | Release asset (JSON), CalVer `YYYY.RR.MICRO` | Tam tarihsel arşiv + pist SVG (`src/assets/circuits`, 4 stil) |
| **Jolpica/Ergast** | **Canlı sezon** (current + bitmiş round'lar) | Düşük hacim, incremental; tarihsel için kullanılmaz | `api.jolpi.ca/ergast/f1` | calendar, standings, results, qualifying, sprint |
| **OpenF1** (api.openf1.org/v1) | **Telsiz audio** + (ileride) telemetri | Ücretsiz, auth yok, `team_radio` audio URL'li; 2023→ | query param; **rate-limit 3 req/s, 30 req/dk** | radio_moments audio, lap/pit/position |

**Okuma fallback sırası (`lib/data/f1.ts`):** Supabase `f1_snapshots` (DB — tek gerçek kaynak) → build-time static (varsa) → Jolpica proxy (son çare, yalnız canlı). **Tarihsel veri her zaman DB'den** (F1DB seed yazmıştır); tarihsel için Jolpica'ya gidilmez.

**Ingestion sorumluluğu:**
- `scripts/seed-f1db.ts` (**ilk kurulum, bir kez**): F1DB JSON release → Ergast-şekline map → `upsertF1Snapshot(..., source='f1db')`. Tüm tarihsel sezonlar.
- `app/api/cron/sync-f1` (15dk / haftalık): **yalnız current season** Jolpica → `source='jolpica'`. Kapsam `getF1Context()`.
- `app/api/cron/sync-radio`: OpenF1 `team_radio` → `radio_moments.audio_url` upsert → `source='openf1'`.

**Adapter arabirimi:** `lib/f1/sources/{f1db,jolpica,openf1}.ts` her biri `toMrData(raw): MRData` döndürür; `lib/f1Ingest.ts` kaynaktan bağımsız upsert eder. Yeni kaynak = yeni adapter, **yazım yolu değişmez**.

---

## 3. Phase'ler

> Her phase: `## Phase N — ad [Sorumlu]`, `ÖNKOŞUL`, `NEDEN BU SIRA`, `▶ Başlamadan önce`, `Todo (checkbox)`, `⚠️ Olası problem → çözüm`, `Doğrulama (DoD)`, `Phase sonu`.

---

### Phase 1 — Temporal SSOT + Tasarım Token Zemini  [Sorumlu: Claude Code + Cursor]
**ÖNKOŞUL:** Phase 0 ✅ (iskelet hazır).
**NEDEN BU SIRA:** Sezon/pilot/takım sabitleri ve tasarım token'ları her şeyin zeminidir; bunlar olmadan ne veri ne UI hardcode'suz yazılabilir.

**▶ Başlamadan önce (agent brief)**
- Oku: bu plandan Karar D (hardcode yasağı) + `DESIGN_SYSTEM.md` (token değerleri) + `old-versions-valuable-files/team-colors.ts` (renk SSOT referans).
- Üreteceğin dosyalar: `lib/f1Calendar.ts`, `config/team-colors.ts`, `app/globals.css` (genişletilir), `app/layout.tsx` (next/font).
- Tükettiği önceki çıktı: yok (zemin).

**Todo**
- [x] `lib/f1Calendar.ts`: `getF1Context()`, `CURRENT_SEASON`, `F1_SEASON_MIN`, `isRaceWeekend`, `isRaceDone`, `getNextRace`, `getLastFinishedRace`. Tek SSOT. *(2026-06-03: temporal çekirdek tamam; `CURRENT_DRIVERS/TEAMS` Phase 4'e ertelendi — pilot/takım `team-colors.ts`+Ergast'ta.)*
- [x] `config/team-colors.ts`: eski `team-colors.ts` birebir taşındı (`getTeamById/ByName`, `resolveTeamUiColor`, `teamColorsCssVars`). *(2026-06-03)*
- [x] `app/globals.css`: Tailwind v4 `@theme` — renk skalası (`#0a0a0a` bg, `#131313` surface, `#141414` card, `#ff1801` accent, `#f4f1ea` paper), font aileleri, spacing (navbar 52px, section-gap 80px), `--radius: 0`. *(2026-06-04 Phase 4)*
- [x] `app/layout.tsx`: `next/font` ile Bebas Neue / Barlow Condensed / Inter / IBM Plex Mono (CDN'den font yükleme yok). *(2026-06-04 Phase 4)*
- [x] Küçük demo: `/` token'ları gösteren minimal hero (Cursor; placeholder). *(2026-06-04 Phase 4 hub)*

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| Tailwind v4'te v3 JS config çalışmaz | Token'lar `@theme` ile CSS'te; `tailwind.config.js` yazma |
| next/font + Bebas Neue (Google Fonts) | `next/font/google`; yoksa `next/font/local` + woff2 |
| Sezon hardcode kayması | Tüm sezon/pilot referansı `getF1Context()` üzerinden |

**Doğrulama (DoD)**
- [x] `npm run build` → exit 0. *(2026-06-04 Phase 4)*
- [x] Demo sayfada fontlar + `#ff1801` accent + 0 radius görünür. *(2026-06-04 / hub)*

**Phase sonu:** [x] log (AGENT_PHASE4_UI_SHELL_2026-06-04) [x] commit [x] checkbox'lar — **Phase 1 token zemini (UI dilimi) ✅**

---

### Phase 2 — Veritabanı Şeması + Tipler + Client  [Sorumlu: Claude Code]
**ÖNKOŞUL:** Phase 1 ✅ (sezon sabitleri — şema seed/validasyonda kullanılır).
**NEDEN BU SIRA:** Veri katmanı şema olmadan yazılamaz; şema "değişmez çekirdek"tir.

**▶ Başlamadan önce**
- Oku: Karar A (şema) + Karar D + `old-versions-valuable-files/001_f1_snapshots.sql` (**superseded** — taşıma, sadece mantık referansı).
- Üreteceğin dosyalar: `supabase/migrations/001_initial_schema.sql`, `types/database.ts`, `lib/supabase.ts`.
- Tükettiği önceki çıktı: `lib/f1Calendar.ts` (F1_SEASON_MIN, sezon aralığı).

**Todo**
- [x] `supabase/migrations/20260603000001_initial_schema.sql`: Karar A — 5 tablo + kanonik `type` CHECK + `source` CHECK + index'ler + RLS + `updated_at` trigger + **table-level GRANT'ler**. *(2026-06-03; isim Supabase timestamp konvansiyonuna uyduruldu)*
- [x] `types/database.ts`: her tablo `Row`/`Insert`/`Update` + `Database` generic + kanonik union'lar. *(2026-06-03)*
- [x] `lib/supabase.ts`: `getSupabaseClient()` (anon) + `getSupabaseAdmin()` (service_role; key yoksa `throw`). *(2026-06-03)*
- [x] `npx supabase db push` → canlı DB'ye uygulandı. *(2026-06-03; GRANT eksikliği 42501 düzeltildi)*

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| `db push` login ister | Supabase login (User yaptı); `npx supabase` wrapper |
| Yazımda anon'a sessiz düşüş (RLS fail) | `getSupabaseAdmin()` service key null'da throw |
| `type` drift (`driverStandings` vs `standings_drivers`) | CHECK constraint + `roundSuffixToSnapshotType` (Phase 3) |
| Migration tekrar çalıştırma | `IF NOT EXISTS` + idempotent policy `drop if exists` |

**Doğrulama (DoD)**
- [x] `npx supabase db push` → başarı (migration history senkron).
- [x] Anon REST: `f1_snapshots`/`stories` SELECT → `[]` (RLS + GRANT doğru). *(introspection cache gecikmesi kozmetik)*
- [x] `npm run build` → exit 0.

**Phase sonu:** [x] log (AGENT_PHASE1_DB_DATA_LAYER_2026-06-03) [x] commit [x] checkbox'lar — **Phase 2 ✅**

---

### Phase 3 — Veri Katmanı + Çok-Kaynaklı Ingestion  [Sorumlu: Claude Code]
> **Durum (2026-06-03):** Okuma katmanı + Jolpica proxy **tamam**; ingestion (adapter/cron/seed) **bekliyor**.
**ÖNKOŞUL:** Phase 2 ✅ (tablolar canlı, client hazır).
**NEDEN BU SIRA:** UI veriyi okuyacak; veri DB'de olmadan sayfa inşa edilemez. Karar E (çok kaynak) + B (Cron auth) burada uygulanır.

**▶ Başlamadan önce**
- Oku: Karar A/B/C/D/E + `old-versions-valuable-files/`: `sync-f1-*.mjs` (retry/backoff/isRaceDone/upsert), `route.ts` (news RSS/dedupe/cluster/SSRF), `newsService.ts` (SWR), `news.test.ts` (test deseni), `newsSummary.ts` (Gemini).
- Üreteceğin dosyalar: aşağıda.
- Tükettiği önceki çıktı: `lib/f1Calendar.ts` (kapsam), `lib/supabase.ts` (admin), `types/database.ts`.

**Todo**
- [x] `lib/data/{f1,news,fs,siteUrl,logger,types}.ts`: 3-katman okuma (DB → static → Jolpica proxy) + logging. *(2026-06-03)*
- [x] `lib/f1/sources/f1db.ts`, `jolpica.ts`, `openf1.ts`: her biri `toMRData(raw): MRData` adapter. *(2026-06-04)*
- [x] `lib/f1Ingest.ts`: kaynaktan bağımsız `upsertF1Snapshot(..., source)`, **disk-cache YOK**, bounded concurrency (`runBounded`), `isRaceDone`, `roundSuffixToSnapshotType` (kanonik küme). *(2026-06-04)*
- [x] `lib/news/aggregate.ts`: `route.ts`'ten RSS mantığını çıkar (F1 filtre, canonical dedupe, Jaccard cluster 0.55) — route + cron paylaşır. *(2026-06-04)*
- [x] `app/api/cron/sync-f1/route.ts`: yalnız current season, Jolpica → `source='jolpica'` (Karar B). *(2026-06-04)*
- [x] `app/api/cron/sync-news/route.ts`: `aggregate()` → `news_cache` upsert(onConflict 'url') + 30g retention. *(2026-06-04)*
- [x] `app/api/cron/sync-radio/route.ts`: OpenF1 `team_radio` → `radio_moments.audio_url` → `source='openf1'`; rate-limit ≤3 req/s. *(2026-06-04)*
- [x] `app/api/f1-season/route.ts`: SSRF-hardened Jolpica proxy (whitelist regex, sezon-aware cache). *(2026-06-03; smoke-tested)*
- [x] `vercel.json`: crons (`sync-f1` 15dk, `sync-news` 30dk, `sync-radio` saatlik). *(2026-06-04)*
- [x] `scripts/seed-f1-history.ts` (**tarihsel tek-seferlik backfill, F1DB**, 2018→currentYear, `--dry-run` destekli). *(2026-06-04)*
- [x] migration-source eski git HEAD'den kurtar: içerik initial commit `a07f942`'te bulundu; 17 hikaye `data/stories/content.ts`'ye taşındı (Phase 6'da seed edildi). radioArchive.js ileride radio seed için. *(2026-06-05)*
- [ ] Hedefli testler: aggregate dedupe/cluster/filter (news.test.ts port), `roundSuffixToSnapshotType`, `isRaceDone`, her adapter `toMrData` (örnek payload → MRData).

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| Jolpica tek-kaynak SLA riski | F1DB tarihsel seed + Jolpica yalnız canlı + adapter (kaynak değiştir = adapter değiştir) |
| Jolpica 429 (tarihsel) | Tarihsel **asla** Jolpica'dan; F1DB statik release → rate-limit 0 |
| OpenF1 rate-limit (3/s, 30/dk) | bounded concurrency ≤3 + 60s pencere sayacı + backoff |
| Cron timeout | `maxDuration=300`; current-season hacmi küçük |
| Tarihsel sezonu tekrar çekme | `year < currentSeason` & satır var → atla (`fetched_at` guard) |
| `news_cache` ölü relation | cron `upsert(onConflict 'url')` + 30g retention |
| serverless FS yazılamaz | in-memory; F1DB release belleğe indirilir, diske yazılmaz |
| Kaynaklar farklı şekil | her adapter `toMrData` ile Ergast `MRData`'ya normalize |
| Cron `Bearer` eşleşmezse | 401; `CRON_SECRET_KEY` Vercel env (User) |

**⚠️ MANUEL AKSİYON GEREKLİ (User):**
- `CRON_SECRET_KEY` ve (opsiyonel) `GEMINI_API_KEY` → Vercel env'e gir → `vercel env pull .env.local`.
- migration-source kurtarılan hikaye/telsiz içeriğini doğrula.
- (OpenF1/F1DB auth gerektirmez — manuel anahtar yok.)

**Doğrulama (DoD — "çalıştığını gördük")**
- [ ] `npm run seed:f1db` → tarihsel satırlar (`source='f1db'`) DB'de (satır sayısı raporlanır). *(User: CRON_SECRET_KEY + seed çalıştırma)*
- [ ] Cron manuel tetikle: `curl -H "Authorization: Bearer $CRON_SECRET_KEY" .../api/cron/sync-f1` → current-season (`source='jolpica'`) satırları DB'de. *(User: env sonrası)*
- [ ] `sync-radio` → OpenF1 audio (`source='openf1'`) satırları `radio_moments`'ta. *(User: env sonrası)*
- [ ] Testler yeşil. *(ertelendi — Phase 4 sonrası)*
- [x] `npm run build` → exit 0. *(2026-06-04)*

**Phase sonu (kod):** [x] log [x] commit [x] checkbox'lar — **Phase 3 ingestion kodu ✅** (DoD tam: seed + cron curl doğrulaması User env sonrası)

---

### Phase 4 — Core UI Shell + Sayfalar  [Sorumlu: Cursor]
**ÖNKOŞUL:** Phase 3 ✅ (veri DB'den okunabilir).
**NEDEN BU SIRA:** UI gerçek veriye oturur; placeholder asset'lerle inşa edilir, Phase 5'te hydrate olur.

**▶ Başlamadan önce**
- Oku: `DESIGN_SYSTEM.md` (TÜM spec) + `pre-plans/CURSOR.md` + `old-versions-valuable-files/{site-nav,shimmer}.tsx` (taşınabilir UI).
- Üreteceğin dosyalar: `app/(site)/layout.tsx`, `app/(site)/_components/*`, sayfa `page.tsx`'ler.
- Tükettiği önceki çıktı: `lib/data/*` (RSC fetch), `lib/f1Calendar.ts`, `config/team-colors.ts`, `app/globals.css` token'lar.

**Todo**
- [x] `app/layout.tsx` + `SiteNav` + `MobileBottomNav` (site-nav.tsx referans) + atmospheric hero katmanları + `ShimmerGrid`. *(2026-06-04)*
- [x] Framer Motion `#ff1801` sweep page transition (`AnimatePresence`); `prefers-reduced-motion` → instant swap. *(2026-06-04)*
- [x] Sayfalar (RSC, DB'den okur, placeholder asset + hydrate slotları): `/` (Hub: quick standings, countdown, AI news highlights), `/season`, `/circuits`, `/radio` (OpenF1 audio player), `/news`. *(2026-06-04)*
- [x] `next/image` + placeholder fallback; asset yoksa kırılmaz. *(2026-06-04 SafeImage)*

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| Hydration mismatch | Veri RSC'de fetch; client'a yalnız interaktif parça (`'use client'`) |
| Asset yokken kırılma | Placeholder SVG + `next/image` fallback; slot Phase 5'te hydrate |
| Mimari/veri hatası | Cursor çözmez → Claude'a pasla (CURSOR.md) |

**Doğrulama (DoD)**
- [x] Tüm rotalar 200; hydration/console hatası yok. *(build + static routes)*
- [x] `npm run build` → exit 0. *(2026-06-04)*

**Phase sonu:** [x] log (AGENT_PHASE4_UI_SHELL_2026-06-04) [x] commit [x] checkbox'lar — **Phase 4 ✅**

---

### Phase 5 — Görsel Asset Üretimi  [Sorumlu: User]  (AGENT DOKUNMAZ)
**ÖNKOŞUL:** Phase 4 ✅ (placeholder slotlar + hydrate mantığı hazır). Story görselleri `public/stories/` altında 17 story-id klasörüne organize edildi (120 PNG, 3 layout: full/landscape/portrait). bacinger/f1-circuits reposu `scripts/geojson-to-svg.mjs` ile işlendi.
**NEDEN BU SIRA:** Slotlar olmadan asset yerleşemez; Cursor Phase 4'te hydrate'i garanti etmiştir.

**▶ Bağlam (User)**
- `asset-production-by-user.md` görevleri. Agent kod yazarken sen materyalleri hazırlar, belirlenen klasörlere (veya Supabase Storage) yüklersin; UI otomatik hydrate olur.

**Todo (User)**
- [x] Task 1: 11 takım kimliği (`.svg`) — `config/team-colors.ts` renkleriyle eşleşir. **Tamamlandı:** `public/teams/` altında 11 SVG. Primary/secondary/accent renk sistemi, diagonal overlay, accent şerit.
- [x] Task 2: 22 pilot ikonu (`.svg`). **Tamamlandı:** `public/drivers/` altında 22 SVG. `LEC/16` formatı, takım primary/accent renkleri.
- [x] Task 3: 24 pist haritası (`.svg`). **Tamamlandı:** `public/circuits/` altında 24 SVG. bacinger/f1-circuits GeoJSON → piksel projeksiyon, `scripts/geojson-to-svg.mjs` ile üretildi. DRS/sektör katmanları ertelendi.
- [x] Task 4: lastik ikonları (`.svg`) — Pirelli. **Tamamlandı:** `public/tyres/` altında 7 SVG. C1-C5 (slick), Intermediate, Wet. Slick düz yüzey, ıslak diş dokulu.
- [ ] Task 5: anthology/glossary destek görselleri (`.webp`) — CC vintage foto / konsept vektör. **Phase 6'ya ertelendi** — içerik yazılmadan görsel üretilemez.

**Doğrulama (DoD)**
- [x] Dosyalar eklendikçe UI placeholder'dan gerçek asset'e otomatik hydrate olur (Cursor Phase 4 garantisi). *(Task 1-4 asset'leri hazır; Task 5 Phase 6 ile gelecek.)*

---

### Phase 6 — İçerik Sayfaları (anthology / tech-glossary)  [Sorumlu: Cursor + Claude Code]
**ÖNKOŞUL:** Phase 3 ✅ (`stories` DB) + Phase 4 ✅ (shell).
**NEDEN BU SIRA:** İçerik shell ve veri katmanı üstüne oturur.

**▶ Başlamadan önce**
- Oku: `pre-plan.md` Phase 3 Adım 3 + `DESIGN_SYSTEM.md`.

**Todo**
- [x] `/anthology`: `stories` (jsonb content) → RSC render. `StoryCard` (DESIGN_SYSTEM kart spec: full-bleed image, gradient overlay, IBM Plex Mono kategori, Bebas Neue başlık, in-place expand). 17 hikaye seed edildi (`scripts/seed-stories.ts`, published=true). *(2026-06-05)*
- [x] `/anthology/[slug]`: detay sayfası, jsonb blocks render + `generateStaticParams` (17 SSG) + `generateMetadata` (dinamik OG). *(2026-06-05)*
- [x] `/tech-glossary`: statik içerik — `data/glossary/terms.ts` (11 terim, kategoriye gruplu). Karar: DB değil tracked TS modülü (sabit referans, anchor slug, build-time tüketim). *(2026-06-05)*
- [x] Internal-linking component `components/GlossaryLink.tsx`: regex + kelime sınırı `\b` + case-insensitive + terim başına tek link + alias; saf server component. *(2026-06-05)*

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| Regex linking yanlış eşleşme | Kelime sınırı + glossary anahtar kümesi; case-insensitive, tek-eşleşme ✅ |

**Doğrulama (DoD):** [x] içerik render (anthology/glossary 200, GlossaryLink çalışıyor), [x] `npm run build` exit 0 (27/27 sayfa). *(2026-06-05)*
**Phase sonu:** [x] log (AGENT_PHASE6_CONTENT_20260605) [x] commit [x] checkbox'lar — **Phase 6 ✅**

---

### Phase 7 — SEO + QA  [Sorumlu: Claude Code]
**ÖNKOŞUL:** Phase 4 + 6 ✅.
**NEDEN BU SIRA:** SEO/QA tamamlanmış sayfalar üstünde anlamlı.

**▶ Başlamadan önce**
- Oku: `pre-plan.md` Phase 4 + `pre-plans/CLAUDE.md` (QA/CSO).

**Todo**
- [ ] Dinamik Open Graph meta (`generateMetadata`) + JSON-LD schema (tüm sayfalar).
- [ ] `sitemap.ts` + `robots.ts`.
- [ ] Headless smoke (rotalar 200, console/hydration temiz).
- [ ] Supabase index kullanımı + Vercel cache (`s-maxage`/SWR) kurallarını teyit.

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| OG image üretimi | `next/og` (ImageResponse) dinamik OG |
| Yavaş first paint | RSC + `news_cache`/`f1_snapshots` indexli SELECT (RSS kullanıcı yolundan çıkar) |

**Doğrulama (DoD):** [ ] `npm run build` exit 0, [ ] rotalar 200, [ ] temel Lighthouse geçer.
**Phase sonu:** [ ] log [ ] commit [ ] checkbox'lar

---

### Phase 8 — Production Deploy & Doğrulama  [Sorumlu: Claude Code]
**ÖNKOŞUL:** Phase 7 ✅.
**NEDEN BU SIRA:** Tüm zemin sağlam; production'a son adım.

**▶ Başlamadan önce**
- Oku: bu plan Karar B/C + `data-ingestion-plan.md` §2 (cron prod davranışı).

**Todo**
- [ ] `git push origin main` → Vercel Continuous Deployment (production deploy).
- [ ] MCP `list_deployments` ile en yeni commit → `state: READY` teyit.
- [ ] Prod'da cron'ları doğrula (Vercel Cron Bearer ile tetiklenir; `f1_snapshots`/`news_cache`/`radio_moments` satır artışı görülür).
- [ ] `vercel env pull` ile prod ↔ local env senkron.

**⚠️ Olası problem → çözüm**
| Problem | Çözüm |
|---|---|
| Push main = prod deploy (geri dönüşü zor) | User onayı; başarısızsa Vercel rollback (`isRollbackCandidate`) |
| Cron prod'da env eksik | Phase 3 manuel env adımı tamam mı kontrol; `vercel env ls` |

**Doğrulama (DoD):** [ ] production deploy READY, [ ] cron prod'da satır yazıyor, [ ] `npm run build` sıfır hata.
**Phase sonu:** [ ] log [ ] commit [ ] checkbox'lar

---

## 4. Nihai Definition of Done (proje production-ready)
- [ ] Her phase'in DoD'si ✅; `logs/AGENT_*.md` zinciri tam.
- [ ] `npm run build` → **sıfır hata** (TS + derleme).
- [ ] Üç kaynak ingestion çalışıyor: F1DB tarihsel seed + Jolpica canlı + OpenF1 telsiz audio; `f1_snapshots.source` dağılımı DB'de görülüyor.
- [ ] Tüm rotalar 200, hydration/console temiz, SEO meta + JSON-LD mevcut.
- [ ] **Vercel production deploy READY**; cron'lar prod'da satır yazıyor.
- [ ] Anti-pattern guard (Karar D) ihlali yok.

## 5. ⚠️ MANUEL AKSİYON ÖZETİ (User)
- Supabase login (**yapıldı**).
- `CRON_SECRET_KEY` + (ops.) `GEMINI_API_KEY` + (ops.) Cloudinary → Vercel env → `vercel env pull` (Phase 3).
- migration-source kurtarılan hikaye/telsiz içeriğini doğrula (Phase 3).
- Tüm görsel asset üretimi (Phase 5).
- Production push onayı (Phase 8).
