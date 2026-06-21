# Apex — Frontend Design System (design.md)

> **Amaç:** Apex F1 anlatı/istatistik platformunun frontend inşası için tek yönerge kaynağı.
> Bu döküman; renk, tipografi, düzen, derinlik, hareket, veri görselleştirme, asset kullanımı
> ve performans kurallarını tanımlar. **Mimari/backend** kararları için `docs/mimari.md` geçerlidir;
> bu döküman onunla çelişmez, onu görsel katmanda tamamlar.
>
> **İlk tasarım prensibi:** *Performans en temel tasarım öğesidir, ardından estetik gelir.*
> Asıl amaç estetik olduğu için, estetiği taşıyabilecek bir performans tabanı şarttır.
>
> **Türetilmiştir:** Stitch ile üretilip kullanıcı tarafından onaylanan 5 sayfa ailesinden
> (home, pilot profili, takım profili, season, anthology — her biri desktop + mobil) ve
> `team-colors.ts` tek-renk-kaynağından. Bu ekran görüntüleri Claude Code için referanstır.

---

## 0. Felsefe — "Karanlık Sinematik Editöryel"

Apex; premium bir spor belgeselinin atmosferi ile bir yarış mühendisinin telemetri
panosunun teknik disiplinini birleştirir. Sakin, otoriter, sofistike. Tipik "gürültülü"
spor klişelerinden (agresif renk, eğik italik blok, gradyan bombardımanı) kaçınır.

Üç duygusal çapa:
1. **Sayı kahramandır.** Puan, geri sayım, mesafe, pozisyon — büyük condensed rakamlar
   sayfanın ana görsel öğesidir. Hiyerarşi rakamla kurulur.
2. **Karanlık bir sahne.** Neredeyse siyah taban, içeriğin (foto, SVG, veri) öne çıktığı
   sonsuz bir tuval. Renk az, anlamlı, ölçülü.
3. **İki okuma modu.** Veri yoğun sayfalar **bento**; arşiv/hikâye sayfaları **editöryel akış**
   (scrollytelling). İkisi aynı tipografi ve renk diliyle konuşur ama farklı iskelet kullanır.

**Risk/imza:** Sayfanın hatırlanacak tek öğesi, içeriğe göre **dinamik takım renginin** ve
**dev condensed sayının** birlikte yarattığı "broadcast HUD'u sakinleştirilmiş" his. Bütün
cesaret buraya harcanır; etrafındaki her şey sessiz ve disiplinli kalır.

---

## 1. Renk Sistemi

### 1.1 Tek kaynak ilkesi (zorunlu)

**Takım renkleri hiçbir yerde hardcode edilmez.** Tek doğruluk kaynağı, canlı
[`config/team-colors.ts`](../config/team-colors.ts).

Renk türetimi yalnız bu dosyanın dışa açtığı fonksiyonlarla yapılır:
- `getSeasonPalette(teamIdOrName, season)` → `{ primary, secondary, accent }` (60-30-10)
- `resolveTeamUiColor(apiColor, teamName)` → timing bar / chip / border için tek UI rengi
- `teamPaletteCssVars(palette)` → `--team-primary/secondary/accent` inline CSS değişkenleri
- `teamColorsCssVars()` → tüm takımların global CSS değişkenleri

Profil/round sayfaları **server-side**'da paleti çözer, kök elemana inline CSS değişkeni
olarak basar; alt bileşenler `var(--team-secondary)` vb. okur. Yeni renk üretilmez,
mevcut HEX'ler kopyalanıp ikinci kaynak yaratılmaz.

### 1.2 Nötr taban (taşıyıcı katman)

Saf siyah **kullanılmaz** (halation/göz yorgunluğu). Tonal katmanlar:

| Token | HEX | Kullanım |
|---|---|---|
| `--bg` | `#0a0a0a` | Sayfa zemini (the void) |
| `--surface` | `#141414` | Bento kart zemini |
| `--surface-raised` | `#1c1c1c` | Hover / iç içe kart / vurgulu satır |
| `--hairline` | `#262626` | 1px kart kenarlığı |
| `--text-hi` | `#ffffff` | Başlık, kahraman sayı |
| `--text` | `#e6e6e6` | Gövde |
| `--text-mid` | `#9a9a9a` | İkincil etiket |
| `--text-low` | `#666666` | Mono caption, pasif etiket |

Takım-temalı sayfalarda taban, `getSeasonPalette().primary` ile **çok hafif** takım tonuna
boyanır (ör. Mercedes `#06100f`, Ferrari `#1a0606`). Bu, `#0a0a0a`'nın yerini alır; nötr `#141414`
kartlar üstünde durur. Boyama yalnız tabanda; kartlar nötr kalır.

### 1.3 Vurgu rengi — bağlama göre

- **Global sayfalar** (home, season, news, tech-glossary, circuits listesi): vurgu **Apex Red
  `#ff1801`** (kaynak: `DEFAULT_SEASON_PALETTE.secondary` — tek renk kaynağı `team-colors.ts`).
  Yalnız: canlı durum noktası, güncel round, tek kritik vurgu. Başka hiçbir yerde kırmızı yok.
- **Takım-bağlamlı sayfalar** (pilot profili, takım profili, round detay): vurgu o takımın
  `secondary`'si (Mercedes teal `#00D2BE`, Red Bull `#3671C6`…). Bu sayfalarda **kırmızı
  görünmez** (kırmızı bir takımın rengi değilse).
- **Standings/listeler:** her satırın yanındaki ince bar `resolveTeamUiColor` ile o pilotun
  takım rengini taşır — birden fazla takım rengi aynı listede yan yana yaşar, bu kaostur değil,
  bilgidir (renk = takım kimliği).

### 1.4 Kırmızı disiplini (sert kural)

Kırmızı **veri/durum rengidir, dekorasyon değil.** İzinli: canlı "LIVE" noktası, güncel/next
round çubuğu, kayıt-kıran istatistik. **Yasak:** editöryel etiket ("EDITORIAL" nötr gri olur),
hikâye başlığı, genel başlık, hover dekoru, input focus (focus beyaz olur). Anthology'de kırmızı
tüm sayfada **en fazla bir-iki kez** (pull-quote dikey kuralı + opsiyonel bir kicker).

### 1.5 Erişilebilirlik

Takım renkleri koyu zeminde okunur kalmalı. `getSeasonPalette` tone/chroma'yı sabitleyip
sadece hue'yu değiştirir (HCT mantığı); kontrast WCAG AA'yı geçmezse `DEFAULT_SEASON_PALETTE`
nötr fallback devreye girer. **Renk asla tek bilgi taşıyıcısı değildir** (bkz. §6).

---

## 2. Tipografi

Üç-font stratejisi. Hepsi açık-kaynak, **build-time self-host** (`next/font/google` ile;
fontlar derleme anında indirilip `'self'` origin'den sunulur — runtime CDN yok, CSP
`font-src 'self'` ile uyumlu). `font-display: swap`, yalnız kullanılan ağırlıklar subset edilir.
Display/sayı = Barlow Condensed (ayrı display fontu yok); veri/etiket = **JetBrains Mono**
(IBM Plex Mono değil).

| Rol | Font | Kullanım |
|---|---|---|
| **Display / Sayı** | **Barlow Condensed** | Kahraman sayılar, isimler, başlıklar, section header. Dar ve dik — yarış livery'sinin hızı. |
| **Gövde** | **Inter** | Anthology uzun metin, açıklama, editöryel paragraf. |
| **Veri / Etiket** | **JetBrains Mono** | Tablo verisi, timing, puan, caption, mono etiket, çip. Eşaralıklı → sayılar canlı güncellemede zıplamaz. |

> **Sert kural:** Başlık/sayı **asla** geniş serif veya değişken-genişlik fontla render edilmez.
> (Stitch ilk turlarda bunu kırdı; gerçek implementasyonda Barlow Condensed zorunlu.)

### 2.1 Tip ölçeği

| Token | Font | Boyut / satır | Ağırlık | Notlar |
|---|---|---|---|---|
| `display-hero` | Barlow Condensed | 120 / 110 px | 700 | `letter-spacing:-0.02em`. Desktop hero isim/sayı. Tek satır hedeflenir. |
| `display-hero-mobile` | Barlow Condensed | 64 / 60 px | 700 | `-0.01em`. Mobil hero. |
| `headline-lg` | Barlow Condensed | 48 / 52 px | 600 | Section başlık. |
| `headline-md` | Barlow Condensed | 32 / 36 px | 600 | Kart başlık. |
| `body-lg` | Inter | 18 / 28 px | 400 | Anthology gövde. |
| `body-md` | Inter | 16 / 24 px | 400 | Genel açıklama. |
| `data-tabular` | JetBrains Mono | 14 / 20 px | 500 | `-0.01em`, **tabular-nums**, puan/timing sağa hizalı. |
| `label-caps` | JetBrains Mono | 12 / 16 px | 700 | `letter-spacing:0.1em`, uppercase. Eyebrow/etiket. |

### 2.2 Kahraman sayı kuralları

- Büyük sayıda satır yüksekliği boyutla **ters orantılı** (≈1.0). Geniş line-height büyük
  rakamı kopuk gösterir.
- Tablodaki/listedeki sayılar **sağa hizalı** + `font-variant-numeric: tabular-nums`.
- Sayı görsel ağırlığını dengelemek için yanındaki etiket/ikon **düşük kontrast** (`--text-mid`/`--text-low`).
- Anthology gövde ölçüsü **≤75 karakter** (`max-width: ~68ch`); okuma yorgunluğunu önler.

---

## 3. Düzen

### 3.1 İki iskelet

**A) Bento** — home, pilot profili, takım profili, season, circuits, news, tech-glossary.
Asimetrik grid; farklı boyutlarda modüler "veri tuğlaları". Bir kahraman kart + etrafında
yoğun-veri kartları.

**B) Editöryel akış (scrollytelling)** — **yalnız** `/anthology/[slug]`. Bento DEĞİL. Tek
ortalanmış okuma kolonu, tam-genişlik sinematik görseller, kart yok, pano öğesi yok.

**Navigasyon:** Masaüstünde sticky üst header (gerçek blur, §4). **Mobilde sabit alt tab-bar
(bottom-nav)** — Stitch deseni onaylı: Home / Season / Drivers / Anthology + aktif sekme accent'i.
Hamburger-drawer kullanılmaz.

### 3.2 Grid & ritim

- **Desktop:** 12 kolon, 24px gutter, `container-max: 1440px`, sayfa kenarı 64px.
- **Tablet:** 8 kolon, 20px gutter.
- **Mobil:** tek kolon (kavramsal 4 kolon), 16px gutter, kenar 20px.
- Tüm padding/margin **4px baseline grid**'e oturur.
- Editöryel kolon: gövde `~68ch`, tam-genişlik görseller kolonu taşar (full-bleed).

### 3.3 Sayfa arketipleri (onaylı referanslardan)

**Home (bento):**
```
┌──────────────────────────┬───────────────┐
│ HERO: NEXT RACE           │ STANDINGS     │
│ dev "SINGAPORE" + pist    │ [Drivers|Teams]│
│ outline + geri sayım      │ top5 + bar+pts │
├──────────────┬───────────┤ (toggle, tek  │
│ STORY (wide) │ 382 stat  │  kart)        │
│ EDITORIAL    ├───────────┤               │
│ (nötr kicker)│ PODIUM    │               │
│              ├───────────┴───────────────┤
│              │ THE WIRE (haber, mono ts) │
└──────────────┴───────────────────────────┘
```
- Standings **tek kart + Drivers/Teams toggle** (client component, §7). Ayrı Constructors
  bar kartı **yok** (kaldırıldı).
- Editöryel kicker **nötr gri**, kırmızı değil.

**Pilot profili (bento, takım-temalı):**
- Hero: dev numara + condensed isim + mono takım/ülke + sağda pilot SVG portresi (takım
  rengi soft glow ile, içeriğe bakacak yönde). Sol kenar ince takım-rengi accent bar.
- Bento: WINS/PODIUMS/POLES trio · Season Standing (P# + puan) · Career Progression
  (çizgi grafik) · Season Form (son 5, pozisyon çipi ikon+etiket) · Technical Dossier
  (mono liste) · "2026 CAR" kartı (araç SVG + logo).

**Takım profili (bento, takım-temalı):**
- Hero: logo + dev condensed takım adı + mono künye + araç SVG (geniş, glow). Sol accent bar.
- Bento: Constructor Standing (P# + puan + bar) · Season Stats trio · **Driver Line-up**
  (iki pilot SVG, eşit ağırlık) · **Head-to-Head** (imza öğe, §3.4) · Technical Dossier ·
  Recent Form.

**Season (bento):**
- Üst: dev "2026" + ok'lar + yıl scrubber + özet (ROUNDS/COMPLETED/CURRENT LEADER).
- Bento: Calendar (round listesi, status çipi DONE/NEXT/UPCOMING, NEXT ince kırmızı bar) ·
  Standings (Drivers/Teams toggle) · Season Highlight (dev sayı) · Last Race podium.
- Tarihsel sezonlarda taban + barlar `getSeasonPalette(team, year)` ile **dönem rengine** kayar.

**Anthology (editöryel akış):**
- Sinematik full-bleed hero (foto + alt gradyan) · mono kicker "THE ANTHOLOGY · VOL.N" ·
  dev condensed başlık · Inter standfirst · mono byline.
- Gövde: drop-cap açılış · condensed section header · full-bleed görsel + mono caption ·
  pull-quote (dev condensed + ince kırmızı dikey kural) · portre+metin ikilisi ·
  **data interlude** (prozadan ayrı mono stat bloğu — telemetri/sektör farkı; sayfanın tek
  yapısal öğesi) · sonda "NEXT IN THE ANTHOLOGY" kartı.

### 3.4 İmza öğe: Head-to-Head

Takım sayfasının ayırt edici bileşeni. İki pilotun sezon karşılaştırması: merkez-bölücü,
sola/sağa büyüyen barlar (`8  QUALI  14`, `10  RACE  12`). Bir taraf nötr gri, diğer taraf
takım `secondary`'si + pilot kısaltması (renk tek başına bilgi taşımaz). Mono sayılar.

---

## 4. Derinlik & Yüzey

Hiyerarşi gölge **yığınıyla değil**, tonal katman + hairline + ölçülü gölge/cam ile kurulur.

| Katman | Teknik |
|---|---|
| Taban | `--bg #0a0a0a` (veya takım-tonlu taban). |
| Kart (yükseltilmiş) | `--surface #141414` + `1px solid --hairline #262626` + **yumuşak ambient gölge** (büyük blur ≥32px, opaklık ~%15, offset 0 — yüksek-uç monitör parıltısı). |
| Hover | Kart zemini `--surface-raised #1c1c1c`'a yükselir; takım/kırmızı ince accent bar belirir; `transform: translateY(-2px)`. |
| Yüzen (gerçek cam) | `backdrop-filter: blur(20px)` + `#141414`'ün ~%60 opaklığı. **Yalnız:** sticky header, modal, ve kahraman/öne-çıkan kartlar (home hero, profil hero gibi sayfada 1-2 adet). |
| Sıradan bento (pseudo-glass) | Gerçek blur **yok**. Yarı-saydam koyu katman + üst-kenar 1px hairline highlight ile cam *hissi*. Yoğun gridlerde maliyet sıfır. |

**Radius:** kart/büyük container `16px` (`rounded-lg`); buton/çip `8px` (`DEFAULT`); pill/nokta `full`.

**Performans sınırı (zorunlu):** `backdrop-filter` pahalıdır. Bir viewport'ta aynı anda
**en fazla ~2 gerçek-blur katmanı**. Bento kartlarının hiçbiri gerçek blur kullanmaz.
Gölge `box-shadow` ile tek katman; iç içe gölge yığını yok.

---

## 5. Hareket

Kütüphane: **framer-motion 12**. Hareket *amaçlıdır* — geri bildirim veya bağlam için;
gösteriş için değil. Aşırı animasyon tasarımı "AI üretimi" hissettirir.

- **Mikro-etkileşim:** kart hover yükselme (~150ms, ease-out), buton/toggle geçişi.
- **Takım rengi geçişi:** profil/round'da tema değişince renk ~**800ms** zarifçe geçer
  (sert sıçrama yok).
- **Scroll-reveal (anthology):** bölümler scroll'da yumuşak fade/translate ile belirir;
  full-bleed görseller hafif paralaks (ölçülü). Bento sayfalarında scroll-reveal minimal.
- **Canlı nokta:** "LIVE" yanında kırmızı 8px nokta yumuşak pulse.
- **`prefers-reduced-motion: reduce`** mutlaka desteklenir: tüm non-essential hareket kapanır,
  geçişler anlık olur, paralaks devre dışı.

---

## 6. Veri Görselleştirme & Veri Etiği

- **Renk asla tek başına bilgi taşımaz.** Durum/sonuç daima **ikon + metin etiketi** ile:
  damalı bayrak + "P1", "DNF", "+5s", DONE/NEXT/UPCOMING çipi. Renk körlüğü + teknik
  "mühendislik" estetiği bir arada. Bayrak/durum ikonları repo'dan: `public/icons/`
  (green-flag, red-flag, racing-flag, safety-car, virtual-safety-car).
- **Aşamalı sunum (progressive disclosure):** ilk bakışta yalnız kritik veri; derin telemetri
  etkileşimle (tıklama/scroll/expand) açılır. Bilişsel yük düşük tutulur.
- **Çipler:** mono, pill (`8px`), düşük kontrast gri stroke ("L5/56", "SOFT", "P2").
- **Barlar:** standings/constructor bar = takım rengi (`resolveTeamUiColor`); ilerleme barı
  takım `secondary` veya kırmızı (bağlama göre).
- **Tablolar:** sayılar sağa hizalı, `tabular-nums`, mono. Satır hover `--surface-raised`.
- **Grafikler:** minimal eksen (mono etiket), tek vurgu rengi, gridsiz/ince grid; "müze
  kataloğu" disiplini — net, otoriter, sade.

---

## 7. Performans (estetiği taşıyan taban)

`docs/mimari.md` ile uyumlu: Next.js 16 App Router, **RSC-öncelikli**, Tailwind CSS 4.

- **Server-first:** Sayfalar ve bento kartları varsayılan **Server Component**. Veri RSC'de
  server-side okunur (`lib/data/*`), client'a fetch/secret sızmaz.
- **Client adacıkları (minimal):** yalnız etkileşim gerektiren küçük parçalar `'use client'`:
  Standings **Drivers/Teams toggle**, search, mobil menü, anthology scroll efektleri. Toggle'da
  her iki veri seti sunucudan hazır gelir; client yalnız görünürlük state'ini değiştirir.
- **Font:** `next/font/google` ile build-time self-host (`'self'` origin'den sunulur), subset,
  `swap`. Runtime CDN yok — CSP `font-src 'self'` uyumlu.
- **Görsel:** `next/image`; foto'lar (anthology `public/stories/…`) responsive
  (portrait/landscape/full varyantları zaten mevcut, §8). SVG'ler (araç/pilot/logo/bayrak)
  inline veya `<img>`; küçük/kritik SVG inline, dekoratif SVG lazy. Pist `.png`'leri optimize.
- **Hareket/efekt bütçesi:** gerçek blur ≤2/viewport (§4); animasyonlar `transform`/`opacity`
  ile compositor'da; layout-trigger animasyon yok.
- **CLS/hizalama:** `tabular-nums` ile canlı sayı zıplamaz; hero başlık `clamp()` ile
  taşmadan ölçeklenir (kelime kırılması yok — "MERCEDES" tek satır).
- **Sentry/`lib/logger`:** kritik client etkileşimleri sarılı (mimari kuralı).

---

## 8. Asset Kullanımı (repo gerçeği)

| Tür | Yol | Not |
|---|---|---|
| 2026 araç (side, şeffaf) | `public/cars/<constructorId>.svg` | `carSrc()` constructorId'yi as-is kullanır (underscore deseni: `red_bull.svg`, `aston_martin.svg`, `rb.svg`). Hero/`2026 CAR` kartında. |
| Pilot portresi | `public/drivers/2026/<slug>.svg` | 24 pilot. Profil hero + standings + line-up. **Foto değil SVG.** |
| Takım logosu | `public/teams/2026/<slug>.svg` | Profil hero + line-up rozeti. Kebab-case (`red-bull.svg`). |
| Durum/bayrak ikonu | `public/icons/*.svg` | Veri-etiği ikonları (§6). |
| Lastik | `public/tyres/*.svg` | Mevcut 11 compound (soft/medium/hard/intermediate/wet/full-wet/c1–c5). Strateji/round detayında. |
| Pist | `public/circuits/*` | **İkilik:** modern pistler `.png` (render), tarihsel `.svg` (yıl-kodlu layout). Kural: hero/detay görseli `.png` varsa onu; şematik/outline gerekiyorsa `.svg`. Hero arka planındaki soluk "pist outline" şematik SVG'den. |

**Slug tutarlılığı:** **Logo ve pilot** asset basename'leri `team-colors.ts`'teki `id`
(kebab-case: `red-bull`, `aston-martin`, `racing-bulls`) ile eşlenir; çözümleme
`teamIconSrc`/`driverIconSrc` ve `team-colors.ts` `aliases` üzerinden yapılır. **Araç** asset'leri
ise constructorId underscore deseninde kalır (`carSrc()` zaten doğru çözümlüyor; normalize gerekmez,
`f1-icons.ts`'e dokunulmaz).

---

## 9. Bileşen Özeti (hızlı referans)

- **Bento Card:** `--surface` + hairline + 16px radius + 24/32px iç padding + ambient gölge.
- **Action Button:** birincil = dolu beyaz / siyah metin (maks kontrast); ikincil = ghost
  (hairline, dolgusuz).
- **Data Chip:** mono, pill 8px, düşük kontrast gri stroke.
- **Live Indicator:** kırmızı 8px pulse nokta + mono "LIVE".
- **Standings Row:** pozisyon · pilot SVG · condensed isim · mono takım · ince takım-rengi bar
  · sağa hizalı mono puan; hover `--surface-raised` + accent bar.
- **Toggle (Drivers/Teams):** client; aktif sekme alt çizgi (global'de kırmızı, takım
  sayfasında takım rengi); iki veri seti SSR'dan hazır.
- **Status Chip:** ikon + metin (DONE/NEXT/UPCOMING, P1/DNF) — renk tek başına değil.
- **Input:** koyu, gömük, 1px border; focus border **beyaz** (kırmızı değil).
- **Head-to-Head:** merkez-bölücü çift bar, bir taraf nötr / diğer takım rengi, mono.

---

## 10. Özet Kararlar (değişmezler)

1. **Performans önce, estetik sonra** — ama hedef estetik; performans onu taşır.
2. **Tek renk kaynağı** `team-colors.ts`; hardcode yok, 60-30-10, sezon-farkındalıklı.
3. **Nötr taban + bağlama göre vurgu:** global = kırmızı (kritik veri), takım sayfası = takım rengi.
4. **Tipografi:** Barlow Condensed (sayı/başlık) + Inter (gövde) + JetBrains Mono (veri).
   Başlık asla geniş serif değil.
5. **İki iskelet:** bento (veri) + editöryel akış (yalnız anthology).
6. **Derinlik:** tonal + hairline + ölçülü gölge/hover; gerçek blur yalnız header/modal/hero,
   gerisi pseudo-glass; ≤2 blur/viewport.
7. **Hareket amaçlı:** ~800ms tema geçişi, ölçülü scroll-reveal, reduced-motion zorunlu.
8. **Veri etiği:** renk asla tek başına değil (ikon+etiket), progressive disclosure.
9. **RSC-öncelikli:** client yalnız küçük etkileşim adacıkları; self-host font; CSP'ye uyum.
10. **Asset:** repo SVG'leri (araç/pilot/logo/bayrak); logo/pilot kebab-slug, araç constructorId
    underscore (`carSrc` çözümlü), png/svg pist ikiliği.
