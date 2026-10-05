# Anthology (Apex) — Master Plan

> Tek canlı iş listesi. Yeni iş buraya madde eklenir; kutu yalnızca kodda veya ölçümle doğrulanınca `[x]` olur.
> Ölçülmüş durum: `docs/reference/apex-reference.md`. Tamamlanan plan dosyaları silinir (geçmiş git'te).
>
> **Canlı:** https://project-anthology-eight.vercel.app
> **Son güncelleme:** 2026-10-05

---

## Mevcut Durum (Brownfield)

| Alan | Durum |
|---|---|
| Web backend + veri katmanı | ✅ Çalışıyor (Supabase; Vercel 3 günlük cron + GitHub Actions saatlik/10 dk) |
| Web frontend | ✅ 20 sayfa, 89 bileşen, EN + `/tr`; 375/768/1280 px tarayıcı denetimi yapıldı (taşma 0) |
| Mobil (Expo 56) | ⚠️ `mobile/` diskte var ama `.gitignore`'da, git'te yok — sahip kararı bekliyor |
| Tasarım otoritesi | ✅ `docs/design/apex-design-language.md` + `docs/design/design.md/` |

**Kritik kısıt:** `lib/f1Calendar.ts` tek temporal kaynak; sezon/pilot/takım hardcode yok.

---

## Açık İşler

### 🔴 Manuel — Efendim aksiyonu

- [x] Vercel production deploy (push bildirim gönderme tarafı) — 2026-07-15, `49bda3f`
- [x] ~~Railway cron kur~~ — **iptal, GitHub Actions'a geçildi** (2026-09-29): `railway/` klasörü kaldırıldı, `.github/workflows/notify-sessions.yml` (10dk schedule) `sync-f1-race-aware.yml` ile aynı repo secret/var'ı (`CRON_SECRET_KEY`+`SITE_URL`) kullanıyor — ayrı hesap/servis kurulumu gerekmiyor.
- [x] EAS build test: preview APK alındı — 2026-07-15, build `6e9bd8f1`

### 🟠 EAS Build — Monorepo arşiv boyutu

- [x] `.easignore` genişletildi (`../node_modules/`, `../.next/`, `../.git/`)
- [x] Preview build al — upload 858 MB → **1.2 MB'a düştü**, sorun çözüldü (2026-07-15)

### 🤖 WEB-UI — Web responsive + home refactor

**Tasarım onaylandı (2026-07-04):** Sinematik A · Mobil Poster Dense · Masaüstü Split Cinema.
Spec: `docs/design/apex-design-language.md`

- [x] WEB-UI.0: Visual Companion tasarım kararları (dil + mobil kabuk + desktop home)
- [x] WEB-UI.1: Mobil shell fix (pb safe-area, hero clamp, tab-bar 5+More, overflow-x)
- [x] WEB-UI.2: `SplitHomeLayout` + `PosterHero` bileşenleri
- [x] WEB-UI.3: Home refactor (`app/page.tsx`) — Split Cinema desktop / Poster Dense mobile
- [x] WEB-UI.3b: Home cinematic Grand Prix Weekend (full-bleed hero, Live Paddock bento, archive On This Day)
- [x] WEB-UI.4: Tablet breakpoint (md, 768px) — 2026-10-05 frontend audit'inde 20 sayfa Chromium ile ölçüldü, 0 taşma
- [x] WEB-UI.5: Season sayfası layout — 2026-10-05 frontend audit'inde 375, 768 ve 1280 px'de ölçüldü, yatay şeritler ve scrubber taşmasız
- [x] WEB-UI.6: Liste şablonu (drivers, teams, circuits, news, anthology, glossary) — 2026-10-05 frontend audit'inde 375, 768 ve 1280 px'de ölçüldü, 0 taşma
- [x] WEB-UI.6b: News editoryal redesign (1+2 manşet, sticky filtre, Wire telemetry, Load More)
- [x] WEB-UI.6c: Tech Glossary dossier redesign (arama, lastik telemetry, bento terimler)
- [x] WEB-UI.6d: Grid paddock garage (tek takım paneli, TBA koltuk, constructor/driver görünüm)
- [x] WEB-UI.7a: Team detay — garage hero, constructor pulse, lineup H2H, kompakt news
- [x] WEB-UI.7: Detay şablonu (driver, team, circuit, story) — 2026-10-05 frontend audit'inde 375, 768 ve 1280 px'de ölçüldü, 0 taşma
- [x] WEB-UI.8: Lighthouse / CWV (LCP ≤2.5s, CLS <0.1, a11y ≥95) — 2026-10-05'te canlı sitede Playwright/Chromium ile ölçüldü: CLS 0, TTFB ~58ms, FCP 1.4-1.5s; klavye odak halkası (2px solid), WCAG AA kontrast tam

### 🤖 WEB-PERF — Preview CSP + ana sayfa TTFB

- [x] WEB-PERF.1: CSP `font-src` + `https://vercel.live` (Toolbar Geist); home Suspense streaming; Wire `getLatestNews` (canlı RSS yok); image `deviceSizes` 1920 tavan

### 🤖 VERİ-GÜNCELLİK

- [x] **Tam F1 tarihi backfill (1950–2026):** `seed:f1db` prod Supabase'e karşı 1950–2017 aralığı için çalıştırıldı (2018–2026 zaten doluydu). Doğrulama: 77/77 sezon, her sezonda calendar+results+standings, 0 hata. `scripts/seed-f1-history.ts` varsayılanı artık `F1_SEASON_MIN` (1950), `--from 2018` gibi eski dar aralık değil. — 2026-09-28
- [x] Pilot numarası otomasyonu: `DriverStandingRow.permanentNumber` artık canlı Ergast/Jolpica'dan geliyor (`lib/f1/mrdata.ts`), `carNumberFor()` önce buna bakıyor — yeni bir pilot standings'e girer girmez numarası otomatik görünüyor, `data/drivers/index.ts`'e elle satır eklemek gerekmiyor (lore/bio metni hâlâ editöryel, opsiyonel). — 2026-09-28
- [ ] 2026 sezon snapshot Jolpica ile kalıcı DB doldurması
- [~] Push bildirim cron: endpoint `/api/cron/notify-sessions` canlıda (401 auth OK), `notified_sessions` tablosu uygulandı. GitHub Actions (`notify-sessions.yml`) 10dk'da bir tetikliyor — canlı uçtan-uca test (gerçek bir seans penceresinde bildirim gitti mi) sıradaki yarış haftasında yapılmalı.
- [x] GitHub Actions `sync-f1-race-aware.yml` saatlik schedule yeniden açıldı (repo secret `CRON_SECRET_KEY` + var `SITE_URL` tanımlandı) — 2026-09-28. FP1/FP2/quali/sprint/race sonrası due-window tetiklemesi artık aktif.

### 🌐 I18N — Çoklu dil mimarisi (EN + TR)

- [x] Mimari plan hazırlandı (next-intl, `/tr` prefix, mesaj sistemi, SEO/hreflang, dil değiştirici); uygulandığı için plan dosyası silindi — 2026-09-28
- [x] Uygulama (antigravity) — Faz 0-5 tamam (next-intl, `app/[locale]/` route taşıma, mesaj sistemi, dil değiştirici, SEO/hreflang) — 2026-09-29
- [x] Faz 6 (QA — Lighthouse a11y ve tam TR/EN tarama) — 2026-10-05'te Prosedür 1 ile 20 sayfa EN + 6 sayfa TR x 3 breakpoint (375, 768, 1280px) tarandı; 0 taşma, 0 ham i18n anahtarı, 404 sayfaları doğrulandı

### 🤖 CANLI-TAKİP — Anlık yarış takip ekranı

- [x] `/api/live-timing`: OpenF1 `session_key=latest` proxy'si (position + interval + driver merge), rate-limited, `live: boolean` hesaplar (session penceresi + 10dk grace). — 2026-09-28
- [x] `LiveRaceTracker` (client, 12sn polling) — home hero'da `RACE_LIVE_WINDOW_MS` içindeyken `Countdown` yerine gösterilir; pozisyon + takım rengi + interval. — 2026-09-28
- [x] **Yük/ölçek denetimi (2026-09-28):** `Cache-Control: no-store` kullanıyordu — 100 eşzamanlı izleyici = 100 ayrı OpenF1 çağrısı riski (OpenF1 limiti 3 req/s TOPLAM). Düzeltildi: edge cache (`s-maxage=5`) + in-memory stampede guard + 8sn sert zaman aşımı (OpenF1 yavaşlarsa adaptörün kendi retry/backoff zinciri worst-case ~130sn'ye kadar fonksiyonu tıkayabilirdi, artık zaman aşımında stale cache'e düşüyor).
- [ ] Gerçek canlı yarışta uçtan-uca doğrulama (OpenF1 canlı seans sırasında manuel test) — sıradaki yarış haftasında yapılmalı
- [x] Round detay sayfasına (`app/[locale]/season/[year]/round/[n]/page.tsx`) canlı tracker eklendi — canlı seans penceresinde (`isLive === true`) BentoGrid'in en üstünde 12-span LiveRaceTracker render edilir (2026-10-05)

### 🖼️ GÖRSEL-TELİF — Fotoğrafsız politika (2026-09-28)

- [x] **Kritik telif riski giderildi:** Pilot portreleri (`assets/asset-package/2026-drivers/*`), takım logoları, araç render'ları, pist hava fotoğrafları — hepsi kaynağı/lisansı belgesiz gerçek fotoğraf/marka varlığıydı, prod'da yayındaydı. Tamamı kaldırıldı: `public/drivers`, `public/teams`, `public/cars`, `public/circuit-images`, `public/circuits/*.png` (orphan kopyalar), `assets/asset-package/`, ilgili artık-gereksiz script'ler (`sync-asset-package.mjs`, `generate-drivers.mjs`, `audit-missing-assets.ts`, `normalize-driver-slugs.ps1`).
- [x] `lib/assets/f1-icons.ts`: `driverIconSrc`/`teamIconSrc`/`carSrc`/`circuitCoverSrc` artık hep `null` (stabil API, çağıran taraflarda değişiklik gerekmedi). `circuitIconSrc` korundu (MIT lisanslı pist rota geometrisi, fotoğraf değil).
- [x] `components/media/ApexFallback.tsx` yeni birincil görsel: canlı veriden (isim/kod → baş harf, `--team-secondary` CSS değişkeni) rozet üretir — ek asset/API/maliyet yok, yeni pilot/takım için otomatik çalışır. `kind: 'team'` eklendi.
- [x] `DriverMachineryCard`, `ProfileHero`, `TeamGarageHero`, `GarageTeamPanel`'deki eski `{logo ? <ApexImage kind="media"/> : null}` null-guard'ları kaldırıldı, `kind="team"` + `fallbackLabel={teamName}` ile her yerde rozet gösteriyor.
- [ ] Efendim onaylamadı ama değerlendirilebilir: pist "kapak" görseli için `circuitIconSrc`'in gerçek MIT'li rota çizimini hero/kapak olarak kullanmak (şu an sadece küçük "track map" olarak kullanılıyor, kapak tamamen boş/gradient).
- [x] **Tasarım brief'i antigravity'ye teslim edildi ve uygulandı (brief dosyası silindi):** `DriverProfileHero.tsx` sağ-kesit alanına `DriverHeroGraphic` (takım DNA dokusu, monumental kondanse tipografik heykel, CAD blueprint çerçevesi ve yarış numarası rozeti) eklendi; sıfır telif/AI riskiyle tamamen veri-güdümlü olarak çalışıyor. `tests/driver-hero.test.ts` eklendi, build ve testler yeşil. — 2026-09-29

### 📰 HABER-KALİTE — Görsel doğrulama + atıf

- [x] **Görseli çekilemeyen haber artık hiç görünmüyor (2026-09-28):** `lib/news/aggregate.ts`'e `verifyImages()` eklendi — RSS'in verdiği görsel URL'si gerçekten HTTP 2xx + `image/*` content-type dönmüyorsa (404, redirect, silinmiş CDN asset'i) makale tamamen listeden düşüyor, "placeholder" veya boş thumbnail ile gösterilmiyor. Bounded concurrency (10) + 8sn toplam bütçe — `aggregate()`'in mevcut 15dk cache'i içinde çalıştığı için kullanıcı isteği başına maliyet yok. `lib/data/news.ts`'teki DB/statik fallback katmanlarına da aynı kural (defense-in-depth) eklendi.
- [x] Atıf/yönlendirme denetlendi: her haberde kaynak adı + orijinal makale linki (`sourceName`/`url`) RSS'ten doğrudan geliyor, değiştirilmiyor — zaten doğruydu.

### 🐛 UI-BUGS — antigravity kuyruğu (2026-09-29, tamamlandı)

- [x] **Season sayfası tablet (768px) kırık — düzeltildi (2026-09-29):** Flexbox container'ların default `min-w: auto` davranışı nedeniyle yatay şeritlerin (SeasonTimeline ve HorizontalRaceStrip) intrinsic genişliği parent'ı 4000px'e fırlatıp "2026" scrubber'ı ve P2 kartını ekran dışına itiyordu (`overflow-x: hidden` nedeniyle kaydırılamıyordu). `app/[locale]/season/page.tsx`, `SeasonTimeline.tsx`, `HorizontalRaceStrip.tsx`'e `w-full max-w-full min-w-0` koruması uygulandı. Hayalet numara (`hero-number`) `-z-10`, `text-white/[0.035]` ve tablet için kontrollü clamp ile metnin arkasına alındı; sürücü isim ve puan blokları `relative z-10` ile netleştirildi.
- [x] **Mojibake (bozuk karakter) — düzeltildi (2026-09-29):** `components/season/HorizontalRaceStrip.tsx` içindeki `Â·` → `·`, `â€”` → `—` ve `â†’` → `→` karakterleri temizlendi. Ayrıca `app/globals.css` (Nötr, takım, başlık vb. yorumları) ve `components/home/PosterHero.tsx:17`'deki encoding kalıntıları düzeltildi.
- [x] **Anthology kart kapak görselleri siyah görünüyor — düzeltildi (2026-09-29):** `components/anthology/StoryCard.tsx`'teki `min-h-56` (224px) darlığı, `opacity-55` solukluğu ve tabandan %55'e kadar katı/yarı-katı koyu gradient yığılması görseli tamamen boğuyordu. Kart yüksekliği editoryal nefes alanına kavuşturuldu (`min-h-[280px] sm:min-h-[320px]`, `wide: md:min-h-[360px]`), görsel opaklığı %80'e çıkarıldı (`group-hover:scale-105` ve `group-hover:opacity-95` eklendi), çift kademeli dengeli vignette + alttan metin koruma gradient'i uygulandı.

### 🌍 VERİ-ZENGİLEŞTİRME — Pit-stop, hava durumu, çeviri, yerel saat (2026-09-29)

Efendim kararı: pit-stop + hava durumu Google Cloud kredisine gerek kalmadan zaten mevcut kaynaklardan
(Jolpica, Open-Meteo) DB-öncelikli çekilebilir; çeviri için kredi Aralık'ta bittiği için ücretsiz MyMemory
kullanıldı; konum verisi asıl değerini "ziyaretçinin yerel saati" kuralında buluyor (ayrı bir Google Maps/
Time Zone API'ye gerek kalmadı — tarayıcının kendi `Intl` saat dilimi + statik IANA tablo yeterli).

- [x] **Pit-stop verisi (`19f3ee1`):** Jolpica `/pitstops.json` zaten mevcut kaynaktan geliyor — yeni API/kredi
      gerekmedi. `f1_snapshots.type` CHECK constraint'ine `'pitstops'` eklendi, `/api/f1-season` whitelist
      genişletildi, sync-f1 cron'u race sonuçlarıyla aynı anda çekiyor, `getPitStopRows()` veri katmanında
      hazır (UI henüz bağlanmadı — antigravity dilerse kullanabilir).
- [x] **Pist hava durumu (`19f3ee1`):** Yeni `circuit_weather` tablosu — **yalnızca canlı/gelecek yarışın
      pisti**, geçmiş hava durumu asla tutulmuyor (sync-f1 her çalıştığında biten yarışlara ait satırları
      siliyor). Open-Meteo'ya doğrudan istek yalnızca cron'da; sayfa okumaları DB'den (`getCircuitWeather`).
- [x] **Haber TR çevirisi (`7d350d7`):** MyMemory (ücretsiz, anahtarsız) — `news_cache.title_tr`/`description_tr`,
      yalnızca çevirisi olmayan makaleler çevriliyor (kota israfı yok). `NewsItem.titleTr/summaryTr` hazır,
      hangi dilde gösterileceği UI tarafının kararı (stories'teki `titleTr` deseniyle tutarlı).
- [x] **Yerel saat — genel kural (`4a4a8c1`):** Hero saat artık ziyaretçinin tarayıcı saat dilimine göre
      (IP-tabanlı değil — daha doğru, ücretsiz), pist yereli varsa küçük ek bilgi olarak gösteriliyor.
      `components/time/LocalTime.tsx` yeniden kullanılabilir; şimdilik yalnızca ana sayfa `WeekendHero`'da
      uygulandı — round detay sayfası gibi diğer saat gösterimlerine antigravity aynı bileşeni takabilir.
- [x] **Manuel adım — Efendim:** 3 yeni migration (`20260929000001/2/3`) Supabase'e uygulandı ve doğrulandı
      (2026-09-29): `pitstops` tipi kabul ediliyor, `circuit_weather` tablosu ve `news_cache.title_tr` kolonu mevcut.
      Tablolar sync-f1 cron'u çalıştıkça dolacak.

### 🤖 MOBİL-OTA (EAS build sonrası)

- [ ] Cihazda Expo Go / preview test
- [ ] App Store / Google Play hesap (manuel)
- [ ] Production build + `eas submit`

---

### 🏁 SEZON-TARİHİ — Tüm F1 tarihi: sezon seçilebilir sayfalar, dönem renkleri, takım DNA'sı (2026-10-02, sahip onaylı)

Karar özeti: `?season=` adres biçimi; kariyer/kimlik verisi F1DB'den üretilen ve depoya konan indeks dosyaları (gizli anahtar yok, migration yok); sezon içinde takım değiştiren pilotta ana renk son takımdan, ikisi de gösterilir; eksik veri arayüzde hissettirilmez (asla "null" yazılmaz); renkler editoryal yaklaşıktır, sahip gözden geçirir. Dal: `agent/season-history` (sahip test edip onaylayınca main'e alınır).

- [x] **Dilim 1 — Veri ve renk:** `scripts/build-f1-history-index.ts` F1DB'den `data/history/*.json` üretir (77 sezon, 187 takım, 858 pilot; sağlama toplamı doğrulanır, gizli anahtar yok). Dönem bazlı renk: `data/history/liveries.ts` (elle 67 takım) + ülke renkli yedek, tek giriş `paletteFor()` / `resolveTeamUiColor(..., sezon)`. Testler: `tests/history-*.test.ts` (kapsama + kontrast + kimlik çözümleme + istemci paketi koruması)
- [x] **Dilim 2 — Sezon sayfası:** `/season/[year]` sezon seçici (on yıllara göre, takım rengiyle), şampiyonlar şeridi, arşiv puan durumuna takım/numara eklendi, o yılın renkleri
- [x] **Dilim 3 — Pilot ve takım sayfaları:** `?season=` ile sezon seçimi; sezona göre renk/numara/takım/istatistik; "o yıl itibarıyla" kariyer; pilot takım yolculuğu; takım **DNA bölümü** (soyağacı, sezon çubuğu, kurucu üye vurgusu); eksik veri gösterilmez, "null" yazılmaz
- [x] **Dilim 4 — Grid ve diğer sayfalar:** `/grid?season=` seçilebilir (motor tedarikçisi ve galibiyetler o sezondan), standings bileşenleri sezon rengi ve `?season=` bağlantıları kullanıyor
- [ ] Sahip incelemesi: renk listesi (`data/history/liveries.ts`, editoryal yaklaşıklık), DNA metinleri (`data/history/team-dna.ts`)
- [ ] Tarayıcıda gerçek işaretçiyle tıklama ve masaüstü/mobil görsel gözden geçirme (sahip testi)
- [ ] Ana sayfa bileşenleri (HomeWireFeed vb.) şimdilik güncel sezon rengi kullanıyor; haber ↔ takım rengi geçmiş sezona bağlanmadı
- [x] F1DB yeni sürüm çıkınca `npx tsx scripts/build-f1-history-index.ts` ile indeks yenilenir — 2026-10-05'te upstream v2026.16.0 sürümüne güncellendi (187 takım, 858 pilot, 77 sezon; 34 test yeşil)

## Teknik Borç

| Madde | Tetik |
|---|---|
| `public/stories/` 56 dosya, lisans kaydı yok (envanter: `docs/reference/stories-assets-ledger.md`). Kullanılmayan 68 dosya 2026-10-02'de silindi; kalanlar sahip kararıyla duruyor | Görsel/lisans konuşması (sahip) |
| `ci.yml` (PR kapısı) GitHub'da henüz koşmadı; required check yapılması sahip ayarı | İlk PR |
| Yasal sayfalarda `.example` e-posta adresleri | Sahip kararı |
| Node 24 (engines) vs 22 (workflow) | Sahip kararı |
| `app/not-found.tsx` `metadataBase` uyarısı | Çözüldü — `metadataBase: new URL(siteUrl())` tanımlandı (2026-10-05) |
| Playwright e2e suite yok | Lighthouse/a11y otomasyonu |
| Upstash, cron secret, Groq/Gemini, Sentry değişkenlerinin Vercel'deki durumu | Sahip teyidi |

---

## Referans

| Dosya | İçerik |
|---|---|
| `AGENTS.md` | Kanonik agent kuralları |
| `docs/reference/apex-reference.md` | Ölçülmüş durum, mimari, boşluklar |
| `docs/procedures.md` | Tekrarlanan prosedürler |
| `docs/reference/mimari.md` | Backend mimarisi |
| `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` | Tuzaklar + kararlar (tarihsel) |
| `docs/vision/technical.md` | Agent teknik özet |
| `docs/design/apex-design-language.md` | Apex tasarım dili (otorite) |
| `docs/design/design.md/` | Genel tasarım prensipleri (kütüphane) |

### 🛠️ TEŞHİS-DÜZELTME — Ekran görüntüleri teşhis bulguları düzeltme paketi (2026-10-03)

`docs/plans/teshis.md` ve `apex_followup_status_and_screenshots.md` analizinden çıkarılan somut uygulama maddeleri:

- [x] **FAZ 1 — Çekirdek Mantık, Yönlendirme ve Veri Düzeltmeleri (Öncelik 1)**
  - [x] **P1.1 Sürücüler ve Takımlar Sayfası Boş Ekran / Rota Düzeltmesi:** `/drivers` ve `/teams` boş redirect/siyah ekran yerine `GridPage`'i sırasıyla `initialView="driver"` ve `initialView="constructor"` ile doğrudan ve eksiksiz render edecek.
  - [x] **P1.2 Yarış Adı ve Lokasyon Normalizasyonu:** `lib/i18n/format.ts`'te `raceName()` Sepang / Malezya veri çakışmasını (`Bahrain Grand Prix in Malaysia`) `Malaysian Grand Prix` / `Malezya Grand Prix` olarak normalize edecek; `X Grand Prix in Y` kalıplarını ve Türkçe karşılıklarını tam eşleştirecek. `circuitName()` yerelleştirme yardımcısı eklenecek (`Sepang International Circuit` → `Sepang Uluslararası Pisti`).
  - [x] **P1.3 Sepang Pist Haritası (SVG) ve Bilgileri (Facts):** `assets/f1-circuits/f1-circuits.geojson`'daki `my-1999` koordinatlarından `public/circuits/my-1999.svg` üretilecek; `lib/assets/f1-icons.ts` `CIRCUIT_ID_TO_SVG` sözlüğüne `sepang: 'my-1999.svg'` eklenecek; `data/circuits/facts.ts` ve `facts.tr.ts`'e Sepang eklenecek (boş `CIRCUIT` kutusu ortadan kalkacak).

- [x] **FAZ 2 — Arayüz, Grid ve Katman Çakışması Düzeltmeleri (Öncelik 2)**
  - [x] **P2.1 Noktalı Büyük "İ" (Dotted I) Problemi Giderilmesi:** İngilizce arayüzde `IN` kelimesinin `İN` olmasına yol açan CSS `uppercase` yerine veya öncesinde JavaScript `toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US')` dönüşümü ve açık `lang` izolasyonu uygulanacak (`BAHRAIN GRAND PRIX IN MALAYSIA`, `SPEC // HAM`).
  - [x] **P2.2 Analitik Onay Banner Çakışması (Overlay Conflict):** `components/consent/AnalyticsConsent.tsx` masaüstünde sol sütundaki puan durumu, kariyer dökümü ve yasal metinleri örtmeyecek şekilde sağ alt köşeye (`md:right-6 md:left-auto md:bottom-6`) konumlandırılacak ve sayfa altlarına yeterli koruma padding'i (`pb-24`) eklenecek.
  - [x] **P2.3 ApexFallback Görsel Tasarım İyileştirmesi:** `components/media/ApexFallback.tsx` içindeki kaba `CAR`, `DRIVER`, `CIRCUIT` metin yer tutucuları yerine takım renkleriyle uyumlu, teknik tipografik monogram rozeti ve CAD blueprint dokusu verilecek; "eksik görsel hatası" değil kasıtlı teknik tasarım olarak görünecek.
  - [x] **P2.4 Sezon ve Haberler Kart Kırpılma / Hizalama:** `components/season/HorizontalRaceStrip.tsx` yarış kartlarındaki taşmalar ve `components/news/` ikincil manşet kartı görsel/metin en-boy oranları sıkışmayı önleyecek şekilde dengelenecek.
  - [x] **P2.5 "Tarihte Bugün" Hiyerarşi Ayrımı:** `components/home/OnThisDayCard.tsx`'teki arşiv bağlamı (`ARCHIVE // ON THIS DAY` / `F1 ARŞİVİ // TARİHTE BUGÜN`) güçlendirilerek güncel sezon akışından net bir şekilde ayrıştırılacak.

- [x] **FAZ 3 — Yerelleştirme ve Dil Bütünlüğü (Öncelik 3)**
  - [x] **P3.1 Türkçe Modu Çeviri Bütünlüğü:** Ana sayfa hero'sunda yarış ve pist isimlerinin Türkçe karşılıklarının kullanılması; haber akışında TR modunda `titleTr`/`summaryTr`'nin önceliklendirilmesi; sözlük ve gizlilik sayfalarında dil kontrollerinin doğrulanması.

- [x] **FAZ 4 — Doğrulama ve Ekran Görüntüleri Yenileme (Öncelik 4)**
  - [x] **P4.1 Test ve Tip Kontrolleri:** `npm test`, `npx tsc --noEmit`, `npm run lint`.
  - [x] **P4.2 Yerel Sunucu Ekran Görüntülerinin Yenilenmesi:** Düzeltmeler sonrası 14 temel sayfa yeniden Chromium ile fotoğraflanacak ve `teshis.md`'deki tüm maddelerin çözüldüğü kanıtlanacak.

## Teknik Borç

