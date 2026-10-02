# public/stories assets ledger

Last verified: 2026-10-02

Read-only inventory. Nothing was deleted, moved or edited, and no page was changed. It was generated from `git ls-files public/stories`, `data/stories/content.ts`, `app/ components/ lib/ scripts/`, and the four docs `docs/anthology-ingestion-report.md`, `docs/anthology-image-map.md`, `docs/anthology-image-remap-audit.md`, `docs/anthology-missing-assets-download-list.md` plus `docs/reference/anthology-gorsel-temin.md`. Types come only from docs and file names, never from looking at the pixels. Deciding what to keep is an owner question (end of file).

## Summary

- Files tracked under `public/stories`: **124** (120 png, 4 svg) in **17** story folders.
- **License recorded: no, for all 124 files.** No file has an author, source URL, license type or acquisition record anywhere in the repo. `AGENTS.md` requires all of these before an asset ships.
- Source information that does exist: 23 files appear in the 2026-09-17 ingestion report with a raw file name only (for example `missing-images/senna-monacogp.webp`) and no author or origin. The raw folder was deleted after ingestion.
- By category: ingested raw web images = 23; undocumented png = 97; svg = 4.
- Referenced by `data/stories/content.ts` or code: 56 files. **Referenced by nothing: 68 files.**
- Byte-identical duplicate groups: 26 (see the type column).
- `stories-images/` (59 tracked files) is the local export noted in its README (57 images and `manifest.json`); it is not served by the site and is not referenced by code. It has the same license gap.
- The live `stories` table in Supabase is seeded from `content.ts`; it was not read here, so the live references could differ.

### Stories and their hero image

| Story | Files in folder | Hero file | Hero category | Body references (EN and TR blocks counted separately) |
|---|---|---|---|---|
| brawn-2009 | 6 | `landscape/01.png` | undocumented | 4 |
| button-canada | 6 | `landscape/01.png` | undocumented | 4 |
| collins-fangio-1956 | 9 | `landscape/01.png` | undocumented | 6 |
| dijon-1979 | 6 | `landscape/01.png` | ingested | 4 |
| fangio-nurburgring | 6 | `landscape/01.png` | ingested | 4 |
| hakkinen-schumacher | 8 | `landscape/01.png` | ingested | 4 |
| hamilton-silverstone | 3 | `landscape/01.png` | undocumented | 2 |
| hunt-lauda | 7 | `landscape/01.png` | undocumented | 4 |
| imola-1994 | 4 | `landscape/01.png` | ingested | 4 |
| jaguar-monaco-diamond | 9 | `landscape/01.png` | undocumented | 6 |
| jerez-1997 | 9 | `landscape/01.png` | undocumented | 6 |
| massa-2008 | 9 | `landscape/01.png` | undocumented | 6 |
| monaco-1982 | 9 | `landscape/01.png` | undocumented | 6 |
| schumacher-1994-spain | 9 | `landscape/01.png` | undocumented | 6 |
| schumacher-ferrari | 9 | `landscape/01.png` | undocumented | 6 |
| senna-donington-1993 | 9 | `landscape/01.png` | undocumented | 6 |
| senna-monaco | 6 | `landscape/01.png` | ingested | 2 |

If every unlicensed file were removed, **all 17 stories with a hero would lose it** (hero categories: {'undocumented': 12, 'ingested': 5}). Removing only the undocumented png and svg files would leave the ingested images, and would take away the hero of: brawn-2009, button-canada, collins-fangio-1956, hamilton-silverstone, hunt-lauda, jaguar-monaco-diamond, jerez-1997, massa-2008, monaco-1982, schumacher-1994-spain, schumacher-ferrari, senna-donington-1993.

### Files referenced by nothing

- `brawn-2009/full/01.png`
- `brawn-2009/full/02.png`
- `brawn-2009/portrait/02.png`
- `button-canada/full/01.png`
- `button-canada/full/02.png`
- `button-canada/portrait/02.png`
- `collins-fangio-1956/full/02.png`
- `collins-fangio-1956/full/03.png`
- `collins-fangio-1956/landscape/03.png`
- `collins-fangio-1956/portrait/02.png`
- `collins-fangio-1956/portrait/03.png`
- `dijon-1979/full/01.png`
- `dijon-1979/full/02.png`
- `dijon-1979/portrait/02.png`
- `fangio-nurburgring/full/01.png`
- `fangio-nurburgring/full/02.png`
- `fangio-nurburgring/portrait/02.png`
- `hakkinen-schumacher/full/01.png`
- `hakkinen-schumacher/full/01.svg`
- `hakkinen-schumacher/full/02.png`
- `hakkinen-schumacher/full/02.svg`
- `hakkinen-schumacher/portrait/02.png`
- `hamilton-silverstone/portrait/01.png`
- `hunt-lauda/full/01.png`
- `hunt-lauda/full/02.png`
- `hunt-lauda/full/02.svg`
- `hunt-lauda/portrait/02.png`
- `imola-1994/full/01.png`
- `imola-1994/full/01.svg`
- `jaguar-monaco-diamond/full/02.png`
- `jaguar-monaco-diamond/full/03.png`
- `jaguar-monaco-diamond/landscape/03.png`
- `jaguar-monaco-diamond/portrait/02.png`
- `jaguar-monaco-diamond/portrait/03.png`
- `jerez-1997/full/02.png`
- `jerez-1997/full/03.png`
- `jerez-1997/landscape/03.png`
- `jerez-1997/portrait/02.png`
- `jerez-1997/portrait/03.png`
- `massa-2008/full/02.png`
- `massa-2008/full/03.png`
- `massa-2008/landscape/03.png`
- `massa-2008/portrait/02.png`
- `massa-2008/portrait/03.png`
- `monaco-1982/full/02.png`
- `monaco-1982/full/03.png`
- `monaco-1982/landscape/03.png`
- `monaco-1982/portrait/02.png`
- `monaco-1982/portrait/03.png`
- `schumacher-1994-spain/full/02.png`
- `schumacher-1994-spain/full/03.png`
- `schumacher-1994-spain/landscape/03.png`
- `schumacher-1994-spain/portrait/02.png`
- `schumacher-1994-spain/portrait/03.png`
- `schumacher-ferrari/full/02.png`
- `schumacher-ferrari/full/03.png`
- `schumacher-ferrari/landscape/03.png`
- `schumacher-ferrari/portrait/02.png`
- `schumacher-ferrari/portrait/03.png`
- `senna-donington-1993/full/02.png`
- `senna-donington-1993/full/03.png`
- `senna-donington-1993/landscape/03.png`
- `senna-donington-1993/portrait/02.png`
- `senna-donington-1993/portrait/03.png`
- `senna-monaco/full/02.png`
- `senna-monaco/landscape/02.png`
- `senna-monaco/portrait/01.png`
- `senna-monaco/portrait/02.png`

## One row per file

| File (under `public/stories/`) | Referenced by | Source or credit found in the repo | License recorded | Type (from docs and names only) |
|---|---|---|---|---|
| `brawn-2009/full/01.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `hunt-lauda/landscape/01.png`. |
| `brawn-2009/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `brawn-2009/landscape/02.png`. |
| `brawn-2009/landscape/01.png` | brawn-2009 (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `brawn-2009/landscape/02.png` | brawn-2009 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `brawn-2009/full/02.png`. |
| `brawn-2009/portrait/01.png` | brawn-2009 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `brawn-2009/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `button-canada/full/01.png` | **none** | none | no | unclear (no doc entry) |
| `button-canada/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `fangio-nurburgring/landscape/02.png`. |
| `button-canada/landscape/01.png` | button-canada (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `button-canada/landscape/02.png` | button-canada (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `button-canada/portrait/01.png` | button-canada (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/jenson-button-2011.avif` (ok (Button Canada wet)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `button-canada/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `collins-fangio-1956/full/01.png` | collins-fangio-1956 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `collins-fangio-1956/landscape/01.png`. |
| `collins-fangio-1956/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `collins-fangio-1956/landscape/02.png`. |
| `collins-fangio-1956/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `collins-fangio-1956/landscape/03.png`. |
| `collins-fangio-1956/landscape/01.png` | collins-fangio-1956 (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `collins-fangio-1956/full/01.png`. |
| `collins-fangio-1956/landscape/02.png` | collins-fangio-1956 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `collins-fangio-1956/full/02.png`. |
| `collins-fangio-1956/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `collins-fangio-1956/full/03.png`. |
| `collins-fangio-1956/portrait/01.png` | collins-fangio-1956 (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/peter-colling-gives-fangio.webp` (ok (Collins to Fangio handover)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `collins-fangio-1956/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `collins-fangio-1956/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `dijon-1979/full/01.png` | **none** | none | no | unclear (no doc entry) |
| `dijon-1979/full/02.png` | **none** | none | no | unclear (no doc entry) |
| `dijon-1979/landscape/01.png` | dijon-1979 (hero); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/dijon-1979.jpg` (ok (Dijon duel cover)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `dijon-1979/landscape/02.png` | dijon-1979 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `dijon-1979/portrait/01.png` | dijon-1979 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `fangio-nurburgring/full/02.png`. |
| `dijon-1979/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `fangio-nurburgring/full/01.png` | **none** | none | no | unclear (no doc entry) |
| `fangio-nurburgring/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `dijon-1979/portrait/01.png`. |
| `fangio-nurburgring/landscape/01.png` | fangio-nurburgring (hero); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/fangio-1957.webp` (ok (Fangio 250F cover)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `fangio-nurburgring/landscape/02.png` | fangio-nurburgring (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `button-canada/full/02.png`. |
| `fangio-nurburgring/portrait/01.png` | fangio-nurburgring (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `fangio-nurburgring/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `hakkinen-schumacher/full/01.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `hakkinen-schumacher/full/02.png`. |
| `hakkinen-schumacher/full/01.svg` | **none** | none | no | svg, origin undocumented (extension only) Duplicate content of `hakkinen-schumacher/full/02.svg`. |
| `hakkinen-schumacher/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `hakkinen-schumacher/full/01.png`. |
| `hakkinen-schumacher/full/02.svg` | **none** | none | no | svg, origin undocumented (extension only) Duplicate content of `hakkinen-schumacher/full/01.svg`. |
| `hakkinen-schumacher/landscape/01.png` | hakkinen-schumacher (hero); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/zonta-overtake.jpg` (ok (Spa 2000 three-wide cover)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `hakkinen-schumacher/landscape/02.png` | hakkinen-schumacher (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/mika-haikkinen-mclaren.jfif` (ok (Hakkinen Eau Rouge)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `hakkinen-schumacher/portrait/01.png` | hakkinen-schumacher (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/schmaucher-f2000.webp` (ok (Schumacher F1-2000)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `hakkinen-schumacher/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `hamilton-silverstone/full/01.png` | hamilton-silverstone (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/hamilton-silverstone-victory.avif` (ok (Hamilton flag lap 2021)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `hamilton-silverstone/landscape/01.png` | hamilton-silverstone (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `hamilton-silverstone/portrait/01.png` | **none** | none | no | unclear (no doc entry) |
| `hunt-lauda/full/01.png` | **none** | none | no | unclear (no doc entry) |
| `hunt-lauda/full/02.png` | **none** | none | no | unclear (no doc entry) |
| `hunt-lauda/full/02.svg` | **none** | none | no | svg, origin undocumented (extension only) |
| `hunt-lauda/landscape/01.png` | hunt-lauda (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `brawn-2009/full/01.png`. |
| `hunt-lauda/landscape/02.png` | hunt-lauda (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/james-hunt-mclaren.webp` (ok (Hunt wet Zandvoort)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `hunt-lauda/portrait/01.png` | hunt-lauda (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/nikki-lauda-ferrari312t2.jpg` (ok (Lauda 312T2 portrait)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `hunt-lauda/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `imola-1994/full/01.png` | **none** | none | no | unclear (no doc entry) |
| `imola-1994/full/01.svg` | **none** | none | no | svg, origin undocumented (extension only) |
| `imola-1994/landscape/01.png` | imola-1994 (body), imola-1994 (hero); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/imola-tamburello.jpg` (ok (Tamburello cover)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `imola-1994/portrait/01.png` | imola-1994 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `jaguar-monaco-diamond/full/01.png` | jaguar-monaco-diamond (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `jaguar-monaco-diamond/landscape/01.png`. |
| `jaguar-monaco-diamond/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `jaguar-monaco-diamond/landscape/02.png`. |
| `jaguar-monaco-diamond/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `jaguar-monaco-diamond/landscape/03.png`. |
| `jaguar-monaco-diamond/landscape/01.png` | jaguar-monaco-diamond (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `jaguar-monaco-diamond/full/01.png`. |
| `jaguar-monaco-diamond/landscape/02.png` | jaguar-monaco-diamond (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `jaguar-monaco-diamond/full/02.png`. |
| `jaguar-monaco-diamond/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `jaguar-monaco-diamond/full/03.png`. |
| `jaguar-monaco-diamond/portrait/01.png` | jaguar-monaco-diamond (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/jaguar-diamond.jfif` (ok (Steinmetz/Jaguar nose)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `jaguar-monaco-diamond/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `jaguar-monaco-diamond/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `jerez-1997/full/01.png` | jerez-1997 (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/jerez-qualifying.jfif` (ok (Jerez timing screen)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `jerez-1997/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `jerez-1997/landscape/02.png`. |
| `jerez-1997/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `jerez-1997/landscape/03.png`. |
| `jerez-1997/landscape/01.png` | jerez-1997 (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `jerez-1997/landscape/02.png` | jerez-1997 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `jerez-1997/full/02.png`. |
| `jerez-1997/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `jerez-1997/full/03.png`. |
| `jerez-1997/portrait/01.png` | jerez-1997 (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/villeneuve-champion.webp` (ok (Villeneuve champion)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `jerez-1997/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `jerez-1997/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `massa-2008/full/01.png` | massa-2008 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `massa-2008/landscape/01.png`. |
| `massa-2008/full/02.png` | **none** | none | no | unclear (no doc entry) |
| `massa-2008/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `massa-2008/landscape/03.png`. |
| `massa-2008/landscape/01.png` | massa-2008 (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `massa-2008/full/01.png`. |
| `massa-2008/landscape/02.png` | massa-2008 (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/2008-braziliangp.jpg` (ok (Interlagos wet grid)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `massa-2008/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `massa-2008/full/03.png`. |
| `massa-2008/portrait/01.png` | massa-2008 (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/felipe-massa-2008-braziliangp.webp` (ok (F2008 spray)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `massa-2008/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `massa-2008/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `monaco-1982/full/01.png` | monaco-1982 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `monaco-1982/landscape/01.png`. |
| `monaco-1982/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `monaco-1982/landscape/02.png`. |
| `monaco-1982/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `monaco-1982/landscape/03.png`. |
| `monaco-1982/landscape/01.png` | monaco-1982 (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `monaco-1982/full/01.png`. |
| `monaco-1982/landscape/02.png` | monaco-1982 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `monaco-1982/full/02.png`. |
| `monaco-1982/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `monaco-1982/full/03.png`. |
| `monaco-1982/portrait/01.png` | monaco-1982 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `monaco-1982/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `monaco-1982/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `schumacher-1994-spain/full/01.png` | schumacher-1994-spain (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `schumacher-1994-spain/landscape/01.png`. |
| `schumacher-1994-spain/full/02.png` | **none** | none | no | unclear (no doc entry) |
| `schumacher-1994-spain/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `schumacher-1994-spain/landscape/03.png`. |
| `schumacher-1994-spain/landscape/01.png` | schumacher-1994-spain (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `schumacher-1994-spain/full/01.png`. |
| `schumacher-1994-spain/landscape/02.png` | schumacher-1994-spain (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/schmaucher-benetton-b194.webp` (ok (B194 exhaust flames)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `schumacher-1994-spain/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `schumacher-1994-spain/full/03.png`. |
| `schumacher-1994-spain/portrait/01.png` | schumacher-1994-spain (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/benetton-cockpit.jpg` (ok (B194 cockpit)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `schumacher-1994-spain/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `schumacher-1994-spain/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `schumacher-ferrari/full/01.png` | schumacher-ferrari (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/monza-ferrari-podium.webp` (ok (Monza tifosi/banner)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `schumacher-ferrari/full/02.png` | **none** | none | no | unclear (no doc entry) |
| `schumacher-ferrari/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `schumacher-ferrari/landscape/03.png`. |
| `schumacher-ferrari/landscape/01.png` | schumacher-ferrari (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `schumacher-ferrari/landscape/02.png` | schumacher-ferrari (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/ferrari-f2004.webp` (ok (F2004 side profile)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `schumacher-ferrari/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `schumacher-ferrari/full/03.png`. |
| `schumacher-ferrari/portrait/01.png` | schumacher-ferrari (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) |
| `schumacher-ferrari/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `schumacher-ferrari/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `senna-donington-1993/full/01.png` | senna-donington-1993 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `senna-donington-1993/landscape/01.png`. |
| `senna-donington-1993/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `senna-donington-1993/landscape/02.png`. |
| `senna-donington-1993/full/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `senna-donington-1993/landscape/03.png`. |
| `senna-donington-1993/landscape/01.png` | senna-donington-1993 (hero); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `senna-donington-1993/full/01.png`. |
| `senna-donington-1993/landscape/02.png` | senna-donington-1993 (body); code: scripts/build-anthology-stories.ts | caption in anthology-image-map.md | no | unclear (no doc entry) Duplicate content of `senna-donington-1993/full/02.png`. |
| `senna-donington-1993/landscape/03.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `senna-donington-1993/full/03.png`. |
| `senna-donington-1993/portrait/01.png` | senna-donington-1993 (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/senna-donington-trophy.jfif` (ok (SEGA Sonic trophy)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `senna-donington-1993/portrait/02.png` | **none** | none | no | unclear (no doc entry) |
| `senna-donington-1993/portrait/03.png` | **none** | none | no | unclear (no doc entry) |
| `senna-monaco/full/01.png` | senna-monaco (body); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/senna-monacogp.webp` (ok (MP4/4 Monaco action)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `senna-monaco/full/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `senna-monaco/landscape/02.png`. |
| `senna-monaco/landscape/01.png` | senna-monaco (hero); code: scripts/build-anthology-stories.ts | ingestion report 2026-09-17: raw `missing-images/senna-monacogp-pole.jfif` (ok (Monaco 1988 pole/cover)); caption in anthology-image-map.md; named in remap audit | no | image of a real event, ingested from a raw web file (docs do not say photograph; no author) |
| `senna-monaco/landscape/02.png` | **none** | none | no | unclear (no doc entry) Duplicate content of `senna-monaco/full/02.png`. |
| `senna-monaco/portrait/01.png` | **none** | none | no | unclear (no doc entry) |
| `senna-monaco/portrait/02.png` | **none** | none | no | unclear (no doc entry) |

## Owner questions

1. Which of these images (if any) may stay? None has a license record, so by `AGENTS.md` all of them are currently unlicensed.
2. Where did the 23 ingested images come from, and can the owner prove the right to use them? The repo only holds the raw file names.
3. What about the 97 undocumented png files and the 4 svg files: who made them, and under what terms?
4. Should the 68 unreferenced files be deleted regardless of the licensing decision?
5. If images are removed: should the story pages ship image-free (like the grid), or should original illustrations replace them?
6. Should `stories-images/` (local export) be deleted from the repo?
