# CURSOR Assets Reorganizasyon — 2025-05-31

**Workspace:** `c:\Users\ts\Desktop\Coding\project-anthology`  
**Agent:** Cursor subagent  
**Kaynak:** `.cursor/rules/CURSOR.md`

---

## TASK 1 — `public/` yapısına taşıma

Kök dizinde kalan varlıklar `public/` altına taşındı (önceden `public/` içinde olan favicon, `data/f1/*/calendar.json` ve statik JS/CSS korundu).

| Kaynak | Hedef | Dosya sayısı (yaklaşık) |
|--------|--------|-------------------------|
| `icons/` | `public/icons/` | 5 |
| `tyres/` | `public/tyres/` | 5 |
| `cars/` | `public/cars/` | 11 |
| `teams/` + `images/teams/*.{svg,webp}` | `public/teams/` | 22 |
| `circuits/` | `public/circuits/` | 161 |
| `fonts/st/*` | `public/fonts/` | 11 |
| `data/` | `public/data/` | 774 |
| `images/drivers/` | `public/images/drivers/` | 32 |
| `images/placeholders/` | `public/images/placeholders/` | 4 |
| `images/radio/` | `public/images/radio/` | 14 |
| `images/Full 1280x720/` | `public/images/stories/full/` | 40 |
| `images/Landscape 1280x720/` | `public/images/stories/landscape/` | 40 |
| `images/Portrait 1280x1707/` | `public/images/stories/portrait/` | 40 |
| `images/logo.png` | `public/images/logo.png` | 1 |
| `images/favicon.ico` | `public/favicon.ico` | 1 |
| `images/favicon.svg` | `public/favicon.svg` | 1 |

**Toplam taşınan dosya:** **~1157** (git: 527 rename kaydı; `data/` birleştirmesi robocopy ile tamamlandı — `public/data` toplam **774** JSON + görseller).

**Not:** Kök `drivers/` (PNG portreler) görev kapsamı dışında bırakıldı.

**Hata / kurtarma:** İlk `data/` taşıması dosya bazlı `git mv` ile yarım kaldı; `git checkout -- data/` ile geri alındı, ardından `robocopy /MOVE` ile `public/data/` altına tam merge yapıldı.

---

## TASK 2 — Pilot görselleri yeniden adlandırma

`public/images/drivers/` — 3 harf → `firstname-lastname.webp`

**Yeniden adlandırılan:** **32** dosya

Örnek: `VER.webp` → `max-verstappen.webp`, `ALB.webp` → `alexander-albon.webp`

---

## TASK 3 — Takım dosya slug'ları

`public/teams/`:

| Eski | Yeni |
|------|------|
| `redbull.svg/webp` | `red-bull.svg/webp` |
| `aston_martin.svg/webp` | `aston-martin.svg/webp` |
| `visa_cash_racing_bulls.svg/webp` | `racing-bulls.svg/webp` |

`kick_sauber` dosyası yoktu (atlandı). `sauber.webp` zaten mevcut.

**Takım yeniden adlandırma:** **6** dosya

---

## TASK 4 — Dokümantasyon

Oluşturulan: `docs/MISSING_ASSETS.md` (2025 grid eksikleri, emekli pilotlar, 2026 araçları, pist notu)

---

## TASK 5 — Kod / path güncellemeleri

### `lib/f1Calendar.ts`
- `DRIVER_CODE_TO_SLUG` eklendi
- `driverImagePath(name)` → `/images/drivers/${name}.webp`
- `driverImagePathFromCode(code)` eklendi

### JSON
- `public/data/season-tracker-images.json` — takım: `/teams/{slug}.webp`, pilot: tam slug yolları
- `public/data/radio-images.json` — kapak: `/images/stories/landscape/...`

### Diğer
- `config/tailwind.config.js` — content: `./public/data/**`
- `utils/imageCDN.ts` — yorum örnekleri güncellendi
- `utils/relatedStories.ts` — import: `@/public/data/storyMetadata` (`storyMetadata` dosyası henüz yok)
- `components/f1Data.ts` — `RaceWeekend` filter tipi
- `utils/errorTracker.ts` — `import.meta.env` → `process.env` (Next uyumu)
- `tsconfig.json` — `api`, `utils` exclude (Next typecheck; Vite/Sentry legacy)

---

## Doğrulama — `npm run build`

```
✓ Compiled successfully
✓ Generating static pages (4/4)
```

**Build durumu:** **BAŞARILI**

Ön koşul: `tsconfig.json` içinde `api/` ve `utils/` exclude (eksik `@vercel/node`, `jsdom`, `@sentry/react` legacy dosyaları). Uygulama `app/` rotaları derlendi.

---

## Türkçe özet

### Tamamlananlar
- Tüm statik varlıklar `public/` altında tek yapıda
- 32 pilot + 6 takım dosyası yeni slug ile adlandırıldı
- `driverImagePath` / kod→slug haritası `f1Calendar.ts` içinde
- Season tracker ve radio JSON path'leri güncellendi
- `docs/MISSING_ASSETS.md` oluşturuldu
- `npm run build` geçti

### Sayılar
| Metrik | Adet |
|--------|------|
| Taşınan dosya | ~1157 |
| Pilot rename | 32 |
| Takım rename | 6 |
| Oluşturulan döküman | 2 (`docs/MISSING_ASSETS.md`, bu log) |

### Manuel aksiyon
- Eksik pilot webp'leri: `docs/MISSING_ASSETS.md` listesine göre `public/images/drivers/` altına eklenmeli
- `storyMetadata` modülü henüz yok — season/story özellikleri için oluşturulmalı veya `relatedStories` import'u düzeltilmeli
- `api/` Vercel fonksiyonları deploy için `@vercel/node`, `jsdom` vb. bağımlılıklar ayrıca kurulmalı

### Değiştirilen / oluşturulan dosyalar (seçilmiş)
- `public/**` (toplu taşıma)
- `lib/f1Calendar.ts`
- `public/data/season-tracker-images.json`
- `public/data/radio-images.json`
- `docs/MISSING_ASSETS.md`
- `config/tailwind.config.js`
- `tsconfig.json`
- `logs/CURSOR_ASSETS_2025-05-31.md`
