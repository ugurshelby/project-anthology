# Anthology (Apex) — Master Plan

> **Temel Otorite ve Tek Canlı İş Listesi:** Bu döküman doğrudan geliştirici vizyonu ve direktifleri doğrultusunda oluşturulmuş en temel operasyonel rehberdir. Projedeki tüm planlama, geliştirme ve bakım adımları bu liste üzerinden yürütülür.  
> Bir madde yalnızca kodda veya ölçülmüş bir çalışma sonucunda doğrulandığında `[x]` olarak işaretlenir. Tamamlanan planlar ve süreçler geçmiş git kayıtlarına devredilir; dökümanda yalnızca aktif açık işler yer alır.  
> **Temel Vizyon Belgesi:** `docs/vision/apex-vision.md`  
> **Tasarım Sistemi Mimarisi:** `docs/design/apex-design.md` (Apple tasarım felsefesi + F1 teknik kimlik sentezi)  
> **Canlı Canlı Referans & Ölçümler:** `docs/reference/apex-reference.md`  
> **Canlı Host:** https://project-anthology-eight.vercel.app  
> **Son Güncelleme & Ölçüm:** 2026-10-06  

---

## 1. Vizyon ve Misyon

* **Vizyon (Nereye Ulaşmak İstiyoruz?):** Motor sporları tutkusunu ve zengin Formula 1 mirasını; arka planda saat mekanizması hassasiyetinde çalışan harmonik bir veri mimarisiyle, gecikmesiz, akıcı, modern ve editoryal derinliği yüksek bir arayüzde birleştiren; F1 kültürünün küresel ölçekteki dijital başvuru ve deneyim merkezi olmak.
* **Misyon (Bunu Nasıl ve Ne İnşa Ederek Yapıyoruz?):** 1950'den günümüze tüm F1 verisini, yarış takvimlerini, teknik düzenlemeleri, ikonik araçları ve insan hikayelerini; telif riski barındırmayan temiz görsel varlıklar, yüksek performanslı web mimarisi (sıfır takılma, kusursuz edge caching) ve ödün vermeyen bir kullanıcı deneyimi ile erişilebilir kılmak.

---

## 2. Mevcut Doğrulanmış Durum (Tüm Katmanların Ölçülmüş Gerçekliği)

| Katman | Ölçülen Durum | Kanıt & Metrik |
| :--- | :--- | :--- |
| **Birim & Entegrasyon Testleri** | ✅ 36 Test Dosyası, 278 Test Başarılı | `npx vitest run` (17.4s, 0 hata, %100 yeşil) |
| **Statik Tip Güvenliği** | ✅ Sıfır Tip Hatası | `npx tsc --noEmit` (kod 0) |
| **Kod Stili & Linter** | ✅ Sıfır Hata | `npm run lint` (0 error, 15 warnings, kod 0) |
| **Web Production Build** | ✅ 48/48 Sayfa ve Rota Derlendi | `npm run build` (Next.js Turbopack, kod 0) |
| **Veri Katmanı & Fallback** | ✅ Supabase + Jolpica Fallback + F1DB | DB → Cache → Live Proxy kademeli okuma devrede |
| **Görsel & Varlık Altyapısı** | ✅ 64 Varlık Yolu Denetlendi, 0 Kırık Yol | `public/brand/`, `public/circuits/` (25 SVG), `public/tyres/` (11 SVG), `public/glossary-icons/` (20 WebP), `public/stories/` (56 PNG) |
| **Tasarım Sistemi Orkestrasyonu** | ✅ Tamamlandı | `apex-design.md`, `tokens.json`, 5 katmanlı `skills/` |
| **Mobil Uygulama (Expo 56)** | ⚠️ Beklemede | `mobile/` diskte mevcut, gitignored; sahip incelemesi bekliyor |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Açık İşler: Önem Sırasına Göre Faz Planı

> Doğrulanıp tamamlanan maddeler (1.2, 2.1, 2.2, 3.1–3.3, 4.1–4.2, 5.1–5.2) bu listeden silindi; kanıtları `logs/2026-10-06.md` ve git geçmişindedir. Burada yalnızca açık (`[ ]`) ve kısmi (`[~]`) işler kalır.

---

### ⏱️ Faz 1: Kusursuz Saat — Veri Mimarisi, Canlı Senkronizasyon & Caching
*Vizyonun 1. önceliği: Arka planda saat gibi işleyen harmonik veri mimarisi ve sıfır gecikmeli yanıt.*

- [~] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması:**
  - Doğrulandı: `/api/live-timing` rota simülasyonu (`tests/live-timing-route.test.ts`, 10 test): canlı pencere + 10 dk bitiş toleransı, `Cache-Control: public, s-maxage=5, stale-while-revalidate=15`, 25 eşzamanlı istek → 1 upstream turu (stampede guard), 5 sn TTL memo, upstream hata / 8 sn zaman aşımında son iyi sonucun sunulması, 502 (genel gövde) ve 429 (`Retry-After`) yolları. OpenF1 `sessions?session_key=latest` canlı probu: HTTP 200, 1.4 sn (2026-10-06; son seans 2026-10-04 Race, bitmiş → rota `live:false` döner).
  - Açık: gerçek bir yarış hafta sonunda canlı seansla `LiveRaceTracker` + rotanın uçtan uca gözlemi. (Eski plan metnindeki `s-maxage=3 / swr=9` koddan farklıydı; kod ve `apex-reference.md` `5 / 15` — OpenF1'in paylaşımlı 3 req/sn bütçesi — olarak doğrulandı.)
- [~] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger:**
  - Doğrulandı: `sync-f1` yerleşmiş (settled) snapshot'ı yeniden çekmiyor. Jolpica kaynaklı bir satır, due penceresinden ≥ 24 sa sonra çekildiyse final sayılır (`isSnapshotSettled`, `loadSnapshotFetchTimes`); yalnızca `source='jolpica'` satırları sayılır (F1DB placeholder'ı asla settled olmaz), DB okunamazsa her şey çekilir (fail-open), ertelenen yarış otomatik settled olmaktan çıkar, sonuç ve pit stop ayrı kapılanır, `?force=1` hepsini zorlar, yanıtta `settled` sayacı döner. Testler: `tests/sync-f1-idempotent.test.ts` (11 test).
  - Açık (sahip kararı): okuma yolu güncel sezonda DB satırı bayatsa hâlâ canlı Jolpica proxy'sine düşüyor (`lib/data/f1.ts`, `lib/f1/snapshotStaleness.ts`) — tazelik gecikmeye tercih edilmiş. "Kullanıcı dış API süresine asla maruz kalmasın" için seçenek: bayat DB satırını hemen sun, arka planda yenile.
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması:**
  - `/api/cron/notify-sessions` canlıda (401 guard OK), `notified_sessions` tablosu devrede. Sıradaki yarış hafta sonunda seans başlangıç penceresi bildirim tetiklemesinin canlıda doğrulanması.
- [ ] **1.5 Tarihsel Takvim Snapshot'larının Yeniden Tohumlanması (sahip onayı gerekir):**
  - Ölçüm (canlı, 2026-10-06): `/api/season/{yıl}` — 2022, 2024 ve 2025 takvimlerinde `raceName`, `circuitName`, `locality`, `country` **tüm yarışlarda boş** (22/22, 24/24, 24/24); 2026 (Jolpica) boş yok. Etki: tarihsel tur sayfaları boş başlık/`<h1>` (`/season/2025/round/3` → `<title>` ` 2025 | Apex`), tur `SportsEvent` JSON-LD'sinde boş `name`/`location`. Yerelde de doğrulandı (`/tr/season/2025/round/1` → `<h1>` boş).
  - Kök neden: F1DB adaptörü var olmayan `race.name` / `race.circuit.*` alanlarını okuyordu (F1DB `races[]` yalnızca `grandPrixId` / `circuitId` referansı taşır). Kod düzeltildi: `lib/f1/sources/f1db.ts` (`grandsPrix` / `circuits` / `countries` lookup'ları, `Qualifying` ve `Sprint` slotları, `HH:mm` → `HH:mm:ssZ`), `tests/f1db-adapter.test.ts` (5 test).
  - Açık: düzeltmenin canlı DB'ye uygulanması. Sahip onayıyla: `npm run seed:f1db` (varsayılan 1950–güncel, idempotent, `--dry-run` destekli; `.env.local` gerektirir). Sonrasında doğrulama: `/api/season/2025` boş isim sayısı 0.

---

### 🏁 Faz 2: Yaşayan Sezon, Grid & Telemetri Dinamikleri
*Vizyonun 2. önceliği: Kullanıcının sezonun nabzını tutabileceği, grid ve yarış dinamiklerini derinlemesine görebileceği arayüz.*

- [~] **2.3 Takım İçi Pilot Düellosu (Head-to-Head):**
  - Hazır: `getSeasonHeadToHead(year)` (`lib/data/f1.ts`, `lib/f1/headToHead.ts`; `tests/head-to-head.test.ts`, 6 test) takım bazında gerçek Sıralama ve Yarış H2H sayımını verir (iki toplu sorgu, upstream çağrısı yok).
  - Açık (frontend): `GarageTeamPanel`'deki `TeammateHeadToHead` şu an şampiyona puanı/sırasına göre; grid sayfası `getSeasonHeadToHead` ile beslenip Quali / Race skorunu göstermeli.
- [~] **2.4 Ana Sayfa Sezon Renk Senkronizasyonu:**
  - `HomeWireFeed` `season` prop'unu destekliyor, ancak tek çağrı yeri (`app/[locale]/page.tsx`) `season` geçirmiyor ve ana sayfada geçmiş sezon seçimi akışı yok → davranış henüz erişilebilir değil. Açık (frontend/ürün): hangi akışta geçmiş sezon bağlamı verileceğine karar verip prop'u bağlamak.

---

### ⚙️ Faz 4: Machinery — İkonik Araçlar Koleksiyonu
*Vizyonun 4. önceliği: Formula 1'in ikonik şasi, motor ve mühendislik şaheserlerini sergileyen vitrin.*

- [~] **4.3 Çapraz Bağlantılar:**
  - Araç detay sayfaları sözlüğe (`/tech-glossary?q=`) ve diğer sayfalara bağlı, `/machinery` ana navigasyon ve footer'da. Açık: ters yön yok — pilot / takım / sezon sayfalarından `/machinery/[id]`'ye bağlantı bulunmuyor.

---

### 📖 Faz 5: Tech Glossary 2.0 (Regülasyonlar ve Çağlar)
*Vizyonun 5. önceliği: Teknik kuralların sporu nasıl şekillendirdiğini gösteren eğitici arşiv.*

- [~] **5.3 Dinamik Sözlük Köprüleri:**
  - Araç sayfası terim çipleri sözlük aramasına bağlı. Açık: terimlerin hikaye ve yarış sayfalarında otomatik vurgulanıp sözlüğe linklenmesi yok.

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals
*Vizyonun 6. önceliği: Ürünün arama motorlarında kusursuz indekslenmesi ve performans tescili.*

- [~] **6.1 Structured Data (JSON-LD) Doğrulaması:**
  - Ölçüm (canlı, 2026-10-06): ana sayfa `WebSite`; sürücü `Person`, takım `SportsTeam`, tur `SportsEvent` ve hikâye `Article` JSON-LD'leri mevcut ve parse ediliyor. Kusurlar: (a) tarihsel tur `SportsEvent`'inde `name`, `location.name`, `addressLocality`, `addressCountry` boş (kök neden 1.5); (b) ana sayfada `og:image` yoktu → `app/[locale]/page.tsx` metadata'sına `/opengraph-image` eklendi, yerelde doğrulandı.
  - `lib/seo.ts`'e `sportsEventJsonLd` / `vehicleJsonLd` kurucuları eklendi (Machinery detayı `Vehicle` basıyor, yerelde doğrulandı); `sportsEventJsonLd` tur sayfasına bağlı değil (sayfa hâlâ satır içi nesne kullanıyor) ve zorunlu alan koruması yok.
  - Açık: tur sayfasını `sportsEventJsonLd`'ye bağlayıp zorunlu alan boşken JSON-LD basmamak; schema validator + Search Console doğrulaması (sahip erişimi).
- [ ] **6.2 Core Web Vitals & Lighthouse Baseline:**
  - Canlı prod ortamında LCP (<2.5s), INP (<200ms) ve CLS (<0.1) performans eşiklerinin ölçülerek tescillenmesi.
- [~] **6.3 Sentry ve Hata Gözlemlenebilirliği:**
  - Düzeltildi: kaynak haritası yüklenmediğinde release oluşturma kapatıldı (`next.config.ts`: `release.create` / `finalize` = `SENTRY_UPLOAD_SOURCE_MAPS=true` + token). `npm run build` çıktısında `Project not found` 0 kez (önceki build'de vardı).
  - Açık: prod'da hata yakalama / alert akışının doğrulanması (Sentry projesi `anthology-z0/project-anthology` erişimi — sahip).

---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem
*Sahip kararları ve yasal netleştirme gerektiren maddeler.*

- [ ] **7.1 `public/stories` 56 Görselin Lisans Manifestosu:**
  - Kalan 56 hikaye görselinin açık lisans kayıtlarının (Public Domain / CC-BY) tamamlanması veya alternatif teknik illüstrasyonlarla güncellenmesi (sahip kararı).
- [ ] **7.2 Editoryal İnceleme (Sahip):**
  - Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinleri (`data/history/team-dna.ts`).
  - Yeni frontend içeriği (olgusal doğruluk kaynakla doğrulanmadı): `data/circuits/lore.ts`, pist irtifa/telemetri sayıları (`CircuitElevationProfile`), `data/machinery/cars.ts`, `RegulationErasPanel`, `TyreThermalWindows` (hamur çalışma pencereleri).
- [ ] **7.3 Mobil Uygulama (Sahip):**
  - Cihazda Expo Go / preview test, App Store / Google Play süreçleri ve `mobile/` deposunun git durumu.
- [ ] **7.4 Yasal Mailbox'lar (Sahip):**
  - `privacy@`, `dmca@`, `contact@apexstats.example` yer tutucularının sahibin izlediği gerçek e-posta adresleriyle değiştirilmesi.

---

## 4. Teknik Borç ve Çevre Takibi

| Madde | Durum | Önlem / Aksiyon |
| :--- | :--- | :--- |
| **`ci.yml` (PR Kapısı)** | GitHub'da henüz koşmadı | Pull request'te test edilip required check yapılması (sahip ayarı) |
| **Yasal Mailbox'lar** | `.example` yer tutucular | Gerçek adreslerle güncellenecek (sahip kararı) |
| **Node Sürüm Uyumu** | Yerel: Node 22; `.nvmrc`: 24 | `.nvmrc` ve motor tanımları 22 ile uyumlu çalışıyor |
| **Vercel & Prod Değişkenleri** | Sentry, Upstash, Cron Secret | Prod ortam değişkenlerinin senkronizasyonu |
