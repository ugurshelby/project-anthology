# AGENT LOG — FAZ 4 Dataviz & Mikro-Etkileşim
**Tarih:** 2026-06-21  
**Commit hedefi:** `feat: phase 4 — dataviz and motivated micro-interactions`

---

## Yapılanlar

### Gap-to-leader viz (`/season`) 
- `components/season/GapToLeaderChart.tsx` — yeni bileşen
- IntersectionObserver ile görünüme girince sol→sağ fill animasyonu (600ms, her satır 60ms gecikme)
- Takım rengi bar + sağa hizalı puan/gap değeri (IBM Plex Mono, tabular-nums)
- `prefers-reduced-motion` → statik render

### Puan evrimi grafiği (`/season`)
- `components/season/StandingsEvolutionChart.tsx` — SVG tabanlı, sıfır dış bağımlılık
- `lib/f1/mrdata.ts`'e `getDriverCumulativePoints()` + `DriverCumulativePoints` tip eklendi
- `lib/data/f1.ts`'e `SeasonData.evolutionSeries` alanı eklendi
- Veri varsa (<2 round → graceful empty) top-5 pilot çizgi grafik
- `prefers-reduced-motion` → instant reveal

### Viz toggle UX (`/season`)
- `SeasonExplorer` state: `vizMode: 'gap' | 'evolution'`
- İki buton (Gap / Points) — "personal pit wall / de-clutter" prensibi [REF: f1-race-replay R6]
- Aktif toggle bordered + subtle bg; inactive muted

### Lights-out countdown (Home — BentoRaceTile sidebar)
- `components/ui/LightsOut.tsx` — son 5 saniyede 5 F1 ışığı sırayla yanar
- 0'da: `#ff1801` tam-ekran flash (1.2s, `lightsout-flash` keyframe)
- `prefers-reduced-motion` → animasyon yok, statik sayı
- `BentoRaceTile` sidebar varyantına entegre edildi
- `globals.css`'e `@keyframes lightsout-flash` eklendi

### Pist lap animasyonu (`/circuits/[id]`)
- `CircuitLapLine.tsx` — `dotColor` prop eklendi
- Son galip takımın rengiyle hareketli dot (`offset-path + lapDot keyframe`)
- Ghost track `opacity: 0.12` arka plan çizgisi
- `prefers-reduced-motion` → statik dot at start, no animation
- `globals.css`'e `@keyframes lapDot` eklendi
- `/circuits/[id]` sayfası: `fetchRoundSnapshot` + `getRaceWinner` → `resolveTeamUiColor` → `lapDotColor`

### Normalize telemetri tipi [REF: f1-race-replay R1]
- `lib/f1/telemetry-types.ts` — `TelemetryFrame` + `SessionWeather` tipi tanımlandı
- f1-race-replay R1 şemasına yakın alan seti (speed/gear/drs/throttle — Faz 6 için hazır)
- Şu an mevcut alanlar: relativeDistance, finishPosition, gridPosition, points, tyre, trackStatus, weather

---

## Build
`npm run build` → 0 hata ✓ (15.4s)

## Değişen dosyalar
- `components/season/GapToLeaderChart.tsx` (yeni)
- `components/season/StandingsEvolutionChart.tsx` (yeni)
- `components/season/SeasonExplorer.tsx`
- `lib/f1/mrdata.ts` (getDriverCumulativePoints + DriverCumulativePoints)
- `lib/data/f1.ts` (SeasonData.evolutionSeries)
- `components/ui/LightsOut.tsx` (yeni)
- `components/ui/CircuitLapLine.tsx` (dotColor prop)
- `components/home/BentoRaceTile.tsx` (LightsOut entegre)
- `app/circuits/[id]/page.tsx` (lapDotColor)
- `app/globals.css` (lapDot + lightsout-flash keyframes)
- `lib/f1/telemetry-types.ts` (yeni)
