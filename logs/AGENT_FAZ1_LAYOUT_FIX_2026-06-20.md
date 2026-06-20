# AGENT LOG — FAZ 1: Bozuk Layout & Veri Açıkları
**Tarih:** 2026-06-20  
**Faz:** 1 — Bozuk Layout & Veri Açıkları  
**Plan:** `docs/apex-production-plan-20-06-2026.md`

---

## 1.1 Route Envanteri

| Route | Status | Notlar |
|---|---|---|
| `/` | ✅ 200 | OK |
| `/season` | ✅ 200 | query param (`?year=`) tabanlı — intended |
| `/season/2024` | ✅ 404 intended | `/season?year=2024` doğru URL; path-based route yok ve yok olması tasarım kararı |
| `/drivers` | ✅ 200 | |
| `/drivers/hamilton` | ✅ 200 | 2026 sezonu |
| `/drivers/hamilton?season=2021` | 🔴→✅ **FIX** | Önceden 404 (matchDriver bug), düzeltildi |
| `/teams` | ✅ 200 | |
| `/teams/mercedes` | ✅ 200 | |
| `/teams/red_bull` | ✅ 200 | |
| `/circuits` | ✅ 200 | |
| `/circuits/albert_park` | ✅ 200 | SVG harita var |
| `/news` | ✅ 200 | 297 haber öğesi |
| `/tech-glossary` | ✅ 200 | |

## 1.2 Bulunan ve Düzeltilen Sorunlar

### 🔴 BUG 1 — Driver ID format uyumsuzluğu (KRİTİK)
**Sorun:** Ergast formatı 2018–2025 için `lewis-hamilton` (hyphenated full-name), 2026+ için `hamilton` (slug) kullanıyor. `matchDriver()` exact match yapıyordu → `/drivers/hamilton?season=2021` (ve tüm tarihsel sezonlar) 404 veriyordu.

**Düzeltme:** `lib/data/entities.ts::matchDriver()` — exact match önce, fallback olarak hyphenated ID'nin son parçasını (`lewis-hamilton` → `hamilton`) URL slug'ıyla karşılaştır.

```
// Önceki
return rows.find((r) => r.driverId === id);

// Sonrası  
exact match → fallback: parts[last] === id || endsWith('-' + id) || startsWith(id + '-')
```

**Kapsam:** `getDriverProfile` ve `getDriverSeasons` her ikisi de `matchDriver` kullandığından her ikisi de düzeldi. Tüm tarihsel pilot sayfaları artık erişilebilir.

### 🟡 BUG 2 — Driver eyebrow'da boş constructor adı
**Sorun:** 2021 standings_drivers'ında Ergast `Constructors: []` boş array döndürüyor → `constructorName: '—'`. Eyebrow'da `Driver · — · 2021` görünüyordu.

**Düzeltme:** `app/drivers/[driverId]/page.tsx` line 92 — constructorName `'—'` veya boşsa eyebrow'dan gizle.

### 🟡 EKSIK — `box-sizing: border-box` global CSS'de yoktu
**Düzeltme:** `app/globals.css` — `*, *::before, *::after` bloğuna `box-sizing: border-box` eklendi (design-rules §1).

### 🟡 EKSIK — `min-h-screen` yerine `min-h-dvh` (iOS mobile jump)
**Düzeltme:**
- `components/ui/AtmosphericHero.tsx`: `min-h-screen` → `min-h-dvh`
- `components/ui/NewsFeaturedHero.tsx`: `min-h-screen` → `min-h-dvh`

### 🟡 EKSIK — `cursor: pointer` + min 44px touch target
**Düzeltme:** `app/globals.css`
- `.profile-driver-row`: `cursor: pointer` + `min-height: 44px` eklendi
- `.entity-grid-card`: `cursor: pointer` + `min-height: 44px` eklendi

## 1.3 Doğrulama

- `npm test`: **52/52 PASS** ✅
- `npm run build`: **0 hata** ✅
- `/drivers/hamilton?season=2021` → **200** ✅ (önceden 404)
- `/api/news` → 200, 60 item ✅
- RelatedNews boş dönerse `return null` guard devrede ✅

## 1.4 Açık Kalan (Faz 2'ye devir)

- 2021 standings'taki boş constructor bilgisi (results snapshot'tan çekilecek — Faz 2 §2.1 kapsamı)
- Kariyer aggregate veri (wins/podiums sadece current-season gösteriyor — Faz 2 §2.1)
- Pilot numarası hero (Faz 2 §2.3)
- Playwright otomatik CLS/console testi (CI ortamında playwright kurulamadı; manuel smoke temiz)

---

```
✅ Tamamlananlar
  - matchDriver Ergast ID uyumsuzluğu düzeltildi (tüm tarihsel pilot sayfaları)
  - Driver eyebrow boş constructor '—' gizlendi
  - box-sizing: border-box global eklendi
  - min-h-screen → min-h-dvh (iOS mobile jump düzeltmesi)
  - cursor: pointer + min 44px touch target (profile-driver-row, entity-grid-card)
  - 52 test yeşil, build sıfır hata

⚠️ Manuel aksiyon gerekenler
  - YOK

❌ Tamamlanamayan
  - Playwright otomatik testi (ortam kısıtı) — build + test + curl smoke başarılı

📁 Değişen dosyalar
  - lib/data/entities.ts (matchDriver fuzzy fix)
  - app/drivers/[driverId]/page.tsx (eyebrow empty constructor)
  - app/globals.css (box-sizing, cursor, min-height)
  - components/ui/AtmosphericHero.tsx (min-h-dvh)
  - components/ui/NewsFeaturedHero.tsx (min-h-dvh)
  - logs/AGENT_FAZ1_LAYOUT_FIX_2026-06-20.md (bu dosya)
```
