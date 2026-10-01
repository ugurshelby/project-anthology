# Teknik Referans — Project Anthology (Apex)

> Agent'ın kalıcı entegrasyon/API/tablo eklerken güncellediği özet.
> Detay: `docs/reference/mimari.md`

**Son güncelleme:** 2026-07-04

---

## Stack

| Katman | Sürüm / Araç |
|---|---|
| Web framework | Next.js **16.2.7**, React **19.2.4**, TypeScript **5** |
| Stil (web) | Tailwind CSS **4** |
| Mobil | Expo **~56**, React Native **0.85.3**, Expo Router **~56.2** |
| Veritabanı | Supabase (PostgreSQL + RLS) |
| Deploy | Vercel (web + 4 cron), EAS (mobil) |
| Test | Vitest (unit), Playwright (devDep, e2e henüz yok) |
| İzleme | Sentry, Vercel Analytics + Speed Insights |
| Rate-limit | Upstash Redis + in-memory fallback — Upstash env `.env.local`'de mevcut (muhtemelen prod'da da tanımlı, `vercel env pull` ile senkronize edilmiş olmalı); Vercel dashboard'dan **teyit edilmeli**, çünkü in-memory fallback yalnızca tek serverless instance içinde sayar — trafik artışında yeni instance'lar açıldıkça korumayı zayıflatır |
| CSP | `lib/security/csp.ts` — `font-src` same-origin + `data:` + `https://vercel.live` (Vercel Toolbar) |

---

## Klasör Haritası (özet)

```
anthology/
├── app/           # Next.js App Router (sayfalar iskelet; API/cron korundu)
├── lib/           # Veri katmanı, f1Calendar, ingest, supabase
├── data/          # Metin içerik (drivers, teams, stories, glossary)
├── config/        # team-colors.ts
├── public/        # Assetler — DOKUNMA
├── supabase/migrations/  # DB migration (3 dosya)
├── mobile/        # Expo monorepo alt projesi
├── docs/design/   # Tasarım otoritesi
└── tests/         # Vitest
```

**Silindi / yok:** `components/` (web UI sıfırlandı, 2026-06-21)

**Görsel politikası (2026-09-28):** Apex fotoğrafsız. Pilot portreleri, takım logoları, araç render'ları ve pist hava fotoğrafları kaynağı/lisansı belgesiz gerçek fotoğraf/marka varlıklarıydı — telif riski nedeniyle kaldırıldı. `lib/assets/f1-icons.ts`'teki `driverIconSrc`/`teamIconSrc`/`carSrc`/`circuitCoverSrc` artık her zaman `null` döner; `components/media/ApexFallback.tsx` veri-güdümlü rozet render eder (isim/kod baş harfleri + `--team-secondary` rengi — canlı standings verisinden, ek asset gerektirmez, yeni pilot/takım için otomatik çalışır). İstisna: `circuitIconSrc` — pist rota çizimi MIT lisanslı geometri (`assets/f1-circuits/`, fotoğraf değil), kaldırılmadı.

---

## Veri Akışı

```
Jolpica · F1DB · OpenF1 · RSS
        ↓  Vercel Cron (service_role)
    Supabase (f1_snapshots, stories, radio_moments, circuits, news_cache, push_subscriptions)
        ↓  lib/data/* (anon, RLS)
    app/**/page.tsx (RSC)
```

**Tek temporal kaynak:** `lib/f1Calendar.ts` — `CURRENT_SEASON`, `getF1Context()`

**Tarihsel kapsam:** `f1_snapshots` 1950–güncel sezon tam dolu (77/77 sezon, calendar+results+standings — 2026-09-28 backfill). `scripts/seed-f1-history.ts` varsayılanı `F1_SEASON_MIN` (1950), idempotent — yeniden çalıştırmak güvenli.

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
| `/api/cron/sync-news` | RSS → news_cache (06:00 UTC) |
| `/api/cron/sync-f1?scope=season` | Jolpica → f1_snapshots (07:00 UTC) |
| `/api/cron/sync-radio` | OpenF1 → radio_moments (08:00 UTC) |
| `/api/cron/notify-sessions` | Seans başlangıcından ~30dk önce push (GitHub Actions `notify-sessions.yml`, 10dk) |
| `/api/push/register` | Expo push token kayıt |
| `/api/f1-season` | Canlı Jolpica proxy |
| `/api/live-timing` | OpenF1 `session_key=latest` canlı pozisyon/interval proxy'si — home hero `LiveRaceTracker` tarafından 12sn'de bir poll edilir. Edge cache (`s-maxage=5`) + in-memory stampede guard + 8sn sert zaman aşımı (OpenF1 yavaşlarsa stale cache'e düşer) — 100+ eşzamanlı izleyici tek upstream çağrısını paylaşır. |
| `/api/news` | Haber API |
| `/api/season/[year]` | Sezon snapshot API |

Cron auth: `Authorization: Bearer ${CRON_SECRET_KEY}`

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
| `CRON_SECRET_KEY` | Cron auth |
| `NEXT_PUBLIC_SITE_URL` | RSC self-fetch |
| `GEMINI_API_KEY` | Haber birleştirme/yeniden yazım (ücretsiz katman, opsiyonel; AI Studio'dan) |
| `GROQ_API_KEY` | Haber yazımı ana sağlayıcı (ücretsiz katman; gpt-oss-120b → 20b). Gemini yedek |
| `UPSTASH_REDIS_REST_URL/TOKEN` | Rate-limit (opsiyonel) |

---

## Komutlar

```bash
# Web (kök)
npm run dev | build | lint | test
npm run seed:f1db | seed:stories

# Mobil
cd mobile && npm start
```

---

## Brownfield Uyarıları

1. Web sayfaları iskelet — veri çağrıları/metadata korundu, JSX boş.
2. `isSeasonSnapshotContentInvalid()` — boş DB snapshot atlanır, Jolpica fallback.
3. Pilot/takım/araç görseli **yok artık** — `driverIconSrc()`/`teamIconSrc()`/`carSrc()` hep `null` döner, `ApexFallback` rozet render eder (bkz. Görsel politikası yukarıda). Yeni bir görsel-tabanlı asset eklemeden önce telif/lisans durumunu netleştir.
4. Paralel `npm run build` kilitleme riski — tek build aynı anda.


## Haber hikâyeleri (news_stories)

- `sync-news` → RSS → `lib/news/cluster.ts` (olay bazlı kümeleme, transitif değil) → `lib/news/stories.ts` (kararlı id, en iyi görsel = ulaşılabilir en büyük, AI yeniden yazım EN+TR, parmak izi ile yalnız yeni/değişen) → `news_stories` tablosu.
- Yeniden yazım `lib/news/rewrite.ts` (Groq gpt-oss-120b → 20b, yedek Gemini; 4 hikâye tek istekte, ücretsiz katman; telif koruması: kaynakla 7+ ardışık kelime örtüşürse çıktı reddedilir). Ses/ton tek yerden: `lib/news/voice.ts`.
- AI anahtarı yoksa hikâye en iyi kaynağın kendi başlığı/özetiyle kalır (`rewritten=false`), TR başlık MyMemory ile (günde küçük kota).
- Saklama: 7 gün (news_stories + news_cache). Sayfalar yalnız DB okur (`lib/data/news.ts`), görseli olmayan hikâye listelerde çıkmaz, detayda kapaksız gösterilir.
- Pist konumu/saat dilimi: `circuits.data.location` (sync-f1, Jolpica takvimi + Open-Meteo `timezone=auto`).
