# Mimari — Project Anthology (Apex)

> F1 anlatı/istatistik platformu. Next.js 16 App Router + Supabase (PostgreSQL) + çok kaynaklı dış F1 veri entegrasyonu. Bu döküman backend mimarisini, veri tabanı kullanımını, veri/API kaynaklarını ve bunların nasıl kullanıldığını anlatır.

---

## 1. Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | Next.js **16.2.7** (App Router, RSC), React **19.2.4** |
| Dil | TypeScript 5 |
| Veri tabanı | Supabase (PostgreSQL + PostgREST + RLS) |
| Stil | Tailwind CSS 4 |
| Animasyon | framer-motion 12 |
| Hata izleme | Sentry (`@sentry/nextjs`) — `withSentryConfig`, tunnelRoute `/monitoring` |
| Telemetri | Vercel Analytics + Speed Insights |
| Rate-limit | Upstash Redis (sliding-window) + in-memory fallback |
| Deploy / Cron | Vercel (3 cron job, `vercel.json`) |
| Test | Vitest (unit) + Playwright (e2e/görsel) |

**Tek kaynak ilkesi:** Sezon/round/"hangi sezon güncel" kararlarının tamamı [`lib/f1Calendar.ts`](../lib/f1Calendar.ts) üzerinden geçer. Hiçbir dosya sezon yılını, pilot listesini veya takım listesini hardcode etmez. `CURRENT_SEASON = new Date().getUTCFullYear()`, `F1_SEASON_MIN = 1950`.

---

## 2. Mimari Genel Bakış

```
┌──────────────────────────────────────────────────────────────────────┐
│  DIŞ KAYNAKLAR                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────────┐    │
│  │  F1DB    │   │ Jolpica  │   │  OpenF1  │   │  RSS feeds        │    │
│  │ (tarih)  │   │ (canlı)  │   │ (radyo)  │   │ (haber)           │    │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────────┬─────────┘    │
└───────┼──────────────┼──────────────┼───────────────────┼────────────┘
        │ seed         │ cron sync-f1 │ cron sync-radio    │ cron sync-news
        ▼              ▼              ▼                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│  YAZMA YOLU  (server-side, service_role — RLS bypass)                 │
│  lib/f1Ingest.ts (upsert)    OpenF1 adapter    aggregate()            │
└───────────────────────────────┬──────────────────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SUPABASE / PostgreSQL  (tek doğruluk kaynağı)                        │
│  f1_snapshots · stories · radio_moments · circuits · news_cache      │
│  RLS: public SELECT / service_role WRITE                             │
└───────────────────────────────┬──────────────────────────────────────┘
                                 ▼ anon key, RLS-kısıtlı
┌──────────────────────────────────────────────────────────────────────┐
│  OKUMA YOLU  (RSC, server-side)                                       │
│  lib/data/*.ts → DB → static JSON → /api/f1-season (live proxy)       │
└───────────────────────────────┬──────────────────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│  app/**/page.tsx  (Server Components)                                  │
└──────────────────────────────────────────────────────────────────────┘
```

İki katı ayrılmış istemci (bkz. [`lib/supabase.ts`](../lib/supabase.ts)):

- **`getSupabaseClient()`** — anon key. İstemci + RSC okumaları için. RLS'e tabi (sadece public read). **Asla yazmaz.**
- **`getSupabaseAdmin()`** — service_role key. **Yalnızca server-side** (cron/seed). RLS'i bypass eder. Service key yoksa **fırlatır** — anon key'e sessiz fallback yapmaz (anon yazma RLS'e takılır ve kafa karıştırıcı "permission denied" üretir).

---

## 3. Veri Tabanı (Supabase / PostgreSQL)

Migrasyonlar: [`supabase/migrations/`](../supabase/migrations/). 5 tablo, `jsonb` ile ham dış veri saklama, kanonik `type` CHECK kısıtları, kaynak (source) izleme.

### 3.1 Tablolar

| Tablo | Amaç | PK / Önemli alanlar |
|---|---|---|
| **`f1_snapshots`** | Ergast/MRData biçimli F1 verisi (tek tablo modeli) | `(season, round, type)` unique; `round IS NULL` → sezon seviyesi, `round NOT NULL` → round seviyesi |
| **`stories`** | Editöryel anthology hikayeleri | `slug` unique, `content jsonb`, `published`, `sort_order` |
| **`radio_moments`** | Telsiz anları (transcript + OpenF1 audio) | `slug` unique, `audio_url`, `driver`, `year`, `round`, `published` |
| **`circuits`** | Pist editöryel + agregat verisi | `id` = Ergast `circuitId` (text PK), `data jsonb` |
| **`news_cache`** | Agregatlanan F1 haberleri (sync-news ile beslenir) | `url` unique, `tags text[]` (GIN index), `published_at`, `cached_at` |

### 3.2 `f1_snapshots` — kalbi

```
type ∈ { calendar, standings_drivers, standings_constructors,
         results, qualifying, sprint, circuit }   -- CHECK ile dondurulmuş
source ∈ { f1db, jolpica, openf1 }                -- provenance CHECK
```

- **Round-NULL tuzağı:** PostgreSQL `UNIQUE(season, round, type)` her NULL'ı ayrı kabul eder, yani sezon seviyesi satırlar için düz upsert duplicate INSERT yapabilir. İki savunma var:
  1. Kısmi unique index `idx_f1_snapshots_season_type_no_round` (`WHERE round IS NULL`) — migrasyon `20260606000001`.
  2. Yazma katmanı ([`lib/f1Ingest.ts`](../lib/f1Ingest.ts)): `round === null` ise **update-first, yoksa insert** yapar (düz upsert yerine).
- **Okuma katmanı** bu yüzden `maybeSingle` yerine `order('fetched_at', desc).limit(1)` kullanır — eski duplicate'ler varsa en yenisi gelir.

### 3.3 RLS & yetkiler

- Tüm tablolarda RLS **açık**.
- **Public SELECT:** `stories` / `radio_moments` → sadece `published = true`; `circuits` / `f1_snapshots` / `news_cache` → hepsi.
- **Yazma (insert/update/delete):** yalnız `service_role`. `anon` asla yazmaz.
- RLS satır filtrelemeden ÖNCE table-level GRANT gerekir; yeni tablolar otomatik grant almadığı için `GRANT SELECT … TO anon, authenticated` ve `GRANT … TO service_role` açıkça verilmiştir (yoksa PostgREST 42501 döner).

---

## 4. Veri & API Kaynakları

Çok kaynaklı mimari (her kaynak farklı bir işi yapar — örtüşme yok):

### 4.1 F1DB — tarihsel veri (seed)
[`lib/f1/sources/f1db.ts`](../lib/f1/sources/f1db.ts)
- GitHub Release'ten (`f1db-json-single.zip`) **bellekte** indirilir, `fflate` ile açılır — **diske yazılmaz**.
- Tüm geçmiş sezonlar (1950→) buradan gelir. **Jolpica tarihsel için asla kullanılmaz** (rate-limit tükenmesini ve gönüllü-host bağımlılığını önlemek için).
- Normalize edici fonksiyonlar F1DB'nin ID-tabanlı şemasını **Ergast/MRData biçimine** çevirir (`toMRDataCalendar`, `toMRDataResults`, `toMRDataDriverStandings`, …) → `f1Ingest` kaynağı bilmeden upsert eder.
- Kullanım: `npm run seed:f1db` ([`scripts/seed-f1-history.ts`](../scripts/seed-f1-history.ts)).

### 4.2 Jolpica (Ergast) — güncel sezon canlı veri
[`lib/f1/sources/jolpica.ts`](../lib/f1/sources/jolpica.ts) · base `https://api.jolpi.ca/ergast/f1`
- **Sadece güncel sezon** (cron sync-f1) ve okuma katmanı son-çare proxy'si.
- Per-instance rate-limit: ~0.8 req/s floor (1200 ms), 6 retry exponential backoff, 10 s timeout, 429/5xx retry, 404→boş MRData.
- Veri zaten MRData biçiminde gelir (passthrough). `fetchCalendar`, `fetchDriverStandings`, `fetchResults`, `fetchQualifying`, `fetchSprint` + `hasRaces`/`hasResults`… shape guard'ları.

### 4.3 OpenF1 — telsiz audio
[`lib/f1/sources/openf1.ts`](../lib/f1/sources/openf1.ts) · base `https://api.openf1.org/v1`
- Auth yok. Rate-limit: 3 req/s, 30 req/min → adapter 350 ms inter-request floor uygular (≈2.86 req/s).
- `fetchRaceSessions(year)` → `fetchTeamRadio(sessionKey)` + `fetchSessionDrivers` + `fetchMeeting` → `radio_moments` insert'lerine map'lenir.

### 4.4 RSS — haber
[`lib/news/aggregate.ts`](../lib/news/aggregate.ts)
- Kaynaklar: The Race, Autosport, Motorsport.com (+diğerleri). Per-source AbortController timeout.
- F1 keyword filtresi + non-F1 exclusion, canonical-URL dedup (UTM/hash strip), Jaccard başlık-benzerliği clustering (eşik 0.65), newest-first sıralama.
- Node.js'te JSDOM `DOMParser` polyfill kullanır → **bu yüzden `jsdom` `next.config` `outputFileTracingExcludes`'tan DIŞLANMAZ** (yoksa sync-news 500 verir).

---

## 5. Backend — API Rotaları

Tümü `app/api/` altında, `runtime = 'nodejs'`.

### 5.1 Cron Jobs (Vercel — [`vercel.json`](../vercel.json))

| Rota | Schedule (UTC) | Kaynak → Hedef | `maxDuration` |
|---|---|---|---|
| `GET /api/cron/sync-news` | `0 6 * * *` | RSS → `news_cache` (upsert onConflict=url + 30g retention) | 300 s |
| `GET /api/cron/sync-f1?scope=season` | `0 7 * * *` | Jolpica → `f1_snapshots` | 300 s |
| `GET /api/cron/sync-radio` | `0 8 * * *` | OpenF1 → `radio_moments` | 300 s |

- **Auth:** [`lib/cronAuth.ts`](../lib/cronAuth.ts) — `Authorization: Bearer <CRON_SECRET>` (birincil; Vercel Cron tam bu env adıyla enjekte eder) veya legacy `CRON_SECRET_KEY`. Karşılaştırma **constant-time** (`timingSafeEqual`). Secret yoksa fail-closed (asla yetkili değil).
- **sync-f1 scope:** `live` (race-weekend pencereleri: quali/sprint/results) veya `season` (tam backfill). Race-weekend olmadığında varsayılan `season`. Round seçimi takvim-farkındalıklı ([`lib/f1/syncSchedule.ts`](../lib/f1/syncSchedule.ts)).

### 5.2 Public/okuma rotaları

| Rota | İş |
|---|---|
| `GET /api/f1-season?path=…` | **SSRF-sertleştirilmiş** Jolpica proxy. `path` katı whitelist regex'ine karşı doğrulanır, host hardcode. Sezon-farkındalıklı cache (tarihsel immutable, güncel kısa+SWR). |
| `GET /api/season/[year]` | Tam sezon bundle'ı (`getSeasonData`). `F1_SEASON_MIN..CURRENT_SEASON` aralığı dışı 400. |
| `GET /api/news` | Canlı RSS aggregate (news_cache boşsa fallback). Upstash rate-limit (30 req/60 s), IP `x-real-ip`'ten (spoof-dirençli). |

---

## 6. Okuma Katmanı — 3 Kademeli Fallback

[`lib/data/f1.ts`](../lib/data/f1.ts) tüm F1 okumaları için:

```
1. Supabase f1_snapshots  (DB — tek doğruluk kaynağı)
2. build-time static JSON  (public/data/f1/…)
3. Jolpica proxy /api/f1-season  (son çare, SADECE canlı sezon)
```

- **Staleness kontrolü:** güncel sezon satırları takvim-farkındalıklı tazelik kontrolünden geçer ([`lib/f1/snapshotStaleness.ts`](../lib/f1/snapshotStaleness.ts)). DB cache beklenenden eskiyse (post-quali/post-race) bypass edilip canlı Jolpica okunur — cron çalışmaları arası standings/results taze kalır.
- **Content-validity guard:** F1DB seed'in placeholder (boş `raceName` / eksik `Constructors[]`) yazdığı satırlar tazelik geçse bile geçersiz sayılıp canlıya düşülür.
- **Tarihsel veri her zaman DB'den** servis edilir; Jolpica tarihsel için asla kullanılmaz.
- Diğer okuyucular: [`lib/data/news.ts`](../lib/data/news.ts) (news_cache → /api/news → static fallback), [`lib/data/stories.ts`](../lib/data/stories.ts) (published-only), [`lib/data/radio.ts`](../lib/data/radio.ts), [`lib/data/circuits.ts`](../lib/data/circuits.ts).

---

## 7. Frontend Rotaları

App Router (`app/**/page.tsx`, RSC — veri server-side okunur):

| Rota | Sayfa |
|---|---|
| `/` | Ana sayfa (Bento dashboard) |
| `/anthology` · `/anthology/[slug]` | Hikaye listesi / detay |
| `/season` · `/season/[year]` · `/season/[year]/round/[n]` | Sezon arşivi / round detay |
| `/drivers` · `/drivers/[driverId]` | Pilot listesi / profil |
| `/teams` · `/teams/[constructorId]` | Takım listesi / profil |
| `/circuits` · `/circuits/[id]` | Pist listesi / detay |
| `/news` | Haber akışı |
| `/tech-glossary` | Teknik sözlük |

`/radio` → `/anthology` kalıcı redirect ([`next.config.ts`](../next.config.ts)).

---

## 8. Güvenlik & Operasyon

- **CSP / güvenlik header'ları** [`next.config.ts`](../next.config.ts) (`lib/security/csp.ts`): `font-src` same-origin + `data:` + `https://vercel.live` (Vercel Toolbar Geist fontları); `connect-src` whitelist (Supabase, Sentry, Vercel insights, Jolpica, OpenF1, open-meteo); HSTS, X-Content-Type-Options, frame-ancestors (portfolio embed izinli). Preview deploy'larda `X-Robots-Tag: noindex`.
- **SSRF koruması:** `/api/f1-season` proxy'sinde host hardcode + path whitelist regex.
- **Rate-limit:** [`lib/rateLimit.ts`](../lib/rateLimit.ts) — Upstash sliding-window (UPSTASH_* env varsa, instance'lar arası tutarlı), yoksa in-memory fallback.
- **Sentry:** kritik fonksiyonlar sarılı; client upload `tunnelRoute = '/monitoring'` üzerinden.
- **Bundle:** `outputFileTracingexcludes` ile `public/**`, `node_modules/canvas/**` hariç tutulur; **`jsdom` hariç tutulmaz** (sync-news runtime'da kullanır).

### Gerekli env değişkenleri
| Değişken | Kullanım |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Okuma (RLS-kısıtlı) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yazma (cron/seed, server-only) |
| `CRON_SECRET` (+ legacy `CRON_SECRET_KEY`) | Cron Bearer auth |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Dağıtık rate-limit (opsiyonel) |
| `SENTRY_AUTH_TOKEN` | Sentry source-map upload |

> Env var'lar **hem `.env.local` hem Vercel dashboard**'da bulunmalıdır.

---

## 9. Scriptler

[`scripts/`](../scripts/):

| Script | Komut | İş |
|---|---|---|
| `seed-f1-history.ts` | `npm run seed:f1db` | F1DB → `f1_snapshots` tarihsel backfill |
| `seed-stories.ts` | `npm run seed:stories` | Editöryel hikayeleri seed et |
| `build-story-content.ts` | — | Hikaye `content jsonb` derleme |
| `dedupe-f1-snapshots.ts` | — | Round-NULL duplicate temizliği |
| `sync-f1-scheduled.ts` | — | Zamanlanmış F1 sync (local/CI) |

---

## 10. Önemli Mimari Kararlar (özet)

1. **Tek tablo F1 modeli** (`f1_snapshots`) — round-NULL ile sezon/round ayrımı, kanonik `type` CHECK ile drift dondurma.
2. **Kaynak ayrımı** — F1DB=tarih, Jolpica=canlı, OpenF1=radyo, RSS=haber. Örtüşme yok.
3. **Disk I/O yok** — dış veri bellek → DB akışı (F1DB zip bile bellekte açılır).
4. **Sıkı istemci ayrımı** — anon=okuma, service_role=yazma; anon fallback yasak.
5. **Hardcode yasak** — sezon/round tek kaynak `lib/f1Calendar`.
6. **3 kademeli okuma fallback** — DB → static → live proxy, staleness-farkındalıklı.
