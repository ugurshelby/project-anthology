# F1 static assets

Runtime SVGs live under `public/`. Source data and generation scripts live under `assets/`.

## Public layout

| Path | Structure | Notes |
|------|-----------|-------|
| `public/drivers/{season}/` | `2000`–`2026` | One SVG per driver entry per season. Basename is Ergast `driverId` (e.g. `max_verstappen.svg`) or a short slug for the current grid (e.g. `verstappen.svg` in 2026). Duplicate entries in a season use `{driverId}-{team-slug}.svg`. |
| `public/teams/{season}/` | `2000`–`2026` | One SVG per constructor per season. Basename matches `slug` in `assets/data/constructor-palette.json` (e.g. `force-india.svg`, `red-bull.svg`). |
| `public/circuits/` | Flat | `{country}-{first-year}.svg` (e.g. `gb-1948.svg`). Not season-partitioned. |
| `public/tyres/` | Flat | Pirelli compound icons (generated once). |

Season folders replace the old flat `public/drivers/*.svg` and `public/teams/*.svg` layout.

## Source folder (`assets/`)

```
assets/
  data/
    constructor-palette.json   # Team colours, slugs, era overrides (2000–2026)
    season-rosters.json        # Cached Ergast rosters per season (generated)
  scripts/
    generate-historical-assets.mjs  # Main pipeline: rosters → season SVGs
    generate-drivers.mjs            # Legacy: 2026-only flat output (superseded)
    generate-teams.mjs              # Legacy: 2026-only flat output (superseded)
    generate-tyres.mjs              # Tyre compound SVGs → public/tyres/
    geojson-to-svg.mjs              # Circuit outline tooling
    lib/svg-builders.mjs            # Shared SVG templates for drivers/teams
```

### Regenerating driver & team SVGs

```bash
node assets/scripts/generate-historical-assets.mjs          # use cached season-rosters.json
node assets/scripts/generate-historical-assets.mjs --fetch  # refresh rosters from Jolpica, then generate
```

This writes `public/drivers/{season}/` and `public/teams/{season}/` for 2000–2026, and removes any legacy flat SVGs at the roots of those folders.

### Adding a new season

1. Ensure `constructor-palette.json` has entries (and `eras` if liveries change) for any new/rebranded teams.
2. For the upcoming grid before Ergast data exists, add a manual block in `generate-historical-assets.mjs` (see `MANUAL_2026`).
3. Run `node assets/scripts/generate-historical-assets.mjs --fetch` (or without `--fetch` if rosters are already in `season-rosters.json`).
4. Extend `lib/assets/f1-icons.ts` if new driver codes or constructor aliases are needed.

### Adding a single driver or team

- **Team:** add/update palette in `constructor-palette.json`, re-run the historical generator for affected seasons.
- **Driver:** roster data drives filenames; re-run the generator. For runtime resolution, add FIA codes to `DRIVER_CODE_TO_SLUG` or Ergast aliases in `f1-icons.ts`.

## Runtime resolution

All UI code should use `lib/assets/f1-icons.ts` — do not hardcode `/drivers/` or `/teams/` paths.

```ts
import { driverIconSrc, teamIconSrc, circuitIconSrc } from '@/lib/assets/f1-icons';

driverIconSrc(driverCode, driverNameOrId, season?);  // → /drivers/{season}/{slug}.svg | null
teamIconSrc(constructorName, season?);             // → /teams/{season}/{slug}.svg | null
circuitIconSrc(circuitId);                         // → /circuits/{file}.svg | null
```

- `season` defaults to `CURRENT_SEASON` from `lib/f1Calendar.ts`.
- Pass the viewed season when rendering historical data (`SeasonExplorer`, season hero, etc.).
- Returns `null` when no slug can be derived; components hide the icon or `SafeImage` falls back to a placeholder on 404.

Team colours for UI bars/chips remain in `config/team-colors.ts` (current-season reference). Historical constructor names are mapped to asset slugs inside `f1-icons.ts`.
