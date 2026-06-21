# Apex (Project Anthology)

Formula 1 odaklı arşiv ve canlı veri sitesi. Sezon takvimi, puan durumu, pilot/takım profilleri, pistler, haberler ve tarihsel hikâyeler tek bir arayüzde birleşir.

**Canlı:** [project-anthology-five.vercel.app](https://project-anthology-five.vercel.app)

## Özellikler

- **Ana panel** — Bento dashboard: geri sayım, puan durumu, son yarış, haber özeti, "on this day"
- **Sezon** — Takvim, yarış detayları
- **Pilotlar & takımlar** — Grid, profil sayfaları,takım-bazlı renk paleti
- **Pistler** — Pist listesi ve detay sayfaları
- **Anthology** — Tarihsel F1 hikâyeleri (Senna, Fangio, Brawn GP vb.)
- **Haberler** — RSS kaynaklarından canlı aggregate
- **Tech Glossary** — F1 terimleri sözlüğü
- **PWA** — Manifest ve service worker desteği

## Teknoloji

| Katman | Araç |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Stil | Tailwind CSS 4 |
| Veritabanı | Supabase (PostgreSQL) |
| Hosting | Vercel (+ Cron) |
| Veri kaynakları | Jolpica/Ergast, F1DB, OpenF1, RSS |
| İzleme | Sentry, Vercel Analytics & Speed Insights |
| Test | Vitest, Playwright (devDependency) |

## Kurulum

```bash
git clone <repo-url>
cd anthology
npm install
cp .env.example .env.local
```

`.env.local` dosyasını doldurun (aşağıya bakın), ardından:

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje URL'si |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Client-side anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet | Server-side tam erişim (client'a sızdırılmaz) |
| `CRON_SECRET_KEY` | Evet | Vercel Cron `Authorization: Bearer` doğrulaması |
| `NEXT_PUBLIC_SITE_URL` | Önerilir | Mutlak site URL'si (RSC self-fetch için) |
| `GEMINI_API_KEY` | Hayır | Haber özetleri için; yoksa özet atlanır |

Şablon: [`.env.example`](.env.example)

## Komutlar

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm run lint         # ESLint
npm test             # Vitest (bir kez)
npm run test:watch   # Vitest (watch modu)
npm run seed:f1db    # F1DB tarihsel veri seed
npm run seed:stories # Anthology hikâye seed
npm run gen:pwa-icons # PWA ikon üretimi
```

## Rotalar

| Rota | Açıklama |
|---|---|
| `/` | Ana sayfa (bento dashboard) |
| `/season` | Güncel sezon |
| `/season/[year]/round/[n]` | Yarış detayı |
| `/drivers`, `/drivers/[id]` | Pilotlar |
| `/teams`, `/teams/[constructorId]` | Takımlar |
| `/circuits`, `/circuits/[id]` | Pistler |
| `/anthology`, `/anthology/[slug]` | Tarihsel hikâyeler |
| `/news` | Haberler |
| `/tech-glossary` | Terim sözlüğü |

## Mimari (kısa)

```
Dış API'ler (Jolpica, F1DB, OpenF1, RSS)
        ↓  Vercel Cron (server-side)
    Supabase (PostgreSQL)
        ↓  lib/data/* (RSC)
    Next.js sayfaları → UI
```

- **Temporal kaynak:** `lib/f1Calendar` — sezon, takım ve pilot bilgisi buradan okunur; hardcode yok.
- **Geçmiş sezonlar:** F1DB seed ile DB'de saklanır.
- **Güncel sezon:** DB snapshot + canlı Jolpica fallback (content-invalid guard ile).
- **API anahtarları:** Yalnızca server-side; client'a sızmaz.

Detaylı dizin haritası: [`docs/reference/proje-dizini.md`](docs/reference/proje-dizini.md)

## Test

```bash
npm test                    # Birim testleri (Vitest)
```

> **Not (2026-06-21):** Frontend tamamen sıfırlandı, sıfırdan inşa edilecek. `components/` silindi; sayfalar veri çağrılarını koruyan iskelet placeholder. Backend/veri/mimari korundu.

## Dokümantasyon

| Dosya | İçerik |
|---|---|
| [`docs/reference/proje-dizini.md`](docs/reference/proje-dizini.md) | Dizin haritası ve mimari (güncel durum) |
| [`docs/reference/PROJECT_LESSONS_AND_ROADMAP.md`](docs/reference/PROJECT_LESSONS_AND_ROADMAP.md) | Dikkat dökümanı ve yol haritası |
| [`.claude/CLAUDE.md`](.claude/CLAUDE.md) | Agent çalışma anayasası (backend/mimari) |

## Deploy

Vercel üzerinde deploy edilir. Cron rotaları (`/api/cron/sync-f1`, `sync-news`, `sync-radio`) `CRON_SECRET_KEY` ile korunur.

```bash
npm run build   # Deploy öncesi sıfır hata doğrulaması
```

## Lisans

Özel proje (`private: true`).
