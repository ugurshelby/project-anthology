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
| **Görsel & Medya Altyapısı** | ✅ 56 hikâye görseli + 24 pist fotoğrafı canlı | `public/stories/`, `media_assets` (çözümleyici v2 devrede, circuits dizini gerçek fotoğraflara bağlandı) |
| **Tasarım & Bileşen Mimarisi** | ✅ Tailwind 4 `@layer components` + Apple Fluid | CSS yardımcı sınıfları katmanlı, bento yay fiziği, `.bento-deferred` ve circuits akıcı segmented kontrolü devrede |
| **Grid & Kadraj Standardı** | ✅ 11 Takım 22 Pilot Tam Kadro | 2026 Cadillac (#77 Bottas & #11 Pérez) tam entegre; sıfır boş slot |
| **Mobil Uygulama (Expo 56)** | ⏸️ Tamamen Rafta (sahip kararı) | `mobile/` diskte mevcut, gitignored; web tamamen kusursuz olana kadar asla dokunulmayacak (belki hiç geliştirilmeyecek) |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Aktif Açık İşler Listesi (Faz & Öncelik Sırasıyla)

> **Yürütme & Sorumluluk Kuralları:**
> 1. **Sahip Adımları Protokolü:** Site sahibinin yapacağı dış işler (arama konsolu, yasal e-postalar, lisans linkleri, GCP hesabı vb.), sitede eksik hiçbir şey kalmayana ve *"Site tamam, her şey yerli yerinde, yayın öncesi son adımlardayız"* aşamasına gelinene kadar bekletilecektir. Ajanlar kritik bir blokaj olmadığı sürece bu adımları talep etmeyecektir.
> 2. **Canlı Yarış Testleri Protokolü (Faz 1):** 25 Ekim ABD GP yarışına kadar projede kod ve mimari geliştirmeler süreceğinden, yapılan her değişiklik ve push sonrasında bu bölümdeki test senaryoları güncel koda göre revize edilecek; yarış günü testleri sistemin en taze haline göre icra edilecektir.
> 3. **Model Şartı (Faz 13 & 14):** İleri Pist Telemetrisi (Faz 13) ve Siber Güvenlik / Sertleştirme (Faz 14) adımları, sistemin saat gibi işlemesi ve güvenlik hassasiyeti nedeniyle **Claude Opus 5.5** şartı ile icra edilecektir.
> 4. **Mobil Uygulama (7.3):** Tamamen raftadır (belki hiç geliştirilmeyecektir). Web kusursuz olana kadar gündeme alınmaz.
> 5. **Eski Sezonlar Görsel Genişletmesi (8.6):** Medya sistemi, optimizasyon, veri akışı ve performans sorunları tamamen çözülüp kusursuz hale gelmeden başlatılmayacaktır (yüksek miktarda görselle erkenden boğuşulmayacaktır).
> 6. **Run Satırı Kuralı:** Her faz ve adım, `docs/workflow/model-effort.md` tablosundan seçilen `Run: <model> / <effort>` satırını taşır; plan yazan model bunu sahip istemeden ekler ve plan her değiştiğinde günceller. Faz 13/14'te model sahip şartıdır (Opus 5.5), effort tablodan seçilir. `max` ve `ultracode` yalnızca sahip onayıyla.

### ⏱️ Faz 1: Canlı Seans, Zaman Senkronizasyonu & QStash

> **Dinamik Güncelleme Protokolü:** 25 Ekim R18 ABD GP tarihine kadar projede kod ve mimari geliştirmeler devam edecektir. Yapılan her geliştirme ve push sonrasında bu bölümdeki test senaryoları ve doğrulama koşulları güncel kod yapısına göre revize edilecek; yarış günü testleri sistemin en taze haline göre icra edilecektir.

- [~] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması (Claude, yarış hafta sonu):**
  - **Hedef:** Gerçek bir yarış hafta sonunda (R18 ABD GP, 2026-10-25) canlı seans akışının `/api/live-timing` ve `LiveRaceTracker` üzerinden uçtan uca gözlemi.
  - **Mevcut Durum:** Seans simülasyonları (`tests/live-timing-route.test.ts`, 14 test) ve kilitli seans 401 ele alımı (`tests/openf1-auth.test.ts`, 5 test) tam yeşil. Canlı kilitli seans davranışı ve rota önbelleği doğrulanacak.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.A.
  - **Run:** Sonnet / high — live-race debugging, edge cases
- [~] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger (Claude, yarış hafta sonu):**
  - **Hedef:** Yarış sonrası `sync-f1` yerleşmiş (settled) snapshot ve `after()` ile arka plan yenileme akışının canlı yarışta doğrulanması.
  - **Mevcut Durum:** `tests/sync-f1-idempotent.test.ts` (11 test) ve `tests/snapshot-refresh.test.ts` (8 test) devrede.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.B.
  - **Run:** Sonnet / high — idempotency verification on live data
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması (Claude, yarış hafta sonu):**
  - **Hedef:** Seans başlangıcından ~30 dk önce `notified_sessions` kaydının oluşumunun canlıda gözlenmesi (`tests/notify-sessions-route.test.ts`, 7 test).
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.C.
  - **Run:** Sonnet / medium — observe and check one record
- [~] **1.6 Zamanlayıcı Güvenilirliği: GitHub `schedule` Kaldırılması (Claude):**
  - **Hedef:** Upstash QStash 3 aktif cron zamanlaması (`sync-f1`, `sync-news`, `sync-media`) EU bölgesinde devrede. QStash kararlılığı doğrulandıktan sonra GitHub Actions workflow dosyalarındaki eski `schedule:` tetikleyicilerinin kaldırılması (yalnızca `workflow_dispatch` kalacak).
  - **Run:** Sonnet / medium — workflow edit, verify via gh
- [~] **1.7 OpenF1 Canlı Seans Erişimi ve Canlı Zamanlama Gözlemi (Claude, R18 ABD):**
  - **Hedef:** Topluluk (Community) katmanında yarış süresince canlı sıralama kaynağının kısıtlandığı arayüzde dürüstçe bildirilmekte; yarış bitiminde geçici sonuçların `provisionalSync` ile anında işlenmesi R18 ABD yarışında test edilecek.
  - **Run:** Sonnet / high — live provisional-result handling

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals

> **Sahip Adımları Notu:** Bu fazdaki harici hesap kurulumları ve saha doğrulamaları, site yayın öncesi nihai hazır oluş aşamasına gelene kadar bekletilmektedir.

- [~] **6.1 Structured Data (JSON-LD) ve Search Console Doğrulaması (Sahip [Yayın Öncesi Son Adım] + Claude):**
  - **Hedef:** Google Search Console mülkünün `GOOGLE_SITE_VERIFICATION` meta etiketiyle doğrulanması, `sitemap.xml` gönderimi ve Rich Results Test ile `WebSite`, `Person`, `SportsTeam`, `SportsEvent`, `Article` şemalarının tescili.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.D.
  - **Run:** Sonnet / medium — owner step; agent verifies markup (owner: Search Console)
- [~] **6.2 Core Web Vitals & Lighthouse Saha Takibi (Claude + Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** Mobil ortamda LCP < 2,5 s, INP < 200 ms, CLS < 0,1 eşiklerinin takibi.
  - **Mevcut Durum:** `nextDynamic` chunk splitting, `.bento-deferred` (`content-visibility: auto`) ve hero görseli önceliklendirmesi tamamlandı. Search Console kurulduktan sonra CrUX saha verileri izlenecek.
  - **Prosedür:** `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.E.
  - **Run:** Sonnet / medium — measure and compare vitals
- [~] **6.3 Sentry ve Hata Gözlemlenebilirliği (Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** Vercel Production ortamına `NEXT_PUBLIC_SENTRY_DSN` eklendiğinde istemci tarafı hata yakalama akışının doğrulanması (`sendDefaultPii: false`).
  - **Run:** Sonnet / low — owner sets DSN; agent checks capture

---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem

- [~] **7.1 `public/stories` Görselleri: Kaynak Doğrulaması (Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** `docs/reference/hikaye-gorselleri-kaynak-listesi.md` dosyasındaki 56 görselin kaynak linklerinin doğrulanıp `data/stories/image-credits.ts` manifest'ine `status: 'sourced'` olarak işlenmesi.
  - **Not:** Sistem ve arayüz hazırdır; kaynak eklendiği anda arayüzde otomatik olarak atıf satırı ve kaynak linki (`↗`) görünür. Site bittiğinde topluca yapılacaktır.
  - **Run:** Sonnet / low — owner sources; agent edits manifest rows
- [ ] **7.2 Editoryal İnceleme & Olgu Teyidi (Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinlerinin (`data/history/team-dna.ts`) genel editoryal denetimi.
  - **Run:** Antigravity (own model) — editorial text; owner reviews
- [⏸] **7.3 Mobil Uygulama (Sahip — Tamamen Rafta):**
  - **Hedef:** Tamamen rafa kaldırılmıştır (sahip kararı: belki hiç geliştirilmeyecektir). Web mimarisi, veri akışları ve arayüz kusursuzluğa ulaşana kadar asla gündeme alınmayacaktır.
  - **Run:** none — shelved
- [ ] **7.4 Yasal Mailbox'lar (Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** `privacy@`, `dmca@`, `contact@apexstats.example` yer tutucularının sitenin nihai yayını öncesinde gerçek operasyonel posta adresleriyle güncellenmesi.
  - **Run:** Sonnet / low — owner supplies addresses; placeholder swap

---

### 🖼️ Faz 8: Görsel Temin Sistemi (Media)

- [ ] **8.3 Medya Seçim Kalite İncelemesi (Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** `media_assets` tablosunda düşük güvenli veya istenmeyen görsellerin `review='rejected'` yapılarak yedek havuzdan beslenmesi (SQL sorguları: `docs/reference/media-sistemi.md` §13).
  - **Run:** Sonnet / low — owner decides; agent runs read-only SQL
- [ ] **8.6 Eski Sezonlar (1950–2017) Medya Genişletmesi (Claude + Sahip):**
  - **Hedef:** Görsel sistemi (optimizasyon, veri akışları, önbellek ve performans sorunları) tamamen oturup kusursuz hale geldikten sonra temiz sistemle yapılacaktır. Yüksek miktarda görselle erkenden boğuşulmaması için ön koşul: Web medya motorunun sıfır sorunla ve tam optimize çalışmasıdır.
  - **Run:** Plan: Opus / high; build: Sonnet / medium — large but mechanical once designed

---

### ☁️ Faz 9: Google Cloud (18 Aralık 2026 Kredi Dönemi ve Sonrası)

- [ ] **9.0 Hesap, Proje ve API Anahtarı Kurulumu (Sahip [Yayın Öncesi Son Adım]):**
  - **Hedef:** Apex için Avrupa bölgesinde ayrı GCP projesi, Generative Language API etkinleştirme, bütçe alarmları (aylık en fazla ~₺50 kalıcı maliyet sınırı).
  - **Run:** owner — GCP console work
- [ ] **9.2 Gemini Ana Sağlayıcı, Groq Yedek Zinciri (Claude; 9.0 bitince):**
  - **Hedef:** Haber üretim zincirinin Gemini (GCP) → Gemini (AI Studio ücretsiz) → Groq olarak yapılandırılması (`lib/news/rewrite.ts`).
  - **Run:** Sonnet / high — LLM fallback chain, cost and overlap guards
- [ ] **9.3 Kredi Dönemi Tek Seferlik İşler (Sahip Onayıyla; 18 Aralık'a kadar):**
  - **Hedef:** 8.6 medya genişletmesi için toplu çözümleme, Cloud Monitoring uptime check ve kontrollü AI görsel/ikon denemeleri.
  - **Run:** Sonnet / medium — one-off scripted jobs, owner approves spend
- [ ] **9.1 Vercel + GCP Hibrit Mimari (İleride ihtiyaç doğarsa):**
  - **Hedef:** Cron işlerinin 300 sn sınırını aşması veya mobil uygulamanın gündeme gelmesi durumunda kalıcı Cloud Run Jobs mimarisine geçiş.
  - **Run:** Opus / xhigh — architecture, only if the need arises

---

### 🏁 Faz 13: Pist İleri Telemetri Genişletmesi (Claude Opus 5.5 Özel Görevi)

> **Model Şartı:** Bu fazın mimarisi, FastF1 telemetri eksiklerinin tespiti, veri hattı ve arayüz entegrasyonu bir saat mekanizması gibi kusursuz işleyecek biçimde bizzat **Claude Opus 5.5** tarafından belirlenip hayata geçirilecektir.

- [~] **13.3 & 13.6 İleri Pist Telemetrisi ve Strateji Entegrasyonu (Claude Opus 5.5):**
  - **Hedef:** FastF1 `get_circuit_info()` üzerinden sektör sınırları, hız tuzakları, apeks süratleri ve strateji metrikleri doğrulanmış veri hattına bağlanacak; neyin eksik olduğunu ve nasıl eklenmesi gerektiğini Opus 5.5 belirleyerek pist detay sayfasına saat mekanizması hassasiyetinde entegre edecektir (asla uydurma veri basılmaz).
  - **Run:** Opus 5.5 / xhigh — owner-mandated model; data must be exact

---

### 🛡️ Faz 14: Siber Güvenlik, Kriptografi & Kaynak/Maliyet Sertleştirmesi (Claude Opus 5.5 Şartı)

> **Model Şartı:** Hem acil yapılması gereken güvenlik yamaları (Push bypass, bağımlılık zafiyetleri, Zod) hem de ileriye dönük rutin kontroller ve maliyet/kaynak önlemleri, mimari derinlik ve kritiklik nedeniyle **kesinlikle Claude Opus 5.5** tarafından icra edilecektir.

- [ ] **14.1 `push/register` Rate Limit Bypass ve Tutarlı Dağıtık Hız Sınırlama (Claude Opus 5.5 — Döküman 2 & 3):**
  - **Hedef:** `app/api/push/register/route.ts:25` satırındaki `clientIP === 'fallback:unknown'` bypass açığının kapatılması; tüm genel JSON rotalarının (`news`, `circuits`, `drivers`, `teams`, `season`, `media`) `applyRateLimit` sarmalayıcısına geçirilerek başlığı eksik isteklerin 1/5 kota ile ortak havuzda sınırlandırılması; Vercel üretim ortamında Upstash Redis ortam değişkenlerinin (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) doğrulanması.
  - **Referans:** `docs/reference/guvenlik-durum-tespiti.md` §1.3, `lib/rateLimit.ts`.
  - **Run:** Opus 5.5 / xhigh — owner-mandated model; security bypass, distributed limiting
- [ ] **14.2 Bağımlılık Zafiyetlerinin Giderilmesi & Güvenlik Kapısı CI Entegrasyonu (Claude Opus 5.5 — Döküman 4):**
  - **Hedef:** `npm audit` tarafından tespit edilen 23 zafiyetin (Next.js 16.2.7 ve Tinypool kritik seviye dahil) `npm audit fix` ile giderilmesi; `.github/workflows/ci.yml` içine `npm audit --audit-level=high` kapısı eklenmesi ve otomatik paket güncellemeleri için `.github/dependabot.yml` yapılandırılması.
  - **Referans:** `docs/reference/guvenlik-durum-tespiti.md` §3.4.
  - **Run:** Opus 5.5 / high — owner-mandated model; mostly mechanical, CI gate needs care
- [ ] **14.3 Şema Tabanlı Girdi Doğrulama & Zod Entegrasyonu (Claude Opus 5.5 — Döküman 4 & 3):**
  - **Hedef:** Projeye `zod` kütüphanesinin eklenmesi; elle yazılmış regex ve nesne filtrelemeleri yerine (`app/api/push/register`, `app/api/f1-season`, `app/api/media`, `app/api/circuits/[id]`) tip güvenli Zod şemalarının tanımlanması ("Don't roll your own validation").
  - **Referans:** `docs/reference/guvenlik-durum-tespiti.md` §3.3.
  - **Run:** Opus 5.5 / high — owner-mandated model; multi-file validation refactor
- [ ] **14.4 Denial of Wallet (DoW) & LLM Sert Harcama Limitleri (Claude Opus 5.5 + Sahip — Döküman 3):**
  - **Hedef:** GCP ve Groq konsollarında aylık sert bütçe sınırlarının (Hard Spend Caps) ve harcama hızı (velocity) alarmlarının tanımlanması; OWASP LLM10 (Unbounded Consumption) ve LLM06 (Excessive Agency) standartları uyarınca `lib/news/rewrite.ts` retry/token tavanlarının belgelenip korunması.
  - **Referans:** `docs/reference/guvenlik-durum-tespiti.md` §1.2.
  - **Run:** Opus 5.5 / high — owner-mandated model; owner sets console caps
- [ ] **14.5 Canlı Haber Toplama (RSS & Image Check) Kaynak Optimizasyonu (Claude Opus 5.5 — Döküman 3 & 2):**
  - **Hedef:** `GET /api/news` rotasının önbellek ıskalamalarında 5 RSS kaynağı ve onlarca görsele eşzamanlı HTTP pingi atarak sunucu tüketmesini önlemek; halka açık rotanın yalnızca veritabanındaki `news_stories` tablosundan beslenmesi, canlı taramanın sadece `sync-news` cron'una bırakılması ("Cheap validation first").
  - **Referans:** `docs/reference/guvenlik-durum-tespiti.md` §1.1.
  - **Run:** Opus 5.5 / high — owner-mandated model; route and cache refactor
- [ ] **14.6 Gelecekteki Kimlik Doğrulama & Parola Mimarisi Şartnamesi (Argon2id) (Claude Opus 5.5 — Döküman 1 & 2):**
  - **Hedef:** İleride kullanıcı profili, üyelik veya yönetim paneli eklendiğinde MD5/SHA/bcrypt yerine doğrudan RFC 9106 Argon2id standardının ($m=47,104\text{ KiB}, t=1, p=1$ güçlü profil), PHC string biçiminin ve CSPRNG salt kullanımının zorunlu kılınması; *Verify-then-Rehash* geçiş modelinin mimari kural olarak muhafazası.
  - **Referans:** `docs/reference/security-docs/Argon2id Standardına Kesintisiz Parola Taşıma Stratejisi Rehberi.md`.
  - **Run:** Opus 5.5 / xhigh — owner-mandated model; cryptographic specification

---

### 🎨 Faz 15: Otomatik AI Görsel Denetim (Vision Audit) & Arayüz İyileştirme Pipeline'ı

> **Amaç:** `screenshots/` klasöründeki 16 temsilci sayfanın Desktop, Tablet ve Mobile görüntülerini, projedeki mevcut AI API anahtarlarımız (Gemini / Vision modelleri) üzerinden otomatik denetime tabi tutarak sayfa bazlı aksiyon ve tespit raporları üretmek.

- [ ] **15.1 Çok Modelli AI Vision Denetim Hattı (Vision Audit Pipeline) Kurulumu (Claude + Antigravity):**
  - **Hedef:** `screenshots/` altındaki her ekran görüntüsünü dosya adı, sayfa URL'si, cihaz tipi ve bileşen bağlamıyla birlikte görsel yetenekli AI modeline (ör. Gemini 2.5 Flash / Pro Vision) gönderen otomatik bir komut dosyası (`scripts/audit-screenshots.ts`) tasarlanması.
  - **Model Analiz Kriterleri:**
    1. **Viewport & Düzen:** Mobilde/tablette dikey/yatay taşmalar, orantısız boşluklar, hizalama sapmaları.
    2. **Bileşen & Kompozisyon:** Bento kart yerleşimleri, buton konumları, etkileşimli öğelerin ergonomisi.
    3. **Tipografi & İçerik:** Okunabilirlik, yazı boyutu hiyerarşisi, kontrast eksiklikleri, metin sarkmaları.
    4. **Görsel Kalite & Kadraj:** Fotoğrafların kırpılma biçimi, oran-orantı, yükseklik dengesi.
  - **Çıktı Biçimi:** Modelin ürettiği detaylı analizler her sayfanın kendi klasörüne `screenshots/<sayfa-id>/audit-report.md` olarak kaydedilecektir. Böylece her sayfa için arayüz anlamında ne yapılması gerektiğini gösteren net tespit dökümanları oluşacaktır.
  - **Run:** Sonnet / high — vision API script with spend caps (Antigravity: own model)
- [ ] **15.2 AI Denetim Raporlarının Arayüze Uygulanması (Antigravity):**
  - **Hedef:** Üretilen `audit-report.md` dosyalarındaki tespitler doğrultusunda, Apple HIG akıcı tasarım mimarisi ve `docs/design/apex-component-rules.md` kurallarına uygun olarak sayfa sayfa arayüz iyileştirmelerinin kodlanması.
  - **Run:** Antigravity (own model) — UI implementation

---

## 4. Teknik Borç ve Çevre Takibi

| Madde | Durum | Önlem / Aksiyon |
| :--- | :--- | :--- |
| **`ci.yml` (PR Kapısı)** | GitHub'da henüz koşmadı | Pull request açıldığında required check olarak bağlanması |
| **Yasal Mailbox'lar** | `.example` yer tutucular | Site yayını öncesi gerçek posta kutularıyla değiştirilecek (7.4) |
| **C-7 Yerel Geliştirme Notu** | `next start` localhost SSL uyarısı | Yerel geliştirmede dil değişiminde oluşan prototip uyarısı; canlı https'i etkilemez |
| **Prod Ortam Değişkenleri** | Sentry, Upstash, Cron Secret | Senkronizasyon kontrolü (özellikle Search Console `GOOGLE_SITE_VERIFICATION`) |
| **as any / eslint-disable** | **Sıfır Kaçış (Tam Temiz)** | `grep -rn eslint-disable app lib components` = 0; tip kaçışı kesinlikle yasaktır |
| **Push Rate Limit Açığı** | `fallback:unknown` bypass | `app/api/push/register/route.ts` rotasının `applyRateLimit` ile kapatılması (14.1) |
| **Bağımlılık Zafiyetleri** | 3 Critical, 14 High zafiyet | `npm audit fix` ile Next.js 16.4+ ve sharp/postcss güncellemeleri (14.2) |
| **Zod Şema Doğrulama** | Zod kütüphanesi yok | Elle yazılmış regex yerine Zod şema doğrulamasına geçiş (14.3) |
