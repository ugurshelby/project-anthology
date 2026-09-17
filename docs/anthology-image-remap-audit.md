# Anthology image remap audit — 2026-09-17

Backup: _stories-backup-20260917-114352
Staging: _remap-staging

## Step 1 remaps done

- hakkinen landscape 01/02 -> button-canada landscape 01/02 (Button 2011)
- button landscape/02 + portrait/01 -> fangio landscape/02 + portrait/01 (Maserati 250F)
- fangio landscape/02 -> dijon portrait/01 (RS10)
- fangio portrait/01 -> dijon landscape/02 (312T4)
- dijon portrait/01 -> imola portrait/01 (Senna memorial)
- imola landscape/01 + portrait/01 -> brawn landscape/01 + portrait/01 (BGP001)
- brawn landscape/01 (+portrait) -> hunt-lauda landscape/01 (+portrait/02) (Hunt podium)
- hunt-lauda landscape/02 + portrait/01 purged (Massa podium dupes; kept massa-2008/full/01)

## Placeholders (missing-asset)

- /stories/button-canada/portrait/01.png
- /stories/collins-fangio-1956/portrait/01.png
- /stories/hakkinen-schumacher/landscape/01.png
- /stories/hakkinen-schumacher/landscape/02.png
- /stories/hakkinen-schumacher/portrait/01.png
- /stories/hamilton-silverstone/full/01.png
- /stories/hunt-lauda/landscape/02.png
- /stories/hunt-lauda/portrait/01.png
- /stories/imola-1994/landscape/01.png
- /stories/jaguar-monaco-diamond/portrait/01.png
- /stories/jerez-1997/full/01.png
- /stories/jerez-1997/portrait/01.png
- /stories/massa-2008/landscape/02.png
- /stories/massa-2008/portrait/01.png
- /stories/schumacher-1994-spain/landscape/02.png
- /stories/schumacher-ferrari/full/01.png
- /stories/schumacher-ferrari/landscape/02.png
- /stories/senna-donington-1993/portrait/01.png

## Needs rescan

- /stories/senna-monaco/landscape/01.png
- /stories/senna-monaco/full/01.png

## content.ts

- 56/56 referenced paths resolve (0 broken links).
- No path rewrites in data/stories/content.ts; bytes corrected under stable paths.
- stories-images/manifest.json statuses updated.

## Still verify visually

- dijon-1979/landscape/01 cover (possible Mugello render)
- fangio-nurburgring/landscape/01 cover
- schumacher-1994-spain/portrait/01 cockpit candidate

## Restore

Copy backup folder over public/stories if needed.

## 2026-09-17 invalid-era purge

Purged suspect assets to dark placeholders and added to missing-asset list:
- /stories/senna-monaco/landscape/01.png (cover)
- /stories/senna-monaco/full/01.png
- /stories/dijon-1979/landscape/01.png (cover)
- /stories/fangio-nurburgring/landscape/01.png (cover)
- /stories/schumacher-1994-spain/portrait/01.png (cockpit)

