# Bölüm 5 — UX & Tasarım Bütünlüğü

> Council Section 5 — Apex F1 arşiv platformu. İncelenen kaynaklar: `pre-plans/DESIGN_SYSTEM.md`, `components/ui/*` (18 dosya), `app/globals.css`, `app/layout.tsx`, `components/providers/PageTransition.tsx`, `components/season/SeasonExplorer.tsx`, `app/anthology/_components/StoryCard.tsx` ve sayfa hero'ları.

## Özet

Genel tablo güçlü: tasarım token'ları (`globals.css` `:root` + `@theme`) DESIGN_SYSTEM ile birebir örtüşüyor, `border-radius: 0` global olarak zorlanmış, `prefers-reduced-motion` kapsamı projelerin çoğunda görülmeyecek kadar geniş ve `EntityDrawer` örnek gösterilecek kalitede bir modal implementasyonu. Ana sorunlar üç kümede toplanıyor:

1. **Spesifikasyon kayması** — Navbar'ın scrolled durumu, aktif link göstergesi, hero katman değerleri ve hero tipografi ölçeği DESIGN_SYSTEM'den sessizce uzaklaşmış. Mobile Bottom Nav ve hamburger spec'te var, kodda hiç yok.
2. **Erişilebilirlik mikro-ihlalleri** — `rgba(255,24,1,0.7)` ile yazılmış 9-10px etiketler AA kontrast eşiğinin altında; skip-link yok; `<tr role="button">` tablo semantiğini bozuyor.
3. **Motion boşlukları** — `StoryCard` genişleme animasyonu ve `GlossaryCard` "+" ikonu reduced-motion'ı dinlemiyor; sayfa geçiş süpürmesi spec'teki "maskele → değiştir → çık" akışını gerçekte uygulamıyor.

## Design System Uyumu

### Uyumlu olanlar (doğrulandı)

| Spec | Kod | Durum |
|---|---|---|
| Renk sistemi (`#0a0a0a`, `#131313`, `#141414`, `#ff1801`, `#f4f1ea`, muted %50) | `globals.css:3-27` token'ları birebir | ✅ |
| Carbon grid `45deg repeating-linear-gradient` | `--carbon-grid` aynı değerlerle | ✅ |
| Radius/gölge yasağı | `*,*::before,*::after { border-radius: 0 }` + `@theme` radius'ları 0 | ✅ |
| Shimmer skeleton (gradient, 200%, 1.5s, radius 0) | `.shimmer` birebir + reduced-motion fallback | ✅ |
| Section divider (13px, 0.2em, 2×40px kırmızı blok, sola hizalı) | `SectionDivider` + `.section-divider*` birebir | ✅ |
| Kart spec'i (16/9 görsel, %30→0.85 gradient, 9px mono etiket, Bebas 1.3rem, 3→6px border-left, 300ms cubic-bezier expand) | `StoryCard.tsx` + `.anthology-card` neredeyse birebir | ✅ |
| Navbar marka (chevron SVG 14×18, stroke 2.5, ön ok kırmızı / arka ok beyaz %35, APEX Bebas 22px 0.08em) | `SiteNav.tsx:53-78` birebir | ✅ |
| Spacing (1180px, 80/48px section gap, 52px navbar offset) | `--content-max`, `--section-gap` + 767px media query | ✅ |

### Sapmalar

1. **Navbar scrolled durumu** — Spec: `rgba(10,10,10,0.92)` + `blur(16px)` + `2px solid #ff1801` alt çizgi. Kod:

```104:108:app/globals.css
.site-nav.scrolled {
  background: rgba(10, 10, 10, 0.82);
  backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid rgba(255, 24, 1, 0.55);
}
```

Daha şeffaf arka plan + yarı saydam 1px kırmızı çizgi; spec'teki keskin "2px tam kırmızı" imzası kaybolmuş.

2. **Aktif link göstergesi** — Spec: "color white + `4px` red dot below via `::after`". Kod (`globals.css:174-194`): nokta değil, `scaleX` ile açılan 1.5px kırmızı **alt çizgi**. Görsel dil farklı bir karara evrilmiş ama spec güncellenmemiş.

3. **Mobil navigasyon mimarisi tamamen farklı** — Spec iki şey tanımlıyor: (a) mobilde "brand center, hamburger left, no inline links", (b) 64px'lik 5 öğeli Mobile Bottom Nav (Home/Season/Circuits/Radio/More). Kodda **ikisi de yok**: `SiteNav` tüm linkleri her breakpoint'te gösteriyor, hamburger ve bottom nav hiç implement edilmemiş. `--mobile-nav-height: 64px` token'ı tanımlı ama hiçbir yerde kullanılmıyor (ölü token). Ayrıca spec'teki rota seti (Radio, Timeline, About) ile gerçek IA (Anthology, News, Circuits, Season, Glossary) uyuşmuyor — DESIGN_SYSTEM bu bölümde bayat.

4. **Atmospheric hero katman değerleri yoğunlaştırılmış** — Spec: spotlight sol `20% 0%` / `0.05`, sağ `80% 0%` / `0.04`, kırmızı glow `0.12`, grain `0.04`, **tek** ışık şeridi. Kod (`globals.css:287-368`): spotlight'lar `15%/85% 15%` ve `0.08/0.06`, glow `0.28` + spec'te olmayan ek vignette katmanı, grain `0.05`, **üç** şerit. Sonuç muhtemelen daha sinematik ama spec'in iki katı yoğunlukta — bilinçliyse spec güncellenmeli.

5. **Hero tipografi ölçeği** — Spec: `clamp(3rem,12vw,8rem)`. Tüm index sayfaları (`news`, `circuits`, `anthology`, `season`, `tech-glossary`) `clamp(5rem,16vw,12rem)` kullanıyor; detay sayfaları `clamp(2.5rem,8-9vw,5-6rem)`; `NewsFeaturedHero` `clamp(2.5rem,7vw,5.5rem)`. Sayfalar kendi içinde tutarlı ama hiçbiri spec ile eşleşmiyor.

6. **Küçük kaymalar** — Nav link tracking `0.14em` (spec `0.12em`); navbar default border `0.06` alpha (token `--border` `0.07`); `bento-panel:hover` border-left'i 3px'te sabitliyor (anthology-card'ın 3→6px imzasından bilinçli ayrışma, dokümante değil).

## Mobil Deneyim

- **En kritik boşluk:** Spec'in vaat ettiği Mobile Bottom Nav yok (yukarıda #3). Mevcut çözüm — tüm linklerin 10px / `0.08em` tracking ile sıkıştırılması (`globals.css:203-214`) — çalışıyor ama dokunma hedefleri çok küçük: 10px metin + 3px padding ≈ ~20px yükseklik, WCAG 2.5.8 (24×24px min) ve platform önerilerinin (44px) altında.
- **<380px düzen riski:** `globals.css:216-235`'te nav `height: auto` olup iki satıra çıkıyor, ancak `.site-main` offset'i sabit `padding-top: var(--navbar-height)` (52px). Dar ekranda fixed nav ~90px'e büyüyünce sayfa içeriğinin üstünü örtmesi muhtemel — gerçek cihazda doğrulanmalı.
- **İyi yapılanlar:** `atmospheric-hero` `100svh` fallback kullanıyor; `--section-gap` 767px altında 48px'e düşüyor; `EntityDrawer` paneli `min(100%, 420px)` ile mobilde tam ekran; bento grid 2→4 sütun kademelenmesi temiz; `race-calendar-scroll` ince scrollbar'ı tanımlı.
- **Küçük pürüzler:** `NewsFeaturedHero` `min-h-screen` kullanıyor (`svh` yok — mobil adres çubuğu zıplaması); `TiltCard` `w-[220px]` sabit genişlik (scroll-snap bağlamında kabul edilebilir); drawer içeriği `maxHeight: calc(100dvh - 180px)` sihirli sayısı, başlık 180px'i aşarsa (uzun pilot adı + ikon) içerik kırpılabilir.

## Erişilebilirlik (WCAG 2.1 AA)

### Güçlü yanlar

- Global `:focus-visible` accent ring (`globals.css:59-62`) — tüm odaklanabilir öğeleri kapsıyor.
- `SeasonExplorer` satırları: `role="button"` + `tabIndex={0}` + `aria-haspopup="dialog"` + açıklayıcı `aria-label` + Enter/Space `onKeyDown` — tam klavye desteği.
- `SafeImage` `alt`'ı zorunlu kılıyor; dekoratif görseller tutarlı şekilde `alt=""`/`aria-hidden`.
- `FlipDigit` animasyonlu katmanları `aria-hidden` yapıp `sr-only` ile tek değer okutuyor; `AnimatedBar` dekoratif olduğu için AT'den gizlenmiş (gerekçesi kodda yorumla açıklanmış) — örnek alınacak desenler.
- `nav` öğeleri `aria-label="Primary"` taşıyor (iki flank aynı etiketi paylaşıyor — "Primary left/right" ayrımı daha iyi olurdu).

### Boşluklar

1. **Kontrast (1.4.3) — en yaygın ihlal:** `rgba(255,24,1,0.7)` renkli mikro-etiketler (StoryCard kategori, RaceHeroPanels kicker, EntityDrawer sezon etiketi, GlossaryCard alias) koyu zemin üzerinde ~2.8-2.9:1 kontrast veriyor — 9-10px metin için 4.5:1 gerekir. Tam `#ff1801` bile `#0a0a0a` üzerinde ~5:1 ile sınırda geçiyor; %70 opaklık eşiğin belirgin altına düşürüyor. Çözüm: bu etiketlerde opaklığı kaldırıp tam accent kullanmak (veya opaklığı yalnızca dekoratif öğelerde tutmak). `--muted` (%50 paper) ise ~5.1:1 ile geçiyor — sorun değil.
2. **Skip link yok (2.4.1):** `app/layout.tsx`'te "skip to content" bağlantısı yok; klavye kullanıcısı her sayfada 5 nav linkini geçmek zorunda.
3. **`<tr role="button">` (`SeasonExplorer.tsx:286-291`):** `role` override'ı satırın tablo semantiğini (row/cell ilişkisi) AT'den siler — ekran okuyucu sütun başlıklarını eşleştiremez. Doğru desen: satır içinde gerçek bir buton/link, ya da tüm tabloyu grid pattern'e çevirmek.
4. **`BackButton` global Escape dinleyicisi:** Detay sayfalarında `window`'a Escape bağlıyor. Aynı sayfada ileride bir overlay açılırsa (drawer, lightbox) Escape hem overlay'i hem sayfayı kapatır — çakışma deseni. Şu an `EntityDrawer` yalnızca `/season`'da olduğu için fiilen çatışma yok, ama kırılgan.
5. **Dil:** `html lang="en"` ve tüm UI metinleri İngilizce — tutarlı, sorun yok; içerik Türkçeleşirse `lang` stratejisi gerekecek.
6. 9px (`text-[9px]`) gövde-altı etiketler teknik ihlal olmasa da düşük görme keskinliğinde fiilen okunmaz; minimum 10-11px'e çekilmesi önerilir.

## Tipografi & Görsel Dil

- **Font yükleme** (`app/layout.tsx:15-41`): dört aile de `next/font` ile, doğru ağırlıklar (Inter 300/400/500, Bebas 400, Barlow 400-600, Plex Mono 400/500), `display: swap` — spec'e tam uygun.
- **Gövde:** `body` 300 / 1.7 line-height — spec birebir. `story-prose` 1.05rem/1.7 ile okunabilirlik iyi.
- **Hiyerarşi tutarlılığı:** Display→Bebas + `0.04em` tracking, etiket→Barlow uppercase, veri→Plex Mono deseni tüm bileşenlerde disiplinli uygulanmış. Tracking değerleri ise serbest dağılıyor: condensed için `0.12/0.14/0.15/0.2em`, mono için `wider(0.05em)/0.15/0.2em` karışık. Spec yalnız `0.12-0.2em` aralığı verdiği için ihlal değil ama 3-4 sabit token'a (`tracking-label`, `tracking-data` gibi) indirgenmesi görsel gürültüyü azaltır.
- **Ölçek sapması:** hero clamp'leri spec'ten büyük (yukarıda Design System #5). Kart başlığı `1.3rem` ✅; section başlığı olarak spec'teki `2.5rem` pratikte kullanılmıyor — section'lar `SectionDivider`'ın 13px etiketiyle açılıyor (spec'in kendi Section Dividers bölümüyle tutarlı, "Scale" satırıyla çelişkili; spec kendi içinde belirsiz).
- **Görsel dil:** accent-only kuralı korunmuş — kırmızı dışındaki tek renk kaynağı takım renkleri (veri kaynaklı, meşru istisna). Radius/gölge yasağına tek istisna `bento-neon-divider-glow`'un `box-shadow`'u — ama bu "gölge" değil neon parıltısı, kabul edilebilir; yine de spec'in "no shadows" dili buna izin verdiğini söylemiyor.

## Animasyon & Motion

### Reduced-motion kapsamı (güçlü)

| Animasyon | RM davranışı |
|---|---|
| Shimmer | `animation: none` + düz `#1a1a1a` ✅ |
| Hero ışık şeritleri | `display: none` ✅ |
| Bento neon divider | statik konumda sabitleniyor ✅ |
| Standings barları | `transition: none`, dolu render ✅ |
| `FlipDigit` | anında değer değişimi ✅ |
| `TiltCard` | handler'lar hiç bağlanmıyor ✅ |
| `CircuitLapLine` | `dashOffset: 0` (çizgi tam çizili) ✅ |
| `PageTransition` | `useReducedMotion` → düz `<div>` ✅ |
| `EntityDrawer` | anında aç/kapa ✅ |
| Smooth scroll | `scroll-behavior: auto` ✅ |

### Boşluklar ve sorunlar

1. **`StoryCard` expand** (`StoryCard.tsx:64-69`): `max-height` 300ms geçişi reduced-motion kontrolü yapmıyor — spec "in-place expand"i tanımlayan tek bileşende RM desteği eksik.
2. **`GlossaryCard`**: tanım açılışı RM'yi dinliyor ama (a) `useState` initializer ile **bir kez** okuyor (tercih değişirse güncellenmez; ortak `usePrefersReducedMotion` hook'u dururken), (b) "+" ikonunun 300ms rotate'i hiç gate'lenmemiş.
3. **`usePrefersReducedMotion` çiftlenmiş**: `EntityDrawer.tsx:58-74` ortak hook'un (`components/ui/usePrefersReducedMotion.ts`) birebir kopyasını içeride tanımlıyor — davranışsal risk yok ama bakım maliyeti.
4. **Sayfa geçişi spec'i gerçekleştirmiyor**: Spec'in akışı "band girer (250ms) → sayfa **bandın arkasında** değişir → band çıkar (250ms)". `PageTransition.tsx`'te `AnimatePresence mode="wait"` var ama **exit varyantı yok** — eski sayfa anında kaybolur, süpürme yeni sayfanın *üzerinde* oynar; maskeleme illüzyonu yok. Ayrıca sweep `animate` ile mount'ta tetiklendiği için **ilk sayfa yüklemesinde de** kırmızı bant geçiyor (gereksiz). Easing/süre (`0.5s`, easeIn/easeOut) spec'e uygun.
5. Nav link alt çizgi `scaleX` geçişi ve `anthology-card` border-width geçişi RM'de çalışmaya devam ediyor — küçük/öz-yeterli oldukları için düşük öncelik.

## EntityDrawer / Overlay

`EntityDrawer.tsx` projenin en olgun a11y bileşeni:

- ✅ `createPortal(document.body)` + `role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}`
- ✅ **Focus trap**: `Tab`/`Shift+Tab` ilk↔son odaklanabilir arasında döngü (`getFocusableElements`, `aria-hidden` filtreli)
- ✅ **Escape** ile kapanış (`preventDefault` ile `BackButton` benzeri dinleyicilere sızıntı engellenmiş)
- ✅ Açılışta odak Close butonuna, kapanışta **tetikleyen öğeye geri** (`triggerRef`)
- ✅ `body` scroll kilidi (önceki değeri saklayıp geri yüklüyor)
- ✅ Backdrop gerçek `<button aria-label="Close panel">` — div+onClick değil
- ✅ Reduced-motion'da anında aç/kapa; normal akışta 300ms translateX

Kalan pürüzler:

1. **`aria-labelledby` + `aria-label` birlikte** (`EntityDrawer.tsx:194-195`): `aria-labelledby` kazanır, `aria-label` ölü kod — biri silinmeli (labelledby yeterli; `ariaLabel` değişkeni sezon yılını da içerdiği için aslında daha bilgilendirici olan bu, tercih netleştirilmeli).
2. **Backdrop trap dışında**: Trap yalnız `panelRef` içini dolaşıyor; backdrop butonu klavyeyle ulaşılamaz (fare/dokunma + Escape ile işlev karşılandığı için pratik sorun değil, ama buton odaklanabilir olduğu halde döngü dışı olması tutarsız — `tabIndex={-1}` verilebilir).
3. **Arka plan inert değil**: `aria-modal="true"` modern AT'lerde yeterli, ancak `inert` attribute'u ile desteklemek daha sağlam olur.
4. **`maxHeight: calc(100dvh - 180px)`** sihirli sayısı başlık yüksekliğine dair kırılgan varsayım — `flex` kolon + `flex-1 overflow-y-auto` ile yapısal çözüm daha dayanıklı.
5. Kapanışta `window.setTimeout(finish, 300)` `transitionend` yerine sabit süre — animasyon kesintiye uğrarsa (sekme arka planı) odak iadesi yine çalışır, kabul edilebilir.

Diğer overlay'ler: ayrı bir lightbox/menü overlay'i yok; `GlossaryCard`/`StoryCard` in-place expand'leri `aria-expanded`/`aria-controls` ile doğru işaretlenmiş.

## Öncelikli UX İyileştirmeleri

| # | Öncelik | İyileştirme | Kapsam |
|---|---|---|---|
| 1 | **P0** | `rgba(255,24,1,0.7)` mikro-etiketleri AA'ya çek (tam accent veya min 4.5:1) — StoryCard, RaceHeroPanels, EntityDrawer, GlossaryCard, SeasonExplorer | A11y |
| 2 | **P0** | Mobil nav kararını netleştir: ya spec'teki Bottom Nav + hamburger'ı implement et, ya DESIGN_SYSTEM'in Navbar/Mobile bölümlerini gerçek tasarıma göre yeniden yaz. Mevcut çift kayıt en kötü durum | Spec/Mobil |
| 3 | **P1** | <380px'te nav `height:auto` olunca `.site-main` offset'inin içeriği örtmediğini doğrula; nav linklerinin dokunma hedefini ≥24px'e çıkar | Mobil |
| 4 | **P1** | `StoryCard` expand ve `GlossaryCard` rotate animasyonlarına reduced-motion desteği ekle; `GlossaryCard`'ı ortak `usePrefersReducedMotion` hook'una geçir; `EntityDrawer`'daki kopya hook'u sil | Motion |
| 5 | **P1** | `PageTransition`'a exit fazı ekle (band girer → içerik değişir → band çıkar) ve ilk yüklemede sweep'i atla | Motion |
| 6 | **P2** | Layout'a skip-to-content linki ekle | A11y |
| 7 | **P2** | `SeasonExplorer` tablosundaki `<tr role="button">` desenini satır içi gerçek butonla değiştir | A11y |
| 8 | **P2** | Navbar scrolled durumu, aktif link göstergesi, hero katman değerleri ve hero clamp ölçeği için kod↔spec'i tek yöne hizala (kod kararları bilinçliyse DESIGN_SYSTEM'i güncelle) | Spec |
| 9 | **P3** | Ölü `--mobile-nav-height` token'ını kaldır veya kullan; tracking değerlerini 3-4 token'a indir; `NewsFeaturedHero`'ya `min-h-[100svh]` ver; drawer `maxHeight` sihirli sayısını flex yapıyla değiştir | Temizlik |
