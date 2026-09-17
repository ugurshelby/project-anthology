# Apex Production Roadmap

Bu yol haritası Apex'i portföy demosundan binlerce kullanıcının güvenle
tüketebileceği; lisansı izlenebilir, SEO'su ölçülebilir ve performansı
öngörülebilir bir ürüne taşımak içindir. Sıra zorunludur: bir fazın kabul
kriterleri tamamlanmadan sonraki faz production kapsamına alınmaz.

## Mevcut durum ve kapsam

- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4,
  Supabase/PostgreSQL, Vercel Cron, Sentry, Vercel Analytics/Speed Insights.
- **Mevcut iyi temeller:** `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts`,
  route-level `generateMetadata` örnekleri, CSP/security headers, cron
  doğrulaması, rate-limit ve API validation yardımcıları.
- **İlk teknik inceleme notları:** driver/team sayfaları mevcut metadata üretir
  fakat entity JSON-LD ve tutarlı `og:image` kapsamı tamamlanmalıdır; footer'da
  resmi olmayan kullanım ve telif bildirimi yoktur; public asset ve haber
  kaynakları için lisans envanteri formalize edilmelidir.
- **Kapsam dışı ilk adım:** Bu dosya oluşturulurken uygulama sayfası,
  bileşen veya veri kodu değiştirilmez.

## Faz 1 — Hijyen & Hukuk

**Amaç:** Telif/lisans riskini ölçülebilir hale getirmek ve kullanıcıya
gerekli hukuki şeffaflığı sağlamak.

### Uygulanabilir işler

- `public/`, `assets/`, `stories-images/`, Supabase medya kayıtları ve haber
  RSS kaynakları için varlık envanteri çıkar; her kayıt için kaynak, lisans,
  attribution, edinme tarihi ve kullanım kısıtı alanlarını tanımla.
- Resmi logo/fotoğraf ve lisansı belirsiz görselleri kaldır veya özgün
  vektör/silüet, Wikimedia Commons ya da lisansı doğrulanmış alternatifle
  değiştir. SVG/GeoJSON pist haritalarını kaynak kaydıyla eşleştir.
- Ortak unofficial disclaimer bileşeni/metin standardı belirle; layout ve
  footer'a, ayrıca veri/medya odaklı sayfalara görünür şekilde uygula.
- KVKK aydınlatma ve başvuru kanalı, Çerez Politikası ve tercih merkezi,
  Gizlilik/Kullanım Koşulları, DMCA/telif ihbarı ve içerik düzeltme iletişim
  akışlarını oluştur. Hukuki metinler yayına girmeden yetkili incelemesinden
  geçirilir.
- Çerez/analytics kullanımını rıza durumuna bağla; gerekli olmayan analytics
  ve reklam çerezleri opt-in olmadan çalışmaz. Veri saklama, silme ve
  kullanıcı başvurusu sahiplerini tanımla.
- Kaynak/API attribution'larını (F1DB, Jolpica/Ergast, OpenF1, RSS vb.)
  ürün içinde ve dokümantasyonda görünür kıl; lisans metinlerini kaynak
  şartlarına göre doğrula.

### Kabul kriterleri

- Her production görseli için lisans kaydı ve kaldırma/replace prosedürü var.
- Resmi olmayan kullanım bildirimi tüm public yüzeylerde ve footer'da görünür.
- KVKK, çerez, gizlilik, kullanım ve DMCA sayfaları; iletişim adresi ve
  talep işleme sahibiyle erişilebilir.
- `npm run lint`, ilgili testler ve medya/lisans audit'i hatasızdır; gizli
  veri veya lisansı belirsiz asset kalmaz.

## Faz 2 — SEO & Metadata

**Amaç:** Arama motorlarının güvenilir, canonical ve zengin sonuç üretebilen
bir içerik grafiği görmesi.

### Uygulanabilir işler

- Ortak metadata builder'ı genişlet: sayfa başlığı/açıklaması, canonical,
  locale, `og:title`, `og:description`, mutlak `og:image`, dimensions,
  `twitter:card` ve gerektiğinde `noindex` kurallarını tekilleştir.
- Grand Prix/yarış detayları için gerçeğe dayalı `SportsEvent` JSON-LD;
  pilot detayları için `Person`; takım detayları için uygun `Organization`
  veya `SportsTeam` şeması üret. Tarih, mekan, katılımcı ve URL alanlarını
  yalnızca veri mevcutsa ekle.
- `/season`, `/drivers`, `/teams`, `/circuits`, `/news` ve detail rotalarında
  `generateMetadata`, canonical ve not-found davranışını denetle.
- `app/sitemap.ts` içinde public detail rotalarını, gerçek `lastModified`
  değerlerini ve uygun change frequency/priority değerlerini kullan; gizli,
  duplicate veya query-string URL'leri ekleme.
- `app/robots.ts` ile `/api/`, cron ve preview yüzeylerinin indexlenmesini
  engelle; production sitemap URL'sini doğrula.
- Search Console, structured-data validator ve OpenGraph preview testlerini
  CI/smoke kontrolüne ekle; 404, duplicate title, missing image ve invalid
  JSON-LD metriklerini izle.

### Kabul kriterleri

- Temel public route'ların tamamı canonical ve doğru metadata üretir.
- GP/pilot/takım detail sayfalarında validator'dan geçen, veriyle tutarlı
  JSON-LD bulunur.
- Dinamik sitemap ve robots production URL'siyle doğru XML/text döndürür.
- Preview noindex, API disallow ve `og:image` mutlak URL kontrolleri testlidir.

## Faz 3 — UI/UX & Responsive

**Amaç:** Mevcut Apex editorial dilini koruyarak bento grid, tipografi ve
mobil deneyimi erişilebilir, hızlı ve tutarlı hale getirmek.

### Uygulanabilir işler

- `design/` ve mevcut token'ları tek referans kabul et; spacing, typography
  scale, renk/kontrast, radius ve grid ölçülerini dokümante et.
- Her ana sayfayı Web Interface Guidelines ve WCAG AA açısından denetle:
  semantic headings, landmark'lar, focus/keyboard, touch target, alt metin,
  reduced motion, error/empty/loading/stale state.
- Bento grid için dar ekran, tablet ve geniş ekran breakpoint matrisi çıkar;
  tablo/telemetri taşmasını yatay kaydırma veya okunabilir alternatifle çöz.
- `next/image`, aspect-ratio, responsive sizes ve lazy loading kullanımını
  standardize et; above-the-fold alanını gereksiz client JS ve animasyondan
  arındır.
- Canlı veri bileşenleri için polling/backoff, stale göstergesi, abort
  controller ve cache davranışını görünür kıl; offline/slow network fallback
  ekle.
- Playwright ile kritik mobil/desktop smoke akışlarını ve axe/erişilebilirlik
  kontrolünü çalıştır; Core Web Vitals baseline kaydet.

### Kabul kriterleri

- Kritik rotalar 320px genişlikten büyük ekranlara kadar taşma olmadan
  çalışır; keyboard-only akış tamamlanır.
- Lighthouse/field ölçümlerinde LCP, INP ve CLS için belirlenen baseline
  korunur; görsel bundle bütçesi aşılmaz.
- Reduced-motion, loading/error/empty/stale ve disclaimer durumları testlidir.

## Faz 4 — Production Build & Deployment

**Amaç:** Güvenli, gözlemlenebilir ve geri alınabilir release süreci.

### Uygulanabilir işler

- CI kapıları: type-check, lint, unit/integration test, production build,
  route/metadata/structured-data smoke test ve dependency/security audit.
- Environment matrix oluştur: local, preview, production; secret'ları secret
  store'da tut, preview'da gerçek kullanıcı verisi ve indexleme kullanma.
- Supabase için migration sırası, RLS audit'i, backup/restore tatbikatı,
  connection/pool limitleri ve cron idempotency/runbook'u tanımla.
- Vercel build/cache, ISR revalidation, function timeout/memory, cron
  schedule ve rollback/previous deployment prosedürünü doğrula.
- Sentry source map, error boundary, uptime/cron failure alert, rate-limit ve
  provider failure dashboard'larını kur; PII loglanmasını engelle.
- Staged rollout yap: preview → internal smoke → düşük riskli production
  release → ölçüm → tam trafik. Rollback kararı için eşikler belirle.

### Kabul kriterleri

- Temiz checkout'ta `npm ci`, `npm run lint`, `npm test` ve `npm run build`
  başarıyla tamamlanır.
- Production smoke test; ana sayfa, sezon, pilot, takım, pist, haber,
  sitemap, robots, policy sayfaları ve cron auth davranışını doğrular.
- Backup/restore ve rollback runbook'u denenmiş; monitoring ve alarm sahibi
  atanmış; açık kritik/yüksek hata yoktur.

## Release checklist

- [ ] Faz kabul kriterleri ve lisans envanteri güncel
- [ ] `npm run lint` / `npm test` / `npm run build` yeşil
- [ ] Metadata, sitemap, robots ve JSON-LD validator kontrolleri yeşil
- [ ] Mobil/desktop erişilebilirlik ve Core Web Vitals baseline doğrulandı
- [ ] Env, RLS, cron, backup, monitoring ve rollback kontrol edildi
- [ ] Preview noindex ve unofficial/legal disclaimer production'da doğrulandı
