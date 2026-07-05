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
| Rate-limit | Upstash Redis + in-memory fallback |

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

**Supabase istemcileri:**
- `getSupabaseClient()` — anon, yalnızca okuma
- `getSupabaseAdmin()` — service_role, yalnızca server-side yazma

---

## API & Cron

| Rota | Amaç |
|---|---|
| `/api/cron/sync-news` | RSS → news_cache (06:00 UTC) |
| `/api/cron/sync-f1?scope=season` | Jolpica → f1_snapshots (07:00 UTC) |
| `/api/cron/sync-radio` | OpenF1 → radio_moments (08:00 UTC) |
| `/api/push/register` | Expo push token kayıt |
| `/api/f1-season` | Canlı Jolpica proxy |
| `/api/news` | Haber API |
| `/api/season/[year]` | Sezon snapshot API |

Cron auth: `Authorization: Bearer ${CRON_SECRET_KEY}`

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
| `GEMINI_API_KEY` | Haber özeti (opsiyonel) |
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
3. Asset path'leri sezon alt klasörü: `public/drivers/{season}/`, `teamIconSrc()` kullan.
4. Paralel `npm run build` kilitleme riski — tek build aynı anda.
