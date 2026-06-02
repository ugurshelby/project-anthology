# CURSOR Seed Stories + Radio — 2025-05-31

**Workspace:** `c:\Users\ts\Desktop\Coding\project-anthology`  
**Agent:** Cursor subagent  
**Kaynak:** `.cursor/rules/CURSOR.md`

---

## Yapılan İşlemler

1. `scripts/load-env.ts` — `.env.local` yükleyici (SERVICE_ROLE_KEY server-side)
2. `scripts/seed-stories.ts` — hikaye JSON keşfi + Supabase `stories` upsert
3. `scripts/seed-radio.ts` — RADIO_ARCHIVE / JSON + `radio-images.json` cover merge + `radio_moments` upsert
4. `package.json` — `seed:stories`, `seed:radio` npm script'leri eklendi
5. Seed komutları çalıştırıldı; Supabase MCP ile satır sayıları doğrulandı

---

## Script Davranışı

### seed-stories.ts
- Arama kökleri: `public/data/stories/`, `public/data/`, `src/data/`, `stories/`, `data/`, `storyMetadata.json`
- F1/circuit/radio/season-tracker JSON'ları hariç tutulur
- Alan eşlemesi: slug, title, subtitle, year, era, category, tags, cover_image(_landscape/_portrait), content, published=true, sort_order
- Kapak yoksa `sort_order` ile `/images/stories/{full|landscape|portrait}/{n}.png` fallback
- Upsert: `onConflict: 'slug'`
- Log: `SEEDED {slug}` (yeni) / `SKIPPED {slug} (already exists)` (DB'de vardı)

### seed-radio.ts
- Kaynaklar: `public/radio-anthology/app.js`, `radio-anthology/app.js`, `public/data/radio-archive.json`, `public/data/radio-moments.json`
- `RADIO_ARCHIVE` JS array parse (JSON veya Function fallback)
- `public/data/radio-images.json` → `episodes[slug].cover` merge
- Upsert: `onConflict: 'slug'`

### Güvenlik
- `SUPABASE_SERVICE_ROLE_KEY` yalnızca script'lerde; client bundle'a dahil edilmez
- `load-env.ts` → `.env.local` okur, `@/lib/supabase` import sırası sorununu önler

---

## Çalıştırma Sonuçları

```text
npm run seed:stories
> Found 0 candidate JSON file(s)
> No story records discovered. Add JSON under public/data/stories/ or storyMetadata.json

npm run seed:radio
> No radio moments discovered. Expected RADIO_ARCHIVE in radio-anthology/app.js or public/data/radio-archive.json
```

### Supabase doğrulama (MCP execute_sql)

| Tablo | Satır sayısı |
|-------|-------------|
| `stories` | **0** |
| `radio_moments` | **0** |

---

## Türkçe Özet

### ✅ Tamamlananlar
- Seed script'leri oluşturuldu ve npm komutları bağlandı
- `.env.local` env değişkenleri mevcut; script'ler hatasız çalıştı
- Upsert + SEEDED/SKIPPED log formatı hazır

### 📊 Sayılar

| Metrik | Hikaye | Radio |
|--------|--------|-------|
| Eklenen (SEEDED) | 0 | 0 |
| Atlanan (SKIPPED) | 0 | 0 |
| Hata | 0 | 0 |
| DB toplam satır | 0 | 0 |

### ❌ Seed yapılamama nedeni

**Hikayeler:** Repoda hikaye JSON kaynağı yok.
- `public/data/stories/` klasörü yok
- `public/data/storyMetadata.json` yok
- `lib/storyMetadata.ts` Supabase'den okuyacak şekilde refactor edilmiş (statik JSON export değil)
- 40 adet kapak görseli (`public/images/stories/`) var; metin/içerik JSON'ları henüz migrate edilmemiş

**Radio:** RADIO_ARCHIVE veri kaynağı yok.
- `radio-anthology/app.js` repoda yok
- `public/data/radio-images.json` yalnızca görsel metadata (slug → cover/gallery); driver/quote/context alanları içermiyor
- `quote NOT NULL` constraint nedeniyle slug-only seed yapılamaz

### ⚠️ Manuel aksiyon gerekenler

1. Hikaye içeriğini `public/data/stories/*.json` veya `public/data/storyMetadata.json` olarak ekleyin, ardından:
   ```bash
   npm run seed:stories
   ```
2. Radio anlarını `public/radio-anthology/app.js` (RADIO_ARCHIVE) veya `public/data/radio-archive.json` olarak ekleyin, ardından:
   ```bash
   npm run seed:radio
   ```

---

## 📁 Değiştirilen / Oluşturulan Dosyalar

- `scripts/load-env.ts` (yeni)
- `scripts/seed-stories.ts` (yeni)
- `scripts/seed-radio.ts` (yeni)
- `package.json` (seed:stories, seed:radio)
- `logs/CURSOR_SEED_STORIES_2025-05-31.md` (bu dosya)

---

## Sonraki Adım

Kaynak JSON/JS dosyaları eklendikten sonra seed script'lerini yeniden çalıştır; `loadStoryMetadata()` Supabase'den dolu katalog çekebilir.
