# AGENT — Apex Frontend Build (2026-06-21)

Plan: `docs/apex-frontend-plan-2026-06-21.md` · Tasarım otoritesi: `design/design.md`.

## Ne yapıldı

Frontend sıfırdan inşa edildi (placeholder iskeletlerden tam UI'a). Backend/veri katmanı/mimari
değiştirilmedi — yalnızca mevcut `lib/data/*`, `config/team-colors.ts`, `lib/assets/f1-icons.ts`,
`lib/f1Calendar.ts` tüketildi.

### Adım 1 — Token altyapısı (`app/globals.css`)
- design.md §1.2 nötr taban tokenleri (`--bg #0a0a0a`, `--surface #141414`, `--surface-raised`,
  `--hairline`, `--text-hi/text/text-mid/text-low`). Global accent `--accent #ff1801`.
- Radius `16/8/full`; `border-radius:0` global reset KALDIRILDI.
- Tip ölçeği yardımcı sınıfları: `.display-hero`, `.headline-lg/md`, `.body-lg/md`, `.data-tabular`,
  `.label-caps`, `.hero-number`. `prefers-reduced-motion` global blok. Focus beyaz.

### Adım 2 — Font (`app/layout.tsx`)
- `next/font/google`: Barlow Condensed (400-700), Inter (400,500), JetBrains Mono (400,500,700).
- Bebas Neue + IBM Plex Mono KALDIRILDI. Chrome (header/footer/mobilnav) layout'a bağlandı + skip-link.

### Adım 3 — Tema (`lib/theme.ts`)
- `teamThemeVars(teamIdOrName, season)` — `getSeasonPalette` → `teamPaletteCssVars` + `--bg`/`--accent`
  override. Profil/round sayfaları kök `<main style>`'a basıyor.

### Adım 4 — Paylaşılan komponentler (`components/`)
- layout: `BentoGrid`/`PageShell`, `SiteHeader`+`HeaderNav`(C), `MobileNav`(C, bottom-nav), `SiteFooter`, `nav-items`.
- bento: `BentoCard`, `StatBlock`, `StatTrio`, `StatusChip`/`ResultChip`, `LiveIndicator`(C).
- standings: `StandingsCard`+`StandingsToggle`(C), `DriverRow`/`TeamRow`, `DriverCard`/`TeamCard`.
- profile: `ProfileHero`, `HeadToHead` (imza), `DriverLineup`, `TechnicalDossier`, `SeasonForm`, `CareerProgressionChart` (server SVG).
- season: `CalendarList`, `PodiumViz`, `YearScrubber`(C), `ResultsTable` (race/quali).
- circuit: `CircuitCardView`. news: `NewsList`/`WireItem`/`NewsHero`. home: `Countdown`(C).
- anthology: `AnthologyHero`, `StoryBody`, `Reveal`(C), `StoryCard`, `RadioMomentCard`.

### Adım 5 — 13 sayfa
Home, Drivers grid, Driver profili (temalı), Teams grid, Team profili (temalı+H2H), Season hub,
Round detay (temalı), Circuits list, Circuit detay, News, Tech glossary, Anthology hub,
Anthology story (editöryel akış — tek bento-dışı). Veri çağrıları + metadata korundu.

## Ne çalıştırıldı
- `npx tsc --noEmit` → **sıfır hata**.
- `npm run build` → **başarılı**, 13 route (anthology/circuits SSG prerender, dinamikler SSR).
- `npm test` (vitest) → **52/52 yeşil** (backend/data dokunulmadığı doğrulandı).
- Dev smoke (localhost:3001): tüm ana route'lar HTTP 200; gerçek UI render ediyor (placeholder yok),
  anthology story editöryel akış + drop-cap çalışıyor.

## Kararlar (kullanıcı onaylı)
- Accent `#ff1801` (config tek kaynak); car slug underscore korundu; `next/font/google`;
  mobil bottom-nav (Stitch deseni); framer yerine CSS/IntersectionObserver (hafif bundle).

## Kalan / not
- `config/team-colors.ts` `carAsset` alanı hâlâ `.png` ama `carSrc()` kullanmıyor — ölü alan, bloklayıcı değil.
- Profil sayfalarında PageShell yerine inline `<main style>` kullanıldı (tema CSS değişkenleri kök elemanda olmalı).
