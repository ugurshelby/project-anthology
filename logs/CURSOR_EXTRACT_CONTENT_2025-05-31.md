# CURSOR — Extract Stories + Radio Content

**Tarih:** 2025-05-31  
**Workspace:** `c:\Users\ts\Desktop\Coding\project-anthology`

---

## Özet

Story ve radio içeriği `migration-assets/` kaynağından çıkarılmaya çalışıldı. **Kaynak klasör repoda yok**; mevcut `components/f1Data.ts` yalnızca canlı F1 verisi içeriyor (story/radio array yok). JSON çıktısı ve Supabase seed **0 kayıt**.

---

## TASK 1 — Stories extract

### Aranan kaynaklar
| Yol | Durum |
|-----|--------|
| `migration-assets/components/f1Data.ts` | ❌ Yok |
| `components/f1Data.ts` | ✅ Var — story array yok |

Aranan array isimleri: `STORIES`, `stories`, `storyData`, `STORY_DATA`, `STORY_CATALOG`

### Sonuç
- **JSON'a yazılan hikaye:** **0**
- `public/data/stories/` oluşturulmadı (içerik yok)

---

## TASK 2 — Radio extract

### Aranan kaynaklar
| Yol | Durum |
|-----|--------|
| `migration-assets/public/radio-anthology/app.js` | ❌ Yok |
| `migration-assets/components/f1Data.ts` | ❌ Yok |
| `public/radio-anthology/app.js` | ❌ Yok |
| `components/f1Data.ts` | ✅ Var — `RADIO_ARCHIVE` yok |

### Sonuç
- **JSON'a yazılan radio anı:** **0**
- `public/data/radio/index.json` oluşturulmadı

**Not:** `public/data/radio-images.json` mevcut (14 episode slug, kapak/galeri) — quote/driver/team metni içermiyor; seed için yeterli değil.

---

## TASK 3 — Seed çalıştırma

```text
npm run extract:content  → stories: 0, radio: 0
npm run seed:stories     → 0 kayıt
npm run seed:radio       → 0 kayıt
```

### Supabase doğrulama

| Tablo | Satır sayısı |
|-------|-------------|
| `stories` | **0** |
| `radio_moments` | **0** |

---

## ✅ Tamamlananlar

1. `scripts/extract-content.ts` — migration-assets + fallback path'lerden array çıkarma
2. `npm run extract:content` script'i eklendi
3. `scripts/seed-radio.ts` — `public/data/radio/index.json` kaynağı eklendi
4. `scripts/seed-stories.ts` — `public/data/stories/index.json` seed'den hariç
5. Extract + seed komutları çalıştırıldı, Supabase sayıları doğrulandı

---

## ⚠️ MANUEL AKSİYON GEREKLİ

1. **Legacy Vite kaynağını repoya kopyalayın:**
   ```
   migration-assets/
     components/f1Data.ts      ← STORIES / storyData array
     public/radio-anthology/app.js  ← RADIO_ARCHIVE array
   ```
2. Ardından sırayla:
   ```bash
   npm run extract:content
   npm run seed:stories
   npm run seed:radio
   ```
3. Alternatif: hikayeleri doğrudan `public/data/stories/{slug}.json` olarak, radio'yu `public/data/radio/index.json` olarak elle oluşturun.

---

## ❌ Tamamlanamayan

- İçerik extract/seed: kaynak dosyalar projede bulunamadı (git geçmişinde de yok).

---

## 📁 Değiştirilen dosyalar

| Dosya | İşlem |
|-------|--------|
| `scripts/extract-content.ts` | Yeni |
| `scripts/seed-radio.ts` | `public/data/radio/index.json` path |
| `scripts/seed-stories.ts` | index.json exclude |
| `package.json` | `extract:content` script |
| `logs/CURSOR_EXTRACT_CONTENT_2025-05-31.md` | Bu dosya |

---

## Türkçe rapor (özet)

| Metrik | Değer |
|--------|-------|
| Bulunan / JSON'a yazılan hikaye | **0** |
| Bulunan / JSON'a yazılan radio anı | **0** |
| Supabase `stories` satır | **0** |
| Supabase `radio_moments` satır | **0** |

**Sebep:** `migration-assets/` klasörü repoda yok; mevcut `f1Data.ts` story/radio içermiyor.
