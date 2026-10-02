# Apex (Project Anthology)

Formula 1 odaklı arşiv ve canlı veri sitesi. Sezon takvimi, puan durumu, pilot/takım profilleri, pistler, haberler ve tarihsel hikâyeler tek bir arayüzde birleşir.

**Canlı:** [project-anthology-eight.vercel.app](https://project-anthology-eight.vercel.app)

## Özellikler

- **Ana panel** — Bento dashboard: geri sayım, puan durumu, son yarış, haber özeti, "on this day"
- **Sezon** — Takvim, yarış detayları
- **Pilotlar & takımlar** — Grid, profil sayfaları,takım-bazlı renk paleti
- **Pistler** — Pist listesi ve detay sayfaları
- **Anthology** — Tarihsel F1 hikâyeleri (Senna, Fangio, Brawn GP vb.)
- **Haberler** — RSS kaynakları olay bazında kümelenir, her hikâye için özgün EN+TR özet yazılır (kaynak linkleriyle); sayfalar yalnızca veritabanını okur
- **Tech Glossary** — F1 terimleri sözlüğü
- **Diller** — İngilizce (önek yok) ve Türkçe (`/tr`)
- **PWA** — Manifest ve service worker desteği

## Teknoloji

| Katman | Araç |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Stil | Tailwind CSS 4 |
| Veritabanı | Supabase (PostgreSQL) |
| Hosting | Vercel (`main` otomatik deploy) + GitHub Actions (cron tetikleyicileri) |
| Dil | next-intl (EN + `/tr`) |
| Veri kaynakları | Jolpica/Ergast, F1DB, OpenF1, Open-Meteo, RSS, Groq/Gemini (haber yazımı), MyMemory (çeviri) |
| İzleme | Sentry, Vercel Analytics & Speed Insights |
| Test | Vitest (Playwright kurulu ama kullanılmıyor) |

## Kurulum

```bash
git clone <repo-url>
cd anthology
npm install   # Node 24 (bkz. .nvmrc)
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
| `CRON_SECRET` / `CRON_SECRET_KEY` | Evet (biri) | Cron `Authorization: Bearer` doğrulaması; ikisi de kabul edilir |
| `NEXT_PUBLIC_SITE_URL` | Önerilir | Mutlak site URL'si (canonical ve RSC self-fetch) |
| `SITE_URL` | Hayır | Yalnızca GitHub Actions/script'ler için |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | Hayır | Haber yazımı (Groq ana, Gemini yedek); yoksa kaynağın kendi metni kalır |
| `GROQ_NEWS_MODELS`, `GEMINI_NEWS_MODELS` | Hayır | Model listesi override |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Hayır | Dağıtık rate-limit ve cron kilidi; yoksa in-memory |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_UPLOAD_SOURCE_MAPS` | Hayır | Sentry |

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

Her sayfa `en` (önek yok) ve `tr` (`/tr/...`) olarak vardır.

| Rota | Açıklama |
|---|---|
| `/` | Ana sayfa |
| `/season`, `/season/[year]`, `/season/[year]/round/[n]` | Sezon, yıl ve yarış detayı |
| `/grid` | Pilot ve takım gridi |
| `/drivers`, `/drivers/[driverId]` | Pilotlar |
| `/teams`, `/teams/[constructorId]` | Takımlar |
| `/circuits`, `/circuits/[id]` | Pistler |
| `/anthology`, `/anthology/[slug]` | Tarihsel hikâyeler |
| `/news`, `/news/[id]` | Haberler |
| `/tech-glossary` | Terim sözlüğü |
| `/disclaimer`, `/privacy`, `/terms`, `/dmca` | Yasal sayfalar |
| `/api/*` | 13 route handler (4 cron, `f1-season`, `live-timing`, `news`, `push/register`, season/circuit/career) |

## Mimari (kısa)

```
Dış API'ler (Jolpica, F1DB, OpenF1, RSS)
        ↓  Cron: Vercel (günlük) + GitHub Actions (saatlik/10 dk), server-side
    Supabase (PostgreSQL)
        ↓  lib/data/* (RSC)
    Next.js sayfaları → UI
```

- **Temporal kaynak:** `lib/f1Calendar` — sezon, takım ve pilot bilgisi buradan okunur; hardcode yok.
- **Geçmiş sezonlar:** F1DB seed ile DB'de saklanır.
- **Güncel sezon:** DB snapshot + canlı Jolpica fallback (content-invalid guard ile).
- **API anahtarları:** Yalnızca server-side; client'a sızmaz.

Ölçülmüş durum ve dizin haritası: [`docs/reference/apex-reference.md`](docs/reference/apex-reference.md)

## Test

```bash
npm test                    # Birim testleri (Vitest)
npx tsc --noEmit            # Tip kontrolü (npm script yok)
```

## Dokümantasyon

| Dosya | İçerik |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Tek kanonik agent kural dosyası |
| [`docs/reference/apex-reference.md`](docs/reference/apex-reference.md) | Ölçülmüş durum, mimari, veri, güvenlik, boşluklar |
| [`docs/procedures.md`](docs/procedures.md) | Tekrarlanan bakım/denetim prosedürleri |
| [`docs/plans/master-plan.md`](docs/plans/master-plan.md) | Canlı iş listesi |
| [`docs/vision/technical.md`](docs/vision/technical.md) | Teknik özet (stack, API, tablolar, env) |
| [`docs/design/apex-design-language.md`](docs/design/apex-design-language.md) | Tasarım otoritesi |
| [`docs/reference/PROJECT_LESSONS_AND_ROADMAP.md`](docs/reference/PROJECT_LESSONS_AND_ROADMAP.md) | Geçmiş tuzaklar (tarihsel) |

## Deploy

Vercel `main` dalını otomatik deploy eder. Cron rotaları (`/api/cron/sync-f1`, `sync-news`, `sync-radio`, `notify-sessions`) cron secret ile korunur.

```bash
npm run build   # Deploy öncesi sıfır hata doğrulaması
```

## Lisans

Özel proje (`private: true`).
