# AGENT LOG — FAZ 2: İçerik Derinliği
**Tarih:** 2026-06-20  
**Faz:** 2 — İçerik Derinliği [Data + Frontend]  
**Plan:** `docs/apex-production-plan-20-06-2026.md`

---

## 2.1 Kariyer Aggregate Veri Katmanı

**Dosya:** `lib/data/entities.ts`

Eklenenler:
- `DriverCareer` interface: `seasons`, `championships`, `wins`, `podiums`, `points`, `teams[]`, `bestPosition`
- `TeamCareer` interface: `seasons`, `championships`, `wins`, `bestPosition`
- `getDriverCareer(driverId)`: Tüm arşiv sezonlarını (2018–2026) tarayıp pilot bazlı aggregate döndürür — yeni dış API yok, mevcut DB snapshot'ları kullanılır
- `getTeamCareer(constructorId)`: Aynı yaklaşım, takım için

**Not:** `getSeasonData()` çağrıları `Promise.all` ile paralel yürütülür; N × (2026-2018+1=9) fetch yapılır ama her biri DB-first (Supabase cache).

---

## 2.2 Statik Hikaye İçeriği

**Yeni dosyalar:**
- `data/drivers/index.ts` — 10 pilot: hamilton, max_verstappen, leclerc, norris, piastri, russell, alonso, antonelli, sainz, stroll
- `data/teams/index.ts` — 10 takım: mercedes, red_bull, ferrari, mclaren, aston_martin, alpine, williams, haas, rb, kick_sauber

Her kayıtta:
- `number`: Sabit yarış numarası (2014+ kuralı)
- `nationality`, `born`, `hq` (takımlarda lat/lng + etiket)
- `bio`: Tek kısa paragraf, doğrulanmış bilgiler, klişe yok
- `milestones[]`: En fazla 4 somut milestone (yıl: olay)
- `lore`: Bir teknik/stratejik niş gözlem — sıradan F1 haberciliğinde yer almaz

İçerik politikası: Yalnızca kesin bilinen istatistikler. Uydurma sayı yok.

---

## 2.3 Pilot Numarası Hero (Cinematic Brutalism)

**CSS:** `app/globals.css`
- `.profile-driver-number-accent`: `position: absolute; right: -4vw; bottom: -0.15em` — viewport-dışına taşan Bebas Neue numara; `clamp(8rem, 25vw, 16rem)`; `color-mix(in srgb, var(--team-secondary) 22%, transparent)` — dekoratif arka katman
- 800ms `transition: color ease` — sezon değişiminde renk ile birlikte geçiş
- `prefers-reduced-motion: reduce` → `transition: none`
- `aria-hidden` — dekoratif; ekran okuyuculara gizli

**Driver page:** `app/drivers/[driverId]/page.tsx`
- `driverNumber` `data/drivers/index.ts`'ten çekilir
- Hero'da numeral overlay (`profile-driver-number-accent` + `z-index: 1` içerik)
- Chip'te `#44` formatında da gösterilir (renk: `--team-secondary`)

**Career bölümü:**
- 4 stat hücresi: Seasons / Championships / Wins / Podiums + career points
- Teams timeline: `groupTeamSpans()` — ardışık sezonları tek aralık olarak sıkıştırır (ör: Mercedes 2013–2025)
- Takım adları `/teams/[id]` linkli

**Biyografi bölümü:**
- `bio` paragrafı
- Milestones: sol kenar çizgili liste (team-secondary rengi)
- "Technical Note" kutusu: `lore` metni, `var(--surface)` arka plan

---

## 2.4 Team Profil Sayfası

**Dosya:** `app/teams/[constructorId]/page.tsx`

Eklenenler:
- `getTeamCareer()` çağrısı — Team Record bölümü (4 stat hücresi)
- **Araç görseli slotu:** `SafeImage` `/cars/{constructorId}/{season}.webp` yolunu dener; 404'te `fallbackNode` ile branded placeholder (takım adı + "Car image unavailable")
- **HQ bilgi satırı:** koordinat + şehir etiketi (lat/lng `data/teams/index.ts`'ten)
- **Biyografi + milestone + lore:** driver sayfasıyla aynı yapı

---

## Doğrulama

- `npm run build`: **0 hata** ✅
- `npm test`: **52/52 PASS** ✅
- Build çıktısı: `/drivers/[driverId]` ve `/teams/[constructorId]` dynamic olarak listelendi ✅

---

```
✅ Tamamlananlar
  - getDriverCareer / getTeamCareer aggregate fonksiyonları
  - data/drivers/index.ts — 10 pilot statik içerik + pilot numaraları
  - data/teams/index.ts — 10 takım statik içerik + HQ koordinatları
  - Pilot numarası hero (Bebas Neue, clamp, opacity katman, 800ms geçiş, reduced-motion)
  - Driver sayfası: kariyer aggregate bölümü + takım timeline + biyografi/lore
  - Team sayfası: Team Record + araç görseli slotu + HQ bilgisi + biyografi/lore
  - 52 test yeşil, build sıfır hata

⚠️ Manuel aksiyon gerekenler
  - Araç görselleri: public/cars/{constructorId}/{season}.webp — Agent slot + fallback hazırladı,
    görseli sen koyarsan aktif olur. Şu an fallback placeholder gösteriyor (planlı davranış).

❌ Tamamlanamayan
  - YOK

📁 Değişen dosyalar
  - lib/data/entities.ts (getDriverCareer, getTeamCareer, DriverCareer/TeamCareer interfaces)
  - data/drivers/index.ts (YENİ)
  - data/teams/index.ts (YENİ)
  - app/globals.css (.profile-driver-number, .profile-driver-number-accent)
  - app/drivers/[driverId]/page.tsx (numara hero, kariyer, biyografi)
  - app/teams/[constructorId]/page.tsx (kariyer, araç slotu, HQ, biyografi)
  - logs/AGENT_FAZ2_CONTENT_DEPTH_2026-06-20.md (bu dosya)
```
