# Apex Engineering Standards

Bu dosya, Apex (Project Anthology) üzerinde çalışan tüm ajanlar ve
geliştiriciler için kök çalışma sözleşmesidir. Ayrıntılı teslim sırası ve
kabul kriterleri `ROADMAP.md` içindedir. Kök web uygulaması Next.js 16 App
Router, React 19, TypeScript ve Tailwind CSS 4 kullanır; `mobile/` ayrı bir
Expo uygulamasıdır.

## Değişmez sınırlar

### Marka, telif ve içerik

- Formula 1, takım veya sponsorların resmi logoları; lisanssız basın,
  Getty/AFP/Reuters ve benzeri telifli fotoğraflar kullanılmaz.
- Görsel varsayılanı özgün vektörel/çizim kartları, silüetler, pist SVG/GeoJSON
  haritaları ve lisansı doğrulanmış Wikimedia Commons varlıklarıdır.
- Her görselin kaynak URL'si, yazar/üretici, lisans türü, edinme tarihi ve
  değişiklik bilgisi tutulur. Lisansı belirsiz varlık production'a girmez.
- F1, FIA, takım ve sponsor adları yalnızca tanımlayıcı/editorial bağlamda
  kullanılır; resmi ilişki veya endorsement ima edilmez.
- Tüm public sayfalar ve footer, Apex'in bağımsız/unofficial olduğunu açıkça
  belirtir. KVKK, Çerez Politikası, Gizlilik, Kullanım Koşulları ve DMCA
  iletişim yüzeyleri roadmap tamamlanmadan production kabul edilmez.

### Next.js ve veri mimarisi

- Next.js API'si veya davranışı değiştirilmeden önce ilgili güncel kılavuz
  `node_modules/next/dist/docs/` altından okunur; bu sürümün eski Next.js
  varsayımlarıyla uygulanmasına izin verilmez.
- Route Handler, Server Component ve Client Component sınırları korunur.
  Server-only sırlar (`SUPABASE_SERVICE_ROLE_KEY`, cron secret, Sentry token)
  client bundle'a taşınmaz.
- Statik veya nadir değişen içerik ISR/SSG ile; canlı yarış/telemetri verisi
  server cache, kontrollü revalidation ve client polling stratejisiyle
  sunulur. Her fetch için tazelik, timeout, retry ve fallback davranışı
  belirlenir; sessizce sahte başarı üretilmez.
- F1DB tarihsel veri kaynağı, güncel sezon cron/snapshot akışı ve
  `lib/f1Calendar.ts` temporal tek kaynak kuralları korunur. Sezon/pilot/takım
  hardcode'u eklenmez.
- Dinamik sayfalarda `generateMetadata`, canonical URL ve doğru `og:image`
  kullanılır. Grand Prix `SportsEvent`, pilot `Person`, takım uygun
  `Organization`/`SportsTeam` JSON-LD ile işaretlenir; veride olmayan alanlar
  uydurulmaz.
- `sitemap.ts` ve `robots.ts` public/crawl edilebilir yüzeyin tek kaynağıdır.
  Cron ve API yüzeyleri indexlenmez; preview deploy'ları noindex kalır.

### UI, erişilebilirlik ve performans

- Mevcut Apex görsel dili (koyu editorial yüzey, bento grid, typography
  kontrastı) korunur; yeni bir design system ancak mevcut token'larla uyumluysa
  eklenir. Generic dashboard, saf siyah, düşük kontrast ve dekoratif
  karmaşıklık eklenmez.
- Mobil önce tasarla: küçük ekran kırılmaları, taşan tablolar, safe-area,
  dokunma hedefleri, klavye/focus görünürlüğü ve `prefers-reduced-motion`
  her sayfada test edilir. WCAG AA kontrast hedeflenir.
- `next/image`, doğru boyutlandırma, lazy loading ve sabit aspect-ratio
  kullanılır. Büyük görsel veya client bundle artışı ölçülmeden eklenmez.
- Loading, error, not-found, empty ve stale-data durumları kullanıcıya açık
  ve erişilebilir olmalıdır.

## Güvenlik ve kalite kapıları

- Sırlar yalnızca `.env.local`/deployment secret store'da tutulur; commit,
  log veya dokümana gerçek secret yazılmaz.
- Kullanıcı/API girdileri mevcut validation ve rate-limit yardımcılarıyla
  doğrulanır. Cron endpoint'leri `CRON_SECRET_KEY` ile korunur.
- DB değişiklikleri yalnızca `supabase/migrations/` üzerinden yapılır.
  RLS, least privilege, backup/restore ve veri silme akışı birlikte incelenir.
- Bağımlılık veya production config değişikliği gerekçelendirilir; ilgisiz
  refactor yapılmaz. Kullanıcı istemedikçe commit, push veya deploy yapılmaz.
- Her kod değişikliğinden sonra en küçük ilgili test, `npm run lint` ve
  gerektiğinde `npm run build` çalıştırılır. Production öncesi `ROADMAP.md`
  kabul kriterleri ve smoke test listesi tamamlanır.
- Kod dokunulmadan önce plan ve mevcut pattern okunur. Kod değişince
  `graphify-out/` mevcutsa AST güncellemesi yapılır; graph çıktısı kaynak
  kodun yerine geçmez.

## Çalışma protokolü

1. `ROADMAP.md` içindeki faz, bağımlılık ve kabul kriterini belirle.
2. İlgili `app/`, `components/`, `lib/`, `supabase/` ve test pattern'lerini
   incele; mevcut davranışı koru.
3. Küçük, geri alınabilir bir değişiklik yap ve testlerle doğrula.
4. Hukuki varlık veya veri kaynağı eklediysen lisans/kaynak kaydını aynı
   değişiklikte güncelle.
5. Dokümantasyon ile uygulama arasında drift bırakma; eksikse işi tamamlanmış
   sayma.

## Next.js sürüm notu

<!-- BEGIN:nextjs-agent-rules -->
Bu sürüm, alışılmış Next.js varsayımlarından farklı kırıcı değişiklikler
barındırabilir. Kod yazmadan önce `node_modules/next/dist/docs/` altındaki
ilgili kılavuzu okuyun ve deprecation notlarını uygulayın.
<!-- END:nextjs-agent-rules -->
