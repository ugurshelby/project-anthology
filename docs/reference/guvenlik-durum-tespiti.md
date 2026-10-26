# Apex (Project Anthology) — Siber Güvenlik ve Mimari Durum Tespiti

> **Döküman Kimliği & Amacı:** Bu döküman, Apex (Project Anthology) projesinin mevcut kod tabanı, veritabanı katmanı, API rotaları ve altyapı konfigürasyonu üzerinden gerçekleştirilen teknik siber güvenlik incelemesinin bulgularını içerir.  
> **Tarih:** 2026-10-16  
> **Rol:** Proje Siber Güvenlik Uzmanı  
> **Kapsam:** DoS/Kaynak Tüketimi, LLM Maliyet Güvenliği (Financial DoS), Dağıtık Hız Sınırlama (Rate Limiting), Veri Şifreleme & Hashing, En Az Yetki İlkesi (Least Privilege), WAF, Girdi Doğrulama (Input Validation) ve Otomasyonlu Güvenlik Denetimleri.  
> **Kural:** Yorum katılmaksızın, doğrudan kodda ve sistemde ölçülen/görülen somut gerçeklikler referans verilerek kaydedilmiştir.

---

## 1. Supabase Yetmez: Uygulama Katmanı Neden Çökebilir?

### 1.1 Denial of Service (DoS) ve Sunucu Kaynak Tüketimi

Veritabanında kullanıcı verisi veya doğrudan bir açık bulunmasa bile uygulama katmanı (Next.js serverless lambdaları ve sunucu kaynakları) dış isteklerle tüketilebilir:

#### A. Canlı Haber Toplama (RSS & Görsel Taraması)
* **İlgili Dosyalar:** [`app/api/news/route.ts`](../../app/api/news/route.ts), [`lib/news/aggregate.ts`](../../lib/news/aggregate.ts)
* **Mevcut Durum:**
  * `GET /api/news` rotası çağrıldığında [`lib/news/aggregate.ts:37`](../../app/api/news/route.ts#L37) üzerinden `aggregate({ maxItems: 60 })` fonksiyonu tetiklenir.
  * Bu işlem [`lib/news/aggregate.ts:44-70`](../../lib/news/aggregate.ts#L44-L70) satırlarında tanımlı 5 bağımsız harici RSS kaynağına (`The Race`, `Autosport`, `Motorsport.com`, `BBC Sport F1`, `RaceFans`) eşzamanlı HTTP istekleri atar ve XML dokümanlarını JSDOM/XMLDOM polyfill ile ayrıştırır.
  * Ardından [`lib/news/aggregate.ts:400-415`](../../lib/news/aggregate.ts#L400-L415) (`verifyImagesReachable`) fonksiyonu ile çekilen tüm haberlerin görsellerine eşzamanlı HTTP HEAD/GET istekleri gönderilerek erişilebilirlik testi yapılır (`IMAGE_VERIFY_TOTAL_BUDGET_MS = 5000`, concurrency: 6).
* **Mevcut Koruma:**
  * Rota yanıtı `Cache-Control: s-maxage=300, stale-while-revalidate=600` başlığıyla Vercel Edge CDN üzerinde 5 dakika önbelleğe alınır ([`app/api/news/route.ts:40`](../../app/api/news/route.ts#L40)).
  * Önbellek delme (cache-busting) girişimlerine karşı URL sorgu parametreleri tamamen reddedilir: `if ([...req.nextUrl.searchParams.keys()].length > 0) return 400` ([`app/api/news/route.ts:17-19`](../../app/api/news/route.ts#L17-L19)).
* **Kalan Risk:**
  * CDN önbellek ıskalamalarında (cache-miss) veya önbellek süresi dolduğunda gelen her istek, sunucunun 5 harici siteye RSS isteği ve onlarca görsele HTTP pingi atmasına neden olarak sunucu bant genişliğini ve CPU süresini tüketir.

#### B. Canlı Telemetri ve Kota Tükenmesi (OpenF1 Upstream)
* **İlgili Dosyalar:** [`app/api/live-timing/route.ts`](../../app/api/live-timing/route.ts), [`lib/f1/sources/openf1.ts`](../../lib/f1/sources/openf1.ts), [`lib/f1/sources/openf1Errors.ts`](../../lib/f1/sources/openf1Errors.ts)
* **Mevcut Durum:**
  * Harici sağlayıcı OpenF1'in genel kotası ziyaretçi başına değil, tüm proje için toplamda **saniyede 3 istek / dakikada 30 istek** ile sınırlıdır ([`app/api/live-timing/route.ts:24-25`](../../app/api/live-timing/route.ts#L24-L25)).
  * Koruma amacıyla 4 katmanlı savunma kurulmuştur:
    1. **Edge Önbellekleme:** `Cache-Control: public, s-maxage=5, stale-while-revalidate=15` ([`app/api/live-timing/route.ts:54-55`](../../app/api/live-timing/route.ts#L54-L55)).
    2. **In-Flight Damgalama Koruması (Stampede Guard):** Aynı serverless konteynerine eşzamanlı düşen istekler tek bir `_inflight` Promise üzerinden birleştirilir ([`app/api/live-timing/route.ts:208-220`](../../app/api/live-timing/route.ts#L208-L220)).
    3. **Sert Zaman Aşımı:** OpenF1'in çökmesi durumunda lambdanın kilitlenmemesi için `HARD_TIMEOUT_MS = 8000` konulmuş ve son bilinen veriye dönülmesi (`serve-stale-on-error`) sağlanmıştır ([`app/api/live-timing/route.ts:66, 243-252`](../../app/api/live-timing/route.ts#L66)).
    4. **Canlı Seans Kilit Koruması (401 Yönetimi):** OpenF1 canlı yarış anında ücretsiz istemcilere 401 vermektedir. Bu durum hataya düşürmez; `_restrictedUntil` değişkeniyle 60 saniye boyunca hafızada tutularak upstream'e istek atılmadan doğrudan `{ live: true, restricted: true }` döndürülür ([`app/api/live-timing/route.ts:237, 256-259`](../../app/api/live-timing/route.ts#L237)).

#### C. Jolpica Proxy ve SSRF İzolasyonu
* **İlgili Dosyalar:** [`app/api/f1-season/route.ts`](../../app/api/f1-season/route.ts)
* **Mevcut Durum:**
  * Jolpica API'sine vekil (proxy) istek atan bu rotada SSRF (Server-Side Request Forgery) engellenmiştir: İstemci keyfi URL veremez, yalnızca `PATH_WHITELIST` regex kuralına (`/^\d{4}(?:\/(?:driverStandings|constructorStandings)|\/\d{1,2}\/(?:results|qualifying|sprint|pitstops))?(?:\.json)?$/`) uyan yollar kabul edilir ([`app/api/f1-season/route.ts:44-45`](../../app/api/f1-season/route.ts#L44-L45)).
  * Jolpica'ya gitmeden önce Supabase `f1_snapshots` tablosunda arama yapılır; veri varsa upstream çağrısı hiç yapılmaz ([`app/api/f1-season/route.ts:117-136`](../../app/api/f1-season/route.ts#L117-L136)).

#### D. Arka Plan Cron Rotaları
* **İlgili Dosyalar:** [`app/api/cron/sync-news/route.ts`](../../app/api/cron/sync-news/route.ts), [`app/api/cron/sync-f1/route.ts`](../../app/api/cron/sync-f1/route.ts), [`app/api/cron/sync-media/route.ts`](../../app/api/cron/sync-media/route.ts), [`app/api/cron/sync-radio/route.ts`](../../app/api/cron/sync-radio/route.ts), [`app/api/cron/notify-sessions/route.ts`](../../app/api/cron/notify-sessions/route.ts)
* **Mevcut Durum:**
  * Tüm cron rotaları `maxDuration = 300` (veya `notify-sessions` için `60`) sn çalışma sınırına sahiptir.
  * Beş cron rotasının tamamında ilk satırda `if (!(await isCronAuthorized(req))) return 401;` kontrolü bulunur. Yetkisiz botların bu rotaları tetiklemesi mümkün değildir.
  * Tüm cron rotalarında `isCronTriggerAllowed(routeName, minIntervalMs)` kontrolü ile dakikada birden fazla tetikleme atomik olarak engellenmektedir.

---

### 1.2 Denial of Wallet (Financial DoS) ve LLM Entegrasyonu

* **İlgili Dosyalar:** [`lib/news/rewrite.ts`](../../lib/news/rewrite.ts), [`lib/news/stories.ts`](../../lib/news/stories.ts), [`app/api/cron/sync-news/route.ts`](../../app/api/cron/sync-news/route.ts)
* **Mevcut Durum:**
  * **Halka Açık LLM Rotası Yoktur:** Projede ziyaretçilerin (veya botların) doğrudan veya dolaylı olarak tetikleyebileceği **hiçbir halka açık LLM endpoint'i bulunmamaktadır**.
  * LLM entegrasyonu yalnızca [`lib/news/rewrite.ts`](../../lib/news/rewrite.ts) dosyasında tanımlıdır ve bu dosya yalnızca `sync-news` cron işlemi tarafından çağrılır ([`lib/news/stories.ts:184`](../../lib/news/stories.ts#L184)).
  * **Kullanılan Modeller ve Sağlayıcılar:**
    * Groq: `openai/gpt-oss-120b`, `openai/gpt-oss-20b` ([`lib/news/rewrite.ts:88-91`](../../lib/news/rewrite.ts#L88-L91)).
    * Google Gemini: `gemini-3.5-flash-lite`, `gemini-3.8-flash` ([`lib/news/rewrite.ts:50-53`](../../lib/news/rewrite.ts#L50-L53)).
  * **Maliyet Koruma Mantığı:**
    * Kod seviyesinde yalnızca ücretsiz katmanlar (free-tier) hedeflenmiştir.
    * Sağlayıcı 429 (oran sınırı aşımı) döndürdüğünde `QuotaError` fırlatılır ([`lib/news/rewrite.ts:48, 78, 119`](../../lib/news/rewrite.ts#L78)) ve o sağlayıcı çalışma süresince devre dışı bırakılarak bir sonraki modele geçilir.
    * Sağlayıcıların tamamı tükenirse veya anahtarlar yapılandırılmamışsa işlem sessizce `null` döner; haberler kaynak ajansın özgün başlık ve özetiyle saklanır ([`lib/news/stories.ts:149`](../../lib/news/stories.ts#L149)). Faturalı bir üst katmana geçiş yapılmaz.
* **Kalan Finansal Risk:**
  * Botların halka açık arayüz üzerinden LLM fatura borcu yaratması teknik olarak imkansızdır.
  * Ancak `CRON_SECRET` veya Upstash imza anahtarları çalınırsa bir saldırgan `sync-news` endpoint'ini dakikada bir tetikleyebilir. Groq ve Gemini hesaplarında kredi kartı tanımlı ve otomatik faturalandırma (pay-as-you-go) açık ise kota aşımı maliyet üretebilir.

---

### 1.3 Rate Limiting (Hız Sınırlama) Durumu ve Tespit Edilen Açıklar

* **İlgili Dosyalar:** [`lib/rateLimit.ts`](../../lib/rateLimit.ts), [`app/api/**/route.ts`](../../app/api)
* **Mevcut Altyapı:**
  * `@upstash/ratelimit` ve `@upstash/redis` kullanılarak kayan pencere (sliding window) algoritması kurulmuştur ([`lib/rateLimit.ts:60-70`](../../lib/rateLimit.ts#L60-L70)).
  * `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` ortam değişkenleri tanımlıysa hız sınırı tüm serverless instance'lar arasında dağıtık olarak uygulanır.
  * Bu değişkenler eksikse veya Redis'e erişilemezse in-memory `Map` yapısına (`checkMemory`) düşülür ([`lib/rateLimit.ts:74-97, 117-120`](../../lib/rateLimit.ts#L74-L97)).
* **İstemci IP Tespiti:**
  * [`lib/rateLimit.ts:31-40`](../../lib/rateLimit.ts#L31-L40) (`getClientIP`): Vercel'in bağlantı katmanında eklediği sahtelenemez `x-real-ip` başlığını okur. Bulamazsa `x-forwarded-for` başlığının en sağındaki IP'yi alır. Hiçbir başlık yoksa `'fallback:unknown'` döner.
* **Rota Kullanımı (2026-10-20, master-plan 14.1 ile kapatıldı):**
  1. **Tek Fonksiyon:** 10 genel API rotasının tamamı `applyRateLimit(req.headers, { prefix, max, windowMs })` çağırır (`grep -rln "applyRateLimit" app/api` → 10). IP tespit edilemediğinde (`fallback:unknown`) istek ortak bir havuza alınır ve normal sınırın 1/5'i (`Math.floor(opts.max / 5)`) uygulanır; muafiyet yalnızca `NODE_ENV === 'test'` iken vardır ([`lib/rateLimit.ts`](../../lib/rateLimit.ts)). Eski `clientIP !== 'unknown'` korumaları kaldırıldı; `prefix`/`max`/`windowMs` değerleri değişmedi.
  2. **Kapatılan bypass (`app/api/push/register/route.ts`):** Rota eskiden `clientIP !== 'fallback:unknown'` koşuluyla başlıksız istekleri hız sınırından tamamen muaf tutuyordu. Artık başlıksız istekler ortak havuzda `10/5 = 2` istek/dk ile sınırlanır; [`tests/rate-limit-routes.test.ts`](../../tests/rate-limit-routes.test.ts) üçüncü istekte 429 döndüğünü, `x-real-ip` taşıyan isteğin tam kotayı (10) aldığını doğrular.
  3. **Serverless Çoklu Konteyner Riski:**
     * Upstash ortam değişkenleri Vercel prodüksiyon ortamında eksik olduğunda hız sınırlama tek bir lamba örneğinin belleğiyle sınırlı kalır. Eşzamanlı açılan yeni lambdalar sıfır sayaçla başlar.
     * Ölçüm (2026-10-20, Vercel `filter_project_envs`, yalnızca adlar): `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` Production ve Preview'da tanımlı; dağıtık limiter canlıda devrede.

---

## 2. Hassas Veriler Olsaydı Nasıl Korunurdu?

### 2.1 Encryption at Rest ve in Transit (Şifreleme Standartları)

* **Veri Profili:** Sistemde kullanıcı şifresi, kredi kartı, ödeme bilgisi veya PII (Kişisel Tanımlanabilir Bilgi) tutulmamaktadır ([`types/database.ts`](../../types/database.ts)). Tutulan tek cihaz verisi anonim Expo Push Token ve bildirim tercihleridir ([`types/database.ts:255-267`](../../types/database.ts#L255-L267)).
* **In Transit (Ağ Üzerinde İletim):**
  * Tüm ağ trafiği Vercel ve Supabase altyapısında TLS 1.3 / HTTPS zorunluluğundadır.
  * HSTS (HTTP Strict Transport Security) başlığı [`next.config.ts:16-19`](../../next.config.ts#L16-L19) üzerinde maksimum katılıkta yapılandırılmıştır:
    `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (2 yıl süre, alt alan adları dahil, tarayıcı preload listesine uygun).
  * CSP başlığında [`lib/security/csp.ts:21`](../../lib/security/csp.ts#L21) `upgrade-insecure-requests` direktifi aktiftir.
* **At Rest (Veritabanında Depolama):**
  * Supabase altyapısı AWS KMS üzerinden disk seviyesinde AES-256 şifrelemeye sahiptir.
  * Kod tabanında sütun bazlı uygulama seviyesi şifreleme (`pgcrypto` vb.) bulunmamaktadır; çünkü hassas veri barındırılmamaktadır.
  * Ortam değişkenleri (`.env.local`) git geçmişinde yoktur; `.gitignore` tarafından hariç tutulmaktadır.

### 2.2 Hashing (Parola Saklama ve Karşılaştırma)

* **Mevcut Durum:**
  * Sistemde kullanıcı hesabı veya parola yönetim sistemi bulunmadığından Bcrypt, Argon2 veya PBKDF2 kütüphaneleri `package.json` içerisinde yer almamaktadır.
  * Supabase Auth istemcisi oturum yönetimini kapatacak şekilde yapılandırılmıştır: `{ auth: { persistSession: false, autoRefreshToken: false } }` ([`lib/supabase.ts:30, 55`](../../lib/supabase.ts#L30)).
* **Zamanlama Saldırılarına (Timing Attack) Karşı Sabit Zamanlı Doğrulama:**
  * Parola olmasa da sistemdeki en kritik sırlar olan `CRON_SECRET` ve `CRON_SECRET_KEY` doğrulanırken zamanlama analiziyle sırrın çözülmesini engellemek için Node.js kripto kütüphanesinin `timingSafeEqual` fonksiyonu kullanılmıştır ([`lib/cronAuth.ts:21-26`](../../lib/cronAuth.ts#L21-L26)):
    ```typescript
    function safeEqual(a: string, b: string): boolean {
      const bufA = Buffer.from(a, 'utf8');
      const bufB = Buffer.from(b, 'utf8');
      if (bufA.length !== bufB.length) return false;
      return timingSafeEqual(bufA, bufB);
    }
    ```
  * QStash HS256 JWT imzaları doğrulanırken de üretilen HMAC ile gelen imza `timingSafeEqual(expected, given)` ile karşılaştırılmaktadır ([`lib/cronAuth.ts:80`](../../lib/cronAuth.ts#L80)).

### 2.3 Principle of Least Privilege (En Az Yetki İlkesi)

Sistemde yetki izolasyonu hem uygulama kodunda hem de veritabanı rol seviyesinde uygulanmıştır:

#### A. Supabase İstemci Ayrımı
* **İlgili Dosya:** [`lib/supabase.ts`](../../lib/supabase.ts)
* `getSupabaseClient()` ([`lib/supabase.ts:20-33`](../../lib/supabase.ts#L20-L33)): `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanır. İstemci ve RSC okumaları için kullanılır, RLS kısıtlamalarına tabidir.
* `getSupabaseAdmin()` ([`lib/supabase.ts:41-58`](../../lib/supabase.ts#L41-L58)): `SUPABASE_SERVICE_ROLE_KEY` kullanır. Yalnızca sunucu tarafında (cron/seed) çalışır. Anahtar eksikse sessizce anon anahtarına düşmez, açıkça hata fırlatır (`throw new Error(...)`).

#### B. PostgreSQL Tablo İzinleri ve RLS Koruması
* **İlgili Dosyalar:** [`supabase/migrations/20260603000001_initial_schema.sql`](../../supabase/migrations/20260603000001_initial_schema.sql), [`supabase/migrations/20261006000002_push_service_role_grants.sql`](../../supabase/migrations/20261006000002_push_service_role_grants.sql)
* **Tablo Seviyesinde Kısıtlama:**
  * Postgres rol izinlerinde `anon` ve `authenticated` rollerine yalnızca `GRANT SELECT` verilmiştir ([`20260603000001_initial_schema.sql:224-227`](../../supabase/migrations/20260603000001_initial_schema.sql#L224-L227)). `INSERT`, `UPDATE`, `DELETE` yetkisi bu rollere hiç tanımlanmamıştır.
  * Bu sayede RLS kuralları kazaen silinse dahi, genel internet kullanıcısı veritabanına doğrudan kayıt yazamaz/değiştiremez.
* **Hassas Tabloların Tamamen İzolasyonu:**
  * Push bildirimlerinin tutulduğu `push_subscriptions` ve `notified_sessions` tablolarından `anon` ve `authenticated` rollerinin okuma yetkisi dahil tüm yetkileri geri alınmıştır ([`20261006000002_push_service_role_grants.sql:19-20`](../../supabase/migrations/20261006000002_push_service_role_grants.sql#L19-L20)):
    ```sql
    revoke all on public.push_subscriptions from anon, authenticated;
    revoke all on public.notified_sessions from anon, authenticated;
    ```
  * Anonim bir kullanıcı PostgREST veya Supabase istemcisiyle bu tabloları asla sorgulayamaz (PostgreSQL 42501 permission denied döner). Yalnızca `service_role` erişebilir.
* **Arama Yolu Güvenliği (Search Path Hijacking Koruması):**
  * Supabase Security Advisor uyarısı üzerine tetikleyici fonksiyona `alter function public.set_updated_at() set search_path = '';` uygulanarak şema kaçırma saldırıları önlenmiştir ([`20261006000002_push_service_role_grants.sql:22`](../../supabase/migrations/20261006000002_push_service_role_grants.sql#L22)).

---

## 3. "Ne Olursa Olsun" Korunmak İçin Alınacak Pratik Önlemler

### 3.1 Web Application Firewall (WAF) - Cloudflare Durumu

* **Mevcut Durum:**
  * Projenin önünde **Cloudflare WAF bulunmamaktadır**.
  * Alan adı doğrudan Vercel Edge Network'e bağlıdır (`project-anthology-eight.vercel.app` / Vercel DNS).
  * Vercel altyapısı temel katman 3/4 DDoS mitigasyonu sağlamaktadır; ancak gelişmiş kural tabanlı WAF (Vercel Firewall Rules / OWASP Core Rule Set / Managed Challenge) Enterprise/eklenti özelliğidir.
* **Uygulama Katmanında Alınan Sertleştirmeler:**
  * `poweredByHeader: false`: Next.js çerçeve bilgisi yanıtlardan gizlenmiştir ([`next.config.ts:47`](../../next.config.ts#L47)).
  * Kapsamlı HTTP Güvenlik Başlıkları ([`next.config.ts:10-24`](../../next.config.ts#L10-L24)):
    * `X-Frame-Options: SAMEORIGIN` (Clickjacking koruması)
    * `X-Content-Type-Options: nosniff` (MIME sniffing koruması)
    * `Cross-Origin-Opener-Policy: same-origin`
    * `Referrer-Policy: strict-origin-when-cross-origin`
    * `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
  * Görsel Optimizasyon SSRF İzolasyonu: `next/image` bileşeninin harici rastgele URL'leri optimize ederek sunucu tüketmesini önlemek için `remotePatterns` yalnızca Supabase Storage `media` kovasına kısıtlanmıştır ([`next.config.ts:28-36, 67`](../../next.config.ts#L28-L36)).

### 3.2 Strict Rate Limiting ve Throttling Durumu

* **Dağıtık Altyapı:**
  * Upstash Redis REST API tabanlı kayan pencere mekanizması kodlanmıştır ([`lib/rateLimit.ts`](../../lib/rateLimit.ts)).
  * Cron rotalarında `isCronTriggerAllowed` ile atomik dağıtık kilit (`SET cron:lock:<route> 1 NX EX <ttl>`) uygulanmıştır ([`lib/cronAuth.ts:148-161`](../../lib/cronAuth.ts#L148-L161)).
* **Uygulama Açıkları:**
  * ~~`push/register` bypass açığı ve 7 rotada doğrudan `rateLimit` çağrısı~~: 2026-10-20'de kapatıldı (master-plan 14.1); 10 rotanın tamamı `applyRateLimit` kullanır.
  * Canlı ortam değişkenlerinde Upstash'in eksik kalması durumunda sınırların sunucusuz konteyner belleğine düşerek etkisizleşmesi.

### 3.3 Input Validation (Girdi Doğrulama) ve SQL Injection

* **Zod Kütüphanesinin Durumu:**
  * **Zod kütüphanesi projede kurulu DEĞİLDİR ve kod tabanında KULLANILMAMAKTADIR.** ([`package.json`](../../package.json) bağımlılık listesinde `zod` yoktur).
* **Mevcut Doğrulama Mekanizmaları:**
  Projede girdi doğrulama Zod yerine elle yazılmış Regex desenleri ve sınır kontrolleriyle yapılmaktadır:
  1. *Ergast Slug Doğrulaması:* [`lib/api/validation.ts:15-20`](../../lib/api/validation.ts#L15-L20) (`isErgastSlug`): `driverId`, `constructorId`, `circuitId` parametreleri `/^[a-z0-9][a-z0-9_-]{0,63}$/` regexi ve maksimum 64 karakter sınırı ile denetlenir.
  2. *Jolpica Proxy Yolu:* [`app/api/f1-season/route.ts:44-45`](../../app/api/f1-season/route.ts#L44-L45) (`PATH_WHITELIST`): Regex dışındaki tüm karakterler ve yollar 400 ile reddedilir.
  3. *Medya Anahtarları:* [`lib/media/keys.ts:8-11, 40-49`](../../lib/media/keys.ts#L8-L11) (`parseKeyList`): Maksimum 40 anahtar ve `/^[a-z0-9_.:-]{1,80}$/` regexi kontrol edilir. Veritabanındaki CHECK kısıtlaması ile birebir eşleştirilmiştir.
  4. *Push Tercihleri ve Token:* [`app/api/push/register/route.ts:15-21, 47`](../../app/api/push/register/route.ts#L15-L21) (`sanitizePreferences`): Sadece boolean değerler kabul edilir, maksimum 20 anahtarla sınırlandırılır; token için `Expo.isExpoPushToken(token)` şartı aranır.
  5. *Sezon Yılı:* [`app/api/season/[year]/route.ts:35-37`](../../app/api/season/[year]/route.ts#L35-L37): `year >= F1_SEASON_MIN && year <= CURRENT_SEASON` kuralı kontrol edilir.
* **SQL Injection Koruması:**
  * Kod tabanında ham SQL metin birleştirmesi (`string interpolation / raw SQL execution`) bulunmamaktadır.
  * Tüm sorgular Supabase JavaScript SDK'sının sorgu oluşturucusu (`query builder`) üzerinden çalıştırılır (`db.from('...').select().eq()`); PostgREST seviyesinde parametreli sorgularla yürütülür.

### 3.4 Automated Security Audits ve CI/CD Ajanları

* **CI/CD Hattı:**
  * GitHub Actions iş akışı [`/.github/workflows/ci.yml`](../../.github/workflows/ci.yml) Pull Request anında ve (2026-10-26 itibarıyla) `main` ile `wip/**` dallarına push'ta tetiklenir:
    * `npm ci`
    * `npm audit --omit=dev --audit-level=high` (2026-10-26)
    * `npm run lint`
    * `npx tsc --noEmit`
    * `npm test`
    * `npm run build`
  * 2026-10-26 (14.2): `ci.yml` üretim bağımlılıklarını `npm audit --omit=dev --audit-level=high` ile denetler; haftalık [`security-audit.yml`](../../.github/workflows/security-audit.yml) aynı denetimi pazartesi 06:00 UTC'de koşar; Dependabot uyarıları açıldı (otomatik PR kapalı).
  * Dependabot yapılandırması (`.github/dependabot.yml`) bilinçli olarak yoktur (PR açar; politika PR yok).
  * **Snyk veya benzeri bir SAST (Statik Güvenlik Analizi) aracı entegre EDİLMEMİŞTİR.**
* **2026-10-26 sonrası (14.2):** `next` 16.4.2, `vitest` 5.0.5, `sharp` 0.35.5, `npm audit fix`; `npm audit` toplam 0 açık. Aşağıdaki liste 2026-10-16 ölçümüdür (tarihsel).
* **Mevcut Bağımlılık Güvenlik Açığı Taraması (`npm audit` Ölçüm Sonucu - 2026-10-16):**
  * Toplam **23 Güvenlik Açığı** tespit edilmiştir (1 Low, 5 Moderate, 14 High, 3 Critical):
    * **3 Critical:**
      * `next` (16.2.7): App Router, Turbopack, Image Optimization SSRF, DoS ve RCE danışma bildirimleri (GHSA-6gpp-xcg3-4w24, GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x, GHSA-cjq9-62q9-8jv4). Düzeltme: `next@16.4.2+`.
      * `tinypool` (<=2.1.1): Vitest alt bağımlılığında Prototype Pollution / RCE zafiyeti (GHSA-5gmw-xhrv-c9v3).
    * **14 High:**
      * `sharp` (<=0.35.5-rc.1): libvips ve libheif bağımlılıklarında bellek zafiyetleri (CVE-2026-33327, GHSA-f88m-g3jw-g9cj).
      * `undici` (7.0.0 - 7.29.0): CRLF enjeksiyonu, DoS ve sertifika doğrulama bypass zafiyetleri.
      * `postcss` (<=8.5.22): XSS ve keyfi dosya okuma (sourceMappingURL).
      * `nanoid`, `js-yaml`, `source-map-js`: Sonsuz döngü ve CPU tüketimi DoS zafiyetleri.

---

## 4. Özet Bulgular ve Güvenlik Matrisi

| Güvenlik Alanı | Projedeki Mevcut Durum | Güvenlik Seviyesi | Somut Dosya Referansı |
| :--- | :--- | :---: | :--- |
| **Halka Açık LLM Koruması** | Ziyaretçilerin tetikleyebileceği LLM rotası yok; sadece korumalı cron içinde, free-tier modeller. | **GÜÇLÜ** | [`lib/news/rewrite.ts:1-8`](../../lib/news/rewrite.ts#L1-L8) |
| **Cron Rota Kimlik Doğrulaması** | 5 cron rotasının tamamı `isCronAuthorized` (Bearer veya QStash HS256 JWT) ile korunuyor. | **GÜÇLÜ** | [`lib/cronAuth.ts:21-41`](../../lib/cronAuth.ts#L21-L41) |
| **Veritabanı En Az Yetki (Least Privilege)** | `anon` ve `authenticated` rolleri yalnızca `SELECT` yapabilir; push tablolarında `SELECT` dahi yasaklı. | **GÜÇLÜ** | [`supabase/migrations/20261006000002_push_service_role_grants.sql`](../../supabase/migrations/20261006000002_push_service_role_grants.sql) |
| **Transit Şifreleme & Başlıklar** | HSTS (2 yıl, preload), CSP, X-Frame-Options devrede. | **GÜÇLÜ** | [`next.config.ts:10-24`](../../next.config.ts#L10-L24) |
| **Sabit Zamanlı Karşılaştırma** | `CRON_SECRET` ve QStash HMAC doğrulamalarında `timingSafeEqual` kullanımı. | **GÜÇLÜ** | [`lib/cronAuth.ts:21-26, 80`](../../lib/cronAuth.ts#L21-L26) |
| **Genel Rota Hız Sınırı** | 10 genel rotanın tamamı `applyRateLimit`; başlıksız istekler ortak havuzda 1/5 kota (push bypass 2026-10-20'de kapatıldı). | **GÜÇLÜ** | [`lib/rateLimit.ts`](../../lib/rateLimit.ts), [`tests/rate-limit-routes.test.ts`](../../tests/rate-limit-routes.test.ts) |
| **News RSS Kaynak Tüketimi** | `GET /api/news` önbellek ıskalamalarında 5 harici RSS ve onlarca görsele eşzamanlı HTTP isteği atıyor. | **ORTA RİSK** | [`lib/news/aggregate.ts:400-435`](../../lib/news/aggregate.ts#L400-L435) |
| **WAF / Cloudflare Katmanı** | Cloudflare WAF yok; doğrudan Vercel üzerinde standart koruma ile çalışıyor. | **ORTA RİSK** | Alan adı / DNS mimarisi |
| **Şema Tabanlı Girdi Doğrulama (Zod)** | Zod kurulu değil; doğrulama elle yazılmış regex desenleriyle yapılıyor. | **KISMEN YETERLİ** | [`package.json`](../../package.json), [`lib/api/validation.ts`](../../lib/api/validation.ts) |
| **Otomasyonlu Güvenlik Denetimi & Bağımlılıklar** | Dependabot, Snyk veya CI `npm audit` adımı yok; 3 kritik, 14 yüksek 23 zafiyet mevcut. | **YÜKSEK RİSK** | [`package.json`](../../package.json), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) |
