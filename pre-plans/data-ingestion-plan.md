# PLAN: Data Ingestion & Sync (Next.js + Supabase + Vercel Cron)

> **Amaç:** Eski iki-aşamalı, disk-bağımlı senkronizasyon scriptlerinin mantığını
> (`old-versions-valuable-files/sync-f1-snapshots.mjs` + `sync-f1-to-supabase.mjs`)
> Vercel'da çalışabilir, **disk'e hiç yazmayan**, in-memory bir ingestion pipeline'ına
> dönüştürmek. Ayrıca şu an ölü olan `news_cache` yazım yolunu bağlamak.
>
> **Kaynak gerçekliği:** `project-anthology/` zaten içeriyor:
> - Okuma katmanı: [`lib/data/f1.ts`](../project-anthology/lib/data/f1.ts) (3 katmanlı fallback) + [`lib/f1Snapshots.ts`](../project-anthology/lib/f1Snapshots.ts) (`upsertF1Snapshot`, `roundSuffixToSnapshotType`).
> - Disk-bağımlı prototip ingestion: [`scripts/seed-f1-snapshots.ts`](../project-anthology/scripts/seed-f1-snapshots.ts).
> - Proxy: [`app/api/f1-season/route.ts`](../project-anthology/app/api/f1-season/route.ts) (SSRF-hardened Ergast proxy, season-aware cache).
> - Temporal SSOT: [`lib/f1Calendar.ts`](../project-anthology/lib/f1Calendar.ts) (`getF1Context`, `CURRENT_SEASON`).
> - **Eksik:** `app/api/cron/sync-f1/route.ts` (yok) ve `news_cache` yazımı (yok).

---

## 0. Eski pipeline'ın anatomisi (ne yapıyordu, neden hantaldı)

```
[Ergast/Jolpica API]
   │  (1) sync-f1-snapshots.mjs  →  fs.writeFileSync → public/data/f1/**/*.json   ❌ Disk I/O #1
   ▼
[public/data/f1/ — 1000+ JSON dosyası, git'e commit]
   │  (2) sync-f1-to-supabase.mjs  →  fs.readFileSync → supabase.upsert()         ❌ Disk I/O #2
   ▼
[Supabase: f1_season_snapshots + f1_round_snapshots]  ← eski iki-tablolu model
```

**Skeptical review — eski pipeline'ın kusurları:**

1. **Çift-adımlı disk hamallığı.** API → disk → oku → DB. Tek bir veri iki kez serialize/deserialize ediliyor, araya 1000+ dosyalık bir git ağacı giriyor.
2. **Vercel serverless'ta çalışamaz.** `fs.writeFileSync(public/...)` Vercel'da kalıcı değil; serverless FS read-only/ephemeral. Bu yüzden eski script otomatik Cron olamıyordu — manuel/CI ile koşuyordu.
3. **Round dosyası patlaması + mükerrer state.** `syncSeasonYear` her round için `results.json`, `results-1.json`, `results-2.json`, `qualifying.json`, `qualifying-1.json` yazıyor (`route.ts` legacy davranışı). Aynı veri 3-4 dosyada → mükerrer snapshot.
4. **Sabit sıralı (sequential) fetch + global throttle.** `FETCH_DELAY_MS = 1200ms` ve tek `lastFetchAt` ile tüm istekler seri. ~24 round × ~5 kaynak × N sezon → dakikalarca süren tek-thread döngü.
5. **`readJsonIfExists` cache'i diske bağımlı.** "Zaten çekilmiş mi" kontrolü dosya varlığına bakıyor; DB'ye değil. Serverless'ta dosya yok → her seferinde yeniden çekiyor.

**Korunacak iyi mantık (gold nuggets):**
- Jolpica endpoint deseni (`{year}.json`, `{year}/driverStandings.json`, `{year}/{round}/results.json`).
- Exponential backoff + retry (`429`/`5xx` için `FETCH_DELAY_MS * 2**attempt`).
- `isRaceDone()` — yarış bitmeden round verisi çekmeme.
- `UPSERT` ile idempotent yazım (`onConflict`).
- `hasRaces`/`hasStandings`/`hasUsableMrData` — boş/çöp payload'ı yazmama guard'ları.

---

## 1. Hedef mimari (in-memory, disk yok)

```
[Vercel Cron]  ──tetikler──►  app/api/cron/sync-f1/route.ts  (Fluid Compute, Node.js, maxDuration uzun)
                                   │
                                   ├─ getF1Context() → hangi sezon current, hangi round'lar bitti
                                   ├─ fetchErgast(path) → response.json()         ✅ bellek, disk yok
                                   ├─ guard (hasUsableMrData) → boşları ele
                                   └─ upsertF1Snapshot(supabase, season, round|null, type, data)  → f1_snapshots
                                                                                   ✅ tek tablo, tek yol
[Supabase f1_snapshots]
       ▲
       │  (okuma — DEĞİŞMEZ)
   lib/data/f1.ts  →  Server Components  →  RSC render (CSR yok)
```

**İlke:** API'den gelen `MRData` zarfı **hiç diske yazılmadan** doğrudan `upsertF1Snapshot`
ile Supabase'e gider. `public/data/f1/` artık yalnızca **build-time fallback** (offline/ilk
kurulum) — ingestion'ın hedefi değil.

---

## 2. Vercel Cron yapılandırması

`project-anthology/vercel.json` (yoksa oluştur) — knowledge-update'e göre `vercel.ts` de
tercih edilebilir, ama crons için JSON yeterli ve net:

```json
{
  "crons": [
    { "path": "/api/cron/sync-f1?scope=live",     "schedule": "*/15 * * * *" },
    { "path": "/api/cron/sync-f1?scope=season",   "schedule": "0 5 * * 1" },
    { "path": "/api/cron/sync-news",              "schedule": "*/30 * * * *" }
  ]
}
```

- **`scope=live` (15 dk):** Yalnızca current season + bitmiş ama henüz çekilmemiş son round(lar). Yarış haftasonu güncelliği için. (`getF1Context().isRaceWeekend` ile sıklık mantıksal olarak ayarlanabilir.)
- **`scope=season` (haftalık):** Tüm sezonların standings/calendar tazeleme + eksik round tamamlama.
- **`sync-news` (30 dk):** RSS → `news_cache` (bkz. §4).

> **maxDuration:** Route segment config'te `export const maxDuration = 300;` (knowledge-update:
> Vercel default timeout artık 300s). Sequential throttle yerine bounded-concurrency (§3.3)
> kullanılırsa bu süreye rahat sığar.

### 2.1 Cron güvenliği
- Vercel Cron istekleri `Authorization: Bearer ${CRON_SECRET}` ile gelir. Route bunu doğrular; eşleşmezse `401`.
- `CRON_SECRET` → Vercel env + `.env.local` (Phase 0'daki `vercel env pull` akışı).
- Service-role key zorunlu doğrulanır (anon'a düşmek RLS'e takılır — bkz. database-schema-plan §5).

---

## 3. `sync-f1` ingestion algoritması (adım adım)

`app/api/cron/sync-f1/route.ts`:

```
export const runtime = 'nodejs';        // jsdom/Node API gerekmez ama Fluid Compute Node default
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
```

### 3.1 Akış
1. **Auth & env guard.** `CRON_SECRET` doğrula. `getSupabaseAdmin()` al; service key yoksa `500` (sessizce anon'a düşme).
2. **Bağlam çöz.** `const { currentSeason } = await getF1Context();`
3. **Kapsam belirle.**
   - `scope=live` → `years = [currentSeason]`.
   - `scope=season` → `years = [F1_SEASON_MIN..currentSeason]` (sabit `F1_SEASON_MIN` yeni `lib`'e taşınır; eski `f1-snapshot-paths.mjs` projeye gelmedi).
4. **Her yıl için sezon kaynakları (round NULL):**
   - `calendar` ← `fetchErgast('{year}.json')`
   - `standings_drivers` ← `fetchErgast('{year}/driverStandings.json')`
   - `standings_constructors` ← `fetchErgast('{year}/constructorStandings.json')`
   - Her biri `hasUsableMrData` guard'ından geçer, sonra `upsertF1Snapshot(supabase, year, null, type, data)`.
   - **Kanonik tip zorunlu:** `standings_drivers` / `standings_constructors` (database-schema-plan §3.2). Eski `driverStandings` ASLA yazılmaz.
5. **Bitmiş round'lar için (round != NULL):**
   - Calendar'dan `Races` al; her race için `isRaceDone(race, now)` true ise:
     - `results` ← `fetchErgast('{year}/{round}/results.json')`
     - `qualifying` ← `fetchErgast('{year}/{round}/qualifying.json')`
     - (varsa) `sprint` ← `fetchErgast('{year}/{round}/sprint.json')`
   - **Mükerrer dosya yok:** Eski `results-1.json`/`results-2.json` asla üretilmez. `type` yalnızca `results`/`qualifying`/`sprint` (normalize edilmiş kanonik küme).
6. **Idempotency / bayatlık kontrolü (DB-tabanlı, disk değil):**
   - Yazmadan önce isteğe bağlı: `f1_snapshots`'tan ilgili `(season, round, type)` için `fetched_at` çek; tarihsel sezon (year < currentSeason) ve satır zaten varsa **atla** (historik veri değişmez). Bu, eski `readJsonIfExists` disk-cache'inin DB karşılığıdır.
7. **Özet dön.** `{ scope, years, upserted, skipped, errors }` JSON; ayrıca `logs/` log (CLAUDE.md loglama zorunluluğu).

### 3.2 `fetchErgast` — eski mantığın port'u (disk yok)
Eski `.mjs`'teki retry/backoff korunur, ama:
- `public/data/f1` disk-cache **kaldırılır** (`readJsonIfExists` yok).
- İçeride `/api/f1-season` proxy'sine değil, doğrudan `ERGAST_BASE`'e gidilir (server-side, Cron zaten sunucuda). Proxy SSRF/cache UI içindir; Cron'un buna ihtiyacı yok.
- 404 → `{ MRData: {} }` (eski davranış), guard ile yazımdan elenir.

### 3.3 Throttle yerine bounded concurrency (performans düzeltmesi)
Eski global `1200ms` seri throttle yerine:
- Jolpica rate lim'tine saygı duyacak **küçük bir concurrency limiti** (örn. 3-4 paralel istek) + 429'da exponential backoff.
- Basit bir `pLimit(4)` benzeri kuyruk; harici bağımlılık istenmezse 10-15 satırlık in-house semaphore.
- **Neden:** ~24 round seri × 1.2s = dakikalar. 4'lü paralel + backoff, 300s `maxDuration` içinde rahat biter ve rate-limit'e de takılmaz.

### 3.4 Eski iki script → tek route eşlemesi

| Eski (`.mjs`) | Yeni (`route.ts`) |
|---|---|
| `sync-f1-snapshots.mjs::syncSeasonYear` (API→disk) | §3.1 adım 4-5 (API→bellek) |
| `sync-f1-to-supabase.mjs::syncSeasonCore` (disk→DB) | §3.1 adım 4-5 içindeki `upsertF1Snapshot` (aynı adımda) |
| `writeJson` / `readJsonIfExists` | **silindi** (disk yok) |
| `f1_season_snapshots` + `f1_round_snapshots` upsert | tek `f1_snapshots` upsert (`onConflict: 'season,round,type'`) |
| `--seasons-only` flag | `?scope=season` query |

---

## 4. `sync-news` ingestion (ölü `news_cache` relation'ını bağla)

**Tespit (skeptical review):** Şu an `/api/news` her HTTP isteğinde RSS'i in-memory
işliyor (`processFeeds`), sonucu döndürüyor ama **`news_cache` tablosuna hiç yazmıyor**.
`lib/data/news.ts` ise tablodan okumaya çalışıp boş bulunca `/api/news`'e düşüyor. Yani:
- Tablo asla dolmuyor → her okuma RSS turuna (8.5s timeout) bağımlı.
- SWR cache (`newsService.ts` legacy → `news_cache_v2` localStorage) yalnızca client-side; sunucu RSC ilk boyamada DB'den hızlı okuyamıyor.

**Düzeltme — RSS işleme mantığını paylaşılan bir modüle çıkar:**
1. `app/api/news/route.ts` içindeki `fetchRSSFeed` + `processFeeds` + yardımcılarını `lib/news/aggregate.ts`'e taşı (tek kaynak; route ve cron ikisi de import eder).
2. Yeni `app/api/cron/sync-news/route.ts`:
   - `aggregate()` → `NewsItem[]` (RSS, in-memory; aynı kümelendirme/dedupe mantığı).
   - Her item → `news_cache` satırına map'le ve **upsert** et (`onConflict: 'url'`, `url` UNIQUE):
     ```
     { source: item.sourceName, title, description: summary, url, image_url: image,
       published_at: item.publishedAt || null, summary, tags: item.sources }
     ```
   - (Opsiyonel) `newsSummary.ts` (Gemini) ile `summary` zenginleştir; timeout/fallback korunur, anahtar yoksa atla.
   - Retention: `cached_at < now() - 30 gün` satırları sil (database-schema-plan §3.3 `idx_news_cache_cached_at`).
3. `lib/data/news.ts` **değişmez** — artık tabloyu dolu bulacağı için RSS fallback'i nadiren tetiklenir. `/api/news` route'u public/SWR için kalır ama artık tek gerçek kaynak değil.

**Sonuç:** RSC `getLatestNews()` çağrısı tek bir indeksli `news_cache` SELECT'ine
(`idx_news_cache_published`) döner → first paint hızlı, 8.5s RSS turu kullanıcı yolundan çıkar.

---

## 5. Yeni mimaride kaçınılması gereken ingestion anti-pattern'leri

1. **Diske yazıp sonra DB'ye okumak.** (Eski çift-adım.) → Tek adım, in-memory upsert.
2. **`public/data/f1`'i runtime ingestion hedefi sanmak.** O artık yalnızca build-time fallback. Vercel'da yazılamaz.
3. **Mükerrer round dosyaları/tipleri üretmek** (`results-1`, `results-2`). → Kanonik `type` kümesi (`roundSuffixToSnapshotType`).
4. **Seri global throttle ile saatlerce fetch.** → Bounded concurrency + backoff.
5. **Tarihsel sezonu her Cron'da yeniden çekmek.** → DB `fetched_at` ile staleness guard (year < currentSeason → bir kez yazıldıysa atla).
6. **`news_cache`'i okuyup hiç beslememek.** → `sync-news` Cron yazar; okuma DB'den.
7. **Cron'da anon key'e sessizce düşmek.** → Service-role zorunlu; yoksa `500` + log.
8. **Sezon yılını/round'u hardcode etmek.** → Tek kaynak `@/lib/f1Calendar` (`getF1Context`).
9. **Ham veriyi client'a çekmek (CSR).** → Tüm dış API çağrıları server-side; RSC render.

---

## 6. Uygulama sırası (checklist)

- [ ] `lib/f1Ingest.ts` (veya benzeri): `fetchErgast` (disk-cache'siz port) + bounded-concurrency helper + `F1_SEASON_MIN` sabiti + `isRaceDone`.
- [ ] `app/api/cron/sync-f1/route.ts`: §3 algoritması; `maxDuration=300`, `CRON_SECRET` auth, service-role guard.
- [ ] `lib/news/aggregate.ts`: `/api/news` route'undan RSS mantığını çıkar (paylaşılan modül).
- [ ] `app/api/cron/sync-news/route.ts`: `aggregate()` → `news_cache` upsert + retention.
- [ ] `vercel.json` crons (§2) + `CRON_SECRET` env (Vercel + `.env.local`).
- [ ] `seed-f1-snapshots.ts`'i koru ama rolünü **"ilk kurulum / offline backfill"** olarak belgele (Cron canlı senkronu devralır). Yeni round tipleri için `roundFileType` zaten kanonik.
- [ ] **Doğrulama (canlı):** Cron'u manuel tetikle (`curl` + `Authorization: Bearer`), `f1_snapshots` ve `news_cache` satır sayılarını `scripts/test-data-layer.ts` ile teyit et. "Çalışmalı" değil, "çalıştığını gördük".
- [ ] `npm run build` sıfır TS hatasıyla geçer; RSC sayfaları DB'den okur (disk fallback tetiklenmeden).

---

## 7. Açık sorular (kullanıcı kararı gerekebilir)

- **`F1_SEASON_MIN` değeri:** Eski script `f1-snapshot-paths.mjs`'ten alıyordu (projeye gelmedi). Tarihsel arşiv hangi yıla kadar? (`seed-f1-snapshots.ts` `2022`'den başlıyor; eski `public/data/f1` 2021+ içeriyor.) → Backfill kapsamı netleştirilmeli.
- **`scope=live` sıklığı:** Yarış-haftasonu 15 dk makul; yarış-dışı haftalarda 15 dk gereksiz olabilir. `isRaceWeekend` ile iki ayrı cron ya da route içi erken-çıkış değerlendirilebilir.
