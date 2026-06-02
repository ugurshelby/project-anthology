# CURSOR — f1-db Refactor + relatedStories

**Tarih:** 2025-05-31  
**Workspace:** `c:\Users\ts\Desktop\Coding\project-anthology`  
**Agent:** Cursor subagent

---

## Özet

`api/f1-db.ts` ve yardımcı modüller `f1_snapshots` şemasına taşındı. `utils/relatedStories.ts` import hatası `@/lib/storyMetadata` ile giderildi. Build ve `tsc --noEmit` sıfır hata.

**Git:** Değişiklikler `main` üzerinde zaten commitli (`cd92252 feat: seed f1 snapshots from local JSON`). İstenen mesajla yeni commit oluşturulacak dosya farkı yoktu; `git push` → *Everything up-to-date*.

---

## Task 1 — f1-db API refactor

### Değiştirilen sorgular (eski → yeni)

| Kullanım | Eski | Yeni |
|--------|------|------|
| Tur (round) verisi | `f1_round_snapshots` → `payload`, `year`, `round`, `suffix` | `f1_snapshots` → `data`, `season`, `round`, `type` |
| Tur SELECT | `.eq('year', y).eq('round', r).eq('suffix', suffix)` | `.eq('season', y).eq('round', r).eq('type', mappedType)` |
| Sezon verisi | `f1_season_snapshots` → `payload`, `year`, `resource_type` | `f1_snapshots` → `data`, `season`, `type`, `round IS NULL` |
| Sezon SELECT | `.eq('year', y).eq('resource_type', resource)` | `.eq('season', y).is('round', null).eq('type', resource)` |
| Upsert | (ayrı tablolar) | `upsertF1Snapshot()` → `ON CONFLICT (season, round, type)` |

### `suffix` → `type` eşlemesi (tur)

- `results`, `results-1`, `results-2` → `results`
- `qualifying`, `qualifying-1` → `qualifying`
- `sprint`, `sprint-N` → `sprint`
- Diğer suffix değerleri olduğu gibi `type` olarak kullanılır

### Sezon `resource` → `type`

- `calendar` → `calendar`
- `driverStandings` → `driverStandings`
- `constructorStandings` → `constructorStandings`

(`lib/f1Calendar.ts` takvim yüklemesi: `type = 'calendar'`, `round IS NULL`)

### Supabase istemcisi

- `api/f1-db.ts`: `getSupabaseAdmin()` (`lib/supabase.ts`) — Vite/Next env fallback zinciri
- Ortak sorgular: `lib/f1Snapshots.ts` (`fetchRoundSnapshot`, `fetchSeasonSnapshot`, `upsertF1Snapshot`)

---

## Task 2 — relatedStories

### Düzeltilen importlar

| Dosya | Eski | Yeni |
|-------|------|------|
| `utils/relatedStories.ts` | `import { Story } from '../types'` (yok) | `StoryListItem` from `@/lib/storyMetadata` |
| `utils/relatedStories.ts` | `@/public/data/storyMetadata` (yok) | `@/lib/storyMetadata` |

### Yeni modül

- `lib/storyMetadata.ts`: `StoryListItem`, `storyMetadata[]`, `loadStoryMetadata()` — Supabase `stories` (published), `getSupabaseAdmin()`

---

## Build durumu

| Komut | Sonuç |
|-------|--------|
| `npm run build` | ✅ Başarılı (Next.js 15.5.18) |
| `npx tsc --noEmit` | ✅ Exit 0 |

---

## 📁 Dosyalar

- `api/f1-db.ts`
- `lib/f1Snapshots.ts` (yeni)
- `lib/supabase.ts` (`getSupabaseAdmin`)
- `lib/storyMetadata.ts` (yeni)
- `lib/f1Calendar.ts` (Supabase sorgusu güncellendi)
- `utils/relatedStories.ts`
- `logs/CURSOR_F1DB_REFACTOR_2025-05-31.md`

---

## ⚠️ Manuel aksiyon

1. **Supabase seed:** `f1_snapshots` satırları seed script ile doldurulmalı (`cd92252` seed script mevcut); API 404 döner tablo boşsa.
2. **Stories seed:** `loadStoryMetadata()` için `stories` tablosunda `published = true` kayıtlar gerekli; yoksa `storyMetadata` boş kalır.
3. **`scripts/audit-supabase-test.mjs`:** Hâlâ `f1_season_snapshots` kullanıyor — ayrı güncelleme önerilir.

---

## Sonraki adım

- Vercel env: `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`
- İsteğe bağlı: commit mesajını `fix: refactor f1-db to new snapshots schema` ile hizalamak için `git commit --amend` (yalnızca kullanıcı isterse)
