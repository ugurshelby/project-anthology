# CURSOR Supabase Schema — 2025-05-31

**Workspace:** `c:\Users\ts\Desktop\Coding\project-anthology`  
**Proje:** project-anthology (`ezocovgpybrluvgaqnft`)  
**Agent:** Cursor subagent

---

## Yapılan İşlemler

1. `supabase/migrations/001_initial_schema.sql` oluşturuldu (kullanıcı SQL'i birebir)
2. Supabase MCP `execute_sql` ile 3 batch halinde migration çalıştırıldı
3. `list_tables` (verbose) ile 5 tablo doğrulandı
4. `lib/supabase.ts` oluşturuldu (`@/lib/supabase` — tsconfig `@/*` → `./*`)
5. `types/database.ts` oluşturuldu (5 tablo + Database helper tipi)
6. `npm run build` geçti

---

## ✅ Oluşturulan Tablolar

| Tablo | Kolon sayısı | RLS | İndeks / trigger |
|-------|-------------|-----|------------------|
| `stories` | 16 | ✅ | `updated_at` trigger |
| `radio_moments` | 16 | ✅ | — |
| `circuits` | 22 | ✅ | `updated_at` trigger |
| `f1_snapshots` | 7 | ✅ | `idx_f1_snapshots_season`, `idx_f1_snapshots_type`, UNIQUE(season, round, type) |
| `news_cache` | 10 | ✅ | `idx_news_cache_published` |

**Not:** `EXECUTE FUNCTION` Supabase Postgres'te değişiklik gerektirmeden çalıştı (PG 15+).

---

## ✅ RLS Politikaları

Her tabloda 2 politika (toplam 10):

| Tablo | Public read | Service role |
|-------|-------------|--------------|
| `stories` | `published = true` | ALL |
| `radio_moments` | `published = true` | ALL |
| `circuits` | `true` (herkese açık) | ALL |
| `f1_snapshots` | `true` | ALL |
| `news_cache` | `true` | ALL |

Fonksiyon: `update_updated_at()` — `stories`, `circuits` tablolarında BEFORE UPDATE trigger.

---

## Build Düzeltmeleri

- `@vercel/node` devDependency eklendi (api/ tip desteği)
- `tsconfig.json`: `api/` exclude; include yalnızca `app/`, `lib/`, `types/` (legacy Vite `components/` + `utils/` Next build dışı)
- `vite-shim.d.ts`: geçici `import.meta.env` tip tanımı
- `components/f1Data.ts`: implicit `any` filter tipleri (legacy kod)

---

## ⚠️ Manuel Aksiyon Gerekenler

1. **Vercel env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` değerlerini Vercel dashboard'a ekleyin (`.env.local` zaten tanımlı).
2. **Veri seed:** Tablolar boş; stories, circuits, radio_moments vb. içerik sync/import script'i henüz yok.
3. **Legacy API uyumu:** `api/f1-db.ts` hâlâ `f1_round_snapshots` / `f1_season_snapshots` tablolarını sorguluyor; yeni şema `f1_snapshots` kullanıyor — API refactor gerekli.
4. **Supabase CLI:** Migration dosyası repo'da; `supabase db push` veya Dashboard SQL Editor ile uzaktan senkron tutulmalı (MCP ile zaten uygulandı).
5. **Legacy utils:** `components/`, `utils/` Next build kapsamı dışında; App Router'a taşınırken `@sentry/react`, `jsdom` vb. bağımlılıklar eklenmeli veya kod Next env'e uyarlanmalı.

---

## 📁 Değiştirilen / Oluşturulan Dosyalar

- `supabase/migrations/001_initial_schema.sql` (yeni)
- `lib/supabase.ts` (yeni)
- `types/database.ts` (yeni)
- `vite-shim.d.ts` (yeni)
- `tsconfig.json` (include/exclude güncellendi)
- `components/f1Data.ts` (tip düzeltmesi)
- `package.json`, `package-lock.json` (`@vercel/node` devDependency)
- `logs/CURSOR_SUPABASE_SCHEMA_2025-05-31.md` (bu dosya)

---

## Sonraki Adım

- Seed/sync script'leri ile circuits ve stories verisini Supabase'e yükle
- `api/f1-db.ts` → `f1_snapshots` tablosuna migrate et
- App bileşenlerinde `@/lib/supabase` + `@/types/database` kullanımına başla
