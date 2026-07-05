# Web İyileştirme Önerileri — 2026-07-05

> Kapsam: yalnızca kök Next.js web uygulaması (`app/`, `lib/`, `components/`, `config/`, `data/`, `supabase/migrations/`, `tests/`). **`mobile/` bu dokümanın dışında** — ayrı ele alınacak (artık repo'dan da çıkarıldı, bkz. `986a045`).
>
> Tetikleyici: 2026-07-04/05 commit'lerinin (home redesign, Vercel deploy fix'leri, cron azaltma, mobile repo'dan çıkarma) sonrası yapılan kapsamlı backend/API/UI-UX denetimi.
> Öncelik sırası kabaca: 🔴 kritik/canlıyı etkileyebilir → 🟠 orta → 🟡 iyileştirme/borç.

---

## 1. Backend / Veri Katmanı

### ✅ ÇÖZÜLDÜ (2026-07-05) — Preview deploy'larda yanlış site URL'e fetch (`lib/data/siteUrl.ts:14-15`)
```ts
const explicit = (process.env.NEXT_PUBLIC_SITE_URL ?? PROD_SITE_URL).replace(/\/+$/, '');
if (explicit) return explicit;  // hep truthy, altındaki fallback'ler ölü kod
```
`PROD_SITE_URL` sabit dolu olduğundan `??` hiç devreye girmiyor; `VERCEL_URL`/`localhost` fallback'leri hiçbir zaman çalışmıyor. Sonuç: her preview/branch deploy'unda RSC self-fetch'ler (`fetchSiteJson` → homepage news, `getRacesForStaleness`, `fetchLiveSeasonSnapshot`) production'a (`project-anthology-five.vercel.app`) gidiyor, kendi preview API'sine değil. Bugüne kadar fark edilmemiş çünkü prod ortamında `PROD_SITE_URL` zaten doğru değere denk geliyor — ama her preview build'de **prod verisini** çekiyor olabiliriz, bu da preview testlerini yanıltıcı kılar.
**Öneri:** Sırayı düzelt — önce `NEXT_PUBLIC_SITE_URL`, sonra `VERCEL_URL` (varsa `https://` ekle), en son `PROD_SITE_URL`/localhost.

### 🟠 `sync-f1` cron artık pratikte hep `season` scope'ta çalışıyor → veri 24 saate kadar bayatlayabilir
`app/api/cron/sync-f1/route.ts:59-69`: `vercel.json` cron'u her zaman `?scope=season` gönderdiği için `forcedScope` hep dolu, `scope` hiçbir zaman `'live'` olamıyor. Yarış haftasonu oturumları (quali/sprint/race) günde bir kez 07:00 UTC'de kontrol ediliyor; "due" kontrolü tek seferlik bir eşik kontrolü (`now >= due`) olduğundan veri kalıcı kaybolmuyor ama **bir sonraki gün 07:00'a kadar bayat kalabiliyor**. Bu, Hobby plan cron azaltmasının (30 dakikalık cron'un kaldırılmasının) doğrudan sonucu. Şu an kullanıcı tarafında bunu maskeleyen tek şey: okuma katmanındaki staleness-bypass + canlı Jolpica proxy fallback — yani her bayat okuma, DB yerine canlı Jolpica'ya gidiyor (ekstra dış API yükü + gecikme).
**Öneri:** Ya (a) GitHub Actions ile yarış haftasonlarında saatlik ek bir tetikleyici kur (teknik borç tablosunda zaten var), ya da (b) `scope=live` mantığını günlük cron içinde "eğer bugün/yarın yarış haftasonuysa ekstra kontrol yap" şeklinde koşullu çalıştır.

### ✅ ÇÖZÜLDÜ (2026-07-05) — `push/register` route'unda rate limit yok
`app/api/push/register/route.ts` — diğer tüm public route'ların (f1-season, news, season/[year]) aksine hiç rate-limit yoktu. `lib/rateLimit.ts` uygulandı (IP başına dakikada 10 istek), ayrıca `req.json()` artık try/catch içinde (bozuk JSON → 400) ve `force-dynamic`/`runtime='nodejs'` export'ları eklendi.

### 🟠 `jsdom` yanlış kategoride — production runtime'da kırılma riski
`package.json:46` — `jsdom` devDependency olarak listeli ama `lib/news/aggregate.ts:112` runtime'da (`sync-news` cron + `/api/news` cache-miss yolunda) dinamik import ediyor. `outputFileTracingExcludes` düzeltmesi bunu bundle'da tutuyor ama kategori hâlâ yanlış; `npm ci --omit=dev` kullanan herhangi bir deploy adımı haber ingestion'ını kırar.
**Öneri:** `jsdom`'u `dependencies`'e taşı.

### 🟡 Aynı sayfa render'ında `getSeasonData` tekrar tekrar çağrılıyor
`app/drivers/[driverId]/page.tsx:50-54` gibi yerlerde `getDriverProfile` + `getDriverSeasons` + `getDriverCareer` aynı sezon için bağımsız `getSeasonData()` çağırıyor — sezon başına 3x aynı Supabase okuması. `lib/data/f1.ts` içinde sadece calendar-staleness için kısa bir memo var (`stalenessRacesCache`), sezon paketi için yok.
**Öneri:** Request-scope memoization (React `cache()` ile sarmalama) ekle.

### 🟡 `profileSeasons()` / `getDriverCareer` / `getTeamCareer` — gelecekte N+1 patlaması riski
`lib/data/entities.ts:8-10` şu an sadece `[CURRENT_SEASON]` döndürüyor, bu yüzden fan-out bugün no-op. Ama tarihsel sezonlar eklenince (isimlendirme zaten "career", "full profile archive" diyor) her profil sayfası N sezon × M round sorgusu tetikleyecek, hiçbir cache katmanı yok.
**Öneri:** Tarihsel sezon desteği eklenirken aynı anda bir cache/memoization stratejisi de planla — sonradan eklemek daha zor olur.

### 🟡 `.env.example` ile `lib/cronAuth.ts` arasında isim uyuşmazlığı
`.env.example` sadece `CRON_SECRET_KEY` (legacy) belgeliyor; Vercel'in otomatik enjekte ettiği `CRON_SECRET` (birincil, `_KEY` eki yok) hiç bahsedilmiyor. Şablonu birebir takip eden biri sadece legacy adı ayarlar.
**Öneri:** `.env.example`'a her ikisini de ekle, hangisinin birincil olduğunu not düş.

---

## 2. API

### ✅ ÇÖZÜLDÜ (2026-07-05) — `cron/notify` route'u zombi — "kaldırıldı" ama hâlâ canlı ve tetiklenebilir
30 dakikalık cron `vercel.json`'dan doğru şekilde çıkarılmıştı ama `app/api/cron/notify/route.ts` dosyası silinmemişti. Route tamamen kaldırıldı (`push_subscriptions` tablosu ve `/api/push/register` kayıt akışı dokunulmadan kalıyor, yalnızca bildirim *gönderme* cron'u silindi); `docs/vision/technical.md`'deki referansı da temizlendi.

### 🟡 `force-dynamic` kullanımı tutarsız
- Cron route'ları: `sync-f1`/`sync-news`/`sync-radio` var, `notify` yok.
- Public API: `f1-season`/`news` var, `season/[year]` yok (sadece `runtime='nodejs'`).
- Sayfalar: `season/page.tsx` hem `revalidate=0` hem `force-dynamic` (fazladan ama zararsız); `circuits/[id]`/`anthology/[slug]` sadece `force-dynamic` + açıklayıcı yorum ("SSG lambda mismatch"); `drivers/[driverId]`/`teams/[constructorId]` aynı fix'i yorumsuz uyguluyor; **ana sayfa (`app/page.tsx`) sadece `revalidate=0`, `force-dynamic` yok** — dünkü "SSG lambda mismatch" sınıfı hatanın kök route'ta tekrar çıkma riski var, çünkü `revalidate=0` ile `force-dynamic` Next'in route cache modelinde tam eşdeğer değil.
**Öneri:** Ana sayfaya da `export const dynamic = 'force-dynamic'` ekle; `season/[year]` route'una da aynısını ekle; her `force-dynamic`'in yanına neden gerektiğini kısa yorumla belirt (tutarlı belgeleme).

### 🟡 `push/register` — hata yönetimi ve tip güvenliği zayıf
- `await req.json()` try/catch'siz — bozuk JSON gövdesi handler içinde unhandled exception'a düşüyor (Next genel 500'e çeviriyor ama diğer route'lardaki özenli hata şekillendirmesiyle tutarsız).
- `(getSupabaseAdmin().from('push_subscriptions') as any).upsert(...)` — `any` cast, `Database` tipi kullanılmıyor (aynı pattern `lib/f1Ingest.ts`, `sync-news`, `sync-radio` içinde de var — codebase genelinde tekrarlanan bir workaround, muhtemelen generated type'ların insert şeklini tam karşılamamasından).
**Öneri:** `req.json()`'u try/catch'e al, 400 döndür; push_subscriptions için Database tipini tamamla ya da en azından route-özel bir tip tanımla.

### 🟡 Cron `maxDuration=300` üç ayrı dosyada tekrar ediyor
Merkezi bir yerden yönetilmiyor (Vercel `functions` bloğu tercih edilebilir), şu an sürüklenme riski düşük ama üç dosyayı senkron tutmak manuel.

---

## 3. UI / UX

### 🟠 Tasarım dili bölünmesi: ana sayfa yeni "Poster Dense / Split Cinema", geri kalan her şey eski "Bento"
Dünkü redesign yalnızca `app/page.tsx` + navigasyonu kapsadı. `/season`, `/drivers`, `/teams`, `/circuits`, `/anthology`, `/news`, `/tech-glossary` ve tüm detay sayfaları hâlâ `BentoGrid`/`PageShell`/`BentoCard` iskeletinde. Bu, `docs/design/apex-design-language.md`'nin kendisinin de kabul ettiği bir durum (§4: "sonraki faz — henüz onaylanmadı") ama kullanıcı deneyimi açısından anasayfadan `/season`'a geçiş şu an **stilistik bir kopukluk** yaratıyor.
**Öneri:** Master plan'daki WEB-UI.5-7 (Season/Liste/Detay şablonları) öncelik sırasına alınmalı — mevcut açık iş zaten planda var, hızlandırılması öneriliyor.

### 🟠 Arama ikonu yanıltıcı (`components/layout/SiteHeader.tsx:34-40`)
Büyüteç ikonu + `aria-label="Search"` var ama gerçek bir arama değil, `/season`'a düz link. Kullanıcı arama bekleyip navigasyon buluyor.
**Öneri:** Ya gerçek bir arama ekle (en azından basit client-side sürücü/takım/yarış araması), ya da ikonu/etiketini "Season" gibi doğru bir affordance'a çevir.

### 🟠 Hiçbir route'ta `loading.tsx` / `error.tsx` / `not-found.tsx` yok
Tüm dinamik sayfalar (`force-dynamic` + canlı Supabase/Jolpica fetch yapan ana sayfa, season, round, driver/team/circuit detay, anthology) veri çekilirken **boş/beyaz ekran** gösteriyor — streaming skeleton yok. Hata durumunda Next'in generic (markasız) hata sayfasına düşülüyor; `notFound()` çağrıları (circuits, anthology, drivers, teams) markasız varsayılan 404'e düşüyor.
**Öneri:** En azından ana sayfa, season ve detay route grupları için `loading.tsx` (iskelet/shimmer) ve global bir `app/error.tsx` + `app/not-found.tsx` ekle — düşük efor, yüksek algılanan kalite kazancı.

### 🟡 `parseSeason` her zaman `CURRENT_SEASON` döndürüyor — `?season=` parametresi sessizce yok sayılıyor
`app/drivers/[driverId]/page.tsx:24-26` ve `app/teams/[constructorId]/page.tsx:24-26`:
```ts
function parseSeason(_raw: string | undefined): number {
  return CURRENT_SEASON;
}
```
URL'de `?season=2024` gibi bir değer kabul ediliyor (tip tanımında da var) ama sessizce göz ardı ediliyor, hata da verilmiyor. Muhtemelen tarihsel sezon desteği gelene kadar bilinçli bir stub ama eski/paylaşılmış bir linki takip eden kullanıcı için sessiz bir "yanlış veri gösterimi" riski.
**Öneri:** Tarihsel destek gelene kadar en azından `?season=` geçerli değilse görünür bir not/banner ekle ("şu an yalnızca güncel sezon destekleniyor") ya da parametreyi tamamen kaldır ki yanlış beklenti yaratmasın.

### 🟡 Erişilebilirlik — genel olarak iyi, birkaç noktada spot-check gerekir
`tech-glossary`, `DriverAvatar`, `CircuitCardView`, `CalendarList`, `GridCards` içinde tutarlı şekilde `alt=""` kullanılıyor (yanında metin etiketi olduğu için WCAG açısından kabul edilebilir) ama lastik bileşimi gibi renk-kodlu SVG'lerde ekran okuyucu kullanıcılarının kaybettiği bir sinyal olabilir.
**Öneri:** Düşük öncelik — renk kodlamasının tek bilgi taşıyıcısı olduğu yerlerde `aria-label` ekle.

---

## 4. Test

### 🟠 Hiçbir API route'u test edilmiyor
`tests/` altında 7 dosya var (`f1Calendar`, `mrdata-round`, `f1-read-fallback`, `aggregate`, `cronAuth`, `rateLimit`, `f1-icons`) — hepsi saf mantık/yardımcı fonksiyon testi. `app/api/**/route.ts` handler'larının hiçbiri doğrudan test edilmiyor: auth-gate entegrasyonu (401 dönüyor mu), input validation, rate-limit 429 gövdesi, hata yanıtı şekli — hiçbiri uçtan uca doğrulanmıyor. `sync-f1`'in artık hep `season` scope'ta çalıştığı davranış değişikliği (bkz. §2) bu yüzden fark edilmemiş olabilirdi.
**Öneri:** En kritik 2-3 route için (cron auth akışı, `push/register` validation, `f1-season` whitelist) entegrasyon testi ekle.

### 🟡 Component/sayfa testi hiç yok
`vitest.config.ts` `environment: 'node'` — DOM test ortamı tanımlı değil. Dünkü home redesign (`SplitHomeLayout`, `PosterHero`, `FlatStandingsList`, `MobileNav`) hiç otomatik test kapsamında değil, yalnızca manuel/görsel doğrulama var.
**Öneri:** Kısa vadede zorunlu değil ama `MobileNav`'ın klavye/aria davranışı gibi kritik etkileşimler için en azından birkaç RTL testi düşünülebilir.

### 🟡 `rateLimit.test.ts` yalnızca in-memory fallback'i test ediyor
Upstash/Redis destekli dağıtık yol (`lib/rateLimit.ts:52-69,106-118`) hiçbir testte mock'lanmıyor — production'da asıl kullanılacak yol.
**Öneri:** Upstash client'ı mock'layan en az bir test ekle.

---

## 5. Build / Deploy

### 🟡 `frame-ancestors` tüm `*.vercel.app`'e izin veriyor
`next.config.ts:23` — portfolyo-embed kullanım senaryosu için bilinçli ama herhangi bir Vercel-hosted uygulamanın siteyi iframe'leyebilmesi anlamına geliyor (yalnızca kendi preview subdomain'leri değil). Küçük bir clickjacking-yüzeyi genişlemesi, muhtemelen kabul edilmiş bir tradeoff.
**Öneri:** Mümkünse yalnızca kendi preview domain pattern'ine daraltılabilir mi diye değerlendir; değilse bilinçli kabul olarak belgelensin yeter.

### 🟡 `.nvmrc` yok, yalnızca `package.json#engines: "24.x"`
Vercel bunu doğrudan okuyor, sorun yok, ama yerel geliştirme araçları (`nvm use` vb.) `.nvmrc`'ye bakabilir.
**Öneri:** Küçük bir `.nvmrc` eklemek maliyetsiz bir tutarlılık kazancı.

### 🟡 `tsconfig.tsbuildinfo` (469KB) birkaç config değişikliğinden eski tarihli
Gitignore'da olduğunu doğrulamak gerek; değilse stale incremental-check yanlış pozitif/negatiflerine yol açabilir.

---

## Öncelik Özeti (ilk yapılacaklar)

1. ✅ `lib/data/siteUrl.ts` fallback sırası — çözüldü (2026-07-05).
2. 🟠 `sync-f1` scope-forcing → veri staleness'i belgelenmeli / GH Actions saatlik tetikleyici planlanmalı.
3. ✅ `push/register` rate-limit eksikliği — çözüldü (2026-07-05).
4. 🟠 `jsdom` dependency kategorisi.
5. 🟠 Ana sayfaya `loading.tsx`/`error.tsx`/global `not-found.tsx`.
6. ✅ `cron/notify` zombi route — silindi (2026-07-05).
7. 🟠 Tasarım dili bölünmesi — WEB-UI.5-7'yi hızlandır (zaten planda).

Detaylı gerekçeler ve dosya/satır referansları için ilgili bölümlere bakınız.
