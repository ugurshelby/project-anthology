# Anthology (Apex) — Master Plan

> **Tek Canlı İş Listesi:** Yeni iş buraya eklenir; kutu yalnızca kodda veya ölçümle doğrulanınca `[x]` olur.  
> Tamamlanan planlar ve işler temizlenir (geçmiş git'tedir).  
> **Temel Vizyon ve Amaç:** `docs/vision/apex-vision.md` (Tüm açık işler bu vizyona göre önceliklendirilmiştir).  
> **Ölçülmüş Durum:** `docs/reference/apex-reference.md`  
> **Tasarım Sistemi:** `docs/design/apex-design.md` + `docs/design/apex-design-language.md`  
> **Canlı Host:** https://project-anthology-eight.vercel.app  
> **Son Güncelleme:** 2026-10-06  

---

## 1. Mevcut Doğrulanmış Durum (Baseline)

| Katman | Ölçülen Durum |
| :--- | :--- |
| **Web Backend & Veri** | ✅ Çalışıyor (Supabase, Vercel cron'ları + GitHub Actions 10 dk/saatlik döngü, 1950–2026 F1DB geçmişi) |
| **Web Frontend** | ✅ 20 sayfa, 89 bileşen, EN + `/tr`; 375/768/1280 px tarayıcı denetimi tam, 0 taşma |
| **Tasarım Sistemi** | ✅ `docs/design/apex-design.md` (Apple tasarım ilkeleri sentezi) + `tokens.json` + 5 katmanlı `skills/` |
| **Mobil (Expo 56)** | ⚠️ `mobile/` diskte var, gitignored — sahip kararı bekliyor |

**Kritik Kısıt:** `lib/f1Calendar.ts` tek zamansal kaynak; sezon/pilot/takım hardcode yasaktır.

---

## 2. Açık İşler (Vizyon & Misyon Hiyerarşisine Göre Sıralı)

### ⏱️ Öncelik 1: Veri Mimarisi ve Altyapı (Kusursuz Saat Mekanizması)

- [ ] **2026 Sezon Snapshot Kalıcı DB Doldurması:** 2026 sezonu Jolpica verilerinin `f1_snapshots` tablosunda kalıcı ve eksiksiz doldurulması.
- [ ] **OpenF1 Canlı Seans Doğrulaması:** Gerçek bir yarış hafta sonu seansı sırasında `LiveRaceTracker` ve `/api/live-timing` uçtan uca akışının doğrulanması.
- [~] **Push Bildirim Canlı Doğrulaması:** `/api/cron/notify-sessions` canlıda (401 guard OK), `notified_sessions` devrede. Sıradaki yarış haftasında seans penceresi bildirim tetiklemesinin doğrulanması.

### 🏁 Öncelik 2: Yaşayan Sezon, Puan Durumu ve Grid Dinamikleri

- [ ] **Şampiyona Puan İlerleme Grafiği (Progression Trajectory):** Yarışlar ilerledikçe pilotların kümülatif puan salınımını ve liderlik değişimlerini gösteren SVG eğri grafiği.
- [ ] **Takım İçi Pilot Düellosu (Head-to-Head):** Grid sayfasında takım arkadaşları arası Sıralama (Quali H2H) ve Yarış (Race H2H) kıyaslama telemetrisi.
- [ ] **Grid Pozisyon Değişim Deltası (+/-):** Yarış sonuçlarında grid başlangıç pozisyonu ile bitiş derecesi arasındaki sıralama kazanım/kayıp farkı.
- [ ] **Ana Sayfa Sezon Renk Senkronizasyonu:** `HomeWireFeed` ve ilgili kartların geçmiş sezon seçildiğinde o sezonun renk bağlamıyla eşleşmesi.

### 🏎️ Öncelik 3: Pist Sayfaları ve Topoğrafik Derinlik

- [ ] **Pist Kapak Görseli ve Rota Çizimi Entegrasyonu:** `circuitCoverSrc` boşluğu (null) yerine MIT lisanslı rota çizimi (`circuitIconSrc`) ve yüksek çözünürlüklü teknik CAD sektör şemasının kapak/hero olarak konumlandırılması.
- [ ] **Pist Telemetrisi ve İrtifa Profili:** İrtifa farkı (elevation profile: Spa Eau Rouge, Spielberg T3 vb.), fren sertliği derecesi, DRS aktivasyon bölgeleri ve hız tuzakları paneli.
- [ ] **Pist Efsane Anları (Lore Kartları):** O pistte gerçekleşmiş tarihi anların (Senna Monaco 1988, Häkkinen Spa 2000 üçlü geçişi vb.) pist detay sayfasına eklenmesi.

### ⚙️ Öncelik 4: Machinery — İkonik Araçlar Koleksiyonu

- [ ] **Machinery Veri Modülü ve Sayfa Mimarisi:** Ferrari F2004, McLaren MP4/4, Williams FW14B, Brawn BGP 001, Lotus 72, Red Bull RB19 için `data/machinery/` veri modeli ve `/machinery` vitrin sayfası.
- [ ] **Mühendislik Dehası ve CAD Silüetleri:** Araçların teknik atılımları (çift difüzör, aktif süspansiyon, zemin etkisi), motor mimarisi ve telifsiz CAD tel kafes çizimleri.
- [ ] **Çapraz Bağlantılar:** Araç detay sayfalarının ilgili pilot, takım, sezon ve teknik sözlük (Glossary) maddeleriyle çift yönlü bağlanması.

### 📖 Öncelik 5: Tech Glossary 2.0 (Regülasyonlar ve Çağlar)

- [ ] **"Regülasyonlar Çağları Nasıl Değiştirdi?" Modülü:** Kural değişikliklerinin araç dinamiğine etkileri (1994 aktif süspansiyon yasağı, 2009 çift difüzör, 2014 turbo-hibrit, 2022 zemin etkisi ve yunuslama).
- [ ] **Lastik Fiziği ve Termal Pencereler:** C1–C5 hamurlarının çalışma sıcaklıkları (working window), termal aşınma ve granüllenme (graining) dinamiklerinin son kullanıcıya aktarımı.
- [ ] **Dinamik Sözlük Köprüleri:** Teknik terimlerin hikaye ve araç sayfalarında otomatik vurgulanıp sözlüğe linklenmesi.

### 🖼️ Öncelik 6: Telif-Güvenli Görsel Ekosistemi ve Lisans Kayıtları

- [ ] **`public/stories` 56 Görselin Lisans Manifestosu:** Kalan 56 hikaye görselinin açık lisans kayıtlarının (Public Domain / CC-BY) tamamlanması veya alternatif teknik çizimlerle güncellenmesi (sahip kararı).

### 📱 Öncelik 7: Sahip İncelemesi & Mobil

- [ ] **Editoryal İnceleme (Sahip):** Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinleri (`data/history/team-dna.ts`).
- [ ] **Mobil Uygulama (Sahip):** Cihazda Expo Go / preview test, App Store / Google Play süreçleri ve `mobile/` deposunun durumu.

### 🔍 Öncelik 8: SEO, Yapılandırılmış Veri & Core Web Vitals (Production Release)

- [ ] **Structured Data (JSON-LD) & OpenGraph:** Grand Prix/yarış detayları için `SportsEvent`, pilot detayları için `Person`, takım detayları için `SportsTeam` şemalarının schema validator ve Search Console ile doğrulanması; mutlak `og:image` boyut ve fallback kontrolleri.
- [ ] **Core Web Vitals & Lighthouse Baseline:** Canlı prod ortamında LCP (<2.5s), INP (<200ms) ve CLS (<0.1) performans eşiklerinin ölçülerek tescillenmesi.
- [ ] **Sentry ve Hata Gözlemlenebilirliği:** Build sırasındaki `Project not found` Sentry kaynak haritası yapılandırmasının düzeltilmesi ve prod hata yakalama/alert akışının doğrulanması.

---

## 3. Teknik Borç ve Çevre Takibi

| Madde | Durum |
| :--- | :--- |
| `ci.yml` (PR kapısı) | GitHub'da henüz koşmadı; required check yapılması sahip ayarı |
| Yasal sayfalardaki e-posta adresleri | `.example` uzantılı yer tutucular — sahip kararı bekliyor |
| Node sürüm uyumu | Yerel: Node 22; `.nvmrc` & `package.json`: Node 24 |
| Vercel & Harici Servis Değişkenleri | Sentry, Upstash, Cron secret ortam değişkenlerinin prod teyidi |
