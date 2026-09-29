# Anthology (Apex) — Master Plan

> Agent'ın tek plan kaynağı. Yeni iş buraya madde eklenir, bitince `[x]` işaretlenir.
> Eski detaylı faz geçmişi: `docs/PLAN.md` (2026-06-26 snapshot).
>
> **Canlı:** https://project-anthology-five.vercel.app
> **Son güncelleme:** 2026-07-04

---

## Mevcut Durum (Brownfield)

| Alan | Durum |
|---|---|
| Web backend + veri katmanı | ✅ Çalışıyor (Supabase, 3 cron + notify) |
| Web frontend | 🟡 Bileşenler var; tasarım dili onaylandı — mobil responsive fix + home refactor sırada |
| Mobil (Expo 56) | ✅ 5 tab + detay ekranları; EAS build boyutu sorunu açık |
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
- [ ] WEB-UI.4: Tablet breakpoint (md)
- [ ] WEB-UI.5: Season sayfası layout (Visual Companion Faz 3)
- [ ] WEB-UI.6: Liste şablonu (drivers, teams, circuits, news, anthology, glossary)
- [x] WEB-UI.6b: News editoryal redesign (1+2 manşet, sticky filtre, Wire telemetry, Load More)
- [x] WEB-UI.6c: Tech Glossary dossier redesign (arama, lastik telemetry, bento terimler)
- [x] WEB-UI.6d: Grid paddock garage (tek takım paneli, TBA koltuk, constructor/driver görünüm)
- [x] WEB-UI.7a: Team detay — garage hero, constructor pulse, lineup H2H, kompakt news
- [ ] WEB-UI.7: Detay şablonu (driver, team, circuit, story)
- [ ] WEB-UI.8: Lighthouse (LCP ≤2.5s, CLS <0.1, a11y ≥95)

### 🤖 WEB-PERF — Preview CSP + ana sayfa TTFB

- [x] WEB-PERF.1: CSP `font-src` + `https://vercel.live` (Toolbar Geist); home Suspense streaming; Wire `getLatestNews` (canlı RSS yok); image `deviceSizes` 1920 tavan

### 🤖 VERİ-GÜNCELLİK

- [x] **Tam F1 tarihi backfill (1950–2026):** `seed:f1db` prod Supabase'e karşı 1950–2017 aralığı için çalıştırıldı (2018–2026 zaten doluydu). Doğrulama: 77/77 sezon, her sezonda calendar+results+standings, 0 hata. `scripts/seed-f1-history.ts` varsayılanı artık `F1_SEASON_MIN` (1950), `--from 2018` gibi eski dar aralık değil. — 2026-09-28
- [x] Pilot numarası otomasyonu: `DriverStandingRow.permanentNumber` artık canlı Ergast/Jolpica'dan geliyor (`lib/f1/mrdata.ts`), `carNumberFor()` önce buna bakıyor — yeni bir pilot standings'e girer girmez numarası otomatik görünüyor, `data/drivers/index.ts`'e elle satır eklemek gerekmiyor (lore/bio metni hâlâ editöryel, opsiyonel). — 2026-09-28
- [ ] 2026 sezon snapshot Jolpica ile kalıcı DB doldurması
- [~] Push bildirim cron: endpoint `/api/cron/notify-sessions` canlıda (401 auth OK), `notified_sessions` tablosu uygulandı. GitHub Actions (`notify-sessions.yml`) 10dk'da bir tetikliyor — canlı uçtan-uca test (gerçek bir seans penceresinde bildirim gitti mi) sıradaki yarış haftasında yapılmalı.
- [x] GitHub Actions `sync-f1-race-aware.yml` saatlik schedule yeniden açıldı (repo secret `CRON_SECRET_KEY` + var `SITE_URL` tanımlandı) — 2026-09-28. FP1/FP2/quali/sprint/race sonrası due-window tetiklemesi artık aktif.

### 🌐 I18N — Çoklu dil mimarisi (EN + TR)

- [x] Mimari plan hazırlandı: `docs/plans/i18n-architecture.md` (next-intl, `/tr` prefix, mesaj sistemi, SEO/hreflang, dil değiştirici gereksinimi, anthology içerik şema önerisi) — 2026-09-28
- [x] Uygulama (antigravity) — Faz 0-5 tamam (next-intl, `app/[locale]/` route taşıma, mesaj sistemi, dil değiştirici, SEO/hreflang) — 2026-09-29
- [ ] Faz 6 (QA — Lighthouse a11y tekrar ölçümü, tam TR/EN manuel gezinme) hâlâ açık

### 🤖 CANLI-TAKİP — Anlık yarış takip ekranı

- [x] `/api/live-timing`: OpenF1 `session_key=latest` proxy'si (position + interval + driver merge), rate-limited, `live: boolean` hesaplar (session penceresi + 10dk grace). — 2026-09-28
- [x] `LiveRaceTracker` (client, 12sn polling) — home hero'da `RACE_LIVE_WINDOW_MS` içindeyken `Countdown` yerine gösterilir; pozisyon + takım rengi + interval. — 2026-09-28
- [x] **Yük/ölçek denetimi (2026-09-28):** `Cache-Control: no-store` kullanıyordu — 100 eşzamanlı izleyici = 100 ayrı OpenF1 çağrısı riski (OpenF1 limiti 3 req/s TOPLAM). Düzeltildi: edge cache (`s-maxage=5`) + in-memory stampede guard + 8sn sert zaman aşımı (OpenF1 yavaşlarsa adaptörün kendi retry/backoff zinciri worst-case ~130sn'ye kadar fonksiyonu tıkayabilirdi, artık zaman aşımında stale cache'e düşüyor).
- [ ] Gerçek canlı yarışta uçtan-uca doğrulama (OpenF1 canlı seans sırasında manuel test) — sıradaki yarış haftasında yapılmalı
- [ ] Round detay sayfasına (`app/season/[year]/round/[n]/page.tsx`) da canlı tracker eklenmesi değerlendirilebilir

### 🖼️ GÖRSEL-TELİF — Fotoğrafsız politika (2026-09-28)

- [x] **Kritik telif riski giderildi:** Pilot portreleri (`assets/asset-package/2026-drivers/*`), takım logoları, araç render'ları, pist hava fotoğrafları — hepsi kaynağı/lisansı belgesiz gerçek fotoğraf/marka varlığıydı, prod'da yayındaydı. Tamamı kaldırıldı: `public/drivers`, `public/teams`, `public/cars`, `public/circuit-images`, `public/circuits/*.png` (orphan kopyalar), `assets/asset-package/`, ilgili artık-gereksiz script'ler (`sync-asset-package.mjs`, `generate-drivers.mjs`, `audit-missing-assets.ts`, `normalize-driver-slugs.ps1`).
- [x] `lib/assets/f1-icons.ts`: `driverIconSrc`/`teamIconSrc`/`carSrc`/`circuitCoverSrc` artık hep `null` (stabil API, çağıran taraflarda değişiklik gerekmedi). `circuitIconSrc` korundu (MIT lisanslı pist rota geometrisi, fotoğraf değil).
- [x] `components/media/ApexFallback.tsx` yeni birincil görsel: canlı veriden (isim/kod → baş harf, `--team-secondary` CSS değişkeni) rozet üretir — ek asset/API/maliyet yok, yeni pilot/takım için otomatik çalışır. `kind: 'team'` eklendi.
- [x] `DriverMachineryCard`, `ProfileHero`, `TeamGarageHero`, `GarageTeamPanel`'deki eski `{logo ? <ApexImage kind="media"/> : null}` null-guard'ları kaldırıldı, `kind="team"` + `fallbackLabel={teamName}` ile her yerde rozet gösteriyor.
- [ ] Efendim onaylamadı ama değerlendirilebilir: pist "kapak" görseli için `circuitIconSrc`'in gerçek MIT'li rota çizimini hero/kapak olarak kullanmak (şu an sadece küçük "track map" olarak kullanılıyor, kapak tamamen boş/gradient).
- [x] **Tasarım brief'i antigravity'ye teslim edildi ve uygulandı:** `docs/plans/driver-hero-visual-redesign.md` — `DriverProfileHero.tsx` sağ-kesit alanına `DriverHeroGraphic` (takım DNA dokusu, monumental kondanse tipografik heykel, CAD blueprint çerçevesi ve yarış numarası rozeti) eklendi; sıfır telif/AI riskiyle tamamen veri-güdümlü olarak çalışıyor. `tests/driver-hero.test.ts` eklendi, build ve testler yeşil. — 2026-09-29

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

## Teknik Borç

| Madde | Tetik |
|---|---|
| 2025 eksik driver SVG (tsunoda, lawson) | AssetFallback OK (artık zaten fotoğrafsız politika var, madde geçersiz) |
| `public/stories/` stray klasörler | Silinebilir |
| Playwright e2e suite | Lighthouse/a11y otomasyonu |
| Upstash env Vercel'de | `UPSTASH_REDIS_REST_URL` + `_TOKEN` |

---

## Referans

| Dosya | İçerik |
|---|---|
| `docs/reference/proje-dizini.md` | Dizin haritası |
| `docs/reference/mimari.md` | Backend mimarisi |
| `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` | Tuzaklar + kararlar |
| `docs/vision/technical.md` | Agent teknik özet |
| `docs/design/apex-design-language.md` | Apex özel tasarım dili (onaylı kararlar) |
| `docs/design/design.md/` | Genel tasarım prensipleri |

## Haber hikâyeleri: birleştirme + özgün yazım (2026-09-29)
- [x] Pist konumu + saat dilimi DB'de (`circuits.data.location`), statik veriden bağımsız
- [x] Kümeleme (`lib/news/cluster.ts`), yeniden yazım (`rewrite.ts`, telif koruması), pipeline (`stories.ts`), sync-news yeniden yazıldı, okuma katmanı `news_stories`'tan okuyor, testler (177/177)
- [ ] **Manuel — Efendim:** `supabase/migrations/20260929000004_news_stories.sql` Supabase SQL Editor'de çalıştırılacak
- [ ] **Manuel — Efendim:** ücretsiz `GEMINI_API_KEY` (aistudio.google.com/apikey) `.env.local`'e (ve Vercel env'e) eklenecek; yedek: `GROQ_API_KEY`
- [ ] sync-news'i 30 dk'da bir çalıştıran GitHub Actions workflow'u (Vercel Hobby günde 1 cron) — deploy aşamasında
- [ ] antigravity devir planı: `docs/plans/news-stories-ui-handoff.md` (arka plan özeti + arayüz görevleri + kalite kapıları)
- [ ] antigravity: haber detay sayfasında `item.sourceLinks` ile kaynak listesi + linkler; görselsiz hikâyede kapak alanı gizlenir (placeholder yok); `lib/news/voice.ts` tonunu ev sesine göre ince ayar

