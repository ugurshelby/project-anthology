# Tasarım Skilleri Rehberi — Ne Zaman, Nasıl, Neden

> Bu döküman, Claude Code'da kullandığın 7 tasarım skill'ini (+ 1 çıktı şablonu) tek bir rehberde topluyor: her biri **ne işe yarar**, **hangi projede tercih edilir**, **nasıl tetiklenir/kullanılır** ve **en iyi sonucu almak için ne yapılmalı**. Bu skiller birbirinin *rakibi* değil, çoğu zaman birbirinin *tamamlayıcısı*dır — hangisinin ne zaman devreye gireceğini bilmek, hangisini kullanacağını bilmekten daha önemli.

---

## Hızlı Karar Tablosu

| Skill | Kategori | Ne zaman kullan |
|---|---|---|
| `gpt-taste` | Estetik yön + motion | GSAP-ağırlıklı, sinematik scroll deneyimi olan bir landing page/marketing sitesi kurarken |
| `high-end-visual-design` | Estetik yön + component | "Bu $150k ajans işi gibi dursun" dediğin SaaS/tech/portföy projelerinde |
| `industrial-brutalist-ui` | Estetik yön (spesifik) | Apex F1 gibi veri-ağırlıklı, brutalist/askeri-terminal hissi istenen dashboard/editorial projelerde |
| `minimalist-ui` | Estetik yön (spesifik) | Notion-vari, sıcak monokrom, sessiz-sofistike editorial/SaaS arayüzlerde |
| `redesign-existing-projects` | Süreç (audit) | **Yeni** bir şey kurmuyorsun — var olan bir kod tabanını yükseltiyorsun |
| `stitch-design-taste` + `DESIGN.md` | Meta/şablon üretici | Google Stitch'e beslenecek bir `DESIGN.md` dosyası üretmen gerektiğinde |
| `ui-ux-pro-max` | Arama/veritabanı aracı | Henüz stil kararı vermeden önce seçenekleri keşfetmek, veya diğer skillerin üstüne ek detay (palet/font/chart) aramak istediğinde |

**Altın kural:** Estetik-yön skillerinden (`gpt-taste`, `high-end-visual-design`, `industrial-brutalist-ui`, `minimalist-ui`) **aynı anda sadece biri** aktif olmalı — bunlar birbirini geçersiz kılan, çelişen kurallar içeriyor (biri "Inter yasak" derken diğeri "sıfır radius" diyor, biri glow/glassmorphism isterken diğeri düz/gölgesiz istiyor). `redesign-existing-projects` ve `ui-ux-pro-max` ise **herhangi biriyle birlikte** kullanılabilir; bunlar süreç/araç katmanıdır, estetik dikte etmezler.

---

## 1. `gpt-taste` — Awwwards-Level Design Engineering

### Ne işe yarar?
GSAP motion'a aşırı odaklı, "ödül alacak kalitede" bir landing page üretmek için tasarlanmış bir persona. Python-simüle randomizasyonla (aynı prompt'ta bile) hero mimarisi, tipografi ailesi ve component seçimlerini değiştirerek "LLM'lerin hep aynı layout'u seçme" sorununu kırmayı hedefliyor.

### Öne çıkan zorunluluklar
- **AIDA yapısı** (Attention/Interest/Desire/Action) her sayfada zorunlu.
- **2-3 satır hero kuralı:** H1 asla 4+ satıra taşmamalı; geniş container + küçük font boyutu ile bu garanti edilir.
- **Gapless bento grid:** `grid-flow-dense` zorunlu, boş hücre yasak.
- **GSAP zorunlulukları:** scroll pinning, image scale/fade, scrubbing text reveal, card stacking.
- **Meta-label yasağı:** "SECTION 01", "QUESTION 05" gibi etiketler kesinlikle yasak.

### Ne zaman tercih et?
- Landing page / marketing sitesi kuruyorsan ve **ağır GSAP scroll koreografisi** istiyorsan.
- Rosso'nun `IdentityMarquee` gibi cinematic-scroll gerektiren bileşenlerinde.
- Obsession'ın 3-katmanlı staggered page transition'ı gibi motion-öncelikli sayfalarda.

### Nasıl en iyi sonucu alırsın?
- Skill'in **8. bölümdeki `<design_plan>` zorunluluğunu** atlatma — Claude Code'un kod yazmadan önce bu planı gerçekten üretmesini iste; bu adım atlanırsa randomizasyon kâğıt üstünde kalır, kod hep aynı default'a döner.
- Prompt'ta net bir "vibe" belirt (örn. "otomotiv, sinematik, koyu") — skill'in Python RNG'si prompt karakter sayısına bağlı olduğundan, prompt'u değiştirmeden tekrar istek atarsan **aynı** sonucu alırsın; varyasyon istiyorsan prompt metnini kasıtlı olarak biraz değiştir.
- Font banı var: `Inter` asla kullanılmaz — `Satoshi`, `Cabinet Grotesk`, `Outfit`, `Geist` arasından seçtirilir.

---

## 2. `high-end-visual-design` — Vanguard UI Architect

### Ne işe yarar?
"$150k ajans kalitesi" sözünü teknik kurallara döken en detaylı skill. Üç "vibe" arketipi (Ethereal Glass / Editorial Luxury / Soft Structuralism) ve üç layout arketipi (Asymmetrical Bento / Z-Axis Cascade / Editorial Split) arasından rastgele — ama bağlama uygun — bir kombinasyon seçilmesini zorunlu kılıyor.

### Öne çıkan imza teknikler
- **Double-Bezel (Doppelrand):** Kartlar/görseller asla düz zeminde durmaz; iç içe iki katmanlı "makine gibi" bir çerçeve (dış kabuk + iç çekirdek, iç içe geçen radius matematiği) kullanılır.
- **Button-in-Button:** CTA'lardaki ok ikonu asla çıplak durmaz, kendi dairesel kabuğunun içinde yüzer.
- **Magnetic hover physics:** Buton hover'ında sadece renk değil, `scale`+`translate` ile fiziksel "manyetik" bir tepki.
- **Fluid Island Nav:** Üstten ayrık, yüzen glass-pill navbar; hamburger ikonu X'e akışkan biçimde morph olur.

### Ne zaman tercih et?
- Obsession, EVEREST gibi **"premium, dokunulası" hissi** öncelikli portföy/editorial projelerinde.
- FinPilot'un animasyonlu sphere AI companion'ı gibi "haptic depth" gerektiren bileşenlerde.
- Bir SaaS/tech landing page'inde Apple/Linear-tier bir his isteniyorsa.

### Ne zaman tercih ETME?
- Apex gibi **sıfır-gölge, sıfır-radius** brutalist bir projede — bu skill'in tüm imza teknikleri (double-bezel, glow, glassmorphism) Apex'in tasarım anayasasıyla doğrudan çelişir.

### Nasıl en iyi sonucu alırsın?
- **§8'deki Pre-Output Checklist'i** gerçek bir kontrol listesi gibi kullanmasını iste, dekoratif bir formalite olarak değil.
- Hangi Vibe + Layout arketipinin seçildiğini **açıkça sorup teyit ettir** — "hangi vibe archetype'ı seçtin ve neden?" diye sorman, skill'in gerçekten §3'teki varyans motorunu çalıştırdığını doğrular.
- Mobile Collapse kurallarını (rotasyonların/negative margin'lerin 768px altında tamamen kaldırılması) özellikle mobil-ağırlıklı projelerde (Flutter companion siteleri) vurgula.

---

## 3. `industrial-brutalist-ui` — Tactical Telemetry & Swiss Industrial

### Ne işe yarar?
İki net moddan **birini** seçip sonuna kadar uygulayan, en "opinionated" skillerden biri: **Swiss Industrial Print** (açık zemin, gazete kağıdı hissi, ağır grotesk, kırmızı vurgu) ya da **Tactical Telemetry/CRT Terminal** (koyu zemin, mono tipografi hakimiyeti, scanline/phosphor efektleri).

### Öne çıkan kısıtlamalar
- **Sıfır border-radius** — tüm köşeler tam 90 derece.
- **Gradient/gölge/translucency kesinlikle yasak** — renkler fiziksel medyayı (kağıt, CRT ekran) simüle eder.
- Makro tipografi (dev, sıkı tracking, uppercase) + mikro tipografi (mono, geniş tracking, teknik metadata) arasında **ekstrem kontrast** zorunlu.
- ASCII çerçeveleme (`[ DELIVERY SYSTEMS ]`, `>>>`) ve endüstriyel semboller (®, ©, ™) yapısal eleman olarak kullanılır.

### Ne zaman tercih et?
- **Apex F1** — bu skill neredeyse birebir Apex'in mevcut tasarım anayasasıyla (`apex-final-design.md`: zero border-radius, IBM Plex Mono, Bebas Neue, tonal elevation) örtüşüyor. Apex için en doğal seçim bu.
- Veri-ağırlıklı herhangi bir dashboard/telemetri ekranı.
- "Declassified blueprint" hissi istenen editorial/portföy sayfaları.

### Kritik kural
> **Bir projede iki modu asla karıştırma.** Ya Swiss Industrial (açık) ya Tactical Telemetry (koyu) — ikisi arasında sayfa sayfa geçiş yapmak, sistemin "tek bir tutarlı fiziksel obje" hissini kırar.

### Nasıl en iyi sonucu alırsın?
- Proje başında hangi modun (Swiss vs Telemetry) seçildiğini **CLAUDE.md'ye yaz** — Apex zaten koyu/mono ağırlıklı olduğu için muhtemelen Tactical Telemetry moduna daha yakın; ama bu net bir tercih olarak belgelenmeli, oturumdan oturuma değişmemeli.
- Terminal Green (`#4AF626`) kullanımını **tek bir eleman** ile sınırla — skill bunu açıkça "yoksa hiç kullanma" diye belirtiyor; Apex Red zaten ana vurgu rengi olduğu için bu ikinci vurgu rengi neredeyse hiç gerekmeyecek.

---

## 4. `minimalist-ui` — Premium Utilitarian Minimalism

### Ne işe yarar?
Notion/Linear tarzı "document-style" arayüzler için sıcak monokrom + solgun pastel aksan renk paleti kullanan, düz (flat) component mimarisi zorunlu kılan bir skill.

### Öne çıkan kısıtlamalar
- Ağır drop-shadow, gradient, neon, `rounded-full` büyük container yasak.
- Metin rengi asla saf siyah değil (`#111111`/`#2F3437` gibi off-black).
- Aksan renkler yalnızca **solgun pastel** (Pale Red/Blue/Green/Yellow) — tag/badge/inline-code arka planında.
- AI klişe kelimeler (`Elevate`, `Seamless`, `Unleash`) yasak — bu madde aslında `redesign-existing-projects`'teki content kurallarıyla da örtüşüyor.

### Ne zaman tercih et?
- Rosso'nun editorial/dokümantasyon ağırlıklı sayfalarında (örn. taste-profili anlatan uzun-form sayfalar).
- FinPilot'un light-mode paletiyle (navy/steel blue + bento grid) ruh olarak en yakın olan skill bu — ama FinPilot'un kendi renk sistemi (navy/steel blue, charcoal/warm grey dark) bu skill'in varsayılan paletinin **üstüne** yazılmalı, aynen kopyalanmamalı.

### Ne zaman tercih ETME?
- Apex (brutalist, sıfır yumuşaklık) veya `high-end-visual-design`'ın glow/glass estetiğini istediğin projelerde — doğrudan çelişir.

### Nasıl en iyi sonucu alırsın?
- **§8 Execution Protocol'ü sırayla** uygulat: önce makro-whitespace, sonra tipografi/renk, sonra kart/border kuralı, en son scroll-entry animasyonları. Sıra atlanırsa (örn. önce component yazılıp sonra whitespace eklenirse) "sıkışık" bir sonuç çıkar.
- Kendi projene özel bir aksan rengi tanımlıyorsan (örn. Rosso amber), bunu skill'in "Pale X" formatına (düşük doygunluk, açık arka plan + koyu metin tonu) **çevirerek** ekle — ham amber'i olduğu gibi kullanmak skill'in "sadece solgun pastel" kuralını bozar.

---

## 5. `redesign-existing-projects` — Mevcut Projeyi Yükseltme

### Ne işe yarar?
Diğer dördünden **kategorik olarak farklı**: bir estetik dikte etmiyor, bunun yerine **var olan** bir kod tabanını Scan → Diagnose → Fix sırasıyla denetleyip iyileştiriyor. En kapsamlı "AI tasarım kokusu" (generic pattern) audit listesi burada.

### Audit kapsamı (özet)
Typography, Color/Surfaces, Layout, Interactivity/States, Content, Component Patterns, Iconography, Code Quality, Strategic Omissions (legal linkler, 404 sayfası, form validasyonu) — dokuz kategori, onlarca spesifik "bunu görürsen düzelt" maddesi.

### Ne zaman tercih et?
- **Yeni bir şey kurmuyorsan.** Var olan bir proje (kendi eski bir projen, ya da devraldığın bir kod tabanı) "generic/AI-yapımı gibi duruyor, premium hissettirmiyor" dediğinde.
- Design System Kurulum Rehberi'ndeki **"Retrofitting" bölümüyle** doğrudan ilişkili — ama bu skill daha teknik/kod-seviyesinde, o rehber daha çok takım/iletişim seviyesinde çalışıyor. İkisi birlikte kullanılabilir: önce bu skill'le teknik audit, sonra Retrofitting bölümündeki diplomasi/küçük-zafer stratejisiyle ekibe/kendi sürecine sun.

### Nasıl en iyi sonucu alırsın?
- **"Fix Priority" sıralamasını** (§Fix Priority: Font swap → Color cleanup → Hover/active states → Layout/spacing → Component swap → Loading/empty/error states → Typography polish) atlamadan takip et — bu sıra, en düşük riskle en yüksek görsel etkiyi en başta almanı sağlıyor.
- Skill'in **"Do not break existing functionality"** kuralına özellikle Claude Code'a hatırlat — bu skill *rewrite* değil *upgrade* skill'idir; büyük bir refactor'a kaymaması için her değişiklikten sonra test istemek gerekir.
- Kendi projene özgü audit maddeleri ekleyebilirsin: örn. Apex için "IBM Plex Mono kullanılmayan veri bloğu var mı?" gibi bir satırı bu audit listesine proje-özel ek olarak ekleyebilirsin.

---

## 6-7. `stitch-design-taste` (skill) + `DESIGN.md` (çıktı şablonu)

Bu ikisi bir çift: `stitch-design-taste` bir **üretici** skill, `DESIGN.md` onun ürettiği **çıktı**nın somut bir örneği. Google Stitch aracına (labs.google/stitch) beslenecek, dial-bazlı (Creativity/Density/Variance/Motion Intent, 1-10 skalası) bir tasarım sistemi dosyası üretiyor.

### Ne işe yarar?
- Diğer skillerin çoğu "sabit bir estetik" dikte ederken, bu skill **ayarlanabilir dial'lar** üzerinden bir estetik *üretir*. Creativity 1-3 → Notion-vari sessiz; Creativity 7-10 → editoryal, inline-image başlıklı, güçlü asimetri.
- Stitch'in "Master + Overrides" mantığına benzer bir hiyerarşik yapı önerir: proje geneli için `MASTER.md`, sayfa-özel sapmalar için ayrı dosyalar.

### Ne zaman tercih et?
- Google Stitch ile çalışıyorsan (veya onun mantığına benzer bir dial-bazlı sistem başka bir araca aktarmak istiyorsan).
- Bir projenin "ne kadar yaratıcı/yoğun/hareketli olsun" sorusunu **sayısal bir skala** üzerinden netleştirmek istediğinde — bu, "premium ama ne kadar premium?" gibi belirsiz taleplerin somutlaştırılması için faydalı bir çerçeve, Stitch kullanmasan bile.

### Nasıl en iyi sonucu alırsın?
- Dial'ları proje başında **bilinçli olarak seç ve yaz**, varsayılana (`8/4/8/6`) güvenme — örn. The Origin gibi "ritüel, sakin" bir proje için Density ve Variance çok düşük (1-3) olmalı; Rosso'nun IdentityMarquee'si için Motion Intent yüksek (8-10) olmalı.
- Üretilen `DESIGN.md`'yi olduğu gibi bırakma — kendi semantik renk/font isimlerini (örn. Rosso'nun "Gece Kuşu" persona renkleri) mevcut şablonun **rolüne** (Canvas/Surface/Ink/Secondary/Accent) eşleyerek doldur.

---

## 8. `ui-ux-pro-max` — Arama/Veritabanı Aracı

### Ne işe yarar?
Diğerlerinden tamamen farklı bir mekanizma: bir **CLI arama aracı** (Python script). 67 stil, 96 palet, 57 font eşleşmesi, 25 grafik tipi, 13 teknoloji stack'i içeren bir veritabanını sorgulayarak "reasoning" tabanlı öneriler üretiyor.

### Ne işe yarar (pratikte)?
- `--design-system` bayrağıyla tek komutta ürün tipi + stil + renk + tipografi + anti-pattern önerisi alıyorsun.
- `--persist` bayrağıyla bunu `design-system/MASTER.md` + sayfa-özel override dosyaları olarak diske yazdırabiliyorsun — bu, Uğur'un mevcut CLAUDE.md seed/tree şablon sistemine **doğrudan paralel** bir mantık.
- Domain-özel aramalar (`--domain style/typography/color/chart/ux`) ile herhangi bir aşamada detay derinleştirme yapılabiliyor.

### Ne zaman tercih et?
- **Henüz stil kararı vermeden önce**, seçenekleri keşfetmek istediğinde — diğer 4 estetik skilden birine "commit" etmeden önce bu aracı bir keşif/brainstorm katmanı olarak kullanmak mantıklı.
- Bir stil zaten seçiliyken (örn. `industrial-brutalist-ui` ile gidiliyorken) **ek detay** aramak için: "bu proje için hangi chart tipi uygun?", "hangi font ikilisi bu endüstriyle eşleşir?" gibi noktasal sorularda.
- Yeni bir teknoloji stack'e (Flutter, SwiftUI, Vue) geçildiğinde stack-özel best practice araması için.

### Nasıl en iyi sonucu alırsın?
- **Adım sırasını koru:** önce `--design-system` (genel resim), sonra domain-özel aramalarla derinleş, en son `--stack` ile implementasyon detayına in. Sırayı atlayıp direkt domain aramasına geçmek, "büyük resmi" kaçırmana yol açar.
- Aramalarda **spesifik ol** — "SaaS" yerine "healthcare SaaS dashboard" gibi bağlamsal anahtar kelimeler kullan; skill'in kendisi de bunu açıkça öneriyor.
- Bu aracı diğer estetik skillerle **çelişen** değil **besleyen** bir katman olarak düşün — örn. `industrial-brutalist-ui` ile çalışırken `ui-ux-pro-max`'tan sadece `chart` veya `typography` domain'inde ek arama yapmak, brutalist skill'in kendi kısıtlamalarını bozmadan ek malzeme sağlar.

---

## Kombinasyon Stratejileri

### Yeni bir proje kurarken
1. Henüz stil belirsizse: `ui-ux-pro-max --design-system` ile keşif yap.
2. Bir estetik yöne karar ver ve **tek bir** estetik-yön skilline (`gpt-taste` / `high-end-visual-design` / `industrial-brutalist-ui` / `minimalist-ui`) commit et.
3. Gerekirse `ui-ux-pro-max`'ı domain-özel destek aracı olarak kullanmaya devam et (chart/font/stack detayları).
4. Sonucu CLAUDE.md/design.md'ye yaz — bu, Design System Kurulum Rehberi'ndeki Adım 5 (Document Everything) ile birleşir.

### Mevcut bir projeyi yükseltirken
1. `redesign-existing-projects` ile teknik audit yap (Scan → Diagnose → Fix).
2. Audit'te ortaya çıkan yön ("bu aslında minimalist bir SaaS olmalı" gibi) bir estetik-yön skiliyle **teyit edilirse**, o skil'i ikinci katman olarak devreye al.
3. Design System Kurulum Rehberi'nin Retrofitting bölümündeki diplomasi/küçük-zafer stratejisini paralel yürüt.

### Proje-bazlı hazır eşleşmeler (mevcut portföyün)
| Proje | Önerilen estetik-yön skili | Not |
|---|---|---|
| Apex F1 | `industrial-brutalist-ui` (Tactical Telemetry modu) | Zaten büyük ölçüde örtüşüyor |
| Obsession (10 marka editorial) | `high-end-visual-design` | Double-bezel + editorial luxury vibe archetype markaya göre uyarlanabilir |
| EVEREST | `high-end-visual-design` (Ethereal Glass'a yakın) | Glassmorphism + cryogenic palet örtüşüyor |
| Rosso | `minimalist-ui` (temel) + `gpt-taste` (IdentityMarquee gibi motion-ağır bölümler için nokta atışı) | İki skil karışık kullanılmaz ama farklı sayfa/bölümlerde ayrı ayrı seçilebilir |
| FinPilot | `minimalist-ui` (bento grid + light mode ruhuyla en yakın) | Kendi navy/steel blue paleti üstüne yazılmalı |
| The Origin | Hiçbiri birebir uymuyor — `stitch-design-taste` dial mantığıyla Density/Variance çok düşük (1-3) özel bir profil tanımlanmalı | Ritüel/sakin kimliğe hazır skil yok, özel tarif gerekli |

---

## Genel Uyarı

Bu skillerin hepsi **"AI'nın jenerik görünmesini önleme"** ortak amacına hizmet ediyor, ama her biri bunu farklı bir estetik sözlükle yapıyor. Bir skil'in "yasak" dediği bir şey (örn. `minimalist-ui`'de gölge yasağı) başka birinin (örn. `high-end-visual-design`'da diffused shadow zorunluluğu) **temel gerekliliği** olabilir. Bu yüzden proje başında hangi skil aktif, hangileri pasif — bunu net biçimde CLAUDE.md'ye yazmak, oturumlar arası tutarlılığın tek garantisi.
