# CURSOR_DATA_LAYER — 2025-05-31

## Ne yapıldı

Sunucu tarafı veri erişim katmanı `lib/data/` altında oluşturuldu (`@/*` → `./*`, `src/` yok).

### Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `lib/data/logger.ts` | Supabase çağrı + fallback loglama, `timed()` |
| `lib/data/types.ts` | `NewsItem`, F1 MRData tipleri; DB tipleri re-export |
| `lib/data/fs.ts` | `public/` JSON okuma |
| `lib/data/siteUrl.ts` | SSR için `/api/*` mutlak URL |
| `lib/data/stories.ts` | `getAllStories`, `getStoryBySlug`, `getRelatedStories` |
| `lib/data/radio.ts` | `getAllRadioMoments`, `getRadioMomentBySlug` |
| `lib/data/circuits.ts` | `getAllCircuits`, `getCircuitById` |
| `lib/data/f1.ts` | `getSeasonStandings`, `getSeasonCalendar`, `getRaceResult` |
| `lib/data/news.ts` | `getLatestNews` |
| `lib/data/index.ts` | Barrel export |

### Fallback zinciri

- **Stories:** `stories` (published, sort_order) → `public/data/stories/index.json` + `{slug}.json`
- **Radio:** `radio_moments` → `public/data/radio/index.json`
- **Circuits:** `circuits` → `public/data/circuit-images.json` (minimal `Circuit` map)
- **F1:** `f1_snapshots` (`standings_drivers` / `calendar` / `results`) → `public/data/f1/{year}/…` → `/api/f1-season`
- **News:** `news_cache` → `/api/news` → `public/news-fallback.json`

## Doğrulama

```bash
npx tsc --noEmit   # OK
npm run build      # OK (temiz .next sonrası)
```

## Türkçe rapor

### ✅ Oluşturulan fonksiyonlar

- `getAllStories`, `getStoryBySlug`, `getRelatedStories`
- `getAllRadioMoments`, `getRadioMomentBySlug`
- `getAllCircuits`, `getCircuitById`
- `getSeasonStandings`, `getSeasonCalendar`, `getRaceResult`
- `getLatestNews`

### ⚠️ Eksik tip veya import

- `circuit-images.json` fallback’i yalnızca `id`, `name`, `cover_image`, `data.gallery` doldurur; tam pist editorial alanları Supabase `circuits` tablosundan gelir.
- F1 snapshot tipi seed ile `standings_drivers`; legacy `driverStandings` de denenir.
- Haber: `NewsCache` → `NewsItem` map; API/fallback ile aynı şekil.

### ❌ TypeScript hataları

- Yok (`tsc --noEmit` temiz).

## Sonraki adım

- Sayfa/Server Component’lerde `@/lib/data` import ederek client fetch yerine bu katmanı kullan.
