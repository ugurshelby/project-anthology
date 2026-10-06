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
| **Birim & Entegrasyon Testleri** | ✅ 30 Test Dosyası, 232 Test Başarılı | `npx vitest run` (14.5s, 0 hata, %100 yeşil) |
| **Statik Tip Güvenliği** | ✅ Sıfır Tip Hatası | `npx tsc --noEmit` (kod 0) |
| **Kod Stili & Linter** | ✅ Sıfır Hata | `npm run lint` (0 error, 15 warnings, kod 0) |
| **Web Production Build** | ✅ 34/34 Sayfa ve Rota Derlendi | `npm run build` (Next.js Turbopack, kod 0) |
| **Veri Katmanı & Fallback** | ✅ Supabase + Jolpica Fallback + F1DB | DB → Cache → Live Proxy kademeli okuma devrede |
| **Görsel & Varlık Altyapısı** | ✅ 64 Varlık Yolu Denetlendi, 0 Kırık Yol | `public/brand/`, `public/circuits/` (25 SVG), `public/tyres/` (11 SVG), `public/glossary-icons/` (20 WebP), `public/stories/` (56 PNG) |
| **Tasarım Sistemi Orkestrasyonu** | ✅ Tamamlandı | `apex-design.md`, `tokens.json`, 5 katmanlı `skills/` |
| **Mobil Uygulama (Expo 56)** | ⚠️ Beklemede | `mobile/` diskte mevcut, gitignored; sahip incelemesi bekliyor |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Açık İşler: Önem Sırasına Göre Faz Planı

---

### ⏱️ Faz 1: Kusursuz Saat — Veri Mimarisi, Canlı Senkronizasyon & Caching
*Vizyonun 1. önceliği: Arka planda saat gibi işleyen harmonik veri mimarisi ve sıfır gecikmeli yanıt.*

- [ ] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması:**
  - `lib/f1Calendar.ts` yarış haftası moduna (`RACE_LIVE_WINDOW_MS`) girdiğinde, `components/home/LiveRaceTracker.tsx` ve `/api/live-timing` rotasının dinamik kenar önbellek (`Cache-Control: s-maxage=3, stale-while-revalidate=9`) ve stampede guard ile çalışmasının gerçek bir seans simülasyonunda uçtan uca doğrulanması.
- [ ] **1.2 2026 Sezon Snapshot Kalıcı DB Doldurması:**
  - 2026 sezonu Jolpica verilerinin `f1_snapshots` tablosunda kalıcı ve eksiksiz doldurulması (`calendar`, `standings_drivers`, `standings_constructors`, `results`).
- [ ] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger:**
  - Statik tarih verisi (1950–günümüz) SQLite/JSON bundle veya Supabase DB'den okunurken; canlı sezon puan durumu ve grid verisinin yarış tamamlandığında tek seferlik idempotent event-trigger ile DB'ye snapshotlanması. Kullanıcının harici API yanıt süresine asla maruz bırakılmaması.
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması:**
  - `/api/cron/notify-sessions` canlıda (401 guard OK), `notified_sessions` tablosu devrede. Sıradaki yarış hafta sonunda seans başlangıç penceresi bildirim tetiklemesinin canlıda doğrulanması.

---

### 🏁 Faz 2: Yaşayan Sezon, Grid & Telemetri Dinamikleri
*Vizyonun 2. önceliği: Kullanıcının sezonun nabzını tutabileceği, grid ve yarış dinamiklerini derinlemesine görebileceği arayüz.*

- [ ] **2.1 Grid Pozisyon Değişim Deltası (+/-):**
  - `app/[locale]/season/[year]/round/[n]/page.tsx` altındaki `RaceResultsTable` bileşeni için `lib/f1/mrdata.ts` modeline `grid` pozisyonunun eklenmesi; grid başlangıç pozisyonu ile yarış bitiş derecesi arasındaki sıra farkının (`+3`, `-2`, `NC`) görselleştirilmesi.
- [ ] **2.2 Şampiyona Puan İlerleme Grafiği (Progression Trajectory):**
  - Yarışlar ilerledikçe şampiyonluk yarışındaki pilotların kümülatif puan salınımını ve liderlik değişimlerini gösteren etkileşimli, responsive SVG eğri grafiği (`SeasonProgressionChart`).
- [ ] **2.3 Takım İçi Pilot Düellosu (Head-to-Head):**
  - Grid sayfasında (`app/[locale]/grid`) takım arkadaşları arası Sıralama (Quali H2H) ve Yarış (Race H2H) kıyaslama telemetrisi (GarageTeamPanel içine H2H barı).
- [ ] **2.4 Ana Sayfa Sezon Renk Senkronizasyonu:**
  - `HomeWireFeed` ve ilgili kartların geçmiş sezon seçildiğinde o sezonun takımlarının renk bağlamıyla eşleşmesi.

---

### 🏎️ Faz 3: Pist Sayfaları ve Topoğrafik Derinlik
*Vizyonun 3. önceliği: Motor sporları mirasını pistlerin coğrafi, teknik ve tarihi derinliğiyle aktarmak.*

- [ ] **3.1 Pist Kapak Görseli ve Rota Çizimi Entegrasyonu:**
  - `app/[locale]/circuits/[id]/page.tsx` içindeki `circuitCoverSrc` boşluğu (null) yerine MIT lisanslı rota çizimi (`circuitIconSrc`) ve yüksek çözünürlüklü teknik CAD sektör şemasının kapak/hero olarak konumlandırılması.
- [ ] **3.2 Pist Telemetrisi ve İrtifa Profili:**
  - İrtifa farkı (elevation profile: Spa Eau Rouge, Spielberg T3 vb.), fren sertliği derecesi, DRS aktivasyon bölgeleri ve hız tuzakları panelinin `data/circuits/facts.ts` ve UI'a eklenmesi.
- [ ] **3.3 Pist Efsane Anları (Lore Kartları):**
  - O pistte gerçekleşmiş tarihi dönüm noktalarının (Senna Monaco 1988, Häkkinen Spa 2000 üçlü geçişi vb.) editoryal kartlar olarak pist detay sayfasına eklenmesi.

---

### ⚙️ Faz 4: Machinery — İkonik Araçlar Koleksiyonu
*Vizyonun 4. önceliği: Formula 1'in ikonik şasi, motor ve mühendislik şaheserlerini sergileyen vitrin.*

- [ ] **4.1 Machinery Veri Modülü ve Sayfa Mimarisi:**
  - Ferrari F2004, McLaren MP4/4, Williams FW14B, Brawn BGP 001, Lotus 72, Red Bull RB19 için `data/machinery/` veri modeli ve `/machinery` vitrin sayfası.
- [ ] **4.2 Mühendislik Dehası ve CAD Silüetleri:**
  - Araçların teknik atılımları (çift difüzör, aktif süspansiyon, zemin etkisi), motor mimarisi ve telifsiz CAD tel kafes çizimleri.
- [ ] **4.3 Çapraz Bağlantılar:**
  - Araç detay sayfalarının ilgili pilot, takım, sezon ve teknik sözlük (Glossary) maddeleriyle çift yönlü bağlanması.

---

### 📖 Faz 5: Tech Glossary 2.0 (Regülasyonlar ve Çağlar)
*Vizyonun 5. önceliği: Teknik kuralların sporu nasıl şekillendirdiğini gösteren eğitici arşiv.*

- [ ] **5.1 "Regülasyonlar Çağları Nasıl Değiştirdi?" Modülü:**
  - Kural değişikliklerinin araç dinamiğine etkileri (1994 aktif süspansiyon yasağı, 2009 çift difüzör, 2014 turbo-hibrit, 2022 zemin etkisi ve yunuslama).
- [ ] **5.2 Lastik Fiziği ve Termal Pencereler:**
  - C1–C5 hamurlarının çalışma sıcaklıkları (working window: örn. 100–125°C), termal aşınma, kabarcıklanma (blistering) ve granüllenme (graining) dinamiklerinin son kullanıcıya aktarımı.
- [ ] **5.3 Dinamik Sözlük Köprüleri:**
  - Teknik terimlerin hikaye, yarış ve araç sayfalarında otomatik vurgulanıp sözlüğe linklenmesi.

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals
*Vizyonun 6. önceliği: Ürünün arama motorlarında kusursuz indekslenmesi ve performans tescili.*

- [ ] **6.1 Structured Data (JSON-LD) Doğrulaması:**
  - Sayfalara yerleştirilmiş `SportsEvent`, `Person`, `SportsTeam` şemalarının schema validator ve Search Console ile doğrulanması; mutlak `og:image` boyut ve fallback kontrolleri.
- [ ] **6.2 Core Web Vitals & Lighthouse Baseline:**
  - Canlı prod ortamında LCP (<2.5s), INP (<200ms) ve CLS (<0.1) performans eşiklerinin ölçülerek tescillenmesi.
- [ ] **6.3 Sentry ve Hata Gözlemlenebilirliği:**
  - Build sırasındaki `Project not found` Sentry kaynak haritası yapılandırmasının düzeltilmesi veya sessize alınması; prod hata yakalama/alert akışının doğrulanması.

---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem
*Sahip kararları ve yasal netleştirme gerektiren maddeler.*

- [ ] **7.1 `public/stories` 56 Görselin Lisans Manifestosu:**
  - Kalan 56 hikaye görselinin açık lisans kayıtlarının (Public Domain / CC-BY) tamamlanması veya alternatif teknik illüstrasyonlarla güncellenmesi (sahip kararı).
- [ ] **7.2 Editoryal İnceleme (Sahip):**
  - Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinleri (`data/history/team-dna.ts`).
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
