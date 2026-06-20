# Bölüm 1 — Güvenlik Değerlendirmesi

> Apex F1 arşiv platformu · Next.js App Router (Turbopack) · Supabase PostgreSQL · Vercel (Hobby)
> Kapsam: `next.config.ts`, `app/api/**`, `lib/supabase.ts`, `vercel.json`, env & secret yönetimi.
> Tarih: 2026-06-11

## Özet

Platform, statik/okuma ağırlıklı bir arşiv uygulaması olduğundan saldırı yüzeyi dardır ve genel güvenlik duruşu **iyi seviyededir**. Güçlü temeller mevcut: service-role anahtarı kesinlikle sunucu tarafında izole edilmiş (`NEXT_PUBLIC_*` ile sızdırılmamış) ve eksikse sessizce anon'a düşmek yerine hata fırlatıyor; cron uç noktaları Bearer token ile koruma altında ve token yoksa **fail-closed** (401) davranıyor; `f1-season` proxy'si katı bir whitelist regex'i ile SSRF'e karşı sertleştirilmiş; tüm gizli anahtarlar `.gitignore` ile depo dışında. Bununla birlikte savunma derinliği açısından iyileştirme alanları var: CSP `script-src` içinde hem `'unsafe-inline'` hem `'unsafe-eval'` bulunması XSS koruma değerini düşürüyor; `Strict-Transport-Security` (HSTS) ve `Permissions-Policy` başlıkları eksik; `/api/news` üzerindeki rate limit hem serverless ortamında bellek-içi olduğu için etkisiz hem de `x-forwarded-for` başlığı taklit edilerek atlanabiliyor. **KRİTİK bulgu yoktur.** Önceliklendirilmiş düzeltmeler aşağıdadır.

## Güçlü Yönler

- **Service-role izolasyonu (`lib/supabase.ts`).** Service key yalnızca `process.env.SUPABASE_SERVICE_ROLE_KEY` (NEXT_PUBLIC değil) üzerinden okunuyor; `getSupabaseAdmin()` yalnızca cron route'larında ve `scripts/` içinde kullanılıyor, hiçbir client component tarafından import edilmiyor. Key yoksa **throw** ediliyor — sessiz anon fallback yok (`lib/supabase.ts:48-53`).
- **Cron fail-closed auth.** `CRON_SECRET_KEY` tanımlı değilse `isAuthorized()` doğrudan `false` döner (`sync-f1/route.ts:51-52`, `sync-news/route.ts:25-26`, `sync-radio/route.ts:37-38`) — yanlış yapılandırma açık uç nokta yaratmaz.
- **SSRF sertleştirmesi (`app/api/f1-season/route.ts`).** Tek kullanıcı girdisi olan `path` parametresi, sabit (hardcoded) upstream host'a eklenmeden önce katı bir regex whitelist'ten geçiriliyor (`PATH_WHITELIST`, satır 32-33). Host/şema kullanıcı kontrolünde değil.
- **Girdi doğrulama.** `season/[year]/route.ts:14` yıl aralığını (`F1_SEASON_MIN..CURRENT_SEASON`) ve sonluluğu doğruluyor; `news/route.ts:41-43` beklenmeyen query parametrelerini reddediyor.
- **Secret hijyeni.** `.gitignore` tüm `.env*` dosyalarını yok sayıyor (`!.env.example` hariç); depoda commit edilmiş `.env` dosyası yok. `NEXT_PUBLIC_*` değişkenleri yalnızca herkese açık olması güvenli değerler içeriyor (Supabase URL + anon key, Sentry DSN, site URL).
- **Temel güvenlik başlıkları.** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `Referrer-Policy` ve `Cross-Origin-Opener-Policy` ayarlanmış (`next.config.ts:23-29`).
- **Hata mesajı temizliği (kısmen).** `news` ve `season` route'ları upstream hatalarını jenerik mesajlarla maskeliyor (ham hata sızdırmıyor).

## Bulgular

### YÜKSEK

**B-1 — `/api/news` rate limit'i atlanabilir ve serverless'te etkisiz**
- **Açıklama:** İki sorun bir arada. (1) `getClientIP()` (`app/api/news/route.ts:16-20`) istemci kontrolündeki `x-forwarded-for` başlığının ilk değerine güveniyor; saldırgan bu başlığı her istekte rastgele değiştirerek limiti tamamen atlayabilir. (2) Rate limit durumu `rateLimitStore` adlı süreç-içi bir `Map`'te tutuluyor (satır 14); Vercel serverless'te her invocation ayrı/efemer instance'ta çalışabildiğinden sayaç paylaşılmıyor ve limit pratikte uygulanmıyor.
- **Referans:** `app/api/news/route.ts:14`, `16-20`, `22-38`, `45`.
- **Önerilen çözüm:** Gerçek istemci kimliği için Vercel'in güvenilir `x-real-ip` / `request.ip` değerini tercih edin (proxy zincirinin en sağındaki/altyapı tarafından eklenen IP). Dağıtık ve kalıcı bir sayaç için Vercel KV / Upstash Redis (ör. `@upstash/ratelimit`) kullanın. Bu uç nokta yalnızca cache'li herkese açık haberler döndürdüğünden risk DoS/maliyet ile sınırlı; yine de XFF güvenini kaldırmak önceliklidir.

### ORTA

**B-2 — CSP `script-src` içinde `'unsafe-inline'` ve `'unsafe-eval'`**
- **Açıklama:** `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live` (`next.config.ts:11`). `'unsafe-inline'` + `'unsafe-eval'` birlikte, olası bir XSS'te CSP'nin sağlayacağı korumayı büyük ölçüde sıfırlar. Koddaki yorum bunun Next.js client runtime ve inline JSON-LD scriptleri için gerekli olduğunu ve nonce tabanlı politikanın gelecekteki sertleştirme adımı olduğunu belirtiyor — bu doğru bir tespit, ancak bulgu geçerliliğini korur.
- **Referans:** `next.config.ts:9-21`.
- **Önerilen çözüm:** Nonce tabanlı CSP'ye geçin (Next.js middleware ile per-request nonce üretip `script-src 'nonce-...' 'strict-dynamic'` kullanın). JSON-LD scriptlerine nonce ekleyin. En azından `'unsafe-eval'`'i kaldırmayı hedefleyin; modern Next runtime çoğu durumda eval gerektirmez.

**B-3 — HSTS (`Strict-Transport-Security`) başlığı yok**
- **Açıklama:** `SECURITY_HEADERS` listesinde HSTS yok (`next.config.ts:23-29`). Vercel HTTPS sağlasa da, açık HSTS olmadan tarayıcılar protokol düşürme/SSL-stripping senaryolarına karşı zorlanmaz ve preload listesine giriş yapılamaz.
- **Referans:** `next.config.ts:23-29`.
- **Önerilen çözüm:** `{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }` ekleyin.

**B-4 — `Permissions-Policy` başlığı yok**
- **Açıklama:** Kamera, mikrofon, geolocation gibi güçlü tarayıcı özelliklerini kısıtlayan `Permissions-Policy` tanımlı değil. Savunma derinliği eksikliği.
- **Referans:** `next.config.ts:23-29`.
- **Önerilen çözüm:** `{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' }` ekleyin.

**B-5 — Cron secret adı Vercel'in otomatik enjeksiyon adıyla uyuşmuyor**
- **Açıklama:** Route'lar `CRON_SECRET_KEY` bekliyor (`sync-f1/route.ts:51`, `sync-news/route.ts:25`, `sync-radio/route.ts:37`). Vercel Cron, `Authorization: Bearer <...>` başlığını yalnızca env değişkeni **tam olarak `CRON_SECRET`** adıyla tanımlıysa otomatik ekler. İsim farkı nedeniyle güvenlik açısından risk yok (fail-closed → 401), fakat operasyonel olarak otomatik cron'ların 401 alma riski mevcuttur ve geçmiş loglar (`docs/PROJECT_LESSONS_AND_ROADMAP.md:60`) bu sorunu zaten kaydetmiş.
- **Referans:** `app/api/cron/*/route.ts`, `vercel.json:4-8`.
- **Önerilen çözüm:** Vercel env'ine `CRON_SECRET` adını da ekleyin veya route kontrolünü `CRON_SECRET` ile hizalayın; tutarlılık için tek bir isim standardı seçin.

**B-6 — Cron token karşılaştırması sabit-zamanlı değil**
- **Açıklama:** Token doğrulaması `header === \`Bearer ${secret}\`` ile yapılıyor (`sync-f1/route.ts:54`, `sync-news/route.ts:27`, `sync-radio/route.ts:39`). String `===` karşılaştırması erken-çıkış yapar ve teorik olarak timing yan-kanalına açıktır. Ağ gürültüsü nedeniyle gerçek istismar olasılığı düşüktür.
- **Referans:** `app/api/cron/sync-f1/route.ts:50-55` (ve diğer iki cron).
- **Önerilen çözüm:** `crypto.timingSafeEqual()` ile sabit-zamanlı karşılaştırma kullanın.

**B-7 — Cron hata yanıtlarında ham hata mesajı sızıntısı**
- **Açıklama:** `sync-f1` ve diğer cron route'ları `catch` bloğunda `error: msg` olarak ham `err.message` döndürüyor (`sync-f1/route.ts:153-163`, `sync-news/route.ts:84-87`, `sync-radio/route.ts:142-145`). İç sistem/bağımlılık detaylarını açığa çıkarabilir. Uç noktalar auth arkasında olduğundan etki sınırlı.
- **Referans:** yukarıdaki satırlar.
- **Önerilen çözüm:** İstemciye jenerik mesaj döndürün; ayrıntıyı Sentry/log'a yazın.

### DÜŞÜK

**B-8 — CSP `img-src https:` aşırı geniş**
- **Açıklama:** `img-src 'self' data: blob: https:` herhangi bir HTTPS host'tan görsel yüklemeye izin verir (`next.config.ts:13`). `next.config.ts`'teki `images.remotePatterns` zaten dar bir liste tutuyor; CSP de buna hizalanabilir.
- **Önerilen çözüm:** Mümkünse `https:` yerine `remotePatterns` ile aynı host listesini kullanın.

**B-9 — CSP `connect-src` içinde `data:`**
- **Açıklama:** `connect-src 'self' data: ...` (`next.config.ts:16`). `connect-src` için `data:` alışılmadıktır ve genelde gereksizdir.
- **Önerilen çözüm:** Gerçekten gerekli değilse `data:`'yı `connect-src`'den kaldırın.

**B-10 — `season/[year]` ve diğer okuma uçlarında rate limit yok**
- **Açıklama:** `season/[year]` herkese açık ve rate limitsiz; ancak cache'li ve salt-okuma olduğundan ve `f1-season` proxy'si timeout/whitelist ile sınırlı olduğundan risk düşük.
- **Önerilen çözüm:** Maliyet/DoS endişesi varsa platform seviyesinde (Vercel WAF/rate limit) ele alın.

## CSP Analizi

| Direktif | Mevcut Değer | Değerlendirme | Risk |
|---|---|---|---|
| `default-src` | `'self'` | İyi temel | — |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live` | `unsafe-inline`+`unsafe-eval` XSS korumasını zayıflatır (B-2) | ORTA |
| `style-src` | `'self' 'unsafe-inline'` | Inline stil yaygın; nonce ile sertleştirilebilir | DÜŞÜK |
| `img-src` | `'self' data: blob: https:` | `https:` çok geniş (B-8) | DÜŞÜK |
| `font-src` | `'self' data:` | Uygun | — |
| `frame-src` | `'self' https://vercel.live` | Uygun (Vercel toolbar) | — |
| `connect-src` | `'self' data: https://*.supabase.co https://*.sentry.io ... api.jolpi.ca api.openf1.org api.open-meteo.com` | Gerekli origin'ler kapsanmış; `data:` gereksiz (B-9) | DÜŞÜK |
| `frame-ancestors` | `'self'` | İyi (clickjacking) | — |
| `base-uri` | `'self'` | İyi | — |
| `form-action` | `'self'` | İyi | — |
| `object-src` | `'none'` | İyi | — |
| `Strict-Transport-Security` | **YOK** | Eksik (B-3) | ORTA |
| `Permissions-Policy` | **YOK** | Eksik (B-4) | ORTA |
| `upgrade-insecure-requests` | YOK | Vercel HTTPS olduğundan düşük öncelik | DÜŞÜK |

## Cron & Auth

- **Uç noktalar:** `/api/cron/sync-news`, `/api/cron/sync-f1?scope=season`, `/api/cron/sync-radio` (`vercel.json:4-8`). Hepsi `GET` + Bearer token.
- **Auth modeli:** `isAuthorized()` → `CRON_SECRET_KEY` yoksa `false` (fail-closed, **doğru**); aksi halde `Authorization` başlığı `Bearer ${secret}` ile birebir eşleşmeli.
- **Bypass riski:** Token doğru kurulduğunda bypass yolu görülmedi. Üç gözlem: (1) Vercel'in otomatik enjeksiyon adı `CRON_SECRET` ile uyumsuzluk → operasyonel 401 riski (B-5); (2) sabit-zamanlı olmayan karşılaştırma (B-6); (3) hata yanıtı sızıntısı (B-7).
- **Olumlu:** Cron, `getSupabaseAdmin()` üzerinden yazıyor; service guard mevcut. `scope` parametresi dar tipli (`'live' | 'season'`) ve yalnızca akışı dallandırıyor, enjeksiyona açık değil.

## Supabase & Secrets

- **Client/Server ayrımı net (`lib/supabase.ts`):** `getSupabaseClient()` anon key (RLS'e tabi, salt-okuma), `getSupabaseAdmin()` service-role (yalnızca sunucu). Anon ve admin client'lar `persistSession: false` ile yapılandırılmış.
- **Service key sızıntısı:** Yok. Key yalnızca `SUPABASE_SERVICE_ROLE_KEY` (NEXT_PUBLIC değil) üzerinden okunuyor ve sadece cron + `scripts/` içinde kullanılıyor (`getSupabaseAdmin` referansları: `app/api/cron/sync-news`, `app/api/cron/sync-radio`, `lib/f1Ingest.ts`, `scripts/*`). Hiçbir client bundle'a girmiyor.
- **RLS bağımlılığı:** Okuma güvenliği Supabase RLS politikalarına dayanıyor (anon = public read). RLS politikalarının veritabanı tarafında doğru kurulduğu varsayılmıştır; bu denetimin kapsamı dışındadır ancak **veri katmanı denetimiyle (ayrı bölüm) teyit edilmelidir.**
- **Env hijyeni:** `.gitignore` `.env*` (hariç `.env.example`) yok sayıyor; depoda secret yok. `NEXT_PUBLIC_*` yalnızca güvenli-açık değerler (Supabase URL/anon, Sentry DSN, site URL) içeriyor — sızıntı yok.
- **Sentry:** `tunnelRoute: "/monitoring"` ad-blocker bypass için; `SENTRY_AUTH_TOKEN` yalnızca build zamanı (`next.config.ts:66`), client DSN ise `NEXT_PUBLIC_SENTRY_DSN` (açık olması normal).

## Rate Limiting & CORS

- **Rate limiting:**
  - `/api/news` — 60s pencerede 30 istek/IP, ama (a) `x-forwarded-for` taklidiyle atlanabilir ve (b) bellek-içi `Map` serverless'te etkisiz (B-1, YÜKSEK).
  - Cron uç noktaları — rate limit yok ama Bearer auth ile korunduğundan gerek yok.
  - `season/[year]`, `f1-season` — rate limit yok; salt-okuma + cache + timeout ile risk düşük (B-10).
- **CORS:** Hiçbir route `Access-Control-Allow-Origin` veya diğer CORS başlıklarını set etmiyor. Bu, varsayılan **same-origin** davranışı sağlar (cross-origin tarayıcı okumaları engellenir) — kısıtlayıcı ve **doğru** duruş. Açık bir CORS açığı yok.

## Öncelikli Aksiyonlar

1. **(YÜKSEK / B-1)** `/api/news` rate limit'ini düzeltin: `x-forwarded-for` güvenini kaldırın (güvenilir IP kullanın) ve sayacı Vercel KV / Upstash Redis gibi dağıtık bir store'a taşıyın.
2. **(ORTA / B-3, B-4)** `next.config.ts` `SECURITY_HEADERS`'a `Strict-Transport-Security` ve `Permissions-Policy` ekleyin (hızlı kazanım).
3. **(ORTA / B-5)** Cron secret adını netleştirin: Vercel'de `CRON_SECRET` tanımlayın veya route kontrolünü hizalayın; otomatik cron'ların 401 almasını önleyin.
4. **(ORTA / B-2)** CSP'yi nonce tabanlı politikaya taşıyarak `'unsafe-inline'`/`'unsafe-eval'`'i kaldırma yol haritasını başlatın; en azından `'unsafe-eval'`'i hedefleyin.
5. **(ORTA / B-6, B-7)** Cron token karşılaştırmasını `crypto.timingSafeEqual()` ile sabit-zamanlı yapın ve cron hata yanıtlarındaki ham mesajları jenerikleştirip detayı Sentry'e yazın.
6. **(DÜŞÜK / B-8, B-9)** CSP'de `img-src https:`'i `remotePatterns` host listesiyle daraltın ve `connect-src data:`'yı kaldırın.
7. **(Takip)** Supabase RLS politikalarının public-read/yazma kısıtlamalarını veri katmanı denetiminde doğrulayın (bu bölümün varsayımı).
