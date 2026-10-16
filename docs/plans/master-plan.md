# Anthology (Apex) — Master Plan

> **Temel Otorite ve Tek Canlı İş Listesi:** Bu döküman geliştirici vizyonu ve direktifleri doğrultusunda oluşturulmuş operasyonel master rehberdir. Projedeki tüm planlama, geliştirme ve bakım adımları bu liste üzerinden yürütülür.  
> Bir madde yalnızca kodda veya ölçülmüş bir çalışma sonucunda doğrulandığında `[x]` yapılarak tamamlanır; tamamlanan işler geçmiş git kayıtlarına ve günlük loglara devredilerek bu dökümandan kaldırılır. Dökümanda **yalnızca aktif açık işler (`[ ]`) ve doğrulama bekleyen kısmi maddeler (`[~]`)** yer alır.  
> **Temel Vizyon Belgesi:** `docs/vision/apex-vision.md`  
> **Tasarım Sistemi Mimarisi:** `docs/design/apex-design.md` (Apple HIG akıcı tasarım felsefesi + F1 teknik telemetri sentezi)  
> **Bileşen & Düzen Kuralları:** `docs/design/apex-component-rules.md`  
> **Canlı Canlı Referans & Ölçümler:** `docs/reference/apex-reference.md`  
> **Canlı Host:** https://project-anthology-eight.vercel.app  
> **Son Güncelleme & Ölçüm:** 2026-10-16  

---

## 1. Vizyon ve Misyon

* **Vizyon:** Motor sporları tutkusunu ve zengin Formula 1 mirasını; arka planda saat mekanizması hassasiyetinde çalışan harmonik bir veri mimarisiyle, gecikmesiz, akıcı, modern ve editoryal derinliği yüksek bir arayüzde birleştiren; F1 kültürünün küresel ölçekteki dijital başvuru ve deneyim merkezi olmak.
* **Misyon:** 1950'den günümüze tüm F1 verisini, yarış takvimlerini, teknik düzenlemeleri, ikonik araçları ve insan hikayelerini; telif riski barındırmayan temiz görsel varlıklar, yüksek performanslı web mimarisi (sıfır takılma, kusursuz edge caching) ve ödün vermeyen bir kullanıcı deneyimi ile erişilebilir kılmak.

---

## 2. Mevcut Doğrulanmış Durum (Tüm Katmanların Ölçülmüş Gerçekliği)

| Katman | Ölçülen Durum | Kanıt & Metrik |
| :--- | :--- | :--- |
| **Birim & Entegrasyon Testleri** | ✅ 73 Test Dosyası, 749 Test Başarılı | `npx vitest run` (2026-10-16) |
| **Editoryal Doğrulama Kapısı** | ✅ 149/149 Test Başarılı (0 hata, 0 klişe) | `tests/editorial-content.test.ts` (Tüm alıntılar, kaynak formatları, bölümler) |
| **Statik Tip Güvenliği** | ✅ Sıfır Tip Hatası | `npx tsc --noEmit` (kod 0) |
| **Kod Stili & Linter** | ✅ Sıfır Hata, Sıfır Uyarı | `npm run lint` (0 error, 0 warning, kod 0) |
| **Web Production Build** | ✅ 50/50 Sayfa ve Rota Derlendi | `npm run build` (Next.js Turbopack) |
| **Veri Katmanı & Fallback** | ✅ Supabase + Jolpica Fallback + F1DB | DB → Cache → Live Proxy kademeli okuma devrede |
| **Görsel & Medya Altyapısı** | ✅ 56 hikâye görseli + medya sistemi canlı | `public/stories/`, `media_assets` (çözümleyici v2 devrede) |
| **Tasarım & Bileşen Mimarisi** | ✅ Tailwind 4 `@layer components` | CSS yardımcı sınıfları katmanlı, bento yay fiziği ve `.bento-deferred` devrede |
| **Grid & Kadraj Standardı** | ✅ 11 Takım 22 Pilot Tam Kadro | 2026 Cadillac (#77 Bottas & #11 Pérez) tam entegre; sıfır boş slot |
| **Mobil Uygulama (Expo 56)** | ⏸️ Rafta (sahip kararı 2026-10-07) | `mobile/` diskte mevcut, gitignored; web işleri oturduktan sonra ele alınacak |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Aktif Açık İşler Listesi (Faz & Öncelik Sırasıyla)

> Her maddenin sahibi belirtilmiştir: **(Claude)** backend/veri/API/veritabanı, **(Antigravity)** arayüz/tasarım/UX, **(Sahip)** dış hesap/onay/yasal karar.

### ⏱️ Faz 1: Canlı Seans, Zaman Senkronizasyonu & QStash

- [~] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması (Claude + Sahip, yarış hafta sonu):**
  - **Hedef:** Gerçek bir yarış hafta sonunda (R18 ABD GP, 2026-10-25) canlı seans akışının `/api/live-timing` ve `LiveRaceTracker` üzerinden uçtan uca gözlemi.
  - **Mevcut Durum:** Seans simülasyonları (`tests/live-timing-route.test.ts`, 14 test) ve kilitli seans 401 ele alımı (`tests/openf1-auth.test.ts`, 5 test) tam yeşil. Canlı kilitli seans davranışı ve rota önbelleği doğrulanacak.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.A.
- [~] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger (Claude, yarış hafta sonu):**
  - **Hedef:** Yarış sonrası `sync-f1` yerleşmiş (settled) snapshot ve `after()` ile arka plan yenileme akışının canlı yarışta doğrulanması.
  - **Mevcut Durum:** `tests/sync-f1-idempotent.test.ts` (11 test) ve `tests/snapshot-refresh.test.ts` (8 test) devrede.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.B.
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması (Claude, yarış hafta sonu):**
  - **Hedef:** Seans başlangıcından ~30 dk önce `notified_sessions` kaydının oluşumunun canlıda gözlenmesi (`tests/notify-sessions-route.test.ts`, 7 test).
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.C.
- [~] **1.6 Zamanlayıcı Güvenilirliği: GitHub `schedule` Kaldırılması (Claude):**
  - **Hedef:** Upstash QStash 3 aktif cron zamanlaması (`sync-f1`, `sync-news`, `sync-media`) EU bölgesinde devrede. QStash kararlılığı doğrulandıktan sonra GitHub Actions workflow dosyalarındaki eski `schedule:` tetikleyicilerinin kaldırılması (yalnızca `workflow_dispatch` kalacak).
- [~] **1.7 OpenF1 Canlı Seans Erişimi ve Canlı Zamanlama Gözlemi (Sahip + Claude, R18 ABD):**
  - **Hedef:** Topluluk (Community) katmanında yarış süresince canlı sıralama kaynağının kısıtlandığı arayüzde dürüstçe bildirilmekte; yarış bitiminde geçici sonuçların `provisionalSync` ile anında işlenmesi R18 ABD yarışında test edilecek.

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals

- [~] **6.1 Structured Data (JSON-LD) ve Search Console Doğrulaması (Sahip + Claude):**
  - **Hedef:** Google Search Console mülkünün `GOOGLE_SITE_VERIFICATION` meta etiketiyle doğrulanması, `sitemap.xml` gönderimi ve Rich Results Test ile `WebSite`, `Person`, `SportsTeam`, `SportsEvent`, `Article` şemalarının tescili.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.D.
- [~] **6.2 Core Web Vitals & Lighthouse Saha Takibi (Claude + Sahip):**
  - **Hedef:** Mobil ortamda LCP < 2,5 s, INP < 200 ms, CLS < 0,1 eşiklerinin takibi.
  - **Mevcut Durum:** `nextDynamic` chunk splitting, `.bento-deferred` (`content-visibility: auto`) ve hero görseli önceliklendirmesi tamamlandı. Search Console kurulduktan sonra CrUX saha verileri izlenecek.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.E.
- [~] **6.3 Sentry ve Hata Gözlemlenebilirliği (Sahip):**
  - **Hedef:** Vercel Production ortamına `NEXT_PUBLIC_SENTRY_DSN` eklendiğinde istemci tarafı hata yakalama akışının doğrulanması (`sendDefaultPii: false`).

---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem

- [~] **7.1 `public/stories` Görselleri: Kaynak Doğrulaması (Sahip):**
  - **Hedef:** `docs/reference/hikaye-gorselleri-kaynak-listesi.md` dosyasındaki 56 görselin kaynak linklerinin doğrulanıp `data/stories/image-credits.ts` manifest'ine `status: 'sourced'` olarak işlenmesi.
  - **Not:** Sistem ve arayüz hazırdır; kaynak eklendiği anda arayüzde otomatik olarak atıf satırı ve kaynak linki (`↗`) görünür.
- [ ] **7.2 Editoryal İnceleme & Olgu Teyidi (Sahip):**
  - **Hedef:** Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinlerinin (`data/history/team-dna.ts`) genel editoryal denetimi.
- [⏸] **7.3 Mobil Uygulama (Sahip — rafta):**
  - **Hedef:** Web arayüzü, veri hattı ve mimari tamamen oturduktan sonra `mobile/` kod tabanı (Expo 56) ele alınacaktır.
- [ ] **7.4 Yasal Mailbox'lar (Sahip — en sonda):**
  - **Hedef:** `privacy@`, `dmca@`, `contact@apexstats.example` yer tutucularının gerçek operasyonel posta adresleriyle güncellenmesi.

---

### 🖼️ Faz 8: Görsel Temin Sistemi (Media)

- [ ] **8.3 Medya Seçim Kalite İncelemesi (Sahip):**
  - **Hedef:** `media_assets` tablosunda düşük güvenli veya istenmeyen görsellerin `review='rejected'` yapılarak yedek havuzdan beslenmesi (SQL sorguları: `docs/reference/media-sistemi.md` §13).
- [ ] **8.6 Eski Sezonlar (1950–2017) Medya Genişletmesi (Sahip + Claude):**
  - **Hedef:** Görsel site denetimi tamamlandıktan sonra `MEDIA_MIN_SEASON` düşürülerek arşivin geriye doğru zenginleştirilmesi.

---

### ☁️ Faz 9: Google Cloud (18 Aralık 2026 Kredi Dönemi ve Sonrası)

- [ ] **9.0 Hesap, Proje ve API Anahtarı Kurulumu (Sahip):**
  - **Hedef:** Apex için Avrupa bölgesinde ayrı GCP projesi, Generative Language API etkinleştirme, bütçe alarmları (aylık en fazla ~₺50 kalıcı maliyet sınırı).
- [ ] **9.2 Gemini Ana Sağlayıcı, Groq Yedek Zinciri (Claude; 9.0 bitince):**
  - **Hedef:** Haber üretim zincirinin Gemini (GCP) → Gemini (AI Studio ücretsiz) → Groq olarak yapılandırılması (`lib/news/rewrite.ts`).
- [ ] **9.3 Kredi Dönemi Tek Seferlik İşler (Sahip Onayıyla; 18 Aralık'a kadar):**
  - **Hedef:** 8.6 medya genişletmesi için toplu çözümleme, Cloud Monitoring uptime check ve kontrollü AI görsel/ikon denemeleri.
- [ ] **9.1 Vercel + GCP Hibrit Mimari (İleride ihtiyaç doğarsa):**
  - **Hedef:** Cron işlerinin 300 sn sınırını aşması veya mobil uygulamanın gündeme gelmesi durumunda kalıcı Cloud Run Jobs mimarisine geçiş.

---

### 🏁 Faz 13: Pist İleri Telemetri Genişletmesi (Opsiyonel / Veri Sağlandığında)

- [~] **13.3 & 13.6 İleri Pist Telemetrisi ve Strateji Entegrasyonu (Claude + Antigravity):**
  - **Hedef:** FastF1 `get_circuit_info()` üzerinden sektör sınırları, hız tuzakları, apeks süratleri ve strateji metrikleri doğrulanmış veri hattına bağlandığında pist detay sayfasına etkileşimli pinler ve strateji kartları olarak entegre edilecektir (uydurma sayı gösterilmez).

---

## 4. Teknik Borç ve Çevre Takibi

| Madde | Durum | Önlem / Aksiyon |
| :--- | :--- | :--- |
| **`ci.yml` (PR Kapısı)** | GitHub'da henüz koşmadı | Pull request açıldığında required check olarak bağlanması |
| **Yasal Mailbox'lar** | `.example` yer tutucular | Site yayını öncesi gerçek posta kutularıyla değiştirilecek (7.4) |
| **C-7 Yerel Geliştirme Notu** | `next start` localhost SSL uyarısı | Yerel geliştirmede dil değişiminde oluşan prototip uyarısı; canlı https'i etkilemez |
| **Prod Ortam Değişkenleri** | Sentry, Upstash, Cron Secret | Senkronizasyon kontrolü (özellikle Search Console `GOOGLE_SITE_VERIFICATION`) |
| **as any / eslint-disable** | **Sıfır Kaçış (Tam Temiz)** | `grep -rn eslint-disable app lib components` = 0; tip kaçışı kesinlikle yasaktır |
