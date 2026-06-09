# AGENT LOG — Season-based driver/team assets

Tarih: 2026-06-09

## Bağlam

`public/drivers/` ve `public/teams/` kökündeki düz SVG düzeni, sezon alt klasörlerine taşındı (`2000`–`2026`). Üretim pipeline'ı `assets/scripts/generate-historical-assets.mjs` ile mevcuttu; runtime path'ler hâlâ eski `/drivers/{slug}.svg` formatını kullanıyordu.

## Bulunan yapı

- **Drivers:** `public/drivers/2000` … `2026` — sezon başına Ergast `driverId` tabanlı dosya adları; çift takım girişlerinde `{id}-{team-slug}.svg`.
- **Teams:** `public/teams/2000` … `2026` — `constructor-palette.json` slug'ları (ör. `force-india`, `toro-rosso`, `kick-sauber`).
- **Circuits:** `public/circuits/` — düz yapı, değişmedi (`{ülke}-{yıl}.svg`).
- **assets/:** `data/constructor-palette.json`, `data/season-rosters.json`, üretim script'leri (`generate-historical-assets.mjs` ana pipeline; `generate-drivers.mjs` / `generate-teams.mjs` legacy düz çıktı).

## Yapılanlar

### Runtime resolver (`lib/assets/f1-icons.ts`)
- `driverIconSrc(code, driverIdOrName?, season?)` → `/drivers/{season}/{slug}.svg`
- `teamIconSrc(teamName, season?)` → `/teams/{season}/{slug}.svg`
- `season` yoksa `CURRENT_SEASON` fallback.
- Tarihsel pilotlar: Ergast `given_family` slug + `ERGAST_SLUG_ALIASES` (ör. `lewis_hamilton` → `hamilton`).
- Güncel sezon: `DRIVER_CODE_TO_SLUG` öncelikli (`ver` → `verstappen`).
- Tarihsel takımlar: `CONSTRUCTOR_NAME_TO_SLUG` + `getTeamByName` (2026 grid).

### Call site güncellemeleri
- `components/season/SeasonExplorer.tsx` — `data.year` / `year`
- `app/season/page.tsx` — `initialYear`
- `components/home/BentoLeaderTile.tsx`, `BentoStandingsTile.tsx`, `BentoConstructorsTile.tsx` — `season` prop
- `components/home/CompactBentoDashboard.tsx` — `season` iletilecek şekilde

### Dokümantasyon
- `docs/ASSETS.md` — public layout, assets pipeline, yeni sezon/entity ekleme, resolver kullanımı

## Değişen dosyalar
- `lib/assets/f1-icons.ts`
- `components/season/SeasonExplorer.tsx`
- `app/season/page.tsx`
- `components/home/BentoLeaderTile.tsx`
- `components/home/BentoStandingsTile.tsx`
- `components/home/BentoConstructorsTile.tsx`
- `components/home/CompactBentoDashboard.tsx`
- `docs/ASSETS.md` (YENİ)
- `logs/AGENT_ASSETS_SEASON_LAYOUT_2026-06-09.md` (YENİ)

## Bilinen sınırlamalar (rapor)

- Aynı sezonda iki takımda olan pilotlar (`lawson-red-bull.svg` / `lawson-racing-bulls.svg`): resolver tek slug döndürür; takım bilgisi olmadan yanlış dosya → `SafeImage` placeholder.
- Bazı Ergast isim → slug eşleşmeleri `ERGAST_SLUG_ALIASES` ile manuel; eksik alias → ikon gizli/placeholder.
- `config/team-colors.ts` yalnızca 2026 grid; tarihsel takım **renkleri** fuzzy eşleşmeyebilir (ikon path'leri ayrı map'te).

## Doğrulama
- `npm run build`
- `npm run lint`
- Eski düz path grep: `/teams/{slug}` ve `/drivers/{slug}` (sezon segmenti olmadan) kalmamalı
