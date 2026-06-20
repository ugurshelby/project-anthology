# Project Directory & Architecture Map (Anthology / Apex)

Bu döküman, projenin kök dizin haritasını ve mimari katmanlarını içerir. Agent, projede herhangi bir işlem yapmadan, dosya aramadan veya yeni bir dosya oluşturmadan önce BU HARİTAYI okumak ve kurallara uymak ZORUNDADIR.

## 1. Root Configuration (Kök Dizin Beyni)
- `package.json`: Proje bağımlılıkları ve script listesi.
- `next.config.ts` & `tsconfig.json`: Next.js ve TypeScript yapılandırmaları.
- `.env.local`: API anahtarları ve Supabase bağlantı sırları (Kozmik Oda).
- `instrumentation.ts` & `sentry.*.config.ts`: Sentry hata izleme ve telemetri sistemi.

## 2. Core Architecture (Ana Katmanlar)

### `/app` (Routing & Pages)
Next.js App Router mimarisi kullanılır. Her klasör bir URL rotasıdır.
- `app/page.tsx`: Ana sayfa (Home Dashboard).
- `app/anthology/[slug]/`: Dinamik F1 hikayeleri ve anlatı sayfaları.
- `app/circuits/[id]/`: F1 pist detayları ve haritalandırma rotaları.
- `app/drivers/`: Pilot profilleri ve istatistik listeleri.
- `app/api/`: Backend API rotaları ve zamanlanmış görevler (Cron Jobs).

### `/components` (UI & Lego Bricks)
- `components/ui/`: Proje genelinde tekrar kullanılan atomik bileşenler (Button, Skeleton vb.).
- `components/home/`: Ana sayfaya özel Bento tasarımları (`BentoCountdown.tsx`, `BentoStandingsTile.tsx`).
- `components/layout/`: Navbar, Footer ve ortak iskelet bileşenleri.

### `/lib` (Data & Logic Layers)
- `lib/supabase.ts`: Supabase (PostgreSQL) veri tabanı bağlantı istemcisi.
- `lib/f1/sources/`: Dış kaynaklı F1 API entegrasyonları (`openf1.ts`, `jolpica.ts`).

### `/scripts` (Automation & Seed)
- Veri tabanını besleme (Seeding) ve arka plan senkronizasyon scriptleri (`seed-f1-history.ts`, `sync-f1-scheduled.ts`).

### `/.github/workflows` (CI/CD & Automation)
- GitHub Actions otomasyonları ve test pipeline süreçleri.

## 3. Agent Rules for Directory Awareness
1. **No Redundancy:** Yeni bir component yazmadan önce `components/ui/` veya ilgili sayfaya özel klasörü kontrol et. Mevcut kodu çoğaltma.
2. **Context Preservation:** Manuel olarak eklenen veya değiştirilen dosyaları anlamak için önce ilgili alt dizindeki `README` veya `.plan.md` dosyalarını incele.
3. **Strict Pathing:** Dosya import ederken absolute path (`@/components/...` veya `@/lib/...`) kullan.