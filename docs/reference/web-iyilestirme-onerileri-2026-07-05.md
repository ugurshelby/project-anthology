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

### ✅ ÇÖZÜLDÜ (2026-07-11) — `sync-f1` cron artık pratikte hep `season` scope'ta çalışıyordu → veri 24 saate kadar bayatlıyordu
`app/api/cron/sync-f1/route.ts:59-69`: `vercel.json` cron'u her zaman `?scope=season` gönderdiği için `forcedScope` hep dolu, `scope` hiçbir zaman `'live'` olamıyordu. Vercel Hobby plan'ın günde 1x/route cron kısıtı nedeniyle GitHub Actions dışı, ayrı bir Railway servisi (`railway/apex-sync-f1-cron/`) kuruldu — `*/15 * * * 5,6,0` (Cuma/Cumartesi/Pazar, 15 dakikada bir) `?scope=live` endpoint'ini `CRON_SECRET` ile tetikliyor. 2026-07-11'de doğrulandı: `[sync-f1 live] 200 OK`.

### ✅ ÇÖZÜLDÜ (2026-07-05) — `push/register` route'unda rate limit yok
`app/api/push/register/route.ts` — diğer tüm public route'ların (f1-season, news, season/[year]) aksine hiç rate-limit yoktu. `lib/rateLimit.ts` uygulandı (IP başına dakikada 10 istek), ayrıca `req.json()` artık try/catch içinde (bozuk JSON → 400) ve `force-dynamic`/`runtime='nodejs'` export'ları eklendi.

### ✅ ÇÖZÜLDÜ (2026-07-05) — `jsdom` yanlış kategoride — production runtime'da kırılma riski
`package.json:46` — `jsdom` devDependency olarak listeliydi ama `lib/news/aggregate.ts:112` runtime'da (`sync-news` cron + `/api/news` cache-miss yolunda) dinamik import ediyor. `jsdom` `dependencies`'e taşındı; `npm install --package-lock-only` ile `package-lock.json`'daki jsdom + tüm transitive bağımlılıklarının (`cssstyle`, `data-urls`, `tough-cookie` vb.) `dev` bayrağı doğru şekilde temizlendi.

### ✅ ÇÖZÜLDÜ (2026-07-11) — Aynı sayfa render'ında `getSeasonData` tekrar tekrar çağrılıyordu
`app/drivers/[driverId]/page.tsx:50-54` gibi yerlerde `getDriverProfile` + `getDriverSeasons` + `getDriverCareer` aynı sezon için bağımsız `getSeasonData()` çağırıyordu — sezon başına 3x aynı Supabase okuması. `lib/data/f1.ts:421` artık React `cache()` ile sarmalı; dev server'da doğrulandı (`calendar`/`standings_drivers`/`standings_constructors` fetch'leri sayfa başına 1x'e düştü, önceden 3x idi).

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

### ✅ ÇÖZÜLDÜ (2026-07-12) — Arama ikonu yanıltıcıydı (`components/layout/SiteHeader.tsx:34-40`)
Büyüteç ikonu + `aria-label="Search"` vardı ama gerçek bir arama değildi, `/season`'a düz linkti (kullanıcı arama bekleyip navigasyon buluyordu). `NAV_ITEMS`'da zaten `/season` linki olduğundan ikinci bir "Season" linki eklemek yerine ikon tamamen kaldırıldı; logo genişliğini dengeleyip `HeaderNav`'ı ortalı tutan görünmez bir spacer'a çevrildi.

### ✅ ÇÖZÜLDÜ (2026-07-11) — Hiçbir route'ta `loading.tsx` / `error.tsx` / `not-found.tsx` yoktu
`app/loading.tsx` (home, split-layout'a özel), `app/season/loading.tsx`, `app/season/[year]/round/[n]/loading.tsx`, `app/drivers/loading.tsx` + `[driverId]/loading.tsx`, `app/teams/loading.tsx` + `[constructorId]/loading.tsx`, `app/circuits/[id]/loading.tsx`, `app/news/loading.tsx` + `[id]/loading.tsx`, `app/anthology/[slug]/loading.tsx` eklendi (yeni `components/layout/BentoSkeleton.tsx` — shimmer, Apex tasarım diline uygun). Kök `app/error.tsx` (Sentry entegreli) ve `app/not-found.tsx` markasız Next.js varsayılanlarının yerini alıyor.

### ✅ ÇÖZÜLDÜ (2026-07-12) — `parseSeason` her zaman `CURRENT_SEASON` döndürüyordu, `?season=` sessizce yok sayılıyordu
`app/drivers/[driverId]/page.tsx` ve `app/teams/[constructorId]/page.tsx` — `parseSeason` artık `{ season, requestedUnsupported }` döndürüyor; istenen sezon `CURRENT_SEASON`'dan farklı/geçersizse sayfada görünür bir uyarı banner'ı ("Only the {season} season is available right now") gösteriliyor, sessizce yutulmuyor.

### 🟡 Erişilebilirlik — genel olarak iyi, birkaç noktada spot-check gerekir
`tech-glossary`, `DriverAvatar`, `CircuitCardView`, `CalendarList`, `GridCards` içinde tutarlı şekilde `alt=""` kullanılıyor (yanında metin etiketi olduğu için WCAG açısından kabul edilebilir) ama lastik bileşimi gibi renk-kodlu SVG'lerde ekran okuyucu kullanıcılarının kaybettiği bir sinyal olabilir.
**Öneri:** Düşük öncelik — renk kodlamasının tek bilgi taşıyıcısı olduğu yerlerde `aria-label` ekle.

---

## 4. Test

### ✅ ÇÖZÜLDÜ (2026-07-12) — Hiçbir API route'u test edilmiyordu
Üç entegrasyon test dosyası eklendi, route handler'ları doğrudan çağrılıyor (63 yeni test, toplam 54 → 117):
- **`tests/api-f1-season.test.ts`** (29 test) — SSRF whitelist'i: mutlak URL'ler, `//` protocol-relative, cloud metadata IP'si (`169.254.169.254`), path traversal, listelenmemiş endpoint'ler hepsi 400 alıyor **ve ağa hiç çıkmıyor**; izinli path'ler geçiyor; upstream 404→200/`{MRData:{}}`, 500→502, abort→504 haritalaması; hata gövdelerinde upstream detayı sızmıyor. Whitelist kontrolü bilerek kaldırılıp testlerin gerçekten yakaladığı doğrulandı (11 test kırıldı).
- **`tests/api-push-register.test.ts`** (16 test) — bozuk JSON→400, Expo olmayan/eksik token→400, `preferences` sanitizasyonu (yalnızca boolean değerler, max 20 anahtar, array/string/null → `{}`), DB hatasında generic mesaj (Supabase constraint adı sızmıyor, detay server log'una gidiyor).
- **`tests/api-cron-guard.test.ts`** (18 test) — üç cron route'unun (`sync-f1`/`sync-news`/`sync-radio`) auth kapısı (header yok / yanlış secret / Bearer şeması yok / hiç secret yapılandırılmamış → hepsi 401) ve trigger throttle'ı (ikinci yetkili çağrı 60sn içinde 429; yetkisiz flood throttle'ı tüketmiyor — auth önce kontrol ediliyor).

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
2. ✅ `sync-f1` scope-forcing → Railway cron ile çözüldü (2026-07-11).
3. ✅ `push/register` rate-limit eksikliği — çözüldü (2026-07-05).
4. ✅ `jsdom` dependency kategorisi — çözüldü (2026-07-05).
5. ✅ `loading.tsx`/`error.tsx`/`not-found.tsx` — çözüldü (2026-07-11).
6. ✅ `cron/notify` zombi route — silindi (2026-07-05).
7. ✅ Tasarım dili bölünmesi — standings/haber/circuit BoxBox-ilhamlı redesign + mobile nav yeniden tasarımı ile büyük ölçüde kapandı (2026-07-05); pilot detay hero + tech glossary mobil accordion ile devam etti (2026-07-11); kalan sayfalar (teams/circuits liste) hâlâ eski Bento'da, ayrı bir tur gerekebilir.
8. ✅ API route entegrasyon testleri — çözüldü (2026-07-12), 63 yeni test (bkz. §4).

**Kalan açık maddeler:** Bu rapordaki tüm 🔴/🟠 maddeler kapandı. `parseSeason` sessizce yok sayma sorunu da çözüldü (2026-07-12). Geriye yalnızca şu 🟡 (düşük öncelik / borç) kalemleri kaldı: component/sayfa (RTL) testleri, `rateLimit`'in Upstash yolunun test edilmemesi, cron `maxDuration` üç dosyada tekrarı (Next.js route segment config gereği — kasıtlı, düşük risk), `frame-ancestors`'ın `*.vercel.app` genişliği (portfolyo embed için bilinçli kabul), tarihsel sezon desteği geldiğinde `profileSeasons()` N+1 riski. Renk-kodlu SVG `aria-label` maddesi incelendi — kod tabanında böyle bir bileşen bulunamadı, muhtemelen daha önce kaldırılmış; madde kapatıldı.

Detaylı gerekçeler ve dosya/satır referansları için ilgili bölümlere bakınız.
