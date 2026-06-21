# Apex Frontend — Uygulama Planı

> Kaynak plan dosyasının proje kopyası (onaylı). Tarih: 2026-06-21.
> Tek tasarım otoritesi: `design/design.md`. Bu plan onunla çelişmez, uygulama sırasını verir.

## Context (neden bu plan)

Apex (F1 anlatı/istatistik platformu, Next.js 16 App Router) frontend'i **tamamen sıfırlandı**:
`components/` silindi, tüm `app/**/page.tsx` sayfaları veri çağrılarını + metadata'yı koruyan
iskelet placeholder'lara indirildi (`<main>Drivers</main>` gibi), `app/globals.css` yalnız token +
reset içeriyor. Backend, veri katmanı (`lib/data/*`), mimari, `data/` metinleri, `public/` assetleri
ve `config/team-colors.ts` **korundu**.

Bu plan, onaylı tek tasarım otoritesi **`design/design.md`** ("Karanlık Sinematik Editöryel")
doğrultusunda frontend'i sıfırdan inşa etmek için bağımlılık-sıralı bir yol haritasıdır. Tasarım
yapısal fikri Stitch design pack'inden (`design/stitch-design-pack/`) alınır ama Stitch'in renk/font/
glass sapmaları `design.md`'ye göre düzeltilir. Hedef: 13 route'u placeholder'dan tam UI'a taşımak.

---

## Doğrulanmış durum (kod okumasıyla teyit edildi)

| Konu | Repo gerçeği (teyit) | Karar |
|---|---|---|
| `team-colors.ts` konumu | Canlı `config/team-colors.ts` (arşivde DEĞİL) | design.md notu düzeltildi |
| `carSrc()` çözümleme | `constructorId`'yi as-is `/cars/{id}.svg` (underscore: `red_bull.svg`) — `carAsset` alanını kullanmıyor | underscore korunur; f1-icons.ts'e dokunulmaz |
| Tyre SVG | `public/tyres/` dolu (11 compound) | design.md notu düzeltildi; aksiyon yok |
| Font (CSP) | CSP `font-src 'self' data:`; `next/font/google` build-time self-host → CSP-uyumlu | `next/font/google` kullanılır |
| Mono font | layout.tsx **IBM Plex Mono** yüklü | **JetBrains Mono**'ya çevrilir |
| Display font | layout.tsx ayrıca **Bebas Neue** (design.md'de yok) | kaldırılır; 3-font sistemine inilir |
| Barlow ağırlık | `400,500,600` yüklü (700 yok) | `700` eklenir (`display-hero`) |
| globals.css token | `--surface #131313`, tüm radius `0` | design.md değerlerine (`#141414`, 16/8/full) hizalanır |
| Global accent | config `DEFAULT_SEASON_PALETTE.secondary = #ff1801`; globals.css `--accent #ff1801` | **#ff1801** (tek kaynak team-colors.ts) |

---

## Uygulama Durumu (2026-06-21 — TAMAMLANDI ✅)

- [x] **Adım 0** — Belge güncellemeleri (design.md, plan→docs, CLAUDE.md)
- [x] **Adım 1** — Token altyapısı (`app/globals.css`)
- [x] **Adım 2** — Font sistemi (`app/layout.tsx`) + chrome bağlandı
- [x] **Adım 3** — Takım rengi tema altyapısı (`lib/theme.ts`)
- [x] **Adım 4** — Paylaşılan komponentler (`components/**`)
- [x] **Adım 5** — 13 sayfa (Home + 6 liste + 4 detay + anthology hub/story)
- [x] **Final** — `tsc` ✓ · `build` ✓ (13 route) · `npm test` 52/52 ✓ · dev smoke (200 + gerçek UI)

Log: `logs/AGENT_APEX_FRONTEND_2026-06-21.md`.

---

## Bağımlılık sırası (uygulama sırası)

Sıra zorunlu: belge → altyapı/token → font → tema değişkenleri → paylaşılan komponentler → sayfalar.
Her adım sonunda anayasa §4: `npm run build` + `npx tsc --noEmit` sıfır hata; backend/data dokunulmaz.

**Adım 0 — Belge güncellemeleri** (TAMAMLANDI):
- 0a. `design/design.md`: accent `#ff1801`, bayat notlar silindi, car slug logo/pilot'a daraltıldı,
  font wording `next/font/google` + JetBrains Mono, mobil bottom-nav eklendi.
- 0b. Bu plan `docs/`'a kaydedildi.
- 0c. `.claude/CLAUDE.md` "1. Başlamadan Önce"e tasarım otoritesi maddeleri eklendi.

**Adım 1 — Tasarım token altyapısı (`app/globals.css`)**
- Nötr taban (design.md §1.2 birebir): `--bg #0a0a0a`, `--surface #141414`, `--surface-raised #1c1c1c`,
  `--hairline #262626`, `--text-hi #ffffff`, `--text #e6e6e6`, `--text-mid #9a9a9a`, `--text-low #666666`.
- Global accent **`#ff1801`** (mevcut korunur).
- Radius: `--radius-lg 16px` (kart), `--radius 8px` (buton/çip), pill `full`. **Mevcut global
  `border-radius:0` reset'i kaldırılır** (aksi halde tüm radius ezilir).
- `@theme inline` Tailwind 4 köprüsü güncellenir; tip ölçeği yardımcı sınıfları (`display-hero`,
  `headline-lg`, `data-tabular`, `label-caps` — design.md §2.1) tanımlanır.

**Adım 2 — Font sistemi (`app/layout.tsx`)**
- 3-font (`next/font/google`): **Barlow Condensed** (`400,500,600,700`), **Inter** (`400,500`),
  **JetBrains Mono** (`400,500,700`). **Bebas Neue + IBM Plex Mono kaldırılır.**
- CSS değişkenleri: `--font-condensed`, `--font-body`, `--font-mono` (display = condensed; ayrı YOK).

**Adım 3 — Takım rengi CSS değişken altyapısı**
- `config/team-colors.ts` hazır; yalnız tüketilir. Profil/round sayfaları server-side
  `getSeasonPalette(teamId, season)` → `teamPaletteCssVars()` ile kök `<div style>`'a basar.
  Global sayfalar `#ff1801` kullanır.

**Adım 4 — Paylaşılan komponentler** (envanter aşağıda; sayfalardan ÖNCE).

**Adım 5 — Sayfalar** (önce paylaşılan chrome + Home, sonra liste, sonra detay).

---

## Paylaşılan komponent envanteri (`components/` yeniden oluşturulacak)

S = Server, C = Client adacığı (design.md §7: RSC-öncelikli).

### Chrome / layout
- **SiteHeader** (S kabuk + C menü) — masaüstü sticky, gerçek `backdrop-filter: blur(20px)` (§4).
  Logo "APEX", nav (Season/Drivers/Teams/Circuits/News/Anthology), search trigger.
- **MobileNav** (C) — **mobil sabit alt tab-bar (bottom-nav)**: Home/Season/Drivers/Anthology +
  aktif sekme accent. Hamburger-drawer kullanılmaz (KARAR).
- **SiteFooter** (S) — telif **2026** (Stitch "© 2024" düzeltilir), linkler.
- **PageShell / BentoGrid** (S) — 12/8/4 kolon responsive, 24/20/16px gutter, `container-max 1440px`,
  kenar 64/20px (§3.2).

### Bento veri tuğlaları
- **BentoCard** (S) — `--surface` + 1px `--hairline` + 16px radius + ambient gölge + pseudo-glass
  (gerçek blur YOK). Hover: `--surface-raised` + accent bar + `translateY(-2px)` (CSS).
- **HeroNumber / StatBlock** (S) — dev condensed sayı + düşük-kontrast etiket (§2.2).
- **StatTrio** (S) — WINS/PODIUMS/POLES.
- **StatusChip** (S) — ikon + metin (DONE/NEXT/UPCOMING, P1/DNF); renk tek başına değil (§6).
  İkonlar `public/icons/*.svg`. NEXT'te ince kırmızı bar.
- **DataChip / TyreChip** (S) — mono pill, gri stroke; tyre `public/tyres/*.svg`.
- **LiveIndicator** (C) — kırmızı 8px pulse nokta + mono "LIVE"; reduced-motion'da statik.

### Standings / listeler
- **StandingsCard** (S) + **StandingsToggle** (C) — Drivers/Teams toggle; iki veri seti SSR'dan
  hazır, client yalnız görünürlük (§7). Aktif sekme alt çizgi (global=#ff1801, takım=takım rengi).
- **DriverRow / TeamRow** (S) — pozisyon · pilot SVG (`driverIconSrc`) · condensed isim · mono takım ·
  ince takım-rengi bar (`resolveTeamUiColor`) · sağa hizalı mono puan (`tabular-nums`).
- **DriverCard / TeamCard** (S) — grid sayfaları için kart varyantı.

### Profil-özel
- **ProfileHero** (S) — dev numara + condensed isim + mono künye + pilot/araç SVG (takım glow) +
  sol ince takım-rengi accent bar. `clamp()` tek-satır başlık (§7).
- **HeadToHead** (S) — **imza öğe** (§3.4). Merkez-bölücü, sola/sağa büyüyen barlar; bir taraf nötr
  gri, diğer takım `secondary` + pilot kısaltması. Mono sayılar.
- **DriverLineup** (S) — iki pilot SVG eşit ağırlık.
- **TechnicalDossier** (S) — mono key-value liste.
- **SeasonForm** (S) — son 5 sonuç, StatusChip dizisi.
- **CareerProgressionChart** (S, SVG inline) — minimal eksen, tek vurgu rengi (§6).

### Circuit / season
- **CircuitCard** (S) — track SVG/PNG (`circuitIconSrc` + cards), `circuitGridSpan`/
  `isFeaturedCircuitCard` ile bento boyutu. NEXT race vurgulu.
- **CalendarList** (S) — round listesi, StatusChip.
- **PodiumViz** (S) — son yarış P1/P2/P3 bar görselleştirmesi.
- **YearScrubber** (C) — season yıl ok'ları.

### News / anthology
- **NewsList / WireItem** (S) — "THE WIRE", mono timestamp (`dateLabel`), `hasRealImage` ile hero foto.
- **StoryCard** (S) — anthology hub kart.
- **AnthologyHero** (S) — full-bleed foto + alt gradyan + mono kicker + dev başlık + standfirst + byline.
- **AnthologyScroller / StoryBody** (S kabuk + C scroll) — editöryel akış (sadece `/anthology/[slug]`):
  drop-cap, section header, full-bleed görsel+caption, pull-quote (ince kırmızı dikey kural),
  portre+metin, data interlude. Scroll-reveal/parallax = C, reduced-motion'da kapalı.
- **RadioMomentCard** (S) — `getPublishedRadioMoments` satırları.

### Shared util (yeni kod değil — mevcut tüketilir)
- Renk: `config/team-colors.ts` (`getSeasonPalette`, `resolveTeamUiColor`, `teamPaletteCssVars`).
- Asset: `lib/assets/f1-icons.ts` (`driverIconSrc`, `teamIconSrc`, `circuitIconSrc`, `carSrc`).
- Tarih/sezon: `lib/f1Calendar.ts` (`getF1Context`, `CURRENT_SEASON`, `getLiveOrNextRace` vb.).

---

## Sayfa sayfa görev listesi

Her sayfa: iskelet = **Bento** (anthology detay hariç). Veri okuyucular + çağrılar iskelette mevcut.

### 1. Home — `app/page.tsx` (Bento)
- **Referans:** `home-desktop/`, `home-mobile/`.
- **Veri:** `fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'|'standings_drivers'|'standings_constructors')`, `aggregate({maxItems:6})`, `getOnThisDay()`, `getLiveOrNextRace`, `getLastFinishedRace`, `fetchRoundSnapshot`.
- **Komponentler:** SiteHeader, BentoGrid, HeroNextRace (HeroNumber + circuit outline + countdown=C), StandingsCard+Toggle (tek kart, ayrı constructors bar YOK — §3.3), StoryCard (wide), StatBlock, PodiumViz, NewsList (THE WIRE), SiteFooter.
- **Stitch düzeltmesi:** editöryel kicker nötr gri; salmon/material accent → nötr + #ff1801 disiplini.

### 2. Drivers grid — `app/drivers/page.tsx` (Bento)
- **Veri:** `getDriversByTeam()` → `{season, groups, flat}`.
- **Komponentler:** SiteHeader, BentoGrid, gruplu DriverCard/DriverRow (carNumber lore), SiteFooter. Pilot SVG `driverIconSrc`.

### 3. Driver profile — `app/drivers/[driverId]/page.tsx` (Bento, takım-temalı)
- **Veri:** `getDriverProfile(id, season)`, `getDriverSeasons(id)`, `getDriverCareer(id)`. `?season=`.
- **Tema:** `getSeasonPalette(constructorId, season)` → `teamPaletteCssVars()` köke; accent = takım `secondary`.
- **Komponentler:** ProfileHero, StatTrio, Season Standing StatBlock, CareerProgressionChart, SeasonForm, TechnicalDossier, "2026 CAR" (`carSrc` + `teamIconSrc`).
- **Stitch düzeltmesi:** foto avatar → pilot SVG; satır kırılması → `clamp()`; geniş serif → Barlow Condensed.

### 4. Teams grid — `app/teams/page.tsx` (Bento)
- **Veri:** `getCurrentTeams()` → `{season, rows, data}`.
- **Komponentler:** SiteHeader, BentoGrid, TeamCard/TeamRow (bar `resolveTeamUiColor`), SiteFooter.

### 5. Team profile — `app/teams/[constructorId]/page.tsx` (Bento, takım-temalı)
- **Veri:** `getTeamProfile(id, season)`, `getTeamSeasons(id)`, `getTeamCareer(id)`. `?season=`.
- **Tema:** `getSeasonPalette(constructorId, season)` köke.
- **Komponentler:** ProfileHero (logo+isim+araç SVG `carSrc`), Constructor Standing StatBlock+bar, Season Stats StatTrio, DriverLineup, **HeadToHead** (imza), TechnicalDossier, SeasonForm.

### 6. Season hub — `app/season/page.tsx` (Bento)
- **Veri:** `getSeasonData(CURRENT_SEASON)`.
- **Komponentler:** üst strip (dev "2026" + YearScrubber + ROUNDS/COMPLETED/CURRENT LEADER), CalendarList (StatusChip, NEXT ince kırmızı bar), StandingsCard+Toggle, Season Highlight StatBlock, Last Race PodiumViz.

### 7. Round detail — `app/season/[year]/round/[n]/page.tsx` (Bento)
- **Veri:** `fetchSeasonSnapshotTyped(year,'calendar')`, `fetchRoundSnapshot(year, round, 'results'|'qualifying'|'sprint')`. Validasyon: `year===CURRENT_SEASON`, `1≤n≤30`.
- **Komponentler:** yarış başlığı + sonuç/qualifying/sprint tabloları (DriverRow varyantı, tabular-nums), TyreChip, StatusChip. Kazanan takım rengi accent.

### 8. Circuits list — `app/circuits/page.tsx` (Bento)
- **Veri:** `getCurrentSeasonCircuitCards()`. `revalidate 900`.
- **Komponentler:** BentoGrid + CircuitCard; `nextCircuitIndex`/`circuitGridSpan`/`isFeaturedCircuitCard` ile featured hücre. `.png` (modern) / `.svg` (şematik).

### 9. Circuit detail — `app/circuits/[id]/page.tsx` (Bento)
- **Veri:** `getCircuitDetail(id)` (`generateStaticParams`). weather, winner history.
- **Komponentler:** circuit hero (track SVG + dim outline), editorial (lap/DRS), winner listesi, opsiyonel weather kartı.

### 10. News — `app/news/page.tsx` (Bento)
- **Veri:** `aggregate({maxItems:100})`. `revalidate 0`.
- **Komponentler:** featured hero (`getFeaturedNews`/`hasRealImage`), NewsList/WireItem, kaynak rozetleri.

### 11. Tech glossary — `app/tech-glossary/page.tsx` (Bento)
- **Veri:** statik import `glossaryTerms`, `TYRE_COMPOUNDS`.
- **Komponentler:** kategori bölümleri, terim kartları, TyreChip.

### 12. Anthology hub — `app/anthology/page.tsx` (Bento)
- **Veri:** `getPublishedStories()`, `getPublishedRadioMoments(40)`. `revalidate 900`.
- **Komponentler:** StoryCard ızgarası + RadioMomentCard.

### 13. Anthology story — `app/anthology/[slug]/page.tsx` (**Editöryel Akış — TEK bento-dışı sayfa**)
- **Veri:** `getStoryBySlug(slug)` (`generateStaticParams` ← `getStorySlugs`). `story.blocks[]`.
- **Komponentler:** AnthologyHero, StoryBody/AnthologyScroller (drop-cap, section header, full-bleed
  görsel+caption, pull-quote ince kırmızı dikey kural, portre+metin, data interlude), "NEXT IN THE ANTHOLOGY".
- **Görsel:** `public/stories/{slug}/{full|landscape|portrait}/` (`next/image`).
- **Stitch düzeltmesi:** kicker kırmızı→nötr (kırmızı yalnız pull-quote dikey kural + ops. 1 kicker).

---

## Stitch'in bilinen sapmaları (global düzeltmeler)

HTML kopyalanmaz; yalnız yapısal fikir alınır:
- Renk: kırmızı-tonlu Material / salmon → nötr taban (§1.2) + dinamik takım teması.
- Font: geniş serif başlık → **Barlow Condensed** (§2).
- Glass: sınırsız blur → yalnız header/modal/hero, ≤2/viewport (§4).
- Kicker/başlık kırmızı → nötr gri (§1.4).
- Foto avatar → pilot SVG (`public/drivers/2026/`).
- Hero satır kırılması → `clamp()` tek satır.
- Footer "© 2024" → 2026.
- Head-to-head taraf ayrımı → bir taraf nötr, diğer takım rengi + isim (§3.4).

---

## Açık karar (uygulama sırasında)

- **framer-motion kapsamı:** öneri — yalnız anthology scroll-reveal + LiveIndicator pulse;
  bento hover/tema geçişi saf CSS. design.md §5 uyumlu, bundle hafif.

---

## Verification (uygulama sonrası)

Her adım sonunda (anayasa §4): `npm run build` sıfır hata · `npx tsc --noEmit` sıfır hata ·
backend/data değişmez → `npm test` yeşil kalmalı · `logs/AGENT_{KONU}_{TARIH}.md`.

Görsel/işlevsel:
- `npm run dev` → 13 route tam UI render etmeli.
- Home: countdown + StandingsToggle + THE WIRE çalışır.
- Driver/Team: `?season=` tema değiştirir; pilot/araç SVG 404 yok.
- Anthology story: editöryel akış (bento DEĞİL), drop-cap + pull-quote + data interlude.
- A11y: `prefers-reduced-motion` animasyon kapatır; klavye focus beyaz; kontrast WCAG AA.
- Responsive: 375/768/1024/1440 — yatay scroll yok, hero tek satır (`clamp`).
- Asset 404: `/drivers/2026/*`, `/teams/2026/*`, `/cars/*`, `/circuits/*` (özellikle Audi/Cadillac/RB).
