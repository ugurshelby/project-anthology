# CURSOR — F1 Calendar Modülü

## Ne yapıldı
- `lib/f1Calendar.ts` oluşturuldu — F1 temporal context tek kaynağı
- `public/data/f1/2025/calendar.json` ve `2026/calendar.json` eklendi (`data/f1/` kopyası)
- `.cursor/rules/CURSOR.md` ve `.claude/CLAUDE.md` — "F1 Temporal Context" bölümü eklendi

## Export'lar
- `CURRENT_DATE`, `CURRENT_SEASON`, `LAST_RACE`, `NEXT_RACE`, `IS_RACE_WEEKEND`
- `CURRENT_TEAMS_2025`, `CURRENT_DRIVERS_2025`
- `getF1Context()`, tipler: `RaceSummary`, `NextRaceSummary`, `F1DriverEntry`, `F1Context`

## Runtime test (2026-05-31)
- Season: 2026
- Last: Canadian Grand Prix (2026-05-24)
- Next: Monaco Grand Prix (2026-06-07) — 7 gün
- Race weekend: false

## Notlar
- `@/lib/f1Calendar` → `lib/f1Calendar.ts` (tsconfig `@/*` → `./*`, `src/` klasörü yok)
- Server: fs sync read; client: embedded fallback
- `npm run build` mevcut `@vercel/node` hataları nedeniyle başarısız (önceden var, bu değişiklikle ilgili değil)
- `lib/f1Calendar.ts` lint/type hatası yok

## Sonraki adım
- `components/f1Data.ts` içindeki hardcoded `2025` sezon mantığını `@/lib/f1Calendar`'a taşımak (opsiyonel refactor)
