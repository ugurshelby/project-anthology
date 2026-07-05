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

### ✅ ÇÖZÜLDÜ (2026-07-05) — `jsdom` yanlış kategoride — production runtime'da kırılma riski
`package.json:46` — `jsdom` devDependency olarak listeliydi ama `lib/news/aggregate.ts:112` runtime'da (`sync-news` cron + `/api/news` cache-miss yolunda) dinamik import ediyor. `jsdom` `dependencies`'e taşındı; `npm install --package-lock-only` ile `package-lock.json`'daki jsdom + tüm transitive bağımlılıklarının (`cssstyle`, `data-urls`, `tough-cookie` vb.) `dev` bayrağı doğru şekilde temizlendi.

### 🟡 Aynı sayfa render'ında `getSeasonData` tekrar tekrar çağrılıyor
`app/drivers/[driverId]/page.tsx:50-54` gibi yerlerde `getDriverProfile` + `getDriverSeasons` + `getDriverCareer` aynı sezon için bağımsız `getSeasonData()` çağırıyor — sezon başına 3x aynı Supabase okuması. `lib/data/f1.ts` içinde sadece calendar-staleness için kısa bir memo var (`stalenessRacesCache`), sezon paketi için yok.
**Öneri:** Request-scope memoization (React `cache()` ile sarmalama) ekle.

### 🟡 `profileSeasons()` / `getDriverCareer` / `getTeamCareer` — gelecekte N+1 patlaması riski
`lib/data/entities.ts:8-10` şu an sadece `[CURRENT_SEASON]` döndürüyor, bu yüzden fan-out bugün no-op. Ama tarihsel sezonlar eklenince (isimlendirme zaten "career", "full profile archive" diyor) her profil sayfası N sezon × M round sorgusu tetikleyecek, hiçbir cache katmanı yok.
**Öneri:** Tarihsel sezon desteği eklenirken aynı anda bir cache/memoization stratejisi de planla — sonradan eklemek daha zor olur.

### ✅ ÇÖZÜLDÜ (2026-07-05) — `.env.example` ile `lib/cronAuth.ts` arasında isim uyuşmazlığı
`.env.example` sadece `CRON_SECRET_KEY` (legacy) belgeliyordu; `CRON_SECRET` (birincil) eklendi, hangisinin öncelikli olduğu yorumla belirtildi. `NEXT_PUBLIC_SITE_URL` yorumu da düzeltilen fallback sırasını (VERCEL_URL önce) yansıtacak şekilde güncellendi.

---

## 2. API

### ✅ ÇÖZÜLDÜ (2026-07-05) — `cron/notify` route'u zombi — "kaldırıldı" ama hâlâ canlı ve tetiklenebilir
30 dakikalık cron `vercel.json`'dan doğru şekilde çıkarılmıştı ama `app/api/cron/notify/route.ts` dosyası silinmemişti. Route tamamen kaldırıldı (`push_subscriptions` tablosu ve `/api/push/register` kayıt akışı dokunulmadan kalıyor, yalnızca bildirim *gönderme* cron'u silindi); `docs/vision/technical.md`'deki referansı da temizlendi.

### ✅ ÇÖZÜLDÜ (2026-07-05) — `force-dynamic` kullanımı tutarsız
Ana sayfaya (`app/page.tsx`) ve `season/[year]` API route'una `export const dynamic = 'force-dynamic'` eklendi; `drivers/[driverId]`/`teams/[constructorId]`'daki mevcut `force-dynamic`'lere de açıklayıcı yorum eklendi ("Vercel @vercel/next + Next 16 segment SSG packaging bug"). `cron/notify` zaten silinmişti (bkz. §2), o yüzden o tutarsızlık da kalktı.

### ✅ ÇÖZÜLDÜ (2026-07-05) (kısmen) — `push/register` — hata yönetimi ve tip güvenliği zayıf
JSON try/catch daha önce eklenmişti. `any` cast kaldırılmaya çalışıldı — `Database` tipi zaten `push_subscriptions` için tamdı ama supabase-js'in generic overload çözümü `upsert()` payload'ını yanlış çıkarıyor (Database tanımından bağımsız bir kütüphane kısıtı, doğrulandı). `any` yerine dar/somut bir tip (`{ upsert: (row: PushSubscriptionInsert, ...) => ... }`) ile cast edildi — aynı `any` kaçış yolu değil, en azından `error.message` erişimi artık tip güvenli.

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

### ✅ ÇÖZÜLDÜ (2026-07-05) — `.nvmrc` yok
`.nvmrc` (`24`) eklendi.

### ✅ Doğrulandı — `tsconfig.tsbuildinfo` zaten gitignore'da
`.gitignore:48` — `*.tsbuildinfo` zaten var, ek işlem gerekmedi.

---

## Öncelik Özeti (ilk yapılacaklar)

1. ✅ `lib/data/siteUrl.ts` fallback sırası — çözüldü (2026-07-05).
2. 🟠 `sync-f1` scope-forcing → veri staleness'i belgelenmeli / GH Actions saatlik tetikleyici planlanmalı. **(hâlâ açık — tek kalan orta öncelik madde)**
3. ✅ `push/register` rate-limit eksikliği — çözüldü (2026-07-05).
4. ✅ `jsdom` dependency kategorisi — çözüldü (2026-07-05).
5. 🟠 Ana sayfaya `loading.tsx`/`error.tsx`/global `not-found.tsx`. **(hâlâ açık)**
6. ✅ `cron/notify` zombi route — silindi (2026-07-05).
7. ✅ Tasarım dili bölünmesi — standings/haber/circuit BoxBox-ilhamlı redesign + mobile nav yeniden tasarımı ile büyük ölçüde kapandı (2026-07-05); kalan sayfalar (drivers/teams/circuits liste, tech-glossary) hâlâ eski Bento'da, ayrı bir tur gerekebilir.

**Kalan açık maddeler:** `sync-f1` veri staleness'i (madde 2), `loading.tsx`/`error.tsx`/`not-found.tsx` eksikliği (madde 5), API route entegrasyon testleri (bkz. §4), request-scope memoization (`getSeasonData` tekrar çağrımı), arama ikonunun yanıltıcılığı (`SiteHeader`).

Detaylı gerekçeler ve dosya/satır referansları için ilgili bölümlere bakınız.
