# CURSOR — Git Geçmişi Story/Radio Kurtarma

**Tarih:** 2025-05-31

## Çalıştırılan komutlar

```bash
git log --all --full-history -- "*/storyData*"
git log --all --full-history -- "*/stories*"
git log --all --full-history -- "*/radioArchive*"
git log --all --full-history -- "*/RADIO_ARCHIVE*"
git log --all --full-history -- "*/radio-anthology/app.js"
git log --all --full-history -- "src/data/*"
```

Ek: `git log -S "RADIO_ARCHIVE"`, `git log -S "storyData"`, `git log -- "**/storyMetadata*"`

## Sonuç tablosu

| Pattern | Commit | Dosya | Metin içeriği? |
|---------|--------|-------|----------------|
| `*/storyData*` | — | — | ❌ Hiç commit yok |
| `*/stories*` | `2b60f51` | `public/images/stories/**/*.png` (120 dosya) | ❌ Yalnızca PNG |
| `*/radioArchive*` | — | — | ❌ Hiç commit yok |
| `*/RADIO_ARCHIVE*` | — | — | ❌ Hiç commit yok |
| `*/radio-anthology/app.js` | — | — | ❌ Hiç commit yok |
| `src/data/*` | — | — | ❌ Hiç commit yok |
| `**/storyMetadata*` | `cd92252` | `lib/storyMetadata.ts` | ❌ Supabase okuyucu (statik story array değil) |

## Pickaxe (`-S`) araması

| String | İlk görünüm | Dosya |
|--------|-------------|-------|
| `const RADIO_ARCHIVE` | `a9e1928` | `scripts/extract-content.ts`, `scripts/seed-radio.ts` (script kodu) |
| `storyData` | `a9e1928` | `scripts/extract-content.ts` (array isim listesi) |
| `"quote"` (ts/js/json) | `2b60f51`, `a9e1928` | Script/log dosyaları; kaynak archive yok |

## Önemli bulgu — hiç commit edilmemiş referans

**Commit:** `a05828a` (initial setup)

`utils/relatedStories.ts` şu import ile eklendi:
```typescript
import { storyMetadata } from '../data/storyMetadata';
```

Ancak `data/storyMetadata.ts` / `.js` **hiçbir commit'te yok** — dosya repoya hiç eklenmemiş (broken import).

## Kurtarma

| Hedef dosya | Durum |
|-------------|--------|
| `migration-source/recovered-stories.ts` | ❌ Oluşturulmadı — kaynak bulunamadı |
| `migration-source/recovered-radio.js` | ❌ Oluşturulmadı — kaynak bulunamadı |

## Repoda mevcut (metin değil)

- `a05828a` → `images/Full 1280x720/`, `Landscape`, `Portrait` (40'er story kapak PNG)
- `a05828a` → `data/radio-images.json` (14 episode slug + gallery/cover)
- `2b60f51` → görseller `public/images/stories/` ve `public/data/` altına taşındı

## Sonraki adım

Story/radio **metin içeriği** git geçmişinde yok. Eski Vite projesinden veya yerel yedekten manuel kopyalanmalı:
- `data/storyMetadata.ts` (veya eşdeğeri)
- `radio-anthology/app.js` (`RADIO_ARCHIVE` array)
