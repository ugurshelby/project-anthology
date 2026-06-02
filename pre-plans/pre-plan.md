# PLAN: Çekirdek Geliştirme ve Entegrasyon (Agent Workflow)

Bu doküman projenin Phase 0 (Setup) ve Phase 1-4 geliştirme döngüsünü tanımlar. Bütünleşik geliştirme felsefesine uygun olarak backend mimarisi her zaman önceliklidir.

## Phase 0: Kurulum ve Bağlantılar (Manuel Aksiyon Gerekli)
**Sorumlu:** İnsan (Kullanıcı)
Ajanlara kod yazdırmaya başlamadan önce şu adımlar tamamlanmalıdır:
1. GitHub repository oluştur ve yerel projeyi bağla.
2. Vercel'da projeyi oluştur ve GitHub reposuna bağla (`Continuous Deployment`).
3. Supabase projesi oluştur; `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini al.
4. Google AI Studio'dan `GEMINI_API_KEY` al.
5. Tüm bu anahtarları Vercel'ın "Environment Variables" sekmesine gir.
6. Terminalde `vercel link` ve `vercel env pull .env.local` çalıştırarak local environment'ı senkronize et.
7. Claude Code'un Supabase'i yönetmesi için terminalde `supabase login` ile yetkilendirme yap.

## Phase 1: Veritabanı ve Veri Katmanı (Backend & Data Layer)
**Sorumlu:** Claude Code (gstack destekli)
- **Adım 1:** Supabase şemalarını (Pistler, Pilotlar, Takımlar, Yarışlar, Puanlar) oluştur ve migration dosyalarını yaz.
- **Adım 2:** Ergast/Jolpi gibi dış API'lerden geçmiş sezon verilerini çekecek ve Supabase'e yazacak Serverless Cron Job fonksiyonlarını kurgula. Dış API bağımlılığını en aza indir.
- **Adım 3:** `newsService.ts` içindeki `stale-while-revalidate` önbellekleme stratejisini diğer statik veri akışları için genel bir utility'ye dönüştür.

## Phase 2: Tasarım Sistemi ve Core UI (Design System)
**Sorumlu:** Cursor Agent
- **Adım 1:** `docs/DESIGN_SYSTEM.md` referans alınarak global Tailwind konfigürasyonunu, tipografiyi ve renk değişkenlerini ayarla.
- **Adım 2:** "Atmospheric Hero Layers", Navbar ve Skeleton Shimmer gibi temel UI component'lerini oluştur (Önce placeholder görsellerle).
- **Adım 3:** Framer Motion kullanarak `#ff1801` sweep sayfa geçiş animasyonlarını sisteme entegre et.

## Phase 3: Sayfa İnşası ve Entegrasyon (Pages Integration)
**Sorumlu:** Cursor (Frontend) + Claude Code (Logic)
- **Adım 1 (The Hub `/`):** Supabase'den gelen statik verilerle ana sayfayı (Quick Standings, Countdown, AI News Highlights) Server Components kullanarak inşa et.
- **Adım 2 (`/circuits` & `/season`):** SVG haritaları ve pilot/takım görsellerini UI'a bağla. Yatay kaydırılabilir bilet menülerini ve "Form Guide" (son 5 yarış trendi) grafiklerini kurgula.
- **Adım 3 (`/tech-glossary` & `/anthology`):** MDX tabanlı statik içerik yapısını kur. Metin içindeki teknik terimleri regex ile yakalayıp glossary'ye yönlendirecek "Internal Linking" component'ini yaz.

## Phase 4: SEO ve Kalite Kontrol (SEO & QA)
**Sorumlu:** Claude Code (gstack `/cso`, `/qa`, `/ship`)
- **Adım 1:** Tüm sayfalara dinamik Open Graph meta etiketleri ve JSON-LD schema yapılarını ekle.
- **Adım 2:** Headless Chromium (`/browse`) ile sayfaları test et. Yüklenme sürelerini, API route yanıtlarını ve hydration hatalarını denetle.
- **Adım 3:** Supabase index'lerini ve Vercel Edge Cache kurallarını teyit ettikten sonra Vercel'a production deployment'ı gerçekleştir.