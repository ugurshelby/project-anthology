# Project Directory & Architecture Map (Anthology / Apex)

Bu döküman, projenin kök dizin haritasını ve mimari katmanlarını içerir. Agent, projede herhangi bir işlem yapmadan, dosya aramadan veya yeni bir dosya oluşturmadan önce BU HARİTAYI okumak ve kurallara uymak ZORUNDADIR.

> **⚠️ Frontend durumu (2026-06-21):** Frontend tamamen sıfırlandı, sıfırdan inşa edilecek.
> - `components/` **silindi** (tüm UI bileşenleri gitti).
> - `app/**/page.tsx` sayfaları **iskelet placeholder'a indirildi** — server-side veri çağrıları, `metadata`/`generateMetadata`/`generateStaticParams` ve route yapısı korundu; JSX boş (`<main>Sayfa adı</main>`).
> - `app/layout.tsx` font + `{children}` iskeletine indirildi (nav/footer/transition kaldırıldı).
> - `app/globals.css` yalnızca design token + reset içeriyor (component stilleri yok).
> - Backend, veri katmanı, mimari, `data/` metin içerikleri ve `public/` assetleri **korundu**.
> - Hazır bir tasarım anayasası YOK; yeni tasarım dili kullanıcı tarafından verilecek.

## 1. Root Configuration (Kök Dizin Beyni)
- `package.json`: Proje bağımlılıkları ve script listesi.
- `next.config.ts` & `tsconfig.json`: Next.js ve TypeScript yapılandırmaları (CSP, güvenlik header'ları `next.config.ts`'te).
- `.env.local`: API anahtarları ve Supabase bağlantı sırları.
- `instrumentation.ts` & `sentry.*.config.ts`: Sentry hata izleme ve telemetri.
- `vercel.json`: Cron zamanlaması.

## 2. Core Architecture (Ana Katmanlar)

### `/app` (Routing & Pages)
Next.js App Router. Her klasör bir URL rotasıdır. Sayfalar şu an iskelet placeholder (yukarıdaki nota bak).
- `app/page.tsx`: Ana sayfa.
- `app/anthology/[slug]/`, `app/circuits/[id]/`, `app/drivers/[driverId]/`, `app/teams/[constructorId]/`, `app/season/[year]/round/[n]/`: Dinamik detay rotaları.
- `app/api/`: Backend API rotaları ve Cron Jobs (`sync-f1`, `sync-news`, `sync-radio`, `f1-season` proxy, `news`, `season/[year]`). **Frontend sıfırlamasından etkilenmedi.**
- `app/layout.tsx`, `app/manifest.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/`, `app/opengraph-image.tsx`: layout + SEO/PWA altyapısı (korundu).

### `/components` — SİLİNDİ
Frontend sıfırlamasıyla tamamen kaldırıldı. Yeni bileşenler buraya sıfırdan yazılacak.

### `/lib` (Data & Logic Layers) — korundu
- `lib/supabase.ts`: Supabase (PostgreSQL) bağlantı istemcisi.
- `lib/data/f1.ts`: F1 snapshot okuma (3-tier: DB → static → Jolpica proxy).
- `lib/data/entities.ts`, `lib/data/circuits.ts`, `lib/data/news.ts`, `lib/data/radio.ts`, `lib/data/stories.ts`: sayfa veri okuma katmanları.
- `lib/f1Calendar.ts`: F1 temporal tek kaynak (`CURRENT_SEASON`, `getF1Context()`).
- `lib/f1Ingest.ts`: snapshot yazma (cron → Supabase).
- `lib/f1/sources/`: dış kaynak entegrasyonları (`openf1.ts`, `jolpica.ts`, `f1db.ts`).
- `lib/news/aggregate.ts`: RSS haber aggregate.
- `lib/assets/f1-icons.ts`: asset path çözümleme (sezon parametreli).
- `lib/seo.ts`: SEO/JSON-LD tek kaynak.

### `/data` (Metin İçerik) — korundu
- `data/drivers/`, `data/teams/`: pilot/takım lore (biyografi, kilometre taşları, araç numarası).
- `data/glossary/`: tech glossary terimleri + lastik bileşenleri.
- `data/stories/`: anthology hikaye içerikleri.
- `data/circuits/facts.ts`: pist statik facts + koordinatlar.

### `/config` — korundu
- `config/team-colors.ts`: takım renkleri (UI bar/chip; 2026 grid).

### `/public` — korundu (DOKUNMA)
- Pilot/takım/pist/lastik/bayrak SVG ve PNG assetleri, ikonlar, favicon.

### `/scripts`, `/supabase`, `/tests`, `/types` — korundu
- Seed/sync scriptleri, DB migration'ları, vitest testleri, DB tipleri.

## 3. Agent Rules for Directory Awareness
1. **No Redundancy:** Yeni component yazmadan önce ilgili klasörü kontrol et; mevcut kodu çoğaltma.
2. **Context Preservation:** Değiştirmeden önce ilgili dosyayı oku.
3. **Strict Pathing:** Import'ta absolute path (`@/components/...`, `@/lib/...`) kullan.
4. **Frontend yeniden inşa:** Tasarım kararları kullanıcıdan gelir; varsayım yapma, sor.
