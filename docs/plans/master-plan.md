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

### 🐛 UI-BUGS — antigravity kuyruğu (2026-09-29, tespit edildi, dokunulmadı)

- [ ] **Season sayfası tablet (768px) kırık:** "2026" başlığı ve P2 kartı ekran dışına taşıyor, kaydırma ile erişilemiyor (içerik DOM'da var, görünmüyor). Race Calendar şeridi (R4-R23) aynı şekilde taşıyor. P1/P2 arka plan "hayalet numara" efekti isim/puan metniyle çakışıp okunmaz oluyor. `app/[locale]/season/page.tsx` + `components/season/HorizontalRaceStrip.tsx`/`SeasonTimeline.tsx` (`md:` sınıfı yok) — masaüstünde/mobilde sorun yok, sadece 768px bandı.
- [ ] **Mojibake (bozuk karakter) — kesin kaynak bulundu:** `components/season/HorizontalRaceStrip.tsx` satır 76, 109, 131, 132 — kaynak dosyada kelimenin tam ortasına `Â·` ve `â€”` bayt dizisi gömülü (çalışma zamanı hatası değil, dosyaya yanlış encoding ile kaydedilmiş). `·`→`Â·`, `—`→`â€”` olarak düzeltilmeli. (`app/globals.css` ve `PosterHero.tsx:17`'de de var ama onlar sadece kod yorumu, kullanıcıya görünmüyor — düşük öncelik.)
- [ ] **Anthology kart kapak görselleri siyah görünüyor:** Dosyalar diskte gerçekten var ve doğru path'e işaret ediyor (`public/stories/{slug}/landscape/01.png` — kontrol edildi, eksik asset değil). `components/anthology/StoryCard.tsx`'teki `opacity-55` + gradient overlay yığılması render'da resmi tamamen kapatıyor gibi görünüyor — görsel/CSS hata ayıklaması gerekiyor.

### 🤖 MOBİL-OTA (EAS build sonrası)

- [ ] Cihazda Expo Go / preview test
- [ ] App Store / Google Play hesap (manuel)
- [ ] Production build + `eas submit`

---

## Teknik Borç

| Madde | Tetik |
|---|---|
| GitHub Actions race-aware hourly cron | Billing + `CRON_SECRET_KEY` secret |
| Pit-stop verisi | Ayrı kaynak gerekli |
| 2025 eksik driver SVG (tsunoda, lawson) | AssetFallback OK |
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
