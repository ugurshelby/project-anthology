# CURSOR — data/ Klasör Migrasyonu

**Tarih:** 2025-05-31

## STEP 1 — Bulunan referanslar

| Dosya | Referans | Durum |
|-------|----------|-------|
| `lib/f1Calendar.ts` | `public/data/f1/{year}/calendar.json` fs sync read | **Güncellendi** → API/Supabase/static fetch |
| `config/tailwind.config.js` | `./public/data/**/*` | OK — root `data/` değil |
| `utils/relatedStories.ts` | `@/public/data/storyMetadata` | OK — root `data/` değil |
| `public/data/f1/index.json` | `/data/f1` servis notu | OK — public static URL |
| `logs/CURSOR_F1CALENDAR_2025-05-31.md` | tarihsel not (`data/f1/` kopyası) | OK — log, kod değil |
| `logs/CURSOR_AUDIT_2025-05-31.md` | eski `data/` ağacı | OK — audit snapshot |
| `components/f1Data.ts` | `/api/f1-season?path=...` | OK — zaten API kullanıyor |
| `api/f1-season.ts` | Ergast proxy | OK |
| `api/f1-db.ts` | Supabase `f1_season_snapshots` | OK |

**Root `data/` kod referansı:** Bulunamadı (silinen klasöre işaret eden aktif import/path yok).

## STEP 2 — Veri kaynağı durumu

- `public/data/f1/` **mevcut** — calendar.json (2021–2026), rounds/, circuits/ tam kopya
- Root `data/f1/` silindi; içerik `public/data/f1/` altında korunmuş
- **Veri kaybı yok** — rounds, qualifying, results JSON'ları public altında

## STEP 3 — f1Calendar.ts değişiklikleri

- `loadCalendarFromFilesystem()` ve `node:fs` kaldırıldı
- Yükleme sırası:
  1. Supabase `f1_season_snapshots` (calendar)
  2. `/api/f1-season?path={year}` (client) / Ergast direct (server/build)
  3. `/data/f1/{year}/calendar.json` (public static)
  4. Embedded fallback
- `getF1Context()` artık `async` — canlı takvim verisi
- Sync export'lar (`CURRENT_SEASON` vb.) embedded fallback kullanır

## Değiştirilen dosyalar

- `lib/f1Calendar.ts`
- `logs/CURSOR_DATA_MIGRATION_2025-05-31.md` (bu dosya)
