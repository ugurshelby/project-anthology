# Project Anthology Audit Raporu

Aşağıdaki audit **kod değiştirmeden** yapıldı.  
`public/` içinde 1000+ dosya olduğu için, tekrarlı snapshot/asset kümelerini **dosya desenleriyle (hepsini kapsayacak şekilde)** verdim; küçük klasörler tek tek.

KEEP: `src/components/SeasonTracker.tsx` — Çalışıyor, route’a bağlı ve UI çıktısı tutarlı  
KEEP_MODIFIED: `src/components/LiveTiming.tsx` — Çalışıyor ama `TEAM_COLORS`/yardımcılar duplicate, ayrıştırılmalı  
KEEP_MODIFIED: `src/components/f1Data.ts` — Çalışıyor ama aşırı büyük, `src/data/` altına bölünmeli

SKIP: `src/data/` — Dizin yok (taşınacak gerçek data katmanı burada olmalı)

KEEP: `api/f1-season.ts` — Proxy güvenlik/kısıt kontrolleri iyi  
KEEP: `api/f1-live.ts` — Live proxy ve cache davranışı mantıklı  
KEEP_MODIFIED: `api/f1-db.ts` — Çalışıyor, env/DB bağımlılığı taşınmadan önce sadeleştirilmeli  
KEEP_MODIFIED: `api/generate-assets.ts` — Çalışıyor ama auth/non-auth path karmaşık ve sıkılaştırılmalı  
KEEP: `api/proxy-helpers.ts` — SSRF/sanitize tarafı sağlam  
KEEP: `api/health.ts` — Basit ve doğru  
KEEP_MODIFIED: `api/news.ts` — İş görüyor ama serverless için fazla ağır/uzun  
KEEP_MODIFIED: `api/news.test.ts` — Kısmi test, gerçek edge case kapsamı zayıf

KEEP_MODIFIED: `utils/assetManifest.ts` — Kod iyi, ama manifest tarafı boş/akış eksik  
KEEP_MODIFIED: `utils/assetPipeline.ts` — Çalışıyor ama domain logic + provider logic çok iç içe  
KEEP: `utils/newsService.ts` — SWR/cache fallback akışı iyi  
KEEP_MODIFIED: `utils/newsService.test.ts` — Testler var ama flaky/gerçek network edge’leri eksik  
KEEP_MODIFIED: `utils/optimizedImages.ts` — Kullanılıyor ama mapping tablosu teknik borç  
KEEP_MODIFIED: `utils/optimizedImages.test.ts` — Dar kapsam, davranışın tamamını doğrulamıyor  
KEEP_MODIFIED: `utils/performanceMonitor.ts` — Faydalı ama taşınırken minimalleştirilmeli  
KEEP_MODIFIED: `utils/errorTracker.ts` — Çalışıyor, Sentry init/call pattern sadeleşmeli  
KEEP: `utils/logger.ts` — Net ve merkezi  
KEEP: `utils/imagePreloader.ts` — Kullanım var, yardımcı katman faydalı  
KEEP_MODIFIED: `utils/imagePreloader.test.ts` — Testler kırılgan (DOM/event timing)  
KEEP_MODIFIED: `utils/imageCDN.ts` — Çalışıyor, ama URL/transform policy merkezileştirilmeli  
KEEP_MODIFIED: `utils/relatedStories.ts` — Heuristik çalışıyor ama içerik bağımlılığı yüksek  
KEEP: `utils/keyboardShortcuts.ts` — Net, kullanılan yardımcı  
KEEP_MODIFIED: `utils/images.ts` — Çalışıyor ama isim/niyet teknik olarak yanıltıcı  
SKIP: `utils/imagePaths.ts` — Kullanılmıyor (dead code)

KEEP_MODIFIED: `server/dev-api-server.ts` — Dev için iş görüyor ama fazla sorumluluk yüklü

SKIP: `season-tracker/` — Dizin boş, taşınacak bir çıktı yok

KEEP_MODIFIED: `tracks/index.html` — Çalışıyor ama statik shell yaklaşımı taşınmadan sadeleşmeli  
KEEP_MODIFIED: `tracks/app.js` — Büyük monolit, modülerleştirme gerekli  
KEEP_MODIFIED: `tracks/styles.css` — Çalışıyor ama tekrar/legacy bloklar fazla

KEEP_MODIFIED: `radio-anthology/index.html` — Çalışıyor ama build pipeline ile kopuk  
KEEP_MODIFIED: `radio-anthology/app.js` — Büyük monolit, veri/UI ayrımı zayıf  
KEEP_MODIFIED: `radio-anthology/styles.css` — Çalışıyor ama ciddi cleanup gerekli

KEEP_MODIFIED: `tailwind.config.js` — Çalışıyor ama token/legacy alias şişkin  
KEEP_MODIFIED: `index.css` — Çok büyük, route-bazlı ayrıştırma gerekli  
KEEP_MODIFIED: `vite.config.ts` — Güçlü ama aşırı karmaşık (dev static middleware + build tuning)  
KEEP_MODIFIED: `vercel.json` — Rewrite stratejisi karmaşık, `/season-tracker` çakışması riski var

KEEP: `public/nav-shell.css` — Ortak nav için kullanılabilir  
KEEP: `public/nav-shell.js` — Kullanılıyor, shared shell mantıklı  
KEEP: `public/cinematic.css` — Design system katmanı işe yarıyor  
KEEP: `public/cinematic.js` — Küçük yardımcı, işe yarar  
KEEP: `public/circuit-covers.js` — Circuit cover fallback pipeline çalışır durumda  
KEEP: `public/news-fallback.json` — API fallback için gerekli  
KEEP: `public/tyres/soft.svg` — Kullanılan minimal asset  
KEEP: `public/tyres/medium.svg` — Kullanılan minimal asset  
KEEP: `public/tyres/hard.svg` — Kullanılan minimal asset  
KEEP: `public/images/placeholders/driver.svg` — Fallback asset gerekli  
KEEP: `public/images/placeholders/team.svg` — Fallback asset gerekli  
KEEP: `public/images/placeholders/circuit.svg` — Fallback asset gerekli  
KEEP: `public/images/placeholders/radio.svg` — Fallback asset gerekli

KEEP_MODIFIED: `public/data/season-tracker-images.json` — Çalışıyor, içerik senkronizasyonu düzenli yapılmalı  
KEEP_MODIFIED: `public/data/radio-images.json` — Çalışıyor ama orphan/eksik eşleşmeler cleanup istiyor  
KEEP_MODIFIED: `public/data/circuit-images.json` — Çalışıyor ama kalite/metadata standardizasyonu gerekli  
SKIP: `public/data/asset-manifest.json` — Boş (`assets: []`), şu haliyle taşımaya değmez  
KEEP: `public/data/f1/index.json` — Sezon index’i temel veri

KEEP_MODIFIED: `public/data/f1/2021/*.json` — Kullanılabilir ama snapshot bütünlüğü doğrulanmalı  
KEEP_MODIFIED: `public/data/f1/2021/rounds/*/*.json` — Büyük arşiv, eksik/çifte dosyalar normalize edilmeli  
KEEP_MODIFIED: `public/data/f1/2022/*.json` — Kullanılabilir, migration öncesi doğrulama şart  
KEEP_MODIFIED: `public/data/f1/2022/rounds/*/*.json` — Snapshot set cleanup gerekli  
KEEP_MODIFIED: `public/data/f1/2023/*.json` — Kullanılabilir, kalite kontrol gerekli  
KEEP_MODIFIED: `public/data/f1/2023/rounds/*/*.json` — Eksik varyantlar var, normalize edilmeli  
KEEP_MODIFIED: `public/data/f1/2024/*.json` — Kullanılabilir, eksik tur dosyaları mevcut  
KEEP_MODIFIED: `public/data/f1/2024/rounds/*/*.json` — Bazı round’larda partial set var  
KEEP_MODIFIED: `public/data/f1/2025/*.json` — Kullanılabilir ama tutarlılık kontrolü gerekli  
KEEP_MODIFIED: `public/data/f1/2025/rounds/*/*.json` — Partial/tekrarlı snapshot riski  
KEEP_MODIFIED: `public/data/f1/2026/*.json` — Erken sezon verisi, canlılık kontrolü şart  
KEEP_MODIFIED: `public/data/f1/2026/rounds/*/*.json` — Kapsam dar, güncelleme pipeline’a bağlı  
KEEP_MODIFIED: `public/data/f1/circuits/*/*.json` — Değerli ama standart schema/eksik alan cleanup gerekli

KEEP: `public/circuits/*.svg` — Track SVG set’i değerli  
KEEP_MODIFIED: `public/circuits/*.webp` — Kullanılabilir, dosya kalite/isim standardı gözden geçirilmeli  
KEEP_MODIFIED: `public/circuits/gallery/*/*.webp` — Değerli arşiv ama attribution/metadata yeknesak değil

KEEP_MODIFIED: `public/images/drivers/*.webp` — Kullanılıyor, naming/coverage cleanup önerilir  
KEEP_MODIFIED: `public/images/teams/*.svg` — Kullanılıyor ama bazıları orphan/gelecek takım placeholder  
KEEP_MODIFIED: `public/images/teams/*.webp` — Kullanılıyor, manifest eşleşmeleri temizlenmeli  
SKIP: `public/images/teams/team-background-images-4032x2268/.gitkeep` — Boş placeholder klasör  
SKIP: `public/images/teams/team-logos-200x200/.gitkeep` — Boş placeholder klasör  
KEEP_MODIFIED: `public/images/Full 1280x720/*.png` — Değerli ama build-time optimize edilmeli  
KEEP_MODIFIED: `public/images/Landscape 1280x720/*.png` — Değerli ama cache/format stratejisi yenilenmeli  
KEEP_MODIFIED: `public/images/Portrait 1280x1707/*.png` — Değerli ama yeni projede image pipeline’a taşınmalı  
KEEP_MODIFIED: `public/images/radio/*/*.webp` — Değerli ama manifest senkronu eksik dosyalar var  
KEEP_MODIFIED: `public/images/favicon.ico` — Duplicate favicon yapısı sadeleşmeli  
KEEP_MODIFIED: `public/images/favicon.svg` — Duplicate favicon yapısı sadeleşmeli  
KEEP: `public/favicon.ico` — Root favicon doğru yerde  
KEEP: `public/favicon.svg` — Root svg favicon doğru yerde  
KEEP: `public/images/logo.png` — Statik brand asset taşınabilir

KEEP: `public/fonts/st/*.woff2` — Self-hosted font set iyi, taşınmalı

## `package.json` script audit

KEEP: `predev` — Port temizliği net  
KEEP: `dev` — Ana lokal geliştirme akışı doğru  
KEEP: `dev:api` — Gerekli  
KEEP: `dev:vite` — Gerekli  
KEEP_MODIFIED: `dev:vite:await` — Çalışıyor ama pipeline karmaşık  
KEEP_MODIFIED: `dev:e2e` — Çalışıyor, sadeleştirilebilir  
KEEP: `fonts:season-tracker` — Asset prep için gerekli  
KEEP: `sync:f1` — Veri senkronu gerekli  
KEEP: `sync:f1:seasons` — Faydalı  
KEEP: `sync:f1:supabase` — Faydalı  
KEEP: `sync:f1:supabase:seasons` — Faydalı  
KEEP_MODIFIED: `build` — Çalışıyor ama sadece belirli statikleri kopyalıyor  
KEEP: `nop` — Guard/fallback için pratik  
KEEP_MODIFIED: `build:vercel` — Çalışıyor ama çok kırılgan zincir  
KEEP: `build:check` — Faydalı kalite kapısı  
KEEP: `preview` — Standart  
KEEP: `images:gen` — Gerekli  
SKIP: `images:circuit-covers` — Tanımlı ama build zincirinde fiilen kullanılmıyor  
KEEP: `images:circuit-images` — Gerekli  
KEEP: `images:radio-anthology` — Gerekli  
KEEP: `images:season-tracker` — Gerekli  
KEEP_MODIFIED: `images:optimize-story-38-40` — Çok özel-case; genelleştirilmeli  
KEEP: `test` — Gerekli  
KEEP: `test:ui` — Gerekli  
KEEP: `test:coverage` — Gerekli  
KEEP: `test:run` — Gerekli  
KEEP: `test:e2e` — Gerekli  
KEEP: `test:e2e:ui` — Gerekli  
KEEP: `check:bundle` — Gerekli  
KEEP_MODIFIED: `vercel:link` — Proje adı hardcoded  
KEEP_MODIFIED: `vercel:deploy` — Prod deploy script’i taşınmadan önce güvenlik/ortam ayrımı ister  
KEEP_MODIFIED: `seed:assets` — Ortam bağımlılığı yüksek  
KEEP: `seed:circuits` — Faydalı  
KEEP_MODIFIED: `pipeline:discover` — Operasyonel, yeni projede yeniden bağlanmalı  
KEEP_MODIFIED: `pipeline:rank` — Operasyonel  
KEEP_MODIFIED: `pipeline:stage` — Operasyonel  
KEEP_MODIFIED: `pipeline:approve` — Operasyonel  
KEEP_MODIFIED: `pipeline:plan` — Operasyonel  
KEEP_MODIFIED: `pipeline:verify` — Operasyonel

