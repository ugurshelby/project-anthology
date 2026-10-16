# Anthology (Apex) — Master Plan

> **Temel Otorite ve Tek Canlı İş Listesi:** Bu döküman doğrudan geliştirici vizyonu ve direktifleri doğrultusunda oluşturulmuş en temel operasyonel rehberdir. Projedeki tüm planlama, geliştirme ve bakım adımları bu liste üzerinden yürütülür.  
> Bir madde yalnızca kodda veya ölçülmüş bir çalışma sonucunda doğrulandığında `[x]` olarak işaretlenir. Tamamlanan planlar ve süreçler geçmiş git kayıtlarına devredilir; dökümanda yalnızca aktif açık işler yer alır.  
> **Temel Vizyon Belgesi:** `docs/vision/apex-vision.md`  
> **Tasarım Sistemi Mimarisi:** `docs/design/apex-design.md` (Apple tasarım felsefesi + F1 teknik kimlik sentezi)  
> **Canlı Canlı Referans & Ölçümler:** `docs/reference/apex-reference.md`  
> **Canlı Host:** https://project-anthology-eight.vercel.app  
> **Son Güncelleme & Ölçüm:** 2026-10-13  

---

## 1. Vizyon ve Misyon

* **Vizyon (Nereye Ulaşmak İstiyoruz?):** Motor sporları tutkusunu ve zengin Formula 1 mirasını; arka planda saat mekanizması hassasiyetinde çalışan harmonik bir veri mimarisiyle, gecikmesiz, akıcı, modern ve editoryal derinliği yüksek bir arayüzde birleştiren; F1 kültürünün küresel ölçekteki dijital başvuru ve deneyim merkezi olmak.
* **Misyon (Bunu Nasıl ve Ne İnşa Ederek Yapıyoruz?):** 1950'den günümüze tüm F1 verisini, yarış takvimlerini, teknik düzenlemeleri, ikonik araçları ve insan hikayelerini; telif riski barındırmayan temiz görsel varlıklar, yüksek performanslı web mimarisi (sıfır takılma, kusursuz edge caching) ve ödün vermeyen bir kullanıcı deneyimi ile erişilebilir kılmak.

---

## 2. Mevcut Doğrulanmış Durum (Tüm Katmanların Ölçülmüş Gerçekliği)

| Katman | Ölçülen Durum | Kanıt & Metrik |
| :--- | :--- | :--- |
| **Birim & Entegrasyon Testleri** | ✅ 69 Test Dosyası, 589 Test Başarılı | `npx vitest run` (2026-10-12) |
| **Statik Tip Güvenliği** | ✅ Sıfır Tip Hatası | `npx tsc --noEmit` (kod 0) |
| **Kod Stili & Linter** | ✅ Sıfır Hata | `npm run lint` (0 error, 3 warning, kod 0; üçü de gitignored `scratch/`; 2026-10-12: `f1-icons` no-op yardımcıları ve 12 bileşendeki ölü dalları silindi) |
| **Web Production Build** | ✅ 50/50 Sayfa ve Rota Derlendi | `npm run build` (Next.js Turbopack) |
| **Veri Katmanı & Fallback** | ✅ Supabase + Jolpica Fallback + F1DB | DB → Cache → Live Proxy kademeli okuma devrede |
| **Görsel & Varlık Altyapısı** | ✅ 56 hikâye görseli + medya sistemi canlı | `public/stories/` (56 PNG, hepsi kaynak kaydında, 0'ı doğrulanmış; editoryal not ve kaynak bağlantısı arayüzü canlı), `media_assets` 233/246 çözülmüş (2026-10-08) |
| **Tasarım Sistemi Orkestrasyonu** | ✅ Tamamlandı | `apex-design.md`, `tokens.json`, 5 katmanlı `skills/` |
| **Mobil Uygulama (Expo 56)** | ⏸️ Rafta (sahip kararı 2026-10-07) | `mobile/` diskte mevcut, gitignored; dokunulmaz, web mimari ve arayüz oturduktan sonra ele alınır |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Açık İşler: Önem Sırasına Göre Faz Planı

> Doğrulanıp tamamlanan maddeler bu listeden silindi; kanıtları `logs/` ve git geçmişindedir. Burada yalnızca açık (`[ ]`) ve kısmi (`[~]`) işler kalır. Her maddenin sahibi belirtilir: **(Claude)** backend/veri/API/veritabanı, **(Antigravity)** arayüz, **(Sahip)** karar, hesap, dış doğrulama.

### 🤝 Ajan Düzeni (sahip kararı, 2026-10-07)

- **Claude Code:** backend, API, veri, veritabanı, zamanlayıcı, medya çözümleyicisi, inceleme ve doğrulama. Commit eder; **push yalnızca sahibin onayıyla**; migration ve canlı veritabanı işlemleri sahibin o konuşmadaki yetkisiyle.
- **Antigravity:** yalnızca arayüz, tasarım ve arayüz metinleri (`components/`, `app/[locale]/**` içindeki görsel kısımlar, `messages/*.json`, `public/` tasarım varlıkları). **Commit ve push yetkisi yoktur** (`AGENTS.md`). İşini bitirince günün log'una yazar, dokunduğu plan maddesini `[~]` bırakır (asla `[x]` yapmaz), Claude doğrular ve commit eder.
- **Antigravity'nin dokunmadığı yerler:** `lib/`, `app/api/`, `supabase/`, `scripts/`, `data/media/`, `data/stories/image-credits.ts` (sahip doldurur), `.github/`, `vercel.json`, `AGENTS.md`, `mobile/`. Bir arayüz işi için bunlardan birinde değişiklik gerekirse plana not düşer, Claude yapar.
- **Aynı çalışma ağacı:** iki ajan paralel çalışırken yalnızca kendi dosyalarını düzenler; başka birinin değişikliğini geri almaz, stash'lemez.
- **Oturum devri ("nerede kalmıştık"):** güncel durum `logs/2026-10-12.md` sonundaki "Devir notu" ve aşağıdaki "Sıradaki Oturum" listesinde.
- **Hatırlatma listesi (sahibin isteği):** site denetimi başlarken → 8.3 (medya kalite incelemesi) + 7.1 kaynak listesi + 7.2 editoryal inceleme; denetim düzeltmeleri bittikten sonra → 8.6 (1950–2017 genişletmesi); yarış hafta sonu → `docs/reference/yaris-hafta-sonu-dogrulama.md`; Kasım başında (GCP kredisi 2026-12-18'de bitiyor) → 9.3 tek seferlik işler ve 8.6 zamanlaması; bir cron rotası 300 sn sınırına dayanınca veya mobil gündeme gelince → 9.1 (Vercel + GCP hibrit); sahip yeni bileşen/düzen kuralı verdikçe → `docs/design/apex-component-rules.md`'ye sahibin cümlesiyle eklenir (ilk kurallar 2026-10-10: navigasyon ve ana sayfa).

### 🧭 Sıradaki Oturum: Claude'un Açık İşleri (2026-10-12 sonu, sahibin "dur" talimatıyla bırakıldı)

- [x] **C-1 Lighthouse (canlı, mobil) Sentry değişikliğinden sonra:** ölçüldü 2026-10-13, sonuç 6.2'de.
- [x] **C-2 Lastik termal penceresi yeniden tasarımı (U-1):** yapıldı 2026-10-13, ayrıntı U-1 altında.
- [x] **C-3 Plan 6.4 açıkları (sahip kararı 2026-10-13):** bilinmeyen kimlikte 200 + `noindex` kabul edildi; SVG bayraklar `country-flag-icons` (MIT) ile eklendi (`components/ui/CountryFlag.tsx`, `73dbb9c`).
- [x] **C-4 McLaren logosu (sahip kararı 2026-10-13: yer tutucu):** `LOGO_OVERRIDES` `placeholderOnly` (çözümleme anında da okunur), canlı satır `review='rejected'` (Supabase, sahip onayıyla tek satır), `73dbb9c`.
- [x] **C-5 Sentry (sahip kararı 2026-10-13):** `sendDefaultPii: false` (istemci, sunucu, edge), `73dbb9c`.
- [x] **C-6 `docs/DENETIM.md`:** 2026-10-13 kontrol edildi, tüm maddeleri kodda (Machinery, puan ilerleme grafiği, takım içi H2H, +/- sütunu, pist irtifa/lore, kural dönemleri, termal pencere; hikâye görselleri 7.1'de takipte); rapor silindi.
- [ ] **C-7 Yerel not:** `next start` ile yerelde dil değiştirince next-intl `https://localhost` yönlendirmesi üretiyor (`ERR_SSL_PROTOCOL_ERROR`, tarayıcı tam sayfa yüklemeye düşüyor); canlıda (https) etkisi yok, kaydırma koruması iki yolda da çalışıyor. İstenirse incelenir.
- Takvim: 2026-10-19 10:00 (TR) `apex-github-schedules-off` görevi (1.6); R18 ABD 2026-10-25 (1.1, 1.3, 1.4, 1.7 gözlemi); Kasım başı 9.3 + 8.6 hatırlatması.

### 🎨 Sahip Arayüz Talepleri

- [x] **U-1 "Lastik Sıcaklık Pencereleri ve Aşınma Dinamiği" bileşeninin iOS estetiğinde yeniden tasarımı (Sahip talebi 2026-10-12; uygulayan Claude, C-2):** `components/glossary/TyreThermalWindows.tsx` (`/tech-glossary`). Sahibin brifi, olduğu gibi:

  > Role: Lead Product Designer & Creative Technologist
  >
  > Mevcut "Lastik Sıcaklık Pencereleri ve Aşınma Dinamiği" komponentimiz şu anda fazla mühendislik/telemetri odaklı, görsel hiyerarşisi boğucu, renk paleti donuk ve mobil/desktop deneyiminde sert bir yapıda duruyor.
  >
  > Senden ricam: Projemizin kendi tasarım sistemini temel alarak; iOS estetiğinde (Human Interface Guidelines ruhunu taşıyan, pürüzsüz frosted-glass dokular, mükemmel border-radius oranları, canlı ama rafine renkler ve akıcı yaylı/spring mikro animasyonlar) bu komponenti baştan aşağı yeniden ele alman.
  >
  > Lütfen tasarım ve etkileşim vizyonunu şu prensiplerle kurgula:
  >
  > 1. Görsel Dil & Atmosfer (iOS Look & Feel):
  > - Kaba ve kontrastı düşük kutular yerine; katmanlı derinlik, zarif iç ışıma (inner glow), ince translucent bordürler ve modern bir dark-mode cam dokusu (ultra-refined blur / glassmorphism) kullan.
  > - Tipografide monospaced/aşırı teknik havayı kır; bilgiyi tek bakışta aktaran, net bir hiyerarşiye sahip modern bir tipografik ritim oluştur.
  > - Bilgi panellerini (Kabarcıklanma, Granüllenme vb.) sayfanın altına atılmış statik metin kutuları gibi değil; keşfedilebilir, interaktif kartlar, akordeonlar ya da dokunulduğunda yumuşakça açılan bağlamsal bilgi pencereleri (contextual bottom sheet / modal / popover) olarak düşün.
  >
  > 2. C1 - C5 Hamur Seçimi (Segmented / Pill Selector):
  > - Mevcut küçük ve sıkışık radyo butonları yerine; iOS tarzı akıcı, dokunsal geri bildirimi hissettiren bir "segmented pill control" kurgula.
  > - Bir hamurdan (örn. C5) diğerine geçerken arka plandaki seçim hapı (active pill indicator) spring animasyonuyla akarak kaysın.
  > - Her hamurun kendi kimlik rengi (yumuşak sarı, kırmızı, beyaz) arayüzün geneline hafif, sofistike bir ambient glow / ambient lighting etkisi yaysın.
  >
  > 3. Sıcaklık Penceresi ve Termal Gösterge (Hero Visual):
  > - Mevcut statik ve boğuk slider/çubuk görüntüsünü kaldır. Burası komponentin kalbi olmalı.
  > - Sıcaklık aralığını (Soğuk / Optimum Çalışma / Aşırı Isınma) adeta dinamik bir Apple Health halkası ya da lüks bir otomobil kadranı akıcılığında sun.
  > - "Optimum Aralık" ve "Zirve Tutuş (Peak)" alanını neon sertliğinde değil, zarif bir nefes alma efekti (subtle pulse glow) ve parıltılı bir odak ile göster.
  > - Hamur değiştiğinde sıcaklık barındaki aralıklar ve ibreler sertçe zıplamak yerine; yaylı fizik (spring physics) ile esneyerek yeni konumuna aksın.
  > - Kullanıcı parmağıyla veya imleciyle bar üzerinde gezinebilmeli (scrubbing/slider hissi); derece değiştikçe lastiğin termal risk durumu (Graining vs. Blistering) canlı bir geri bildirimle hissettirilmeli.
  >
  > 4. İstatistik & Metrik Kartları:
  > - "Isınma Hızı", "Aşınma Direnci", "Min/Maks Eşik" gibi verileri düz sıkışık tablolar yerine; temiz, geniş boşluklu (airy), mikro göstergelere veya zarif progress barlara sahip modern KPI kartları olarak tasarla.
  >
  > 5. Mobil & Tablet Esnekliği:
  > - Mobilde dikey eksende darmadağın olan ve metinleri sıkışan yapıyı tamamen düzelt; her şey başparmakla kolayca gezilebilir, ritmik ve hafif hissedilmeli.
  >
  > Özetle: Ekranı sıkıcı bir telemetri raporu olmaktan çıkar; bir F1 pilotunun kokpit iPad'inde göreceği kadar estetik, sezgisel, büyüleyici ve akıcı bir görsel hikaye anlatımına dönüştür. Kendi tasarım sistemimizin bileşenlerini ve animasyon yeteneklerini sonuna kadar kullan.

  - **Yapıldı (Claude, 2026-10-13):** bağlayıcı maddeler sahibin cümleleriyle `docs/design/apex-component-rules.md` §3'e yazıldı. `components/glossary/TyreThermalWindows.tsx` baştan: cam kart (katmanlı, iç ışıma, ince saydam kenar), hamur rengine ve risk bölgesine göre değişen ortam ışığı; `role="radiogroup"` hap seçici (kayan gösterge yay animasyonuyla, ok tuşları); 270° termal kadran (soğuk / çalışma penceresi / aşırı ısı, nefes alan zirve işareti ve pencere halesi), parmak/fare ile sürükleme ve `role="slider"` klavye (oklar, PageUp/Down, Home/End); okuma "Soğuk · Granüllenme riski / Çalışma penceresinde / Zirve tutuş / Aşırı ısınma · Kabarcıklanma riski" ve pencereye uzaklık; hamur değişince pencere, işaret ve başparmak yayla yeni yere akar; KPI kartları (dört basamaklı mikro gösterge, pencere çubuğu, "Zirveye al"); Granüllenme/Kabarcıklanma açılır kartları, kadran o bölgedeyken "Şu an buradasınız" ile vurgulanır. Yay sabitleri `lib/motion.ts`, kadran hesabı `lib/glossary/thermalDial.ts` (`tests/thermal-dial.test.ts`, 4). `framer-motion` (zaten bağımlılık) `LazyMotion` + `domAnimation` ile; ana sayfa JS'i değişmedi (248 KB gzip), `/tr/tech-glossary` ilk yükleme 272 KB gzip.
  - Ölçüldü (yerel, tarayıcı): 1440 px'te C5 seçimi → kadran 100°C "Zirve tutuş"; klavyeyle +20 → 120°C, Kabarcıklanma kartında "Şu an buradasınız"; sürükleme → 82°C "Soğuk · Granüllenme riski" ve 148°C "Aşırı ısınma"; 375 ve 768 px'te yatay taşma yok, 32 px altı hedef yok; açılır kart açılıyor; EN metinleri sunucu HTML'inde; konsolda hata yok. **Ölçülmedi:** `prefers-reduced-motion` (tarayıcı panelinde öykünme yok; kod yolu: `useReducedMotion` ile anında atlama, `MotionConfig reducedMotion="user"`, global CSS bloğu nefes efektini durdurur).
  - Uygulama notları (Claude): `AGENTS.md` sınırları geçerli — klavye ile kullanılabilir kaydırıcı (`role="slider"`, ok tuşları), görünür odak, `prefers-reduced-motion`'da yay animasyonları kapalı, WCAG AA kontrast; sıcaklık değerleri bileşendeki mevcut editoryal veriden (7.2 kapsamında, kaynakla doğrulanmadı). Yeni animasyon kütüphanesi eklemek bağımlılık değişikliği sayılır (sahip onayı); önce CSS/`requestAnimationFrame` yay fiziğiyle yapılır.

- [x] **U-2 Navbar (sahip, 2026-10-13, §1.2 güncellemesi):** kırmızı kutu kalktı; Apex logo işareti (`components/brand/ApexMark.tsx`), ana sayfa seçiliyken apeks noktası parlar + hale + accent "ARŞİV"; sayfa adları gövde yazı tipinde, seçili çizgi kısa ve ışıltılı; buzlu çubuk, kenarlarda sönen çizgi. `c1dce99`.
- [x] **U-3 Ana sayfa Apex kimliği (sahip, §5):** hero üst bandı (`components/home/HeroBrandBar.tsx`): işaret, APEX, "1950'den bugüne Formula 1 arşivi ve canlı veri", masaüstünde arşiv sayıları (F1DB: 77 sezon, 1.166 GP, 858 pilot, 187 takım; `archiveTotals`), konturlu APEX filigranı. Mobilde marka ilk kez görünür. `c1dce99`.
- [x] **U-4 Sözlük: lastik rafı, kavram kartları, kural dönemleri (sahip, §6):** `TyreCompoundExplorer` (kuru/ıslak raf, seçilen lastiğin hikâye paneli, yaylı göstergeler; eski kart ızgarası + alt pencere + masaüstünde de görünen kaydırma satırı kalktı), `TermDossierCard` (diyagram kartın kahramanı, 4:3, `<dialog>` ile tam boy), `RegulationErasPanel` (zaman şeridi + ilerleme çizgisi, "Kural ne dedi? → Mühendisler nasıl cevap verdi?" okuma akışı, etki kartları, önceki/sonraki). Tarayıcıda 1024 / 375 px: taşma yok, 32 px altı hedef yok, diyalog Escape ile kapanıp odağı geri veriyor. `c1dce99`.
- [x] **U-5 Grid ve yıl seçici (sahip, §1.2.1, §4):** yıl seçicide on yıl başlıkları yok; grid her zaman takıma göre (anahtar ve sürücü listesi kaldırıldı, `/drivers` ve `/teams` grid'i gösterir); pilot fotoğrafları üst kadrajdan (`object-position: 50% 20%`). `73dbb9c`.
- [~] **U-6 (Antigravity, 2026-10-16):** `app/globals.css` içindeki tipografi ve bileşen yardımcı sınıfları (`.display-hero`, `.headline-*`, `.body-*`, `.label-caps`, `.hero-number`, `.pb-mobile-nav`, `.touch-target`, `.story-*`, `.film-grain`, `.pit-wall-scroll`, `.apex-*`) Tailwind 4 `@layer components` içine alındı. Böylece `text-[10px]`, `text-xs`, `md:hidden` gibi Tailwind yardımcı sınıflarının bileşen stillerini ezebilmesi sağlandı; tsc (0 hata), lint (0 hata), vitest (749/749) ve production build (50/50) hatasız geçti. Claude doğrulaması bekleniyor.
- [~] **R-1 (Claude incelemesi, 2026-10-13 / 14):** Antigravity'nin Faz 10/11/12/14 işi incelendi ve `main`'e alındı.
  - Yapıldı (2026-10-14): pist notları 26 pist EN+TR kaynaksız G/hız değerlerinden arındırıldı (yalnızca belgelenen sayılar kaldı); pist hikâyelerindeki uydurma hızlar ve Spa 2000 / Bakü 2021 olgu hataları düzeltildi; Lindblad, Hadjar, Ocon, Audi olguları kaynakla düzeltildi; Antonelli (13 galibiyet) ve Doohan doğrulandı.
  - Yapıldı (tarayıcı, 375 px + masaüstü): pilot ve takım sayfasında yatay taşma yok. Bulunan ve düzeltilen: grid içindeki çıplak `col-span-12` sarmalayıcıları mobil/tablette örtük 12 sütun açıp kartları ~50 px'e eziyordu (makine kartlı takım sayfalarında `3a44f63`'ten beri canlıda); takım hero'sunda görsel yokken "-" kutusu; "PTS"/"WDC"/"HOURS AGO" Türkçe sayfada; mobil isim başlığında İ.
  - Açık: alıntılar `docs/editorial/quotes-pending-source.md` (kaynak bulunursa `sourceUrl` ile geri; Bottas 2019 ve Bruce McLaren 1964 adayları). Faz 13 Claude tarafından yapıldı (aşağıda). Tekrar eden sayılar kaldırıldı (sahip, 2026-10-14: "ikilik olmasın"): takım ve pilot sayfasında her sayı tek yerde.

### 🎨 Antigravity İş Listesi (frontend)

- [x] **AG-3 Takım Detay Sayfası Yeniden Tasarımı (Faz 10):** Apple akıcı tasarım prensipleri ve Formula 1 sinematik mühendislik estetiğinde takım detay sayfasının (`/teams/[constructorId]`) baştan tasarlanması (Cinematic Poster Hero, Fast Facts Bento Telemetry Ribbon, Dual Pilot Cockpit Modules, Editorial Legacy & Season Scrubber). Ayrıntı Faz 10 altında.
- [x] **AG-4 Editoryal Anlatı ve Ev Sesi Reformu (Faz 11):** Pilot, takım ve pist detay sayfalarındaki metinlerin F1 Anlatı Stil Kılavuzu (v1 & v2) ev sesiyle; pilotun kariyer derinliğine, takımın mitolojisine ve pistin mekanik karakterine göre özelleştirilmiş, yapay zekadan uzak, iki dilli (TR/EN) editoryal dönüşüm. Ayrıntı Faz 11 altında.
- [x] **AG-5 Pilot Detay Sayfası Yeniden Tasarımı (Faz 12):** Apple akıcı arayüz prensipleri ve F1 telemetri estetiğinde pilot detay sayfasının (`/drivers/[driverId]`) baştan tasarlanması (Split Driver Hero, Career Telemetry Bento, Active Season Pulse & H2H, Chronological Legacy Chapters). Ayrıntı Faz 12 altında.
- [x] **AG-6 Pist Detay Sayfası Yeniden Tasarımı (Faz 13, Claude yaptı 2026-10-14):** Apple WWDC akıcı tasarım prensipleri ve F1 teknik telemetrisiyle pist detay sayfasının (`/circuits/[id]`) baştan tasarlanması (Cinematic Track Hero, Interactive Sector & Corner Pin Vector, Topo Elevation Ribbon, Strategy Demands Module). Ayrıntı Faz 13 altında.
- [x] **AG-7 Grid Sayfası Görsel Kadraj & Medya Optimizasyonu (Faz 14):** 11 takımın araç ve pilot slotları için kesin kadraj (object-position), alttan karartma gradyanı (scrim), renk derecelendirme filtresi (contrast/saturate) ve yarış numarası filigranı entegrasyonu. Ayrıntı Faz 14 altında.
- Tamamlananlar: AG-1 (hikâye görseli notu, kaynak satırı, özgün sayfaya bağlantı, `/media-sources` bölümü) ve AG-2 (atıf rozeti `aria-label`) canlıya alındı (`464dbf0`).

### ⏱️ Faz 1: Kusursuz Saat — Veri Mimarisi, Canlı Senkronizasyon & Caching
*Vizyonun 1. önceliği: Arka planda saat gibi işleyen harmonik veri mimarisi ve sıfır gecikmeli yanıt.*

- [~] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması (Claude + Sahip, yarış hafta sonu):**
  - Doğrulandı: `/api/live-timing` rota simülasyonu (`tests/live-timing-route.test.ts`, 10 test): canlı pencere + 10 dk bitiş toleransı, `Cache-Control: public, s-maxage=5, stale-while-revalidate=15`, 25 eşzamanlı istek → 1 upstream turu (stampede guard), 5 sn TTL memo, upstream hata / 8 sn zaman aşımında son iyi sonucun sunulması, 502 (genel gövde) ve 429 (`Retry-After`) yolları. OpenF1 `sessions?session_key=latest` canlı probu: HTTP 200, 1.4 sn (2026-10-06; son seans 2026-10-04 Race, bitmiş → rota `live:false` döner). **Bu sonuç yalnızca canlı seans dışında geçerli** (aşağıya bakın).
  - **Ölçüldü (2026-10-11, R17 Singapur yarışı sırasında, `logs/2026-10-11.md` §2):** OpenF1 canlı seans süresince kimliksiz TÜM isteklere 401 dönüyor (`sessions`, `meetings`, `drivers`, `position`, `intervals`, geçmiş `sessions?year=2024` dahil; 13:16Z–13:55Z ölçüldü). Adaptör kimlik bilgisi göndermediği için `/api/live-timing` yarış boyunca 502 verdi; tracker "Canlı zamanlama şu an yok" gösterdi, sayfa kırılmadı. Yani canlı seansla uçtan uca gözlem **bu hafta sonu yapılamadı**; tasarımın "canlı = `date_start`–`date_end` aralığı" varsayımı kimlik doğrulaması olmadan çalışamıyor. Çözüm 1.7'de.
  - Açık: gerçek bir yarış hafta sonunda canlı seansla `LiveRaceTracker` + rotanın uçtan uca gözlemi (1.7 çözülmeden mümkün değil). (Eski plan metnindeki `s-maxage=3 / swr=9` koddan farklıydı; kod ve `apex-reference.md` `5 / 15` — OpenF1'in paylaşımlı 3 req/sn bütçesi — olarak doğrulandı.)
  - Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.A (ilk fırsat: R17 Singapur, 9–11 Ekim).
- [~] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger (Claude, yarış hafta sonu):**
  - Doğrulandı: `sync-f1` yerleşmiş (settled) snapshot'ı yeniden çekmiyor. Jolpica kaynaklı bir satır, due penceresinden ≥ 24 sa sonra çekildiyse final sayılır (`isSnapshotSettled`, `loadSnapshotFetchTimes`); yalnızca `source='jolpica'` satırları sayılır (F1DB placeholder'ı asla settled olmaz), DB okunamazsa her şey çekilir (fail-open), ertelenen yarış otomatik settled olmaktan çıkar, sonuç ve pit stop ayrı kapılanır, `?force=1` hepsini zorlar, yanıtta `settled` sayacı döner. Testler: `tests/sync-f1-idempotent.test.ts` (11 test).
  - Doğrulandı (sahip kararı uygulandı — "bayat satırı hemen sun, arkada yenile"): okuma yolu güncel sezonda bayat ama yakın tarihli (≤ 3 gün, `MAX_SERVE_STALE_MS`) DB satırını anında sunar ve yanıttan sonra `after()` ile arka planda Jolpica'dan yeniler (`lib/data/snapshotRefresh.ts`; takvim, sonuç, sıralama turu, sprint, pit stop; `has*` doğrulaması, `source='jolpica'`, sunucu örneği başına snapshot başına 60 sn bekleme, `next build` sırasında çalışmaz). Satır yok / içerik geçersiz / 3 günden eski ise eskisi gibi canlıya gider. Testler: `tests/snapshot-refresh.test.ts` (8), `tests/snapshot-refresh-read.test.ts` (5).
  - Bilinçli istisna: pilot/takım puan durumu arka planda yenilenmez, bayat sunulur ve `sync-f1` cron'u (1.6) yeniler — liderlik değişimi push bildirimi eski/yeni lideri karşılaştırdığı için sayfa kaynaklı bir yenileme bildirimi sessizce yutardı. Yarış sonrası puan durumu en fazla ~30 dk (QStash devredeyken) eski görünür.
  - Açık: gerçek yarış hafta sonunda gözlem (1.1 ile birlikte). Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.B.
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması (Claude, yarış hafta sonu):**
  - Ölçüm (Supabase MCP, salt-okunur, 2026-10-06): `notified_sessions` 0 satır, `push_subscriptions` 0 satır ve **`service_role`'ün bu iki tabloda hiçbir yetkisi yok** (migration'lar yalnızca `anon/authenticated` için `REVOKE` yazmış, varsayılan yetkilere güvenmiş). Sonuç: `/api/push/register` ve `notify-sessions` bu tabloları okuyup yazamıyor; rota hataları yutuyor (`insert` hatası kontrol edilmiyor). Önceki "tablo devrede" notu yanlıştı.
  - Uygulandı (2026-10-06, sahip onayıyla): `supabase/migrations/20261006000002_push_service_role_grants.sql` — `service_role` artık iki tabloda SELECT/INSERT/UPDATE/DELETE yapabiliyor (`has_table_privilege` ile doğrulandı), anon/authenticated kapalı (gerçek anon REST: 401), `set_updated_at` uyarısı kalktı.
  - Not: push'un tek tüketicisi mobil uygulama (Expo token'ları) ve uygulama rafta; bu yüzden gerçek aboneye gönderim şimdilik test edilemez. Doğrulanacak olan zamanlama: oturumdan ~30 dk önce `notified_sessions` satırının oluşması (abone yoksa gönderim 0, satır yine yazılır).
  - Yapıldı (2026-10-08, `27d49cd`): rota önce `notified_sessions` satırını yazıyor, sonra gönderiyor; `23505` = zaten gönderilmiş, başka yazma hatası gönderimi engelliyor ve koşu 500 dönüyor (`failed`), aboneler okunamazsa hiçbir oturum talep edilmiyor (`tests/notify-sessions-route.test.ts`, 7 test). Yetkiler 2026-10-08'de yeniden ölçüldü (`service_role` SIUD true, anon/authenticated false).
  - Açık: gerçek yarış hafta sonunda zamanlama gözlemi. Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.C.
- [~] **1.6 Zamanlayıcı Güvenilirliği: GitHub `schedule` → Upstash QStash (Kuruldu 2026-10-12, EU, 3 zamanlama; GitHub `schedule` kaldırma açık):**
  - **Neden (araştırıldı, 2026-10-07):** GitHub zamanlanmış workflow'ları "best effort" çalıştırır; resmî belgesine göre yoğun yükte (özellikle her saatin başında) geciktirilir ve yeterince yoğunsa kuyruktaki işler **düşürülür**. Ölçüm (`gh run list`): `notify-sessions` kâğıt üzerinde 10 dk, gerçekte medyan 308 dk (~5 koşu/gün, beklenen 144); `sync-news`/`sync-media` saatlik, gerçekte ~5/gün; `sync-f1-race-aware` ~5/gün, en uzun aralık 9,4 sa. Bizim zamanlamamız geçerli (5 dk alt sınırına uyuyor, dakika 0'a konmamış, repo public) — **hata platformun sınırında ve bizim mimari seçimimizde**: zamana duyarlı işler (oturumdan 30 dk önce push, yarıştan 2,5 sa sonra sonuç) garantisiz bir tetikleyiciye bağlanmıştı.
  - **Yapıldı (Claude, 2026-10-07):** `scripts/sync-f1-scheduled.ts` geriye bakış 65 dk → 12 sa (GitHub yedeği için). QStash kodu: `lib/cron/qstashSchedules.ts` (4 zamanlama), `scripts/qstash-sync.ts` (`npm run qstash:sync`: kur/güncelle, `--dry-run`, `--list`, `--remove`, `--skip`), `tests/qstash-schedules.test.ts` (23 test). Rotalar değişmedi: QStash `Authorization: Bearer <CRON_SECRET>` başlığını iletir (`Upstash-Forward-Authorization`).
  - **Kapasite (Upstash ücretsiz plan, 2026-10-07'de fiyat sayfasından):** günde 1.000 mesaj, 10 aktif zamanlama, 15 dk HTTP yanıt süresi; her teslimat denemesi (retry dahil) 1 mesaj sayılır, sınırlar "soft". Bizim yük: `notify-sessions` */5 = 288, `sync-f1` */30 = 48, `sync-news` saatlik = 24, `sync-media` saatlik = 24 → **normal gün 384, en kötü durum (her koşu hata verip her retry kullanılsa) 480 mesaj; 4/10 zamanlama.** Test, en kötü durum kotanın %60'ını aşarsa kırmızı olur.
  - **Güncel (2026-10-11):** cron rotaları QStash imzasını da kabul ediyor (`lib/cronAuth.ts`, `tests/cronAuth.test.ts`), zamanlamalar `CRON_SECRET` taşımıyor (Vercel'deki değer "sensitive", geri okunamıyor). Upstash Claude eklentisi kuruldu (`npx -y upstash setup --yes --claude`: marketplace `upstash/skills`, eklenti `upstash@upstash`, kullanıcı kapsamı). **Sahip adımları (yapıldı):** (1) Vercel → Settings → Environment Variables: `QSTASH_CURRENT_SIGNING_KEY` ve `QSTASH_NEXT_SIGNING_KEY` (Production, Sensitive) + redeploy; (2) Claude uygulamasını yeniden başlatıp ilk Upstash MCP kullanımında tarayıcıdaki onayda read-only'yi kapatmak. **Yapıldı (Claude, 2026-10-12):** aşağıdaki madde.
  - **Kuruldu (Claude, 2026-10-12, sahip kararıyla MCP yolu; `logs/2026-10-12.md` §1):** Upstash MCP `create` yalnızca `POST`, `retries: 3`, varsayılan timeout ve otomatik kimlik (`scd_…`) kuruyor (method, retries, timeout, kimlik verilemiyor); rotalar GET idi, bu yüzden 5 cron rotasına `export const POST = GET` eklendi (`5a42b84`: aynı işleyici, aynı kimlik doğrulama, boş gövde imzası). EU bölgesinde 3 zamanlama: `sync-f1` `*/30`, `sync-news` `11 * * * *`, `sync-media` `41 * * * *`; `notify-sessions` kurulmadı (mobil rafta). Bütçe: normal 96, en kötü 384 mesaj/gün (retries 3), kota 1.000. Ölçüm: ilk teslimatların üçü de `SUCCESS` (2xx), DLQ boş. **Dikkat:** canlı zamanlamalar `qstash:sync` betiğinin `apex-*` kimliklerini taşımıyor; betik çalıştırılırsa kopya oluşur, önce MCP'dekiler silinmeli.
  - **Açık (Claude, QStash doğrulandıktan ~1 hafta sonra):** dört workflow'dan `schedule:` tetikleyicisini kaldırmak (yalnızca `workflow_dispatch` kalır) ki iki çağıran üst üste binmesin.
- [~] **1.7 OpenF1 canlı seans erişimi: kimlik doğrulama kararı ve canlı zamanlamanın yarış boyunca çalışması (Sahip kararı + Claude; 2026-10-11 R17 yarışında bulundu):**
  - **Sorun (ölçüldü, `logs/2026-10-11.md` §2):** OpenF1 canlı seans süresince kimliksiz tüm erişimi kapatıyor ("Live F1 session in progress… restricted to authenticated users until the session ends"). `lib/f1/sources/openf1.ts` `Authorization` göndermiyor → `/api/live-timing` canlı seans boyunca 502, ana sayfa tracker'ı "Canlı zamanlama şu an yok" gösteriyor. Geçmiş veri seans dışında ücretsiz ve kimliksiz çalışıyor (2026-10-06 ölçümü).
  - **Sahip kararı (2026-10-11): OpenF1 ücretsiz (Community) plan, canlı takip için seçenek (c):** seans sırasında canlı sıralama yok; ana sayfa "Lights out" paneli (start ışıkları, yarış saati, sonuçların nerede çıkacağı), bayraktan sonra "Bayrak düştü" + tur sayfası bağlantısı (`components/home/LiveRaceTracker.tsx`, tarayıcıda doğrulandı). Yarış sonrası sonuç + puan durumu OpenF1 ücretsiz katmanından dakikalar içinde (`lib/f1/provisional.ts`, `lib/f1/provisionalSync.ts`, `sync-f1` adım 6; testler `tests/provisional-openf1.test.ts` 7, `tests/provisional-sync.test.ts` 10; R17 gerçek verisiyle kuru deneme: 22 sonuç satırı, 23 pilot, 11 takım, tüm kimlikler Jolpica'dan eşlendi). Kalan: R18'de canlı gözlem (runbook 3.B0). QStash kuruldu (1.6, 2026-10-12): `sync-f1` her 30 dk çalışır, ilk geçici yazma bayraktan en fazla ~30 dk sonra beklenir.
  - **(Sahip) Karar (geçmiş not):** (a) OpenF1 gerçek zamanlı erişimini (ücretli abonelik/sponsorluk) almak mı, (b) almadan "canlı zamanlama yarış boyunca yok" durumunu kabul edip arayüz metnini bunu dürüstçe söyleyecek şekilde değiştirmek mi, (c) başka kaynak mı. Fiyat resmi sayfalarda yok; `openf1.org/auth.html` üzerindeki başvuru/ödeme bağlantısından öğrenilir. Üçüncü taraf bir listeleme €9,90 ve "oturumdan 30 dk önce – 30 dk sonra" penceresi diyor, resmi kaynak doğrulamıyor: sahip kendi teklifini görmeden varsayılmaz. Secret'lar (kullanıcı adı/parola) yalnızca sunucu ortam değişkeni olur, sohbette ve kodda yer almaz.
  - **(Claude) Karar (a) olursa, kod:** `lib/f1/sources/openf1.ts` içinde sunucu tarafı token alımı: `POST https://api.openf1.org/token` (`application/x-www-form-urlencoded`, `username`, `password`) → `{expires_in:"3600", access_token, token_type:"bearer"}`; token bellekte ~55 dk önbelleğe alınır, her isteğe `Authorization: Bearer <token>`; 401'de bir kez yeniden token alıp tekrar dene; parola yoksa bugünkü davranış (kimliksiz, fail-closed 502). OpenF1 "token değişimi backend'de olmalı" diyor: token ve kimlik bilgisi tarayıcıya hiç gitmez. Env adları (öneri, sahip onaylar): `OPENF1_USERNAME`, `OPENF1_PASSWORD`; kod okumaya başladığı anda `.env.example`'a boş değerle eklenir. Testler: token önbelleği, süre dolumu, 401'de yenileme, kimlik bilgisi yokken eski yol. Abonelikle gelen hız sınırı rakamları OpenF1 sayfasında yok: ilk gerçek ölçümden sonra `apex-reference.md` ve rotadaki 3 req/sn yorumu güncellenir.
  - **Yapıldı (Claude, 2026-10-11, sahip yetkisiyle):** (1) 401 → `OpenF1RestrictedError`; rota 200 `{live:true, restricted:true}` + `s-maxage=60`, 60 sn hafıza (izleyici sayısından bağımsız dakikada en fazla 1 upstream kontrolü), diğer hatalar 15 sn hafıza + `Retry-After` (`tests/live-timing-route.test.ts` +4 test). (2) Tracker: kilitliyken 60 sn, hatada 24/48/96/120 sn geri çekilme, kilit için açıklayıcı metin (`lib/home/livePoll.ts`, `tests/live-poll.test.ts`). (3) `sync-radio` ilk kilitte durur, 200 `deferred` döner (`tests/sync-radio-route.test.ts`). (4) Karar (a)'nın kodu hazır: `OPENF1_USERNAME`/`OPENF1_PASSWORD` verilirse token alımı, önbellek, 401'de tek yenileme (`tests/openf1-auth.test.ts`, 5 test; `.env.example`'a boş eklendi). Kalan: sahip kararı (abonelik) ve R18'de gerçek kilitli seansta gözlem.
  - **(Claude) Karardan bağımsız, hemen yapılabilir (önceki not, yukarıda yapıldı):** (1) `/api/live-timing` hata yanıtı önbelleğe alınmıyor (502'de `Cache-Control` yok, `_cache` yalnızca başarıda dolar): OpenF1 kapalıyken her izleyici 12 sn'de bir doğrudan OpenF1'e 401 isteği ağını üretiyor (N izleyici ≈ N/12 istek/sn, paylaşımlı 3 req/sn sınırı N > 36'da aşılır; çıkarım, ölçülmedi). Kısa bir hata önbelleği (ör. rotada birkaç saniyelik başarısızlık memo'su ve 502'ye kısa `s-maxage`) + `tests/live-timing-route.test.ts`'e test. (2) `LiveRaceTracker` art arda hatada poll aralığını uzatsın (geri çekilme); şu an her başarısız poll konsola kırmızı 502 yazıyor. (3) `sync-radio` (08:00 UTC) OpenF1 kullanıyor: canlı bir seansa denk gelirse 401 alır; `errors` içine yazıp yazmadığı, ertesi koşuda telafi edip etmediği incelenmeli (ölçülmedi).
  - **(Antigravity, 2026-10-16) Arayüz metni ve yönlendirme:** `ui.home.live.unavailable` ve `lockedBody` metinleri güncellendi (veri kaynağının yarış boyunca kısıtlı olduğu dürüstçe açıklandı); `LightsOutPanel` bileşenine `resultsHref` desteği bağlandı ve "Yarış sayfası →" (`resultsLink`) yönlendirme bağlantısı eklendi (TR/EN senkron; `tests/i18n-messages.test.ts` geçti). Claude doğrulaması bekleniyor.
  - **Doğrulama (kapanış ölçütü):** bir sonraki yarış hafta sonunda (R18 ABD, yarış Paz 2026-10-25 20:00Z) `docs/reference/yaris-hafta-sonu-dogrulama.md` 3.A: canlı seansta `live:true`, `rows` ≥ 18, `Cache-Control: public, s-maxage=5, stale-while-revalidate=15`, 1 upstream turu; `interval` alanının dolu olup olmadığı ayrıca not edilir (`/intervals` canlı ucunun kapalı olduğuna dair ikincil bir not var, doğrulanmadı).

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals
*Vizyonun 6. önceliği: Ürünün arama motorlarında kusursuz indekslenmesi ve performans tescili.*

- [~] **6.1 Structured Data (JSON-LD) Doğrulaması (Claude + Sahip):**
  - Doğrulandı (2026-10-07): ana sayfa `WebSite`, sürücü `Person`, takım `SportsTeam`, tur `SportsEvent`, hikâye `Article` ve Machinery `Vehicle` JSON-LD'leri mevcut ve parse ediliyor; ana sayfada `og:image` var. Tur sayfası artık `sportsEventJsonLd`'ye bağlı ve zorunlu alan koruması var (`name`, `circuitName`, `country`, `startDate` eksikse JSON-LD basılmaz; `tests/localized-seo.test.ts`). `robots.txt` ve `sitemap.xml` canlıda 200.
  - **Rich Results Test ve Schema Markup Validator:** herkese açık araçlar, giriş gerektirmez. 2026-10-08 gecesi Claude tarayıcı panelinde Rich Results Test sayfasını açtı (URL alanı dolu), ama testi başlatmak bir form gönderimi olduğu için ajan güvenlik kuralı gereği sahibin o konuşmadaki açık onayını bekliyor. **Sahip:** ya "Rich Results Test'i çalıştır" deyin (Claude `/anthology/brawn-2009`, `/season/2026/round/17`, `/drivers/norris` için çalıştırıp sonucu yazar) ya da kendiniz [search.google.com/test/rich-results](https://search.google.com/test/rich-results) ile deneyin (`docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.D).
  - **Search Console (Sahip):** (1) Google hesabınızla search.google.com/search-console → *URL prefix* → `https://project-anthology-eight.vercel.app/`; (2) doğrulama yöntemi **HTML tag**: verdiği `content` değerini Vercel **Production** env `GOOGLE_SITE_VERIFICATION` olarak ekleyin (kod hazır: `app/[locale]/layout.tsx` meta etiketini basar; env eklenince redeploy gerekir) veya değeri bana yazın; (3) *Verify*; (4) *Sitemaps* → `sitemap.xml`; (5) birkaç gün sonra *Pages* ve *Enhancements* raporlarının ekran görüntüsünü paylaşın. Not: `*.vercel.app` için DNS doğrulaması yoktur; özel alan adı alınacaksa Search Console'u o alan adıyla kurmak daha doğru (sinyaller taşınmaz).
- [~] **6.2 Core Web Vitals & Lighthouse Baseline (Claude ölçtü; Sahip kararı gerekiyor):**
  - Eşikler: LCP < 2,5 s, INP < 200 ms, CLS < 0,1 (mobil).
  - **Laboratuvar ölçümü (2026-10-08, Lighthouse 13.5, yerel Chrome, canlı site, mobil = yavaş 4G simülasyonu):** ana sayfa LCP 6,5–7,2 s (skor 64–66, CLS ≤ 0,04, TBT ~300 ms); `/season/2026` 3,6 s; `/grid` 5,2 s; `/drivers/norris` 4,5 s; `/circuits/spa` 3,4 s ama CLS 0,115 (eşik üstü). Masaüstü ana sayfa: LCP 1,7 s, skor 91. **Mobil LCP eşiği hiçbir ölçülen sayfada tutmuyor.** Saha verisi (CrUX) alınamadı: PageSpeed Insights API anahtarsız günlük kotası doldu (429).
  - **Teşhis (ana sayfa):** LCP öğesi hero pist fotoğrafı. Dağılım: TTFB ~0,35–0,6 s, **kaynak yükleme gecikmesi ~1,6–1,9 s**, indirme ~0,1–0,2 s, çizim gecikmesi 0,5–0,7 s. Neden: sayfa `force-dynamic` ve `loading.tsx` Suspense sınırının arkasında; ilk HTML yalnızca "yükleniyor" iskeletini taşıyor, görsel ve onun `preload` etiketi ~0,5 s sonra gelen akış parçasında keşfediliyor.
  - **Yapıldı (2026-10-08, `0e06b06`):** hero artık medya varyantlarından `srcset` alıyor (375 px telefon 1600.webp 153 KB yerine 960.webp 61 KB indiriyor) ve fotoğrafın atfı görünüyor. Bu indirme süresini kısalttı; LCP'yi belirleyen keşif gecikmesi değişmedi (ölçüm sonrası 6,5–7,2 s).
  - **Deneyler (2026-10-08, yerel production build, Lighthouse mobil, aynı makine; commit edilmedi):** taban LCP 6,8 / 7,0 / 7,2 s, sayfa 1.716 KiB. (1) Görsel `preload` ipucunu diğer hero verilerini beklemeden göndermek: 7,4–7,8 s → **fayda yok**, geri alındı (yerelde tüm hero okumaları zaten ~200 ms'de bitiyor; asıl yük başka yerde). (2) Ana sayfa haber akışındaki 44 px küçük resimleri kapatmak: sayfa 1.716 → ~650 KiB, LCP **5,6 / 5,8 s** (−1,2…−1,4 s). Küçük resimler kaynak sitelerin (ör. motorsport.com) **tam boy** basın fotoğraflarıdır (130–330 KB'lık 7 dosya, `unoptimized`), yavaş ağda hero görseliyle bant genişliği için yarışıyor.
  - **Sahip kararı gereken seçenekler (Claude önerisi: a):** (a) haber küçük resimlerini kaldırmak (vizyon 4.7 "izinsiz fotoğrafa sıfır tolerans" ile de uyumlu; takım rengi yer tutucusu zaten var) — ölçülen kazanç ~1,3 s; (b) küçük resimleri Next görsel optimizasyonundan geçirmek (kaynak hostlar `remotePatterns`'e eklenir; Vercel görsel dönüştürme kotası/maliyeti sizde; telif sorusu kalır); (c) olduğu gibi bırakmak. Haber sayfalarındaki büyük görseller için aynı soru geçerli. Kalan LCP'nin büyük kısmı JS/çizim gecikmesi (mainthread ~3,3 s, bootup ~1,5 s simülasyonda); ayrı bir iş olarak bakılabilir.
  - **Yapıldı (2026-10-08):** `/circuits/spa` CLS 0,115'in tamamı footer kaymasıydı: kısa yükleme iskeleti footer'ı ekrana getiriyor, içerik akınca aşağı itiyordu. `BentoSkeleton` artık en az bir ekran yüksekliğinde (`min-h-[100svh]`, 10 rota). Lighthouse `/tr/circuits/spa`: yerel production build CLS 0 / 0, aynı anda canlı (eski kod) 0,115 / 0,115.
  - **Sahip kararı ve yapılan (2026-10-12, `8e42c4e`):** küçük resimler kaldırılmadı, optimize edildi. Haber görselleri yayıncının kendi CDN boyutlarıyla isteniyor (`lib/news/imageVariants.ts`: motorsport `s4…s1200`, Ghost `size/wN/format/webp`, BBC `N/….webp`; kopya yok, Vercel optimizasyonu yok), yüklenirken parıltı (`.apex-img-loading`). Ana sayfa hero'su ayrı Suspense'ten çıkarıldı (yüksekliği yarış adına göre değişiyor, iskelet kaydırıyordu). Lighthouse mobil, canlı, önce → sonra (2 koşu): `/tr` 1.419 → 719 KiB, CLS 0,106 → 0,015 / 0, LCP 6,2 → 5,1 / 5,7 s, TBT 870 → 460 / 3.320 ms (2. koşu aykırı); `/tr/news` 3.388 → 1.089 KiB, LCP 5,8 → 4,2 / 4,9 s. Mobil LCP hâlâ 2,5 s üstünde: kalan pay "element render delay" (JS/hidrasyon, 0,9–3,4 s) ve kaynak yükleme gecikmesi (0,9–1,5 s); sonraki iş JS yükü.
  - **Yapıldı (2026-10-12, JS yükü):** tarayıcı Sentry SDK'sı (`@sentry/nextjs`) hata sınırlarından ve `instrumentation-client.ts`'den statik olarak içe aktarıldığı için her sayfada en büyük parça olarak (133 KB gzip) yükleniyordu; oysa Vercel'de `NEXT_PUBLIC_SENTRY_DSN` yok (6.3), yani hiçbir şey göndermiyordu. Artık `lib/monitoring/clientErrors.ts` SDK'yı yalnızca DSN varsa ve sayfa açıldıktan sonra (`requestIdleCallback`) yüklüyor. Yerel production build, `/tr`: ilk yüklemedeki JS 322 → 248 KB gzip (15 dosya), Sentry isteği 0. Canlı Lighthouse (2026-10-13, mobil, `6e8d7c5`+): `/tr` LCP 4,7 / 4,4 s (önce 5,1 / 5,7), TBT 860 / 480 ms, 730 KiB, CLS 0,015, skor 56 / 70; `/tr/news` 898 KiB (önce 1.089), LCP 6,1 / 6,1 / 4,6 s, TBT 110–1.490 ms (bir koşu `NO_NAVSTART` ile boş). Lighthouse makinenin CPU'sunu yavaş buluyor; koşular oynak, haber LCP'si iyileşme sayılmaz. Kalan mobil LCP darboğazı çizim gecikmesi (hidrasyon) ve kaynak yükleme gecikmesi.
  - Saha verisi için: Search Console (6.1) kurulunca *Core Web Vitals* raporu veya bir PageSpeed Insights API anahtarı (sahip; anahtar dosyaya yazılmaz).
  - Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.E.
- [~] **6.4 Site denetimi bulguları (Claude in Chrome, 2026-10-12; 27 bulgu; ayrıntı `logs/2026-10-12.md` §3):**
  - Yapıldı ve ölçüldü: takım sayfası canlı puan (McLaren 316 → 339), grid'de takım değiştiren pilotların puan payı (Red Bull 221 + 97 + Lawson 14 = 332; RB 61 + 38 + Tsunoda 1 = 100), R17 sınıflandırmasında turlanan araç "+N tur" ve boş durum hücresi, +/- sütun açıklaması, kronolojik program, TR büyük harfte İngilizce sözcükler (`lib/i18n/caps.ts`, özel adlarda `lang="en"`), bilinmeyen adreslerde gerçek 404 (ana sayfa iskeleti `(home)` grubuna taşındı), pist sayfasındaki sahte etiketler, sözlük sayaçları ve tek temizle düğmesi, dil değişiminde kaydırma, kazanan kartında soyadı, altbilgi dokunma alanları (≥ 32 px), medya politikası metni (sahip onayı 2026-10-12), kredi satırında ham adres.
  - Tekrar üretilemedi / bilinçli: #9 (TR çerezli `/` 307 ile `/tr`'ye gider), #10 (gerçek 390 px'te taşma yok), #15 (iskeletin kalması arka plan sekmesinde React'in akış parçasını görünür olana kadar bekletmesi; görünür sekmede açılıyor), #16 (sunucu UTC'yi "UTC" etiketiyle gösteriyor, doğru), #21 (hikâye okuma dili ayrı tercih, gizlilik metninde anlatılıyor), #23 (özel ad).
  - Açık: (a) bilinmeyen sürücü/takım/pist kimliği hâlâ 200 + `noindex` (bu rotaların kendi `loading.tsx` akışı; Next belgesi: akış başladıktan sonra durum kodu değişemez) — ya bu rotalardan `loading.tsx` kaldırılır ya da kabul edilir (Claude önerisi: kabul, `noindex` var). (b) #24 Windows'ta bayrak emojileri harf çiftine düşüyor: SVG bayrak için bağımlılık eklemek gerekir (`country-flag-icons`, MIT) — sahip onayı. (c) #14 McLaren logosu: 8.3'te.
- [~] **6.3 Sentry ve Hata Gözlemlenebilirliği (Sahip):**
  - Düzeltildi: kaynak haritası yüklenmediğinde release oluşturma kapatıldı (`next.config.ts`: `release.create` / `finalize` = `SENTRY_UPLOAD_SOURCE_MAPS=true` + token). `npm run build` çıktısında `Project not found` 0 kez (önceki build'de vardı).
  - Açık: prod'da hata yakalama / alert akışının doğrulanması (Sentry projesi `anthology-z0/project-anthology` erişimi — sahip).
  - Ölçüldü (2026-10-12, Vercel env adları): `NEXT_PUBLIC_SENTRY_DSN` Production'da tanımlı değil; tarayıcı hata raporlama şu an kapalı. DSN eklenince SDK kendiliğinden (sonradan) yüklenir. Not (sahip kararı): istemci yapılandırması `sendDefaultPii: true` (IP vb. gönderir); gizlilik metniyle uyum için açılırken `false` önerilir.
  - Sahip adımları: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.F.

---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem
*Sahip kararları ve yasal netleştirme gerektiren maddeler.*

- [~] **7.1 `public/stories` Görselleri: Gerçek Fotoğraf, Kaynak Kaydı, Editoryal Kullanım Notu (Claude veri katmanı ve arayüz canlı; Sahip kaynak doğrulaması):**
  - **Sahip kararları (2026-10-07):** hikâye görselleri sahibin web'den bulup indirdiği **gerçek fotoğraflardır**; **asla yapay zekâ üretimi veya SVG/çizim olmaz** (`AGENTS.md` Forbidden). Sayfada görsellerin **ticari değil editoryal amaçla** kullanıldığı belirtilir; kaynağı bilinen görselde kaynak yazılır ve görsel **özgün kaynağa yönlenir**; kaynağı bulunamayanlar bir **risk listesinde** durur, sahip kaynağından bakıp tek tek doldurur.
  - **Yapıldı (Claude):** `data/stories/image-credits.ts` (56 görselin kaynak kaydı; `unverified` | `sourced`), `tests/story-images.test.ts` (6 test: SVG/raster olmayan dosya yok, her kullanılan görselin dosyası ve kaydı var, orphan yok, `sourced` kaydı https kaynak + yayıncı ister), `scripts/story-image-audit.ts` (`npm run stories:credits -- --write`), risk listesi `docs/reference/hikaye-gorselleri-kaynak-listesi.md` (hangi hikâyedeki hangi görsel; bilinenler).
  - **Ölçüm (2026-10-07):** 56 görsel / 17 hikâye; 0'ı kaynaklı. 33 dosya Canva dışa aktarımı (Ocak 2026; tasarım adı ve tarih gömülü, fotoğrafçı/kaynak/lisans yok), 23 dosya 2026-09-17'de ham web dosyası olarak eklenmiş (yalnızca özgün dosya adı kayıtlı). EXIF/IPTC/XMP taraması: telif, kaynak veya lisans alanı yok; tek yazar alanı Canva hesabının adı. Görsellere bakıldı: örneklenen dosyalar gerçek fotoğraf; AI olup olmadığı üstverden kanıtlanamaz, sahibin beyanına dayanır.
  - **Not (hukuki sınır):** "editoryal, ticari olmayan" notu kullanım amacını açıklar ve kaldırma taleplerini kolaylaştırır; **bir lisans yerine geçmez**. Kaynağı doğrulanamayan görsel riskli kalır; bu yüzden liste var.
  - Yapıldı (2026-10-08, `464dbf0`, eski AG-1): her hikâyenin sonunda editoryal kullanım notu ve `/dmca` bağlantısı; `sourced` kayıtlı görselde kaynak satırı ve görsel + satır özgün sayfaya bağlı (yeni sekme, `nofollow`, yerelleştirilmiş `aria-label`, görünür odak); `unverified` görselde ikisi de yok; `/media-sources` "Hikâye fotoğrafları" bölümü (sayaç: 56'dan 0'ı kayıtlı; yalnızca kayıtlı görseller listelenir). Geçici `sourced` kayıtla yerel production build'de EN, TR ve 375 px'te doğrulandı, kayıt geri alındı.
  - Açık: **Sahip:** listedeki görselleri kaynağından doğrulayıp manifest'i doldurmak — **site denetimi başlarken hatırlatılacak**. Bir kayıt `sourced` olduğu anda arayüz kendiliğinden kaynak satırını ve bağlantıyı gösterir.
- [ ] **7.2 Editoryal İnceleme (Sahip — site denetimi başlarken hatırlatılacak):**
  - Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinleri (`data/history/team-dna.ts`). Sahip genel site denetimini kendisi yapıp hataları bildirecek; ajandan ayrıca olgusal doğrulama istenmedi.
  - Yeni frontend içeriği (kaynakla doğrulanmadı; sahip site denetiminde bildirecek): `data/circuits/lore.ts`, pist irtifa/telemetri sayıları (`data/circuits/topography.ts`, 10 pist), `RegulationErasPanel`, `TyreThermalWindows`.
  - **Doğrulandı (sahip isteği 2026-10-12, "ikonik araçlarda veri doğruluğu önemli"):** `data/machinery/cars.ts` altı aracın sezon sayıları F1DB ile (`tests/machinery-facts.test.ts`, tek sezonluk 5 araç), motor/şanzıman/tasarımcı Wikipedia bilgi kutularıyla karşılaştırıldı. Düzeltilen: F2004 podyum 30 → 29, devir 19,100 → 18.800 yarış / 19.000 sıralama, güç 865 hp yarış / 900–940 hp sıralama; FW14B'de olmayan "üflemeli difüzör" kaldırıldı, aktif süspansiyon Frank Dernie'ye atfedildi, güç 700–750 bhp, 14.500 devir; MP4/4 675 hp, Weismann şanzıman; Lotus 72 güç/devir aralığı ve Tony Rudd; kaynaksız iddialar (ör. "%30 daha az ön kesit", "45° anti-dive", "sıfır arıza") yumuşatıldı. Ayrıca Norris'in ilk podyumu sezonun ikinci değil açılış yarışıydı (`data/drivers/index.ts`).
  - Not (2026-10-08, `35fd2f0`): topografi panelinin kaynak satırı doğrulanmamış sayılar için "FIA Circuit Homologation" diyordu; artık "Editoryal tahmin; resmî FIA verisi değildir" yazıyor. Kayıtsız pistlerde uydurma varsayılan profil (ve Spa'da 5,2 km gibi yanlış varsayılan tur uzunluğu) artık gösterilmiyor. Gerçek kaynak bulunursa satır geri değiştirilebilir.
- [⏸] **7.3 Mobil Uygulama (Sahip — rafta):**
  - Sahip kararı (2026-10-07): `mobile/` **olduğu gibi kalır, geliştirmeye dokunulmaz**; tüm web işleri, mimari ve arayüz oturduktan sonra ele alınır (Expo Go / preview testi, mağaza süreçleri, git durumu). Push bildirimleri (1.4) bu yüzden şimdilik yalnızca zamanlama doğrulaması olarak izlenir.
- [ ] **7.4 Yasal Mailbox'lar (Sahip — en sonda):**
  - `privacy@`, `dmca@`, `contact@apexstats.example` yer tutucuları (`/media-sources` kaldırma bağlantısı dahil) gerçek e-posta adresleriyle değiştirilecek. Sahip kararı (2026-10-07): bütün işler bitip site tam oturduktan, mobil uygulama geliştirildikten ve kapsamlı güvenlik denetimi ile SEO çalışmaları tamamlandıktan sonra sahip temin edecek; o zamana kadar yer tutucular kalır (ajanlar yeni yer tutucu eklemez).

---

### 🖼️ Faz 8: Görsel Temin Sistemi (Media) — Canlıya Alma ve Arayüz Entegrasyonu
*Lisans doğrulamalı pilot/takım/araç/pist görselleri. Backend ve arayüz canlıda (2026-10-06, `f0f7f30`), migration'lar uygulandı, ilk dolum yapıldı. 8.1 (çözümleyici v2, 233/246) ve 8.7 (sertleştirmeler) 2026-10-08'de kapandı; ayrıntı `logs/2026-10-08.md`.*

- [ ] **8.3 İlk Dolum Sonrası Kalite İncelemesi (Sahip — site denetimi başlarken hatırlatılacak):**
  - Düşük güvenli seçimlerin SQL ile listelenip yanlışların `review='rejected'` yapılması (görsel anında gizlenir, sistem sıradakini seçer; SQL: `docs/reference/media-sistemi.md` §13). Bilinen zayıflar: bazı pistlerde etkinlik karesi (`anderstorp`, `estoril`, `watkins_glen`, `miami` kalabalık karesi, `hockenheimring` aksiyon karesi), Nürburgring tek viraj fotoğrafı, 2021 McLaren/Alfa/Williams garaj kareleri. Serbest logosu bulunamayan takımlar placeholder'da kalır (bilinçli).
  - **McLaren logosu (site denetimi #14, 2026-10-12):** seçilen dosya (`McLaren_Racing_logo.png`) siyah yazı + turuncu kavis, saydam zemin; koyu kartta siyah kutu gibi görünüyor. Commons'taki diğer McLaren logoları (`McLaren 2018 logo.svg`, `Mclaren Logo 2021.svg`) da siyah yazılı; açık renkli sürüm yok. Öneri (Claude, sahip onayıyla): `media_assets`'e "koyu mürekkep" bayrağı (çözümleyici saydam olmayan piksellerin parlaklığından hesaplar) ve böyle logolar açık bir plaka üzerinde gösterilir; ya da McLaren için `review='rejected'` ile placeholder. Kredi satırındaki ham adres (`https://www.mclaren.com/`) artık site adı olarak gösteriliyor (`creditText`).
- [ ] **8.6 Eski Sezonlar (1950–2017) Genişletmesi (Sahip — görsel site denetimi ve düzeltmeler bittikten sonra hatırlatılacak):**
  - `MEDIA_MIN_SEASON` (`lib/media/sync.ts`) düşürülerek aynı sistemle geriye genişletilecek.

---

### ☁️ Faz 9: Google Cloud — kredi dönemi (18 Aralık 2026'ya kadar) ve sonrası
*Sahip kararı (2026-10-09): Free Trial kredisinin tamamı 18 Aralık 2026'ya kadar Apex için harcanabilir (testler, tek seferlik üretimler, geliştirme). Kredi bittikten sonra kalıcı yürütme maliyeti **en fazla ~₺50/ay** (sahibin kartından); sistem buna göre kurulur. Hesap ödemeli (`FreeTrialUpgrade`): kredi bitince ücret otomatik kesilir. Hesap ölçümleri (Claude in Chrome, salt-okunur): `logs/2026-10-09.md`. Groq yedek olarak kalır.*

- [ ] **9.0 Hesap, proje ve anahtar kurulumu (Sahip; Claude in Chrome yardımıyla):**
  - **Sahip kararı (2026-10-10):** mevcut `GEMINI_API_KEY` sahibin Google AI Studio **ücretsiz katman** anahtarıdır; silinmez, **yedek olarak kalır**. Yeni GCP anahtarı ayrı bir ortam değişkeniyle eklenir (ad 9.2'de belirlenir, `.env.example`'a boş değerle). Sağlayıcı zinciri: Gemini (Apex GCP projesi) → Gemini (AI Studio ücretsiz) → Groq.
  - Anahtar değerleri sohbete, log'a veya repoya girmez; sahip Vercel'e (Production + Preview, sensitive) ve `.env.local`'a kendisi yazar. GCP yapılandırması henüz yapılmadı (2026-10-10).
  - Apex için ayrı GCP projesi (Avrupa), faturalama bağlı, **Generative Language API** etkin; API anahtarı yalnızca bu API'ye kısıtlı. Testler ve görsel üretimi de aynı anahtarı kullanır.
  - Ana kredinin bu API'yi (ve Cloud Run / Vertex'i) kapsadığı doğrulanır; kapsam metni yalnızca "Certain usage" diyor.
  - Bütçe ve alarmlar: proje bütçesi kredi dönemi için (toplam, 18 Aralık'a kadar) ve kredi sonrası aylık ₺50 gerçek ücret alarmı (%50 / %90 / %100). Bütçe harcamayı durdurmaz, yalnızca uyarır.
- [ ] **9.2 Gemini ana sağlayıcı, Groq yedek (Claude; 9.0 bitince):**
  - Bugün sıra Groq → Gemini ve kod "yalnızca ücretsiz katman" diyor (`lib/news/rewrite.ts`). Sıra ortam değişkeniyle seçilebilir hale gelir (ad `.env.example`'a), varsayılan Gemini (GCP) → Gemini (AI Studio ücretsiz) → Groq; yorum ve README/`technical.md` güncellenir.
  - Hangi sağlayıcının kaç haber yazdığı cron yanıtına ve log'a eklenir (migration gerekmez); aylık Gemini maliyeti bundan ölçülür.
  - **Kredi bitince kural:** ölçülen aylık Gemini maliyeti ₺50'yi aşıyorsa varsayılan sıra Groq → Gemini'ye döner (ücretsiz katman önce).
  - Ölçüm (2026-10-09, canlı DB salt-okunur): son 7 günde 212 haber, 212'si yeniden yazılmış, bekleyen 0, günde 18–42 haber. Bugün kota sorunu yok; geçişin amacı tek anahtar, kalite ve aynı anahtarla görsel/test erişimi.
  - Anahtarla erişilebilen modeller (`models.list`) listelenip `docs/reference/apex-reference.md`'ye yazılır.
- [ ] **9.3 Kredi dönemi tek seferlik işler (Claude öneri, Sahip onayı; 18 Aralık'a kadar, Kasım başında hatırlat):**
  - 8.6 (1950–2017 medya genişletmesi) kredi bitmeden, gerekirse Cloud Run Job ile. Zamanlama sahip kararı.
  - Haftalık PageSpeed / Core Web Vitals ölçümü ve Cloud Monitoring uptime check (ücretsiz kota; kalıcı maliyet ~0).
  - **AI görsel ve ikon denemeleri (sahip izni, 2026-10-09: "gerçekten iyi sonuç alırsak"):** `public/stories` yasağı sürer (`AGENTS.md`); gerçek kişi yüzü, takım logosu/livery'si, F1/FIA markası üretilmez. Sonuçlar önce sahibe gösterilir; sitede kullanılacaksa önce `AGENTS.md`'ye kayıt kuralı (model, prompt, tarih, kullanıldığı yer) sahip onayıyla eklenir.
- [ ] **9.1 Vercel + GCP hibrit mimari (kalıcı Cloud Run servisi; ileride):**
  - **Fikir:** Next.js arayüzü, routing ve edge Vercel'de kalır; uzun süren, ağır işler GCP'de çalışır. Tercih: **Cloud Run** (boşta ücret yok; Jobs ücretsiz kotası saatlik bir işe yetiyor), Compute Engine VM değil (ücretsiz e2-micro yalnızca ABD bölgelerinde).
  - **Bugünkü durum (ölçülmüş): ihtiyaç yok.** `sync-media` 240 sn, `sync-news` 200 sn iş bütçesiyle Vercel'in 300 sn sınırının içinde; süre dolunca kalan iş sonraki koşuya kalıyor. Zamanlama QStash ile (1.6).
  - **Tetikleyiciler (biri yeter):** bir cron rotası sık sık `time budget` ile duruyor; 8.6 Vercel'de sığmıyor; Vercel limit/fatura sorunu; mobil (7.3) gündeme geliyor.
  - **Tasarım notları:** bölge Supabase bölgesine yakın (Avrupa); cron ve upstream API'ler tarayıcıdan çağrılmaz; kimlik `CRON_SECRET` Bearer (+ istenirse Cloud Run IAM/OIDC); gizli değerler Secret Manager'da; QStash hedefi GCP URL'sine çevrilebilir (`lib/cron/qstashSchedules.ts` tam URL desteği ister); kredi sonrası ₺50/ay sınırına uymayan hiçbir şey kalıcı kurulmaz.

---

### 🏎️ Faz 10: Takım Detay Sayfası Yeniden Tasarımı — Cinematic Editorial & Telemetry Console (Antigravity)
*Vizyon ve Hedef: Takım detay sayfasını (`app/[locale]/teams/[constructorId]/page.tsx`) jenerik wiki/dashboard şablonlarından çıkarıp; takımın mirasını, karakterini ve sezon telemetrisini Apple'ın akıcı tasarım prensipleri (WWDC HIG) ve Formula 1'in yüksek kontrastlı sinematik mühendislik estetiğiyle sunan üst düzey bir editoryal deneyime dönüştürmek.*

> **Tasarım Rolü ve Tonu:** Senior Product Designer with an obsession for Apple's fluid design principles and Formula 1's cinematic, high-contrast engineering aesthetic.  
> **Temel Felsefe:** Neon parlamaları ve jenerik kart kalabalığından arındırılmış, saf işçilik ve itidal (pure craft and restraint); Apple WWDC insan arayüzü yönergeleri rehberliğinde resmi bir Formula 1 telemetri konsolu hissi.

- [x] **10.1 Renk, Yüzey Hiyerarşisi ve Üç Kademeli Tipografi Entegrasyonu (Antigravity):** *(Antigravity: Tamamlandı — `#0a0a0a` kanvas, `--surface (#141414)` bento yüzeyleri, 16px radius, `rgba(255,255,255,0.06)` saç teli specular highlight ve Barlow Condensed / Inter / JetBrains Mono 3 kademeli tipografi uygulandı).*
  - **Ana Kanvas:** Derin koyu nötr (`#0a0a0a`), asla saf siyah değil.
  - **Kart ve Bento Modülleri:** `--surface` (`#141414`), keskin 1px zarif kenarlık (`#262626`) ve 16px border-radius (`rounded-2xl`). Işığı yakalayan fiziksel materyal hissi veren saç teli inceliğinde üst kenar ışıması/vurgusu (`rgba(255, 255, 255, 0.06)` hairline top-edge highlight).
  - **İtidal (Restraint):** Takım birincil vurgu rengini (team primary accent) tasarruflu kullan; Apex Kırmızısı'nı (`#ff1801`) kesinlikle yalnızca aktif durumlar, canlı göstergeler ve kritik rozetler için rezerve et.
  - **Üç Kademeli Tipografik Ritim:**
    - *Hero & Bölüm Başlıkları (Display):* Barlow Condensed (Bold/Semibold), sıkı leading (0.92–1.05), negatif optik tracking (`-0.02em`). Poster büyüklüğünde takım adları ve dönüm noktası sayıları.
    - *Gövde ve Anlatı (Narrative):* Inter (Regular, 16px, 1.5–1.75 line-height), takım tarihi ve hikaye anlatımı parçacıkları; yüksek okunabilirlik, nötr kırık beyaz (`#e6e6e6`).
    - *Telemetri ve Üstveri (Metadata):* JetBrains Mono (`tabular-nums`, 12–14px, etiketler için büyük harf + `tracking-[0.1em]`). Şampiyonluklar, yarış galibiyetleri, kuruluş yılı, şasi kodları ve sezon deltaları.

- [x] **10.2 Cinematic Poster Hero (Top 45vh) (Antigravity):** *(Antigravity: Tamamlandı — `TeamSeasonHero.tsx` full-bleed padok/araç görseli, karanlık vinyet katmanı, büyük boyutlu Barlow Condensed takım monikeri, şasi/motor rozeti, markalar klasmanı rozeti ve devasa konturlu yıl filigranı ile yeniden inşa edildi).*
  - Tam genişlik (full-bleed) atmosferik padok / araç görseli üzerine koyu vinyet (dark vignette) katmanı.
  - Büyük boyutlu yoğunlaştırılmış (condensed) takım monikeri, şasi rozeti ve aktif markalar klasmanı sıralaması (constructor standing rank) ile sabitlenmiş ankor kompozisyon.

- [x] **10.3 Fast Facts Bento — Yatay Telemetri Şeridi (Antigravity):** *(Antigravity: Tamamlandı — `TeamTelemetryRibbon.tsx` heykelsi monospaced veri karolarıyla Şampiyonluklar, Galibiyetler, Podyumlar, Poller, Sezon Durumu ve Galibiyet Oranı modülü olarak kuruldu).*
  - Sıkıcı ve donuk tablolar yerine; temel metrikleri (Şampiyonluklar, Grand Prix Katılımları, Pole Pozisyonları, Galibiyet Oranı) heykelsi, monospaced veri karoları (sculptured data tiles) ve cesur kontrast ile sunan yatay telemetri ribbon modülü.

- [x] **10.4 Dual Pilot Cockpit Modules (Antigravity):** *(Antigravity: Tamamlandı — `TeamCockpitLineup.tsx` aktif pilotlar için altın oran portre hizalaması (%35-40), devasa filigran yarış numaraları, takım rengi dikey gösterge çubuğu ve sezon içi puan katkısı yüzdesiyle inşa edildi).*
  - İki aktif pilotu tamamlayıcı ve etkileşimli bento kartları: yoğunlaştırılmış tipografiyle devasa yarış numaraları, sezon içi puan deltası ve takım renginde dikey vurgu çubuğu (`w-1 rounded-full`).

- [x] **10.5 Editorial Legacy & Season Scrubber (Antigravity):** *(Antigravity: Tamamlandı — `SeasonRail.tsx` hero altına taşındı, şampiyonluk göstergeleri ve Apple akıcı geçişleriyle takım detay akışına bağlandı; sahip kuralı §1.2.1 korundu).*
  - İkonik takım dönemlerini ve sezondan sezona performans geçişlerini keşfetmek için etkileşimli, yatay zaman şeridi (timeline strip).
  - Kesintisiz, akıcı yay fiziği (fluid, interruptible spring physics: `damping: 1.0`, `response: 0.35s`, `lib/motion.ts` uyumlu).

---

### 🖋️ Faz 11: Editoryal Anlatı & Ev Sesi Reformu — Pilot, Takım ve Pist Detay Sayfaları (Antigravity)
*Vizyon ve Hedef: `docs/F1_Anlati_Stil_Kilavuzu.md` ve `docs/F1_Anlati_Stil_Kilavuzu_v2.md` rehberliğinde; pilot, takım ve pist detay sayfalarındaki editoryal dili yapay zeka jenerikliğinden ve tek tip wiki şablonlarından kurtarmak; her öznenin kendi ağırlığına, mirasına ve karakterine göre şekillenen, iki dilli (TR/EN), organik ve derinlikli bir ev sesi ("Güvenilir tanık, sıcak anlatıcı") inşa etmek.*

> **Temel Metodoloji:** F1 Anlatı Stil Kılavuzu v1 & v2 ("Ev Sesi": Yiğit Tezcan'dan tez cesareti, sert cümle sonu düşüşü ve mit kırma; Karaboğa'dan yöntem dürüstlüğü, açılış eşiği, montaj nabzı ve insani koda).  
> **Kritik Kısıtlar:** Yapay zeka şablonları (boş sıfatlar, 'delve', 'showcase', 'testament to', 'yürek burkan', melodram) kesinlikle yasak. Duygusal dikte yok (no emotional coaching); duygu kanıtla, veriyle ve somut dönüm noktasıyla taşınır. Hem Türkçe (SOV fiil-sonu tok ritim) hem İngilizce (SVO sert Anglo-Sakson bitişler) bağımsız editoryal özenle yazılır; motamot çeviri yapılmaz.

- [x] **11.1 Pilot Detay Sayfaları — Kariyer Ağırlığı ve Kuşak Farkına Göre Özelleştirilmiş Anlatım (`data/drivers/index.ts` & `/drivers/[driverId]`):** *(Antigravity: Tamamlandı — 23 pilot için derinlemesine editoryal biyografi, çok dönemli `chapters`, `quote` ve Türk/İngiliz ev sesi entegrasyonu; `LoreSection` ve sürücü sayfası genişletildi. Claude Code doğrulaması bekleniyor).*
  - **Tek Tip Şablonun Kırılması:** Her pilot aynı 1 paragraf + 4 standart milat kalıbına sıkıştırılmayacak; anlatımın derinliği ve ölçeği pilotun kariyer hacmine göre esneyecek.
  - **Efsaneler ve Kuşak Liderleri (Hamilton, Alonso):** 20+ yıla yayılan devasa kariyerler, nesiller arası geçişler, kırılma anları, felsefi ve psikolojik evrim (McLaren 2007 iç savaşı, Mercedes hibrit devrimi, Ferrari'de yeni başlangıç / Alonso'nun saf yarışçı inadı, Minardi'den bugüne her çağda rekabetçi kalma direnci). Zengin, çok katmanlı editoryal ark.
  - **Çağın Zirvesindeki Şampiyonlar ve Kazananlar (Verstappen, Leclerc, Norris, Russell, Piastri):** Kırılma anları, zaaflar ve marjinal kazanımlar odağı; unvan savaşının getirdiği zihinsel eşikler, takım içi rekabet dinamikleri.
  - **Çaylaklar ve Genç Yetenekler (Kimi Antonelli, Bearman, Colapinto, Doohan vb.):** Zorlama biyografi destanı yazmak yerine; genç yaş rekorları, alt serilerdeki dominasyon, grid'e geliş biçimi ve üzerlerindeki devasa teknik/psikolojik baskının dürüst ve odaklı analizi.

- [x] **11.2 Takım Detay Sayfaları — Kurumsal Mitoloji ve Karakter Odaklı Anlatım (`data/teams/index.ts` & `/teams/[constructorId]`):** *(Antigravity: Tamamlandı — 11 takım için kurumsal mitoloji, kurucu kökler, felsefi `chapters`, unutulmaz alıntılar ve tam TR/EN paritesi; `LoreSection` ve takım sayfası bağlandı. Claude Code doğrulaması bekleniyor).*
  - **Kurumsal Şablon Tekdüzeliğinin Kırılması:** Takımların hepsi aynı mekanik formata hapsedilmeyecek; anlatım takımın ruhunu ve F1 tarihindeki konumunu yansıtacak.
  - **Scuderia Ferrari:** Maranello mistisizmi, Enzo Ferrari mirası, sporun kendisinden eski olma ağırlığı, Tifosi tutkusu, politikanın ve kazanma baskısının yarattığı kriz-zafer döngüsü.
  - **McLaren:** Bruce McLaren'ın kurucu kökleri, Ron Dennis mükemmeliyetçiliği ve fabrika kültürü, teknoloji öncülüğü, padoğun en sert iç rekabetleri (Senna-Prost, Hamilton-Alonso).
  - **Red Bull Racing:** "İçecek şirketinden F1 imparatorluğuna" dönüşüm, Adrian Newey aerodinamik dehası, tavizsiz kazanma kültürü ve radikal pilot akademisi.
  - **Mercedes-AMG:** Fabrika mühendisliği disiplini, Brackley/Brixworth hibrit çağ dominasyonu, "pazar gününden çok önce fabrikada kazanılan yarışlar".
  - **Williams, Aston Martin, Alpine, Haas, Sauber, RB:** Garajist bağımsızlık direnişi, fabrika kimliği arayışları, tarihsel isim değişimleri ve orta sıra hayatta kalma savaşı.

- [x] **11.3 Pist Detay Sayfaları — Topografik Karakter, Mekanik Baskı ve Efsane Anlar (`data/circuits/facts.ts`, `facts.tr.ts`, `lore.ts` & `/circuits/[id]`):** *(Antigravity: Tamamlandı — 26 pist için telemetri/G-kuvveti/aero/lastik odaklı teknik karakterler, imza viraj analizleri ve zengin tanık/mikroskop anları eklendi. Claude Code doğrulaması bekleniyor).*
  - **Turistik Klişelerin Temizlenmesi:** "Tarihi ve güzel bir pist" gibi ucuz genel geçer cümleler yerine; asfaltın mikro dokusu, lastik hamuruna ve frenlere binen termal/mekanik yük, pilotun göğsündeki G-kuvveti ve aerodinamik ödünler (downforce vs drag).
  - **İmzalı Virajların Felsefesi ve Bedeli:** Spa Eau Rouge/Raidillon'da dikey sıkışma, Suzuka 130R & Degner'de sınırda kalma bedeli, Monza Parabolica/Curva Grande'de düşük yere basma çılgınlığı, Silverstone Maggotts-Becketts-Chapel ritmi, Monaco Tabac ve Yüzme Havuzu'nda sıfır hata toleransı.
  - **Pist Lore Kartlarının Zenginleştirilmesi (`lore.ts`):** Tarihin unutulmaz insan ve mekanik dramları (Senna 1988 Monaco doğaüstü sıralama turu, Häkkinen-Schumacher 2000 Spa Zonta sandviçi, Hamilton 2008 Silverstone 68 saniyelik yağmur dersi vb.) kılavuzdaki "doruğu tanığa bırak" ve "zamanı yavaşlatma (mikroskop)" teknikleriyle iki dilde derinleştirilecek.

- [~] **11.4 İki Dilli (TR & EN) Sayfa Prozodisi ve Doğruluk Denetimi (Antigravity):** *(Antigravity: Tamamlandı — `LoreSection` tipografisi ve esnek bölüm akışı güncellendi, `tsc --noEmit` ve `npm run lint` hatasız geçti. Claude Code doğrulaması bekleniyor).*
  - **Doğrulanmış Olgu Disiplini:** Biyografi ve lore metinlerindeki tüm veriler (şampiyonluk yılları, puanlar, yarış sayıları, doğrudan demeçler) F1DB ve doğrulanmış arşiv kayıtlarıyla çapraz kontrol edilir; efsaneler ve teyitsiz dedikodular ayıklanır.
  - **Arayüz Entegrasyonu ve Esnek Ritim:** Yenilenen editoryal metinlerin web bileşenlerinde (`LoreSection`, `DriverProfileHero`, `TeamLore`, `CircuitLore`) mobil ve masaüstünde görsel hiyerarşiyi bozmadan, responsive akışı koruyarak yerleşmesi.

---

### 🏎️ Faz 12: Pilot Detay Sayfası Yeniden Tasarımı — Cinematic Editorial & Museum-Grade Profile (Antigravity)
*Vizyon ve Hedef: Pilot detay sayfasını (`app/[locale]/drivers/[driverId]/page.tsx`) jenerik admin tarzı sürücü kartından çıkarıp; Apple'ın WWDC akıcı arayüz prensipleri (itidal, optik tipografi, materyal derinliği) ile Formula 1'in karanlık, yüksek kontrastlı telemetri estetiğini sentezleyen, hem insani duyguyu hem de saf telemetri verisini yakalayan müze derecesinde sinematik bir profile dönüştürmek.*

> **Tasarım Rolü ve Perspektifi:** Elite Design Director combining Apple’s WWDC fluid interface principles (restraint, optical typography, material depth) with Formula 1’s dark, high-contrast telemetry aesthetic.  
> **Temel Felsefe:** Jenerik widget'lar, neon parıltıları veya kalabalık wiki kartları kesinlikle yok; Apple küratörlüğünde özel bir padok telemetri terminali hissi; itidal, mekânsal armoni ve saf zanaat (restraint, spatial harmony, pure craft).

- [x] **12.1 Atmosfer, Yüzey Derinliği ve Üç Kademeli Tipografi Entegrasyonu (Antigravity):**
  - **Uygulandı (2026-10-13):** Ana kanvas `#0a0a0a`, bento yüzeyleri `--surface` (`#141414`), 16px radius (`rounded-2xl`), 1px hairline border (`#262626`) ve saç teli üst kenar parlama çizgisi (`rgba(255, 255, 255, 0.06)`). Barlow Condensed hero isim ölçeği, JetBrains Mono telemetri rakamları ve Inter editoryal gövde metinleri entegre edildi.

- [x] **12.2 The Split Driver Hero (Antigravity):**
  - **Uygulandı (2026-10-13):** `DriverProfileHero.tsx` yenilendi; `lib/data/driverPositions.ts` üzerinden pilot bazlı altın oran göz hizası (`DRIVER_GRID_POSITIONS`, `%35–40` dikey hizalama), `[filter:contrast(1.05)_saturate(0.92)]` sinematik editoryal renk filtresi, anıtsal Barlow Condensed tipografi, devasa yarış numarası filigranı (`hero-number`), `CountryFlag` ülke bayrağı ve `P{rank} WDC` aktif sezon sıralama rozeti eklendi. Fotoğrafsız pilotlarda CAD `DriverHeroGraphic` dokusu korundu.

- [x] **12.3 Career Telemetry Bento — Heykelsi Metrik Şeridi (Antigravity):**
  - **Uygulandı (2026-10-13):** `components/profile/DriverTelemetryRibbon.tsx` oluşturuldu. 6 heykelsi veri hücresi (Dünya Şampiyonlukları, GP Katılımları, Galibiyetler, Podyumlar, Pole Pozisyonları, Kariyer Puanı) saç teli parlama çizgileri ve sezon katkı delta göstergeleriyle hero altına yerleştirildi.

- [x] **12.4 Active Season Pulse & Head-to-Head Modülü (Antigravity):**
  - **Uygulandı (2026-10-13):** `components/profile/DriverSeasonPulse.tsx` ile tur tur bitiş pozisyonları (P1 gold, P2-P3 champagne, P4-P10 emerald, DNF muted, mor en hızlı tur göstergesi) ve `components/profile/DriverTeammateDuel.tsx` ile sıralama turları, yarış finişleri ve puan payını kıyaslayan garaj içi H2H düello kartı `app/[locale]/drivers/[driverId]/page.tsx` sayfasına bağlandı.

- [x] **12.5 Chronological Legacy & Story Chapters (Antigravity):**
  - **Uygulandı (2026-10-13):** `LoreSection` çağlara bölünmüş editoryal bölümler, `CareerArc`, `DriverJourney` ve `MachineryCrossLink` ile tam uyum sağlandı.
  - **Ölçülen Doğrulama:** `npx vitest run tests/driver-hero.test.ts tests/editorial-content.test.ts tests/media-components.test.ts` (169/169 test geçti), `npx tsc --noEmit` (0 hata), `npm run lint` (0 hata, 0 uyarı), `npm run build` (0 hata, 50 statik sayfa ve dinamik rotalar başarıyla derlendi). Açık kalan: Claude Code kod incelemesi ve canlı tarayıcı teyidi.

---

### 🏁 Faz 13: Pist Detay Sayfası Yeniden Tasarımı — Telemetry-Driven Architectural Profile (sahip 2026-10-14: Claude yaptı)

> **Durum (Claude, 2026-10-14):** 13.1, 13.2, 13.5 yapıldı; 13.3 ve 13.4, 13.6 kısmen. Yalnızca kaynağı olan veri gösterildi (sahip: "veri doğruluğu önemli"):
> - Yapıldı: sinematik hero (`CircuitHero`: pist fotoğrafı ya da pist çizimi + vinyet, Barlow Condensed ad, ülke bayrağı, yarış sırası, tarih, durum rozeti — Apex kırmızısı yalnızca "SIRADA" durumunda — geri sayım, ilk GP yılı); hızlı bilgi şeridi (`CircuitFactsRibbon`: tur uzunluğu, viraj, tur, yarış mesafesi = tur × uzunluk, tur rekoru telemetri morunda; tur ve mesafe yarış koşulunca görünür, tahmin yok); kendini çizen pist çizimi (`TrackTrace`, lisanslı f1-circuits geometrisi, reduced-motion'da anında); karakter kartı ve irtifa/talep kartı tekrar eden sayılardan ve fazla kırmızıdan arındırıldı; teknik künye kartı kaldırıldı (her bilgi artık bir kez).
> - Yapılmadı, veri yok: sektör sınırları, hız tuzağı, DRS bölgelerinin haritadaki yeri, viraj pinlerinde apeks hızı ve vites, güvenlik aracı olasılığı, pit kaybı, lastik aşınma indeksi, sürekli irtifa eğrisi. Kaynak adayı: FastF1 `get_circuit_info()` (viraj konumları ve numaraları) ve telemetriden irtifa/hız — Faz 9 (GCP) veri hattına iş olarak eklenebilir; uydurma değer gösterilmez.
*Vizyon ve Hedef: Pist detay sayfasını (`app/[locale]/circuits/[id]/page.tsx`) düz ve statik bir pist genel bakışından çıkarıp; Apple'ın WWDC akıcı tasarım prensipleri (itidal, optik tipografi, materyal derinliği, yay fiziği) ile Formula 1'in teknik telemetrisini sentezleyen, pistin topoğrafyasını, mühendislik hassasiyetini ve yarış karakterini yakalayan etkileşimli, mimari bir telemetri profiline dönüştürmek.*

> **Tasarım Rolü ve Felsefesi:** Senior / Principal Product Designer crafting a high-end motorsport interface, synthesizing Apple’s fluid design philosophy (restraint, material depth, spring physics) with Formula 1 technical telemetry.  
> **Temel Felsefe:** Sıfır neon gürültüsü, jenerik wiki tablolarından ve şablon kalabalığından arınmış, rüzgar tüneli enstrümanı gibi kalibre edilmiş, doğrulanmış fiziksel veriler ve Apple sınıfı zanaat (pure craft & restraint).

- [x] **13.1 Renk, Yüzey Mimarisi ve Üç Kademeli Tipografi Entegrasyonu (Antigravity):**
  - **Ana Kanvas:** Derin nötr `--bg` (`#0a0a0a`), asla saf siyah değil.
  - **Kart ve Bento Modülleri:** `--surface` (`#141414`), keskin 1px sınır (`--hairline: #262626`), 16px radius (`--radius-lg: 16px`) ve fiziksel cam hissi veren ışığı yakalayan üst kenar parlama çizgisi (`rgba(255, 255, 255, 0.06)` ambient specular highlight).
  - **Vurgu Disiplini (Accent Discipline):** Tek küresel eylem vurgusu Apex Kırmızısı (`#ff1801`), son derece sınırlı olarak yalnızca aktif durum rozetlerinde kullanılır. Telemetri moru (`#b356fe`), kesinlikle ve yalnızca resmi Tur Rekoru (Lap Record) modülüne rezerve edilir.
  - **Optik Tipografik Hiyerarşi:**
    - *Hero Pist Adı (Moniker):* Barlow Condensed (Bold, sıkı optik tracking `-0.02em`, leading `0.92`), devasa, heykelsi ekran ölçeği.
    - *Teknik Metrikler & Sektörler:* JetBrains Mono (`tabular-nums`, 13–15px, büyük harf + `tracking-[0.1em]` etiketler); pist uzunluğu, tur sayısı, vites frekansı ve sektör zamanlaması.
    - *Editoryal Miras & Anlatı:* Inter (Regular, 16px, line-height 1.6); pist tarihi, yarış mirası ve geçiş zorluğu analizleri için nötr yüksek okunabilirlik.

- [x] **13.2 Cinematic Track Hero (Top 40vh) (Antigravity):**
  - Tam genişlik (full-bleed) hava çekimi veya asfalt/pist kenarı atmosferik dokusu üzerine koyu vinyet (dark vignette) katmanı.
  - Anıtsal pist adı, ülke rozeti, yerleşim konfigürasyon dönemi (örn. "1950 — Günümüz") ve sıradaki Grand Prix takvim/seans rozeti ile sabitlenmiş etkileyici mimari kompozisyon.

- [~] **13.3 Interactive Sector Vector & Telemetry Map (Antigravity):**
  - **Sektör Kodlu SVG Pist İzi:** Belirgin sektör sınırları (Sektör 1, 2, 3), hız tuzağı (speed trap) işaretçisi ve resmi DRS aktivasyon bölgelerini içeren merkezi etkileşimli SVG vektörü.
  - **İkonik Viraj Mikro-Pinleri (Spring Physics):** İkonik dönüm noktalarında (Monaco için Turn 1 Sainte Dévote, Turn 6 Fairmont Hairpin, Tünel, Yüzme Havuzu şikanı, Rascasse vb.) üzerine gelindiğinde/dokunulduğunda akıcı yay fiziğiyle (`damping: 1.0`, `response: 0.35s`, `lib/motion.ts`) apeks sürati ve vites seçimini açan etkileşimli mikro-pinler.

- [~] **13.4 Elevation Profile Ribbon — Topo Telemetry (Antigravity):**
  - Tur mesafesi boyunca pürüzsüz sürekli Bézier eğrileri ve monospaced delta işaretçileriyle tırmanış ve iniş eğimini (Monaco'nun 3.337 km boyunca ünlü 42 metrelik tırmanış/inişi gibi) gösteren minimalist, yüksek yoğunluklu yükseklik profili şeridi.

- [x] **13.5 Sculpted Fast Facts Bento Ribbon (Antigravity):**
  - Yüksek kontrastlı 4 karolu telemetri şeridi: Tur Uzunluğu (3.337 km), Tur Sayısı (78 tur), Toplam Yarış Mesafesi (260.286 km) ve Tüm Zamanların Resmi Tur Rekoru (örn. Monaco için telemetri moru `#b356fe` rozetle vurgulanan `1:12.909 · Lewis Hamilton · 2021`).

- [~] **13.6 Technical Strategy & Demands Module (Antigravity):**
  - Endüstriyel monospaced yoğunlukta teknik telemetri kartları: Tur başına ortalama vites değişimi (örn. ~54 vites/tur), lastik aşınma/degradasyon profili indeksi, pit stop zaman kaybı (saniye), yere basma kuvveti konfigürasyonu (Maximum Downforce indeksi) ve güvenlik aracı (Safety Car) olasılık yüzdesi.

---

### 🏎️ Faz 14: Grid Sayfası Görsel Kadraj, Medya Konumlandırma & Apple Doku Standardizasyonu (Antigravity)
*Vizyon ve Hedef: Grid sayfasında (`app/[locale]/grid/page.tsx` & `GarageTeamPanel.tsx`) solda araç kartı, sağda iki pilot hücresinden oluşan güçlü ritmik düzeni; yatay kartlarda yüzlerin ve araç burun/kanatlarının kesilmesini önleyen kesin kadraj standartları, Apple tarzı karartma gradyanı (scrim), yekpare renk derecelendirmesi ve devasa yarış numarası filigranlarıyla üst düzey bir motorsport editoryal deneyimine dönüştürmek.*

> **Tasarım Felsefesi ve Kadraj Standardı:** Sinematik editoryal ve Apple malzeme disiplini. Araç slotları `3:2` veya `16:9` oranında, yandan profil veya 3/4 açılı; en az `%10` nefes payı ile. Pilot slotları geniş yatay kadrajda göz hizası dikey eksende **altın orana (%35-40)** çekilmiş; kask/şapka tepesi kesilmemiş, bakış yönü içeriye (açık alana) bakan kompozisyon.

- [x] **14.1 Genel Kadraj ve Görsel Yerleşim Standartları (Antigravity):**
  - **Uygulandı (2026-10-13):** `components/standings/GarageTeamPanel.tsx` ve `components/media/MediaAssetView.tsx` güncellendi. Araç slotlarında `aspect-[16/9]` ve en az %10 nefes payı (`p-2.5 sm:p-3`), pilot slotlarında göz hizasını dikey altın orana (%35-40) çeken `DRIVER_GRID_POSITIONS` tablosu (`center 15%` - `center 30%` aralığı) ve `objectFit="contain"` desteği sağlandı.

- [x] **14.2 11 Takım İçin Araç ve Pilot Konumlandırma Konfigürasyonu (`GarageTeamPanel.tsx` / `MediaAssetView.tsx`):**
  - **Uygulandı (2026-10-13):**
    - Mercedes: Araç `center 60%`, Antonelli `center 25%`, Russell `center 30%`.
    - Ferrari: Araç `center 50%`, Hamilton `center 20%`, Leclerc `50% 25%`.
    - McLaren: Araç `center 45%`, Norris `center 30%`, Piastri `center 20%`.
    - Red Bull: Araç `55% 50%`, Verstappen `center 30%`, Lawson `center 25%`.
    - Racing Bulls: Araç `center 50%`, Pilotlar `center 30%`.
    - Alpine: Araç `60% 50%`, Gasly `center 25%`, Doohan/Colapinto `40% 30%`.
    - Haas: Araç `65% 50%`, Ocon `center 15%`, Bearman `center 30%`.
    - Audi (Sauber): Araç `center 50%`, Hülkenberg `center 25%`, Bortoleto `50% 25%`.
    - Williams: Araç `center 55%`, Sainz `center 20%`, Albon `center 25%`.
    - Aston Martin: Araç `center 50%`, Alonso `center 25%`, Stroll `center 25%` + `transform: scaleX(-1)` (bakış yönü içeriye aynalandı).
    - Cadillac: Araç `60% 50%`, Pilot 1 `center 20%`, Pilot 2 / Boş slot mimari wireframe silüet SVG filigranı ile donatıldı.

- [x] **14.3 Apple & Apex Doku ve Tipografi Dokunuşları (Antigravity):**
  - **Uygulandı (2026-10-13):**
    - Alttan karartma gradyanı: `linear-gradient(to top, rgba(10, 10, 10, 0.90) 0%, rgba(10, 10, 10, 0.35) 42%, transparent 100%)` ile pilot isimleri ve P-sıralamaları yüksek kontrast kazandı.
    - Tek tip fotoğraf dili filtresi: `contrast(1.05) saturate(0.9)` hem pilot portrelerine hem araç slotuna uygulandı.
    - Apple malzeme üst kenar ışıltısı: Kartların ve hücrelerin tepe kenarına `h-px bg-white/[0.06]` specular highlight eklendi.
    - Devasa yarış numarası filigranı: Pilot kartlarının sağ üst köşesine %8–12 opaklıkta `font-condensed font-800 text-7xl md:text-8xl select-none text-white/[0.08]` watermark gömüldü.
    - Doğrulama: `tests/media-components.test.ts` (15/15 test başarılı), `npx tsc --noEmit` (0 hata), `npm run lint` (0 hata). Tarayıcı otomasyonu ortamındaki kısıt (Playwright driver 404) nedeniyle canlı görsel teyit Claude Code / manuel incelemeye bırakıldı.

---

## 4. Teknik Borç ve Çevre Takibi

| Madde | Durum | Önlem / Aksiyon |
| :--- | :--- | :--- |
| **`ci.yml` (PR Kapısı)** | GitHub'da henüz koşmadı | Pull request'te test edilip required check yapılması (sahip ayarı) |
| **Yasal Mailbox'lar** | `.example` yer tutucular | En sonda gerçek adreslerle güncellenecek (7.4, sahip kararı) |
| **npm 11 kurulum betikleri** | Node 24 / npm 11.19 (yerel, 2026-10-11) `npm ci` 8 paketin kurulum betiğini çalıştırmadı (`npm install-scripts ls`: `@parcel/watcher`, `@sentry/cli`, `esbuild` ×3, `@swc/core`, `sharp`, `unrs-resolver`). Ölçüldü: `tsc`, 564 test, lint, `next build`, `require('sharp')` çalışıyor (önceden derlenmiş ikililer). Vercel ve CI Node 24 ile derliyor | İzlenecek: bir araç kırılırsa ilgili paket `npm install-scripts approve <paket>` ile izinlenir (sahip onayı; `package.json` değişir). Node 24 geçişi tamam: Vercel, CI ve yerel 24.21.0 |
| **Vercel & Prod Değişkenleri** | Sentry, Upstash, Cron Secret; yeni: `GOOGLE_SITE_VERIFICATION` (6.1) | Prod ortam değişkenlerinin senkronizasyonu |
| **Supabase MCP bağlantısı** | Bağlayıcı yazma işlemlerini de kabul ediyor (salt-okunur amaçlanmıştı) | Ajanlar yalnızca sahibin onayladığı yazmaları yapar; istenirse bağlantıyı salt-okunur token ile yeniden kurun |
| **`as any` + `eslint-disable`** | **Kapandı (2026-10-11):** neden `types/database.ts`'teki satır tiplerinin `interface` olmasıydı (supabase-js'in `Record<string, unknown>` kısıtını karşılamıyor, Insert/Update `never` oluyordu). `Database` tablo tipleri `Plain<>` eşlemesinden geçiyor; 18 `as any` + 1 `exhaustive-deps` kaçışı silindi, açığa çıkan 2 gerçek tip hatası düzeltildi (`push_subscriptions.preferences` jsonb süzülüyor, `circuit_weather.data`). `grep -rn eslint-disable app lib components` = 0 | Yeni kod `as any`/`eslint-disable` eklemez; satır tipi eklerken `Database`'te `Plain<>` kullanılır |
| **Build sırasında eski fetch önbelleği** | Yerel `next build` statik sayfaları üretirken puan durumu satırları 5–13 ms'de (önbellekten) geldi ve "stale" sayılıp canlı proxy'ye düştü; sonuç doğru (canlı veri) | Zararsız; Vercel build önbelleğinde de olabilir, izlenecek |
