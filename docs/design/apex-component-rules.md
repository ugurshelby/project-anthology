# Apex Component Rules — sahip kuralları

> **Otorite:** Bu dosyadaki her kural sahibin (owner) kendi koyduğu kuraldır ve bağlayıcıdır (`AGENTS.md` → Design authority). Ajanlar bu kuralları yorumlamaz, gevşetmez, "daha iyi" diye değiştirmez; bir kural uygulanamıyorsa durur ve sahibe sorar. Yeni kuralı yalnızca sahip ekler; ajan sahibin cümlesini buraya tarih ve bölümle yazar.
> Token, tipografi ve renk değerleri burada tekrarlanmaz: `docs/design/apex-design.md` §3–§5.
> Kodla zorlanan kurallar testin adıyla işaretlidir; test kırmızıysa kural bozulmuştur.

---

## 1. Navigasyon (sahip, 2026-10-10)

### 1.1 Önem sırası — tek kaynak
- Sayfalar anlam ve önemlerine göre **tek bir listede** sıralanır: `NAV_PAGES_BY_RANK` (`components/layout/nav-items.ts`). Masaüstü ve mobil düzen bu listeden türetilir; hiçbir yüzeyde sıra elle verilmez.
- Yeni sayfa bu listeye **önemine göre doğru sıraya** eklenir; bir tarafa elle eklenmez.
- Güncel sıra (sahip değiştirebilir): Sezon, Grid, Haberler, Pistler, Antoloji, Araçlar, Sözlük.

### 1.2 Masaüstü (md ve üstü)
- **Ana sayfa (APEX ARŞİV) her zaman merkezde:** hem navbar'ın hem sayfanın yatay merkezinde. Ölçü: logonun merkezi ile sayfanın merkezi arasındaki fark en fazla 1 px.
- **Dil seçici sağ kenarda, sayfalardan ayrık:** kendi kenar sütununda, ince bir ayırıcı çizgiyle. Sol kenarda aynı genişlikte boş bir sütun durur, böylece merkez kaymaz.
- **Boşluklar tek ölçüye bağlı:** sayfa kenarı ile dil seçici, dil seçici ile sayfalar, sayfalar ile logo arasındaki boşlukların hepsi aynı değerdir (`--nav-g`).
- **Merkezden dışa sıralama:** en önemli sayfa logonun hemen solunda, ikinci sağında, üçüncü solda bir dışarıda, dördüncü sağda bir dışarıda… diye dışa doğru dizilir.
- **Eşit alan, simetri:** her sayfaya eşit genişlik ayrılır; iki tarafta da aynı sayıda yuva bulunur. Sayfa sayısı tekse en dıştaki sağ yuva boş kalır, logo kaymaz.
- **Taşma yok:** hiçbir sayfa adı yuvasından taşmaz ve kesilmez (EN ve TR ölçülür). Sığmadığı genişlikte düzen iki satıra geçer: üstte logo + dil seçici, altta merkezin iki yanına bölünmüş sayfalar (md–xl). xl ve üstünde tek satırdır.
- **Durumlar:**
  - Seçili sayfa: accent renkli yazı + accent alt çizgi.
  - Hover: yazı açılır + soluk alt çizgi.
  - Klavye odağı: accent halka.
  - Ana sayfa seçiliyken APEX logosu diğer sayfaların seçili hâlinden **belirgin biçimde ayrışır**.
  - **Güncelleme (sahip, 2026-10-13, masaüstü):** "navbarda apex ana sayfası seçili olduğundaki durumunu kırmızı kutu olayını beğenmedim onu düzelt, genel anlamda navbar biraz daha elegant ve modern olabilir, yerleşim boyutlar iyi." Kırmızı dolu kutu kullanılmaz; yerleşim ve boyutlar korunur.

### 1.2.1 Yıl seçici (sahip, 2026-10-13)
- Grid ve detay sayfalarındaki yıl seçici: "2020ler 2010lar yazmana gerek yok direkt yıllar yeterli." On yıl başlıkları gösterilmez, yalnızca yıllar.

### 1.3 Mobil (md altı)
- Alt dock: Ana sayfa + önem sırasındaki ilk sayfalar (`MOBILE_DOCK_PAGE_COUNT`), kalanlar "+" menüsünde **aynı önem sırasıyla**.
- Ana sayfa seçiliyken dolu accent zemin; diğer sayfalar seçiliyken soluk accent zemin + accent yazı. Böylece ana sayfa burada da ayrışır.

Testler: `tests/nav-items.test.ts` (sıra, simetri, boş yuva, merkezden dışa dizilim, mobil sıra).

---

## 2. Ana sayfa (sahip, 2026-10-10)

### 2.1 Haberler kartı
- Başlık doğrudan **"Haberler" / "News"** olur ("Telgraf Akışı", "The Wire" gibi takma adlar kullanılmaz).
- Kartta **3 haber** gösterilir (`HOME_NEWS_COUNT`, `lib/home/homeLayout.ts`). Sunucudan da yalnızca bu kadarı istenir. Haberler kartın yüksekliğini doldurur; altta veya üstte boşluk bırakılmaz.

### 2.2 Tarihte Bugün kartı
- Görselsiz gösterilmez, görsel o olayla **ilgili** olmalıdır. Sıra (`lib/home/onThisDayImage.ts`):
  1. O sezonun kazanan aracı,
  2. kazanan pilot,
  3. pist.
- Hiçbiri yoksa ilgisiz bir fotoğraf konmaz; tipografik görünüm kalır. Görselin kredisi kartın üzerinde görünür.

Testler: `tests/on-this-day-image.test.ts`.

### 2.3 Hero: hafta sonu programı
- Bakan biri "yarış ne zaman, hangi saate göre?" diye sormamalı.
- Program ayrı bir panelde durur. Panelin başlığı saat dilimini **bir kez ve açıkça** söyler: "Senin saatin · GMT+3".
- Her satırda seans adı, gün/tarih ve büyük saat bulunur. Pistin yerel saati küçük olarak "Pist …" diye yazılır ("Yerel" kelimesi kullanılmaz; kimin yereli olduğu belirsizdir).
- Yarış satırı accent ile vurgulanır; bitmiş seanslar soluklaşır ve "Bitti" yazar.
- Gösterilen seanslar: FP1, Sprint (varsa), Sıralama, Yarış; zaman sırasıyla.
- **Yarış sırasında (sahip, 2026-10-11):** canlı sıralama yoksa (OpenF1 ücretsiz plan) "kilitli" denmez; geri sayımın yerinde **"Lights out"** paneli durur: beş start ışığı yanıp birlikte söner, yeşil ışıktan beri işleyen yarış saati ve sonuçların bayraktan birkaç dakika sonra burada olacağı yazar. "Lights out" her dilde İngilizce kalır (F1'in kendi ifadesi). Bayraktan sonra "Bayrak düştü" ve yarış sayfasına bağlantı.

### 2.4 Paddock bento: sağ sütun
- Sağ sütun dikey olarak ikiye bölünür: **üstte Son Yarışın Kazananı, altta Antoloji**. İki kart eşit önemdedir: birebir aynı boyutta, aynı kart kabuğunda.
- Kazanan kartı içeriği: pilot numarası, ad ve soyad, takım (takım rengi sol çizgi, numara ve parıltıda), yarış adı, pist, tarih ve tüm sonuçlara bağlantı. Pilot fotoğrafı varsa kredisiyle birlikte gösterilir.
- Hero'da ayrıca "son yarışın kazananı" kutusu yoktur; bilgi tek yerde durur.
- *Uygulama notu (Claude, 2026-10-11, sahip yetkisiyle; sahip değiştirebilir):* yarış bitip resmî sonuç henüz yayımlanmamışken (Jolpica genelde 1–3 saat sonra) kart iskelet göstermez, önceki yarışın kazananını da "son yarış" diye sunmaz. Bitmiş yarışın adı, pisti ve tarihi ile "Resmî sonuçlar yolda" yazar; sonuç gelince kendiliğinden kazanan kartına döner.
- Mobilde üç sütun aynı genişlikte kaydırılan kartlardır (`w-[min(85vw,22rem)]`); sağ sütun mobilde de iki eşit kart olarak kalır.

---

## 3. Teknik Sözlük: Lastik sıcaklık pencereleri (sahip, 2026-10-12)

Bileşen: `components/glossary/TyreThermalWindows.tsx`. Sahibin brifinden bağlayıcı maddeler, sahibin cümleleriyle (tam brif: `docs/plans/master-plan.md` U-1):

- **Görsel dil:** "Projemizin kendi tasarım sistemini temel alarak; iOS estetiğinde (… pürüzsüz frosted-glass dokular, mükemmel border-radius oranları, canlı ama rafine renkler ve akıcı yaylı/spring mikro animasyonlar)". "Kaba ve kontrastı düşük kutular yerine; katmanlı derinlik, zarif iç ışıma (inner glow), ince translucent bordürler ve modern bir dark-mode cam dokusu".
- **Tipografi:** "monospaced/aşırı teknik havayı kır; bilgiyi tek bakışta aktaran, net bir hiyerarşiye sahip modern bir tipografik ritim".
- **Bilgi panelleri** (Kabarcıklanma, Granüllenme): "sayfanın altına atılmış statik metin kutuları gibi değil; keşfedilebilir, interaktif kartlar, akordeonlar ya da dokunulduğunda yumuşakça açılan bağlamsal bilgi pencereleri".
- **C1–C5 seçimi:** "iOS tarzı akıcı … 'segmented pill control'"; "seçim hapı (active pill indicator) spring animasyonuyla akarak kaysın"; "Her hamurun kendi kimlik rengi … arayüzün geneline hafif, sofistike bir ambient glow … yaysın."
- **Termal gösterge (bileşenin kalbi):** "Sıcaklık aralığını (Soğuk / Optimum Çalışma / Aşırı Isınma) adeta dinamik bir Apple Health halkası ya da lüks bir otomobil kadranı akıcılığında sun." "'Optimum Aralık' ve 'Zirve Tutuş (Peak)' alanını neon sertliğinde değil, zarif bir nefes alma efekti (subtle pulse glow)" ile göster. Hamur değişince aralıklar ve ibreler "yaylı fizik (spring physics) ile esneyerek yeni konumuna aksın". "Kullanıcı parmağıyla veya imleciyle bar üzerinde gezinebilmeli (scrubbing/slider hissi); derece değiştikçe lastiğin termal risk durumu (Graining vs. Blistering) canlı bir geri bildirimle hissettirilmeli."
- **Metrikler:** "Isınma Hızı", "Aşınma Direnci", "Min/Maks Eşik" "temiz, geniş boşluklu (airy), mikro göstergelere veya zarif progress barlara sahip modern KPI kartları".
- **Mobil/tablet:** "her şey başparmakla kolayca gezilebilir, ritmik ve hafif hissedilmeli."
- *Uygulama notu (Claude, `AGENTS.md` sınırları):* kadran klavyeyle de kullanılır (`role="slider"`, ok tuşları), seçim grubu `role="radiogroup"`; `prefers-reduced-motion` açıkken yaylar ve nefes efekti durur; yay değerleri `lib/motion.ts` (`APEX_MOTION`, `apex-design.md` §6).

---

## 4. Grid sayfası (sahip, 2026-10-13)

Bileşen: `components/standings/GarageTeamPanel.tsx` (`/grid`).

- **Sıralama Düzeni:** "toggle ihtiyaç da yok zaten direkt orijinal default ve sabit olarak takıma göre sıralama olsun ve o düzende kalsın." Takım / sürücü sıralaması anahtarı yoktur; sayfa her zaman takıma göre düzenlidir.
- **Kart Düzeni:** "solda takım sağda pilotlar ve puan çubukları takım rengi kullanımı kart içinde görselin hafif fade ile geçişli olması vs harika".
- **Kadraj Standardı (sahip kuralı):**
  - "Yatay (wide landscape) kartlara dikey portre veya rastgele kırpılmış aksiyon fotoğrafları konulduğu için yüzler tepeye çarpıyor, çeneler veya alınlar kesiliyor ya da araçların burun/kanat kısımları çerçeveden taşıyor."
  - **Araç slotları:** `3:2` veya `16:9` oranında, yandan profil (side-profile) veya 3/4 açılı; burun ve arka kanat kartın kenarlarına çarpmadan en az `%10` nefes payı (padding) bırakılarak konumlandırılmalı.
  - **Pilot slotları:** Geniş yatay kadrajda göz hizası dikey eksende **altın orana (%35-40)** çekilmeli; kask/şapka tepesi kesilmemeli, bakış yönü açık alana (içeriye) bakmalı.

### 4.1 11 Takım İçin Araç ve Pilot Konumlandırma Konfigürasyonu
1. **Mercedes-AMG:** Araç (W17/W16): `object-position: center 60%`; Kimi Antonelli: yüzü net 3/4 portre, `object-position: center 25%`; George Russell: `object-position: center 30%`.
2. **Scuderia Ferrari:** Araç (SF-26/SF-25): `object-position: center 50%`; Lewis Hamilton: `object-position: center 20%`; Charles Leclerc: `object-position: 50% 25%`.
3. **McLaren:** Araç (MCL39): `object-position: center 45%`; Lando Norris: yüz/gözler net, `object-position: center 30%`; Oscar Piastri: `object-position: center 20%`.
4. **Red Bull Racing:** Araç (RB21/RB22): `object-position: 55% 50%`; Max Verstappen: `object-position: center 30%`; Liam Lawson: `object-position: center 25%`.
5. **Racing Bulls (VCARB):** Araç: `object-position: center 50%`; Pilot 1: `object-position: center 30%`; Pilot 2: `object-position: center 30%`.
6. **Alpine:** Araç (A526): `object-position: 60% 50%`; Pierre Gasly: `object-position: center 25%`; Jack Doohan / Franco Colapinto: tek pilot net yüz `object-position: 40% 30%`.
7. **Haas F1 Team:** Araç: `object-position: 65% 50%`; Esteban Ocon: `object-position: center 15%`; Oliver Bearman: `object-position: center 30%`.
8. **Audi (Sauber):** Araç: 3/4 veya yan profil, `object-position: center 50%`; Nico Hülkenberg: `object-position: center 25%`; Gabriel Bortoleto: `object-position: 50% 25%`.
9. **Williams:** Araç (FW47): `object-position: center 55%`; Carlos Sainz: `object-position: center 20%`; Alex Albon: `object-position: center 25%`.
10. **Aston Martin:** Araç (AMR26): Yan profil pist üstü dinamik çekim; Fernando Alonso: `object-position: center 25%`; Lance Stroll: bakış yönü sola dönecek şekilde yatay aynalanabilir (flip) veya 3/4 portre, `object-position: center 25%`.
11. **Cadillac F1 Team:** Araç: `object-position: 60% 50%`; Pilot 1 (Bottas): `object-position: center 25%`; Pilot 2 (Pérez): `object-position: center 25%`.

### 4.2 Apple & Apex Dokunuşları
1. **Alttan Karartma Gradyanı (Bottom Vignette / Scrim):** Pilot hücrelerine `linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 40%, transparent 100%)` uygulanması.
2. **Tek Tip Fotoğraf Dili (Color Grading & Mood):** Tüm görsellere hafif desatürasyon ve kontrast filtresi (`contrast(1.05) saturate(0.9)`).
3. **Araç Kadraj Standardizasyonu:** 11 aracın da yönünün soldan sağa akması.
4. **Karakter ve Yarış Numarası Vurgusu:** Pilot kutularının sağ üst köşesine %8–12 opaklıkta devasa **Barlow Condensed** yarış numarası filigranı (watermark) gömülmesi.


## 5. Ana sayfa: Apex kimliği (sahip, 2026-10-13)

- "kullanıcı apexe girdiğinde ana sayfada apex'in logosunu görmüyor ne olduğunu görmüyor tam vs o açıdan boş alanlar daha iyi kullanılabilir, bunun bir f1 sitesi olduğu tasarımla daha iyi anlatılabilir. genel hero section güzel ama apex anlamında eksik."

## 6. Teknik Sözlük: lastik bileşikleri, kavram kartları, kural değişiklikleri (sahip, 2026-10-13)

- Lastik bileşikleri: "üstünde yatay slide ile hepsi yanyana da var bu anlamsız olmuş 7 kartlı direkt lastiği anlatan tıklayınca detaylanan akıllı kompakt kart gibi bi tasarım iyi olur ama yine lastik termal komponentindeki gibi yaratıcılığını kat, animasyonlar vs de olsun akıcı ve anlatıcılığı iyi olsun."
- Kavram kartları: "her kart için görselimiz var kendi ürettiğimiz ama küçücük şuan görünmüyolar kullanıcılar her kavramı görseli de rahat görerek, anlayarak öğrenebilmeli."
- Kural değişiklikleri: "redesign edilmeli. özellikle burda çok metin olduğu için buna uygun düşün."
- Ölçüt: §3'teki lastik termal penceresi ("harika olmuş") bu bileşenlerin kalite çıtasıdır.

---

## 7. Takım Detay Sayfası: Sinematik Editoryal & Telemetri Konsolu (sahip, 2026-10-13)

Sayfa: `app/[locale]/teams/[constructorId]/page.tsx`. Sahibin brifi, olduğu gibi (ayrıntılı faz planı: `docs/plans/master-plan.md` Faz 10):

> **Role & Tone:** Senior Product Designer with an obsession for Apple's fluid design principles and Formula 1's cinematic, high-contrast engineering aesthetic.
>
> **Context & Objective:** Redesign the Team Detail page for Apex (Project Anthology). The page must move away from generic wiki/dashboard templates and transform into a cinematic, high-density editorial experience that tells the team's legacy, character, and season-by-season telemetry without visual clutter.
>
> **Design Philosophy & Constraints (Apex Design System):**
>
> **Color & Surface Hierarchy:**
> - Primary canvas must be deep dark neutral (`#0a0a0a`), never pure black.
> - Cards and bento modules use `--surface` (`#141414`) with a sharp 1px subtle border (`#262626`) and 16px radius (`rounded-2xl`). Add a hairline bright top-edge highlight (`rgba(255,255,255,0.06)`) to simulate physical material catching light.
> - Restraint: Use team primary accent sparingly; reserve Apex Red (`#ff1801`) strictly for active states, live indicators, and key badges.
>
> **Editorial Typography (Three-Tier Hierarchy):**
> - Hero & Section Display: Barlow Condensed (Bold/Semibold), tight leading (0.92 to 1.05), negative optical tracking (`-0.02em`). Massive, poster-like team names and landmark figures.
> - Body & Narrative: Inter (Regular, 16px, 1.5–1.75 line height) for team history and storytelling snippets. High legibility, neutral off-white (`#e6e6e6`).
> - Telemetry & Metadata: JetBrains Mono (`tabular-nums`, 12–14px, uppercase with `+0.1em` letter spacing for labels). Used for championships, race wins, founding years, chassis codes, and season deltas.
>
> **Layout & Spatial Composition:**
> - Cinematic Poster Hero (Top 45vh): Full-bleed atmospheric paddock/car imagery with dark vignette overlay. Anchored with an oversized condensed team moniker, chassis badge, and active constructor standing rank.
> - Fast Facts Bento (Horizontal Telemetry Ribbon): Strip away dull tables. Present key metrics (Championships, Grand Prix Entries, Pole Positions, Win Rate) as sculptured, monospaced data tiles with bold contrast.
> - Dual Pilot Cockpit Modules: Two complementary interactive bento cards featuring the active drivers, displaying their large race numbers in condensed typography, season points delta, and team color accent bar (`w-1 rounded-full`).
> - Editorial Legacy & Season Scrubber: An interactive, horizontal timeline strip to explore iconic team eras and season-by-season performance transitions, maintaining fluid, interruptible spring physics (`damping: 1.0`, `response: 0.35s`).
>
> **Deliverable:** Produce an executive-level, bespoke dark-mode interface layout that feels like an official Formula 1 telemetry console designed under Apple's WWDC human interface guidelines. No neon glows, no generic card clutter, pure craft and restraint.

---

## 8. Pilot Detay Sayfası: Sinematik Editoryal & Müze Derecesi Profil (sahip, 2026-10-13)

Sayfa: `app/[locale]/drivers/[driverId]/page.tsx`. Sahibin brifi, olduğu gibi (ayrıntılı faz planı: `docs/plans/master-plan.md` Faz 12):

> **Role & Perspective:** Elite Design Director combining Apple’s WWDC fluid interface principles (restraint, optical typography, material depth) with Formula 1’s dark, high-contrast telemetry aesthetic.
>
> **Project & Scope:** Redesign the Driver Detail Page (/drivers/[slug]) for Apex (Project Anthology). Transform the current generic admin-style driver card into an editorial, museum-grade cinematic profile that captures both the human emotion/narrative and raw telemetry data.
>
> **Core Design Guidelines & Architecture (Apex Design System):**
>
> **Atmosphere, Materials & Depth:**
> - Canvas base: Deep dark neutral (`#0a0a0a`), never pitch black.
> - Surfaces: Bento cards built on `--surface` (`#141414`) with a razor-sharp 1px border (`#262626`), 16px border-radius, and a hairline top-edge specular highlight (`rgba(255, 255, 255, 0.05)`).
> - Accent: Pilot/Team accent color (`#ff1801` for Ferrari) used strictly as a precision signal (vertical indicator bar `w-1 rounded-full`, active season badges, delta indicators).
>
> **Typographic Hierarchy & Optical Sizing:**
> - Hero Driver Name & Giant Number: Barlow Condensed (Bold, tight optical tracking `-0.02em`, leading `0.95`). The driver's permanent racing number (e.g., 16) must sit as a monumental, semi-translucent sculptural backdrop element (`hero-number`).
> - Editorial Narrative: Inter (Regular, 16px, line height 1.6) for the biographical overview and career story blocks.
> - Telemetry & Stats: JetBrains Mono (`tabular-nums`, 13–15px, uppercase labels with `+0.1em` letter spacing) for all Grand Prix entries, podium counts, pole positions, and season points.
>
> **Layout & Spatial Composition:**
> - **The Split Driver Hero:**
>   - Left / Foreground: Full-bleed cinematic portrait of the driver cut against dark paddock atmosphere with subtle gradient falloff.
>   - Right / Overlay: Driver full name in massive condensed type, driver nickname/monikers, current championship standing badge, and racing flag/chassis tag.
> - **Career Telemetry Bento (Sculpted Stats):**
>   - A compact, high-density row of metrics: World Titles, GP Entries, Wins, Podiums, Pole Positions, Career Points. Numbers stand out in crisp high-contrast white (`--text-hi`).
> - **Active Season Pulse & Head-to-Head Module:**
>   - Interactive season performance strip showing finishing positions (P1, P2, DNF) with status colors (purple for fastest lap, green for gain).
>   - Compact head-to-head bento comparing qualifying and race trim against their teammate.
> - **Chronological Legacy & Story Chapters:**
>   - Narrative broken into readable, curated eras (e.g., "The Junior Dominance", "Monza Glory", "Championship Battles") rather than a single wall of text.
>
> **Tone & Deliverable:** Deliver a breathtaking, dark-mode F1 editorial layout that feels like an exclusive paddock telemetry terminal curated by Apple. Avoid generic widgets, neon glows, or cluttered wiki cards. Focus on restraint, spatial harmony, and craft.

---

## 9. Pist Detay Sayfası: Mimari Telemetri Profili (sahip, 2026-10-13)

Sayfa: `app/[locale]/circuits/[id]/page.tsx`. Sahibin brifi, olduğu gibi (ayrıntılı faz planı: `docs/plans/master-plan.md` Faz 13):

> **Role & Tone:** Senior / Principal Product Designer crafting a high-end motorsport interface, synthesizing Apple’s WWDC fluid design principles (restraint, optical typography, material depth, spring physics) with Formula 1 technical telemetry.
>
> **Objective:** Redesign the Circuit Detail Page (/circuits/[slug]) for Apex (Project Anthology). Transform the current static circuit overview into an interactive, telemetry-driven architectural profile of the track (Monaco’s extreme topography, narrow glamour, and precision engineering).
>
> **Core Design Guidelines & Constraints (Apex Design System):**
>
> **Color & Surface Hierarchy:**
> - Background: Deep neutral `--bg` (`#0a0a0a`), never pure black.
> - Surface Materials: Bento modules built on `--surface` (`#141414`) with a sharp 1px border (`--hairline: #262626`), 16px border-radius (`--radius-lg`), and an ambient top-edge specular highlight (`rgba(255, 255, 255, 0.06)`) simulating light hitting physical glass.
> - Accent Discipline: Single global action accent Apex Red (`#ff1801`) used strictly for active status badges. Telemetry purple (`#b356fe`) exclusively reserved for the official Lap Record module.
>
> **Typographic Discipline & Optical Scaling:**
> - Hero Circuit Moniker: Barlow Condensed (Bold, tight optical tracking `-0.02em`, line-height `0.92`), display scale. Huge and sculptural.
> - Telemetry & Technical Specs: JetBrains Mono (`tabular-nums`, 13–15px, uppercase labels with `+0.1em` letter spacing) for circuit length, lap counts, gear shift frequency, and sector timing.
> - Editorial Heritage: Inter (Regular, 16px, line-height 1.6) for track lore and overtaking difficulty breakdown.
>
> **Spatial Layout & Modular Composition:**
> - **Cinematic Track Hero (Top 40vh):**
>   - Full-bleed trackside atmospheric texture with dark vignette falloff.
>   - Overlaid with the monumental circuit name, country badge, layout configuration year (e.g., "1950 — Present"), and next Grand Prix schedule badge.
> - **Interactive Sector Vector & Telemetry Map:**
>   - Central interactive SVG trace of the circuit featuring clear sector boundaries (Sector 1, 2, 3), speed trap marker, and DRS activation zone indicators.
>   - Interactive micro-pins on landmark corners (Turn 1 Sainte Dévote, Turn 6 Fairmont Hairpin, Tunnel, Swimming Pool chicane, Rascasse) revealing apex speeds and gear selection on hover/tap with spring physics (`damping: 1.0`, `response: 0.35s`).
> - **Elevation Profile Ribbon (Topo Telemetry):**
>   - Minimalist, high-density elevation chart showing Monaco's famous 42-meter climb and descent across the 3.337 km lap, with smooth Bézier curves and monospaced delta markers.
> - **Sculpted Fast Facts Bento Ribbon:**
>   - High-contrast tiles: Lap Distance (3.337 km), Number of Laps (78), Total Race Distance (260.286 km), and All-Time Lap Record (1:12.909 · Lewis Hamilton · 2021 in telemetry purple).
> - **Technical Strategy & Demands Module:**
>   - High-density telemetry cards showcasing: Gear shifts per lap (~54 shifts / lap), tyre degradation profile, downforce configuration (Maximum Downforce index), and safety car probability index.
>
> **Tone & Deliverable:** Deliver a dark-mode F1 telemetry console layout engineered with Apple-grade restraint. Eliminate generic wiki tables, neon glows, and template clutter. Every metric must feel verified, physical, and tuned like a wind-tunnel instrument.



