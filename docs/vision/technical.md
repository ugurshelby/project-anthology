# Teknik Referans — Project Anthology (Apex)

> Kalıcı entegrasyon/API/tablo eklenince güncellenir. Kural dosyası: `AGENTS.md`.
> Ölçülmüş durum ve dizin haritası: `docs/reference/apex-reference.md`. Detay: `docs/reference/mimari.md`.

**Son güncelleme:** 2026-10-02

---

## Stack

| Katman | Sürüm / Araç |
|---|---|
| Web framework | Next.js **16.2.7** (App Router), React **19.2.4**, TypeScript **5** (`strict`) |
| Stil | Tailwind CSS **4**, Framer Motion 12 |
| i18n | `next-intl` 4 — `en` (önek yok) ve `tr` (`/tr/...`); locale proxy `proxy.ts` (`middleware.ts` değil) |
| Veritabanı | Supabase (PostgreSQL + RLS); anon okuma, service-role yazma (`lib/supabase.ts`) |
| Deploy | Vercel (`main` otomatik deploy; `vercel.json` 3 günlük cron) + GitHub Actions (saatlik/10 dk işler) |
| Test | Vitest (`tests/**/*.test.ts`, node ortamı). Playwright devDependency ama config/script yok, kullanılmıyor |
| İzleme | Sentry, Vercel Analytics + Speed Insights |
| Rate-limit | Upstash Redis varsa dağıtık, yoksa in-memory (tek instance) — Vercel'de Upstash varlığı repo'dan doğrulanamaz |
| CSP | `lib/security/csp.ts` — `font-src` same-origin + `data:` + `https://vercel.live` |
| Node | `package.json` `engines` ve `.nvmrc` 24; GitHub Actions F1 workflow'u Node 22 (sahip kararı bekliyor) |
| Mobil | `mobile/` (Expo ~56) diskte var, `.gitignore`'da, **git'te yok**; sahip kararı bekliyor |

---

## Klasör Haritası (özet)

```
anthology/
├── app/[locale]/   # 20 sayfa (home, season, drivers, teams, grid, circuits, news, anthology, glossary, legal)
├── app/api/        # 13 route handler (4 cron, f1-season, live-timing, news, push, season, circuit/driver/team career)
├── components/     # Web UI (89 modül): layout, home, season, news, profile, anthology, glossary, legal, media
├── lib/            # data/, f1/, news/, api/, security/, seo.ts, cronAuth.ts, rateLimit.ts, supabase.ts, f1Calendar.ts, f1Ingest.ts
├── data/           # Editoryal içerik (drivers, teams, stories, glossary)
├── config/         # team-colors.ts
├── i18n/ messages/ # next-intl routing + en.json/tr.json
├── supabase/migrations/  # DB migration (8 dosya)
├── scripts/        # seed ve sync script'leri
├── docs/           # plans/master-plan.md, reference/, design/, vision/, procedures.md
└── tests/          # Vitest (22 dosya)
```

**Görsel politikası (2026-09-28):** Apex fotoğrafsız. Pilot portreleri, takım logoları, araç render'ları ve pist hava fotoğrafları kaynağı/lisansı belgesiz olduğu için kaldırıldı. `lib/assets/f1-icons.ts`'teki `driverIconSrc`/`teamIconSrc`/`carSrc`/`circuitCoverSrc` her zaman `null` döner; `components/media/ApexFallback.tsx` veri-güdümlü rozet render eder (isim/kod baş harfleri + `--team-secondary`). İstisna: `circuitIconSrc` — MIT lisanslı pist rota geometrisi (`assets/f1-circuits/`). Anthology görselleri (`public/stories`, 56 dosya; kullanılmayan 68 dosya 2026-10-02'de silindi) bu kapsamda değildi; lisans durumu sahip kararı bekliyor.

---

## Veri Akışı

```
Jolpica · F1DB · OpenF1 · RSS · Open-Meteo · Groq/Gemini · MyMemory
        ↓  yalnız cron (service_role) — tarayıcıdan çağrılmaz
    Supabase (f1_snapshots, stories, radio_moments, circuits, news_cache, news_stories,
              circuit_weather, push_subscriptions, notified_sessions)
        ↓  lib/data/* (anon, RLS)
    app/[locale]/**/page.tsx (RSC)
```

**Tek temporal kaynak:** `lib/f1Calendar.ts` — `CURRENT_SEASON`, `getF1Context()`

**Tarihsel kapsam:** `f1_snapshots` 1950–güncel sezon tam dolu (77/77 sezon, calendar+results+standings — 2026-09-28 backfill). `scripts/seed-f1-history.ts` varsayılanı `F1_SEASON_MIN` (1950), idempotent — yeniden çalıştırmak güvenli. **2026-10-06:** tarihsel takvim satırlarında yarış/pist/yer/ülke adları boştu (F1DB adaptörü var olmayan alanları okuyordu); adaptör düzeltildi ve 1950–2025 yeniden tohumlandı (güncel sezon Jolpica'dan olduğu için `--to 2025`; seed'i `--to` vermeden çalıştırmayın, 2026 satırlarının üstüne F1DB yazılır).

**Kadro otomasyonu:** Sezon kadrosu (kim hangi takımda) hiçbir yerde hardcode değil — `getSeasonData(CURRENT_SEASON)` ile canlı Jolpica/DB'den gelir, yeni sezon başladığında kod değişikliği gerekmez. Pilot numarası da `DriverStandingRow.permanentNumber` ile canlı kaynaktan gelir (`lib/f1/mrdata.ts`) — yeni pilot standings'e girer girmez otomatik görünür. Yalnızca **editöryel** içerik (`data/drivers/index.ts` bio/lore, `config/team-colors.ts` marka renkleri) elle güncellenir; bunlar veri değil tasarım/içerik kararı, eksik olsa da UI kırılmaz (graceful fallback).

**Supabase istemcileri:**
- `getSupabaseClient()` — anon, yalnızca okuma
- `getSupabaseAdmin()` — service_role, yalnızca server-side yazma

**API yardımcıları (`lib/api/`):**
- `validation.ts` — Ergast slug doğrulama (`isErgastSlug`)
- `errors.ts` — tutarlı hata loglama/yanıt (`logApiError`, `jsonApiError`)

---

## API & Cron

| Rota | Amaç |
|---|---|
| `/api/cron/sync-news` | RSS → kümeleme → `news_stories` (+ `news_cache`). Vercel günlük 06:00 UTC + GitHub Actions `sync-news.yml` saatlik (:07) |
| `/api/cron/sync-f1?scope=season` | Jolpica → f1_snapshots (Vercel 07:00 UTC); `scope=live` GitHub Actions `sync-f1-race-aware.yml` saatlik due-check. İdempotent: due penceresinden ≥ 24 sa sonra çekilmiş Jolpica satırı final sayılır, tekrar çekilmez; `?force=1` zorlar. Okuma yolu stale-while-revalidate: bayat (≤ 3 gün) satır anında sunulur, `after()` ile arkada yenilenir (puan durumu hariç, onu cron yeniler) |
| `/api/cron/sync-radio` | OpenF1 → radio_moments (08:00 UTC) |
| `/api/cron/notify-sessions` | Seans başlangıcından ~30dk önce push (GitHub Actions `notify-sessions.yml`, 10dk) |
| `/api/push/register` | Expo push token kayıt (rate-limit 10/dk) |
| `/api/f1-season` | Canlı Jolpica proxy |
| `/api/live-timing` | OpenF1 `session_key=latest` canlı pozisyon/interval proxy'si — home hero `LiveRaceTracker` tarafından 12sn'de bir poll edilir. Edge cache (`s-maxage=5`) + in-memory stampede guard + 8sn sert zaman aşımı (OpenF1 yavaşlarsa stale cache'e düşer) — 100+ eşzamanlı izleyici tek upstream çağrısını paylaşır. |
| `/api/news` | Haber API |
| `/api/season/[year]`, `/api/season/[year]/last-result` | Sezon snapshot API |
| `/api/circuits/[id]`, `/api/drivers/[driverId]/career`, `/api/teams/[constructorId]/career` | Detay API'leri |

Cron auth: `Authorization: Bearer <secret>`; `lib/cronAuth.ts` `isCronAuthorized` hem `CRON_SECRET` (Vercel enjekte eder) hem `CRON_SECRET_KEY` (eski ad) kabul eder, timing-safe, ikisi de yoksa reddeder. Dört cron route'unun hepsi çağırır.

**GitHub Actions (5-10dk granülerlik gereken işler, Vercel Hobby günde-1-cron sınırını aşar):**
`sync-f1-race-aware.yml` (saatlik, due-window tetikleme) ve `notify-sessions.yml` (10dk, doğrudan çağrı) —
ikisi de aynı repo secret/var'ı kullanır (`CRON_SECRET_KEY`, `SITE_URL`). Ayrı bir hesap/servis (Railway
vb.) gerekmiyor.

---

## DB Tabloları

| Tablo | Amaç |
|---|---|
| `f1_snapshots` | Ergast/MRData F1 verisi (season/round/type) |
| `stories` | Anthology hikayeleri |
| `radio_moments` | Telsiz anları |
| `circuits` | Pist verisi |
| `news_cache` | Agregat haberler |
| `news_stories` | Kümelenmiş + yeniden yazılmış haber hikâyeleri (7 gün saklama) |
| `push_subscriptions` | Mobil push token'ları |
| `notified_sessions` | Seans bildirimi dedupe guard'ı (season/round/session_type) |
| `circuit_weather` | **İleriye-dönük SADECE** — yalnızca canlı/gelecek yarışın pisti (unique season+round); sync-f1 her çalıştığında biten yarışların satırını siler. Geçmiş hava durumu asla tutulmaz. |

`f1_snapshots.type` artık `'pitstops'` de kabul ediyor (Jolpica `/pitstops.json`, race sonuçlarıyla aynı anda çekiliyor). `news_cache`'e `title_tr`/`description_tr` eklendi (MyMemory çevirisi, yalnızca eksik olanlar).

Migration kuralı: `YYYYMMDDHHMMSS_*.sql` formatı zorunlu.

---

## Ortam Değişkenleri (kritik)

| Değişken | Kullanım |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client okuma |
| `SUPABASE_SERVICE_ROLE_KEY` | Server yazma (asla client'a sızmaz) |
| `CRON_SECRET` / `CRON_SECRET_KEY` | Cron auth (ikisi de kabul edilir) |
| `NEXT_PUBLIC_SITE_URL` | RSC self-fetch ve canonical; `getSiteUrl()` sırası: bu → `VERCEL_URL` → sabit canlı host |
| `SITE_URL` | Yalnız GitHub Actions/script'ler (repo variable) |
| `GEMINI_API_KEY` | Haber birleştirme/yeniden yazım (ücretsiz katman, opsiyonel; AI Studio'dan) |
| `GROQ_API_KEY` | Haber yazımı ana sağlayıcı (ücretsiz katman; gpt-oss-120b → 20b). Gemini yedek |
| `GROQ_NEWS_MODELS` / `GEMINI_NEWS_MODELS` | Haber yazım model listesi override (opsiyonel) |
| `UPSTASH_REDIS_REST_URL/TOKEN` | Rate-limit ve cron kilidi (opsiyonel; yoksa in-memory) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_AUTH_TOKEN` / `SENTRY_UPLOAD_SOURCE_MAPS` | Sentry (opsiyonel) |

---

## Komutlar

```bash
npm run dev | build | lint | test
npm run seed:f1db | seed:stories

npx tsc --noEmit   # tip kontrolü (npm script yok)
```

---

## Brownfield Uyarıları

1. `isSeasonSnapshotContentInvalid()` — boş DB snapshot atlanır, Jolpica fallback.
2. Pilot/takım/araç görseli **yok artık** — `driverIconSrc()`/`teamIconSrc()`/`carSrc()` hep `null` döner, `ApexFallback` rozet render eder (bkz. Görsel politikası yukarıda). Yeni bir görsel-tabanlı asset eklemeden önce telif/lisans durumunu netleştir.
3. Paralel `npm run build` kilitleme riski — tek build aynı anda.


## Tarih indeksi (F1DB) ve sezon seçimi

- `scripts/build-f1-history-index.ts`: F1DB GitHub sürümünü indirir (zip sağlama toplamı doğrulanır), `data/history/` altına yazar: `constructor-index.json` (hafif, tarayıcıya gidebilir), `constructors.json` (takımlar, soyağacı/chronology, sezon satırları), `drivers.json` (pilot sezon satırları: takım, numara, sıra, puan, galibiyet…), `seasons.json` (şampiyonlar), `meta.json` (sürüm, sağlama). Gizli anahtar ve veritabanı gerekmez. Lisans: **F1DB CC BY 4.0** — alt bilgide atıf var, kaldırılamaz.
- Kod: `lib/history/` — `ids.ts` (tarayıcı-güvenli kimlik çözümleme), `palette.ts` + `color.ts` (dönem renkleri; tek giriş `paletteFor`), `store.ts` (ağır indeks, yalnız sunucu), `career.ts` (o yıl itibarıyla toplamlar, takım durakları), `dna.ts` (takım soyağacı), `lineup.ts`, `enrich.ts` (arşiv puan durumuna takım/numara/galibiyet), `seasons.ts` (şampiyonlar, sezon seçici). Sunucu tarafı görünüm modelleri: `lib/data/profiles.ts`. Güncel sezon indekste kısmi olduğundan canlı veriyle üzerine yazılır.
- Sayfalar: `/drivers/[id]?season=`, `/teams/[id]?season=`, `/grid?season=`, `/season/[year]`. Kimlikler F1DB kebab-case (`lewis-hamilton`) ya da Ergast (`hamilton`, `red_bull`) olabilir; ikisi de çözülür.
- Renkler editoryal yaklaşıklıktır (`data/history/liveries.ts`, resmî kaynak yok, logo yok); listede olmayan takımlar ülke yarış rengi alır. İstemci paketine ağır JSON girmemesi için `tests/history-palette.test.ts` içinde koruma testi var.

## Haber hikâyeleri (news_stories)

- `sync-news` → RSS → `lib/news/cluster.ts` (olay bazlı kümeleme, transitif değil) → `lib/news/stories.ts` (kararlı id, en iyi görsel = ulaşılabilir en büyük, AI yeniden yazım EN+TR, parmak izi ile yalnız yeni/değişen) → `news_stories` tablosu.
- Yeniden yazım `lib/news/rewrite.ts` (Groq gpt-oss-120b → 20b, yedek Gemini; 4 hikâye tek istekte, ücretsiz katman; telif koruması: kaynakla 7+ ardışık kelime örtüşürse çıktı reddedilir). Ses/ton tek yerden: `lib/news/voice.ts`.
- AI anahtarı yoksa hikâye en iyi kaynağın kendi başlığı/özetiyle kalır (`rewritten=false`), TR başlık MyMemory ile (günde küçük kota).
- Saklama: 7 gün (news_stories + news_cache). Sayfalar yalnız DB okur (`lib/data/news.ts`), görseli olmayan hikâye listelerde çıkmaz, detayda kapaksız gösterilir.
- Pist konumu/saat dilimi: `circuits.data.location` (sync-f1, Jolpica takvimi + Open-Meteo `timezone=auto`).
