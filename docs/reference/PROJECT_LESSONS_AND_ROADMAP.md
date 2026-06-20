# Project Anthology (APEX) — Dikkat Dökümanı & Yol Haritası

> **Amaç:** Geliştirme sırasında yaşanan hatalar, çözümleri ve mimari kararları tek yerde toplamak.  
> Yeni geliştirici veya agent bu dosyayı okuyarak aynı tuzaklara düşmez.  
> **Son güncelleme:** 2026-06-10 · Kaynak: `logs/AGENT_*`, `plans/`, `pre-plans/`, `docs/`

---

## 1. Proje özeti

**Project Anthology (marka: APEX)** Formula 1 odaklı bir Next.js 16 (App Router) sitesidir. Canlı adres: `https://project-anthology-five.vercel.app`. Stack: **Next.js + React 19 + Tailwind 4 + Supabase (Postgres) + Vercel Cron**. Veri akışı: dış kaynaklar (Jolpica/Ergast, F1DB, OpenF1, RSS) → **server-side cron** ile Supabase'e yazılır → **RSC** katmanı `lib/data/*` üzerinden okur → UI render. Geçmiş sezon verisi F1DB seed ile DB'de; güncel sezon hem DB hem canlı Jolpica fallback ile beslenir. Haberler `/news` ve home'da canlı RSS aggregate; F1 takvimi/puan durumu için tek temporal kaynak `@/lib/f1Calendar`.

---

## 2. Tekrarlanmaması gereken hatalar

Aşağıdaki maddeler log'lardan çıkarılmış gerçek olaylardır. Format: **❌ yapıldı → ✅ çözüm**.

### 2.1 Render & cache (Next.js)

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 1 | `/season`, `/circuits`, `/anthology` `revalidate` olmadan build → **build-time'da donmuş** statik HTML; cron DB'yi güncelliyor ama sayfa eski kalıyordu. | DB okuyan sayfalara **`export const revalidate = 900`** (ISR) veya kritik sayfalara **`revalidate = 0` + `dynamic = 'force-dynamic'`**. `/season` artık force-dynamic; `/circuits` ve `/anthology` ISR 900. `/news` ve `/` → `revalidate = 0`. |
| 2 | Home `revalidate=0` (canlı) iken `/season` `revalidate=900` → **aynı standings farklı puan** (156 vs 131). | Season'ı home ile aynı tazelik yoluna al: `force-dynamic` + `fetchSeasonSnapshotTyped` staleness/content-invalid guard'ları. |
| 3 | `npm run build` sırasında paralel build → **"Another next build process is already running"**. | `.next/BUILD_ID` kilidini bekle veya temizle (`Remove-Item .next -Recurse`). Paralel agent'lar aynı anda build koşturmasın. |

### 2.2 Veri katmanı: DB vs canlı Jolpica

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 4 | DB snapshot **taze** (`fetched_at` yeni) ama içerik **boş** (F1DB seed: constructor adı yok, `raceName=""`) → UI "—" ve boş kartlar. Staleness sadece zamana bakıyordu. | `lib/data/f1.ts` → **`isSeasonSnapshotContentInvalid()`**: calendar'da tüm `raceName` boş veya standings'de hiç constructor adı yoksa DB atlanır, canlı Jolpica proxy'ye düşülür. |
| 5 | Tarihsel sezon için Jolpica proxy çağrısı (gereksiz, yavaş, rate-limit riski). | `fetchSeasonSnapshotTyped`: **`season < CURRENT_SEASON` → yalnızca DB** (Jolpica asla). Tarihsel veri `seed-f1-history` ile DB'de olmalı. |
| 6 | Güncel sezon cron arası standings/results bayat. | `lib/f1/snapshotStaleness.ts` — yarış takvimine göre post-quali/post-race **zaman-tabanlı staleness**; bayatsa canlı fallback. |
| 7 | Home `getLatestNews()` (DB `news_cache`) kullanırken `/news` canlı RSS → **Latest Intel eski kalıyordu**. | Home da **`aggregate({ maxItems: 6 })`** — `/news` ile aynı canlı kaynak. `aggregate()` 15 dk module-scope cache + serve-stale-on-error. |

### 2.3 F1DB şema & seed

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 8 | F1DB mapper `driverResults` okuyordu; gerçek alan **`raceResults`**. Result item'lar nested isim taşımıyor, sadece `driverId`/`constructorId` → **Past Winners boş**, seed results yazılmıyordu. | `lib/f1/sources/f1db.ts` tam yeniden yazım: lookup map'ler (`drivers[]`, `constructors[]`), `getF1DbLookups()`, tüm `toMRData*` fonksiyonları lookup parametreli. |
| 9 | F1DB release asset adı değişti (`f1db.json` → **`f1db-json-single.zip`**). | `loadF1Db()` + `fflate` ile in-memory unzip. |
| 10 | `seed-f1-history` çalıştırılmadan kod fix'i → kullanıcı hâlâ boş Past Winners görür. | Mapper fix sonrası **manuel**: `npm run seed:f1db` (idempotent). Dry-run: `--dry-run --from 2023 --to 2023`. |
| 11 | `import 'dotenv/config'` `.env.local` okumuyordu; `lib/supabase.ts` modül yüklenirken env boş. | `dotenv.config({ path: '.env.local' })` + supabase'te **lazy env okuma** (module-level const kaldırıldı). |

### 2.4 Supabase & ingestion

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 12 | `UNIQUE(season, round, type)` — Postgres'te **`round IS NULL` her satırı farklı sayar** → season-level upsert duplikat INSERT, partial unique index ihlali. | Migration: **`idx_f1_snapshots_season_type_no_round`** partial unique index. `lib/f1Ingest.ts` → round=NULL için **update-first, insert-if-missing** (plain upsert değil). |
| 13 | Migration `001_initial_schema.sql` — Supabase CLI **atladı** (timestamp prefix yok). | `20260603000001_initial_schema.sql` formatı zorunlu. Phantom migration → `supabase migration repair`. |
| 14 | RLS policy var ama **table-level GRANT yok** → anon `permission denied (42501)`. | Migration'a `grant select ... to anon, authenticated` eklendi. |
| 15 | `upsert()` TS hatası (`never[]`) — `Relationships` key eksik. | `types/database.ts` → `Relationships: never[]` + gerekli yerlerde `(db.from(...) as any).upsert`. |
| 16 | Disk'e yazan eski pipeline (`public/data/f1/**/*.json`) Vercel serverless'ta **çalışmaz**. | In-memory ingestion: cron → `upsertF1Snapshot` → DB. Disk yalnızca build-time fallback. |

### 2.5 Cron, Vercel & GitHub Actions

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 17 | `vercel.json` ilk planda **15 dk / 30 dk** cron; Vercel **Hobby plan günde 1 cron** limiti. | Güncel: günde 1 — `sync-news 06:00`, `sync-f1?scope=season 07:00`, `sync-radio 08:00` UTC. Yarış haftası tazeliği **read-layer staleness + force-dynamic** ile telafi. |
| 18 | `CRON_SECRET_KEY` Vercel dashboard'da yok → otomatik cron **401** (manuel curl çalışır). | Vercel env'de `CRON_SECRET_KEY` tanımla; `vercel env pull .env.local` ile senkronize et. Kod: `Bearer ${process.env.CRON_SECRET_KEY}`. |
| 19 | GitHub Actions `sync-f1-race-aware.yml` saatlik schedule, repo'da secret yok → **her saat fail** (billing/notification gürültüsü). | Schedule kaldırıldı; yalnız **`workflow_dispatch`**. Yeniden açmak: `CRON_SECRET_KEY` secret + `SITE_URL` var + schedule bloğunu geri ekle. |
| 20 | OpenF1 rate-limit → sync-radio bazı session'larda retry tükenmesi. | Non-fatal; cron 200 döner, kısmi skip. 350ms inter-request floor korunmalı. |

### 2.6 Asset & görsel yol

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 21 | Düz path `/drivers/{slug}.svg` — sezon alt klasörüne geçişten sonra **404**. | `public/drivers/{season}/`, `public/teams/{season}/`. Runtime: **`driverIconSrc(code, name, season)`**, **`teamIconSrc(name, season)`** — hardcode path yasak. |
| 22 | Ergast aksanlı `driverId` (`kimi_räikkönen`) → slug uyuşmazlığı, ikon 404. | `normalizeDiacritics()` + `ERGAST_SLUG_ALIASES` (surname-only dosya adlarına map). Test: `tests/f1-icons.test.ts`. |
| 23 | Aynı sezonda iki takımda pilot (`lawson-red-bull.svg` / `lawson-racing-bulls.svg`) — resolver **tek slug** döndürür, takım bilgisi yok. | Bilinen sınırlama; `AssetFallback` rozeti ile graceful degrade. Tam çözüm: team-aware slug veya duplicate-aware resolver (yol haritası). |
| 24 | `config/team-colors.ts` yalnızca **2026 grid**; tarihsel takım renkleri fuzzy eşleşmeyebilir. | İkon path'leri (`f1-icons.ts` `CONSTRUCTOR_NAME_TO_SLUG`) ile renk path'leri **ayrı**; tarihsel renk için palette genişletme gerekir. |
| 25 | `teamIconSrc` / `driverIconSrc` null → UI boş slot; 404 → generic placeholder. | `AssetFallback` + `SafeImage.fallbackNode` — FIA kodu / baş harf rozeti. |
| 26 | `assets/f1-circuits` git **gitlink (submodule)** ama `.gitmodules` yok → Vercel build **"Failed to fetch submodules"**. | Gitlink kaldır, düz dosya olarak commit et (`git ls-tree -r HEAD` ile `160000` kontrol). Runtime `public/circuits/` kullanır; submodule kaynak değil. |

### 2.7 UI, mimari & diğer

| # | ❌ Yapıldı | ✅ Çözüm |
|---|-----------|----------|
| 27 | `EntityDrawer` kendi fetch yapar sanıldı; aslında **props ile veri** almalı (sezon bağlamı). | Drawer yalnızca `SeasonExplorer` island'ında; seçili sezonun standings/records'undan beslenir. Yeni sayfaya kopyalarken fetch ekleme. |
| 28 | Pit-stop / en hızlı pit istatistiği istendi; snapshot'ta **veri yok**. | Season Records: puan, kazanma, podyum, 1-2 finish ile sınırlandı. Pit-stop için ayrı veri kaynağı gerekir. |
| 29 | CSP eksik direktifler → Vercel Live toolbar, BBC görselleri, Open-Meteo bloklandı. | `script-src` + `connect-src` + `frame-src` + `images.remotePatterns` güncellemeleri (`next.config.ts`) — yeni dış domain eklerken CSP'yi unutma. |
| 30 | `roundSuffixToSnapshotType("results-1")` beklenen `"results"` değil → test brief ile kod çelişkisi. | Kod bilerek **null** döndürür (`_\d+$` disk artefact reddi). DB'ye legacy path sızmasını engeller. |
| 31 | Supabase migration / env / seed işi bitmeden UI özelliği → boş ekranlar, yanlış debug. | **"Karardan Koda"** (`pre-plans/CLAUDE.md`): veri gerçekliğini öğren, sonra UI. |

---

## 3. Mimari kararlar (sakın bozma)

| Konu | Tek kaynak | Not |
|------|------------|-----|
| Sezon yılı, yarış bitti mi, race weekend | `lib/f1Calendar.ts` | `CURRENT_SEASON` clock'tan; başka yere hardcode yok |
| F1 snapshot okuma (3-tier) | `lib/data/f1.ts` | DB → `public/data/f1` static → Jolpica proxy (yalnız current) |
| F1 snapshot yazma | `lib/f1Ingest.ts` → `upsertF1Snapshot` | Tek yazım yolu; round=NULL update-first |
| Jolpica proxy (SSRF-safe) | `app/api/f1-season/route.ts` | `?path=` whitelist; `?season=&type=` değil |
| Haber aggregate | `lib/news/aggregate.ts` | `processFeeds()` test edilebilir çekirdek; `aggregate()` cache'li |
| Asset path çözümleme | `lib/assets/f1-icons.ts` | Sezon parametresi zorunlu (tarihsel görünüm) |
| Takım renkleri (UI bar/chip) | `config/team-colors.ts` | 2026 grid; ikonlardan bağımsız |
| Constructor palette (SVG üretim) | `assets/data/constructor-palette.json` | `generate-historical-assets.mjs` |
| Tasarım kuralları | `pre-plans/DESIGN_SYSTEM.md` | Accent yalnız `#ff1801`, 0 radius/shadow |
| Backend/QA anayasa | `pre-plans/CLAUDE.md` | Dış API client-side yok; cron → Supabase |
| Next.js sürüm farkları | `AGENTS.md` | `node_modules/next/dist/docs/` oku; training data güvenilmez |

**Döngü yasağı:** `f1Calendar.ts` leaf modül — `lib/data/f1.ts` ona bağımlı, tersi yok.

---

## 4. Manuel aksiyonlar checklist

Yeni ortam kurulumu veya deploy sonrası:

- [ ] **Vercel env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` (ve varsa `SENTRY_*`, `GEMINI_API_KEY`)
- [ ] `vercel env pull .env.local` — lokal senkron
- [ ] **Supabase migration:** `npx supabase db push` / `migration list` → Local = Remote
- [ ] **Tarihsel F1 seed (Past Winners için kritik):** `npm run seed:f1db` — F1DB mapper fix sonrası bir kez; `--dry-run` ile önce doğrula
- [ ] **Stories seed:** `npm run seed:stories` (17 hikaye; idempotent)
- [ ] **Cron prod teyit:** `curl -H "Authorization: Bearer $CRON_SECRET_KEY" https://<site>/api/cron/sync-f1?scope=season`
- [ ] **2026 placeholder snapshot temizliği (opsiyonel):** sync-f1 cron tetikle → DB'deki boş F1DB snapshot'larını Jolpica ile güncelle; read-layer guard yine de korunmalı
- [ ] **GitHub Actions yeniden açma (opsiyonel):** repo secret `CRON_SECRET_KEY` + var `SITE_URL` → `sync-f1-race-aware.yml` schedule geri ekle
- [ ] **Lighthouse:** prod URL'de manuel ölçüm (otomasyon yok)
- [ ] **Asset audit:** `npx tsx assets/scripts/audit-missing-assets.ts` → `MISSING_ASSETS.md` (script repo'da; üretim öncesi çalıştır)

---

## 5. Yol haritası

### Tamamlanan (referans)

- Masterplan Phase 0–8, v1.1 (CSP, deploy, bento), v1.2 B2/B4/B5/B6 (BackButton, calendar link, hava durumu, GlossaryCard)
- 5FIX Bölüm 1: season freshness, F1DB schema fix, CalendarScroller, news live RSS, GH workflow disable
- 5FIX2: content-invalid guard, home aggregate, CSP/image domain
- Visual sprint (5 animasyon), QA sprint (AssetFallback, vitest 20 test), season asset layout, EntityDrawer + SeasonExplorer
- Asset fix: submodule → static, diacritic resolver, CSP frame-src

### Açık / devreden işler

| Öncelik | Madde | Kaynak | Not |
|---------|-------|--------|-----|
| 🔴 Yüksek | Tarihsel **results backfill** doğrulama | `AGENT_5fix`, `PLAN_5FIX` | `seed:f1db` prod'da çalıştı mı? Past Winners 2018–2025 dolu mu? |
| 🔴 Yüksek | **2026 DB snapshot** Jolpica ile güncelle | `AGENT_5FIX2` | Content-invalid guard geçici; cron ile kalıcı DB düzeltmesi |
| 🟡 Orta | **Mid-season ikon çözümü** | `AGENT_ASSETS_SEASON_LAYOUT` | İki takımlı pilotlar için team-aware slug |
| 🟡 Orta | **Pit-stop verisi** | `PLAN_5FIX` Özellik 2 | Ayrı kaynak gerekir; Season Records'ta yok |
| 🟡 Orta | v1.2 **C1** hedefli testler genişletme | `plans/v1.2-polish.md` | `snapshotStaleness`, `isSeasonSnapshotContentInvalid` unit test |
| 🟡 Orta | v1.2 **C4** Lighthouse prod ölçümü | QA sprint | LCP/CLS/a11y raporu |
| 🟢 Düşük | v1.2 **B1** NewsCarousel | v1.2 plan | Durum kodda kontrol edilmeli (bazı loglar tamam diyor) |
| 🟢 Düşük | `public/stories/` 3 stray klasör sil | Health check U2 | Export artığı: `Full 1280x720` vb. |
| 🟢 Düşük | **GitHub Actions** race-aware hourly yeniden aç | `.github/workflows/` | Secret + billing kararı sonrası |
| 🟢 Düşük | Tarihsel **takım renkleri** palette | Asset log | `team-colors.ts` 2026 dışı genişletme |
| 🟢 Düşük | `circuits` DB tablosu seed | Health check U5 | Şu an kullanılmıyor; ileride gerekirse |
| 🟢 Düşük | 2025 eksik driver SVG | `MISSING_ASSETS.md` | tsunoda, lawson — AssetFallback OK |

### Cron sıklığı notu

Hobby planda günde 1 cron → yarış haftası için **read-layer staleness** ve **force-dynamic season** kritik. Pro plana geçilirse `vercel.json`'da `scope=live` 15 dk cron değerlendirilebilir (`pre-plans/data-ingestion-plan.md` orijinal tasarım).

---

## 6. Dosya rehberi

| Ne arıyorsun? | Nereye bak |
|---------------|------------|
| Proje anayasası (backend/QA) | `pre-plans/CLAUDE.md` |
| Tasarım SSOT | `pre-plans/DESIGN_SYSTEM.md` |
| v1.2 açık maddeler | `plans/v1.2-polish.md` |
| 5FIX planı (EntityDrawer, records) | `docs/plans/PLAN_5FIX_2026-06-08.md` |
| Agent karar logları | `logs/AGENT_*.md` |
| Asset layout & pipeline | `docs/reference/ASSETS.md`, `assets/scripts/generate-historical-assets.mjs` |
| Docs dizin rehberi | `docs/README.md` |
| Eksik driver audit | `MISSING_ASSETS.md`, `assets/scripts/audit-missing-assets.ts` |
| F1 temporal mantık | `lib/f1Calendar.ts` |
| F1 okuma katmanı | `lib/data/f1.ts`, `lib/f1/snapshotStaleness.ts` |
| F1 yazma / cron | `lib/f1Ingest.ts`, `app/api/cron/sync-*/route.ts` |
| F1DB / Jolpica / OpenF1 adapter | `lib/f1/sources/{f1db,jolpica,openf1}.ts` |
| Tarihsel seed script | `scripts/seed-f1-history.ts` (`npm run seed:f1db`) |
| Haber RSS | `lib/news/aggregate.ts`, `app/news/page.tsx` |
| Asset resolver | `lib/assets/f1-icons.ts` |
| Takım renkleri | `config/team-colors.ts` |
| Pist statik facts + koordinat | `data/circuits/facts.ts`, `lib/data/circuits.ts` |
| DB şema | `supabase/migrations/`, `types/database.ts` |
| Cron zamanlaması | `vercel.json` |
| Güvenlik header / CSP | `next.config.ts` |
| Görsel sprint planı | `.cursor/plans/visual_sprint_animations_de3f79dc.plan.md` |
| Testler | `tests/*.test.ts`, `vitest.config.ts` |
| Next.js agent kuralları | `AGENTS.md` |

---

## Hızlı referans: tipik debug akışı

1. **Sayfa eski veri gösteriyor** → `revalidate` / `dynamic` export'una bak → cron DB'yi güncelledi mi (`f1_snapshots.fetched_at`) → content-invalid guard tetiklendi mi (build log).
2. **Standings tutarsız** → home vs season aynı `fetchSeasonSnapshotTyped` yolunu mu kullanıyor → DB vs Jolpica hangisi servis ediliyor.
3. **İkon 404** → `driverIconSrc(..., season)` sezon parametresi var mı → disk path `public/drivers/{season}/{slug}.svg` → diacritic alias.
4. **Cron 401** → `CRON_SECRET_KEY` Vercel'de tanımlı mı → Bearer header formatı.
5. **Past Winners boş** → DB'de `type='results'` tarihsel sezonlarda var mı → yoksa `seed:f1db` çalıştır.

---

*Bu döküman canlıdır; büyük faz sonlarında `logs/AGENT_*` ile senkron güncellenmelidir.*
