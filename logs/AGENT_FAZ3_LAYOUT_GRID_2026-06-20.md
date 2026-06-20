# AGENT LOG — Faz 3 Layout Grid Yeniden Yapılandırması
**Tarih:** 2026-06-20  
**Kapsam:** Home bento grid + driver hero düzeltmeleri

## Sorun Tespiti

### 1. Desktop asimetrik son satır
`BentoOnThisDayTile` `col-span-4` + `BentoNewsTile` `col-span-full` ayrı satırda → 12-col grid'de `OnThisDay` tek başına bir satır, sağda 8 sütun boş. **Kök neden:** BentoNeonDivider `col-span-full mt-[80px]` + OnThisDay `col-span-4` → iki ayrı satır oluyor, News kendi satırına düşüyor.

**Çözüm:** Desktop'ta `OnThisDay col-span-4` ve `News col-span-8` aynı satırda → toplamda 12. `onThisDay` boşsa News `col-span-12`.

### 2. Mobile zoom problemi
- `max-w-[480px]` container limiti → geniş ekranları kesiyor
- `bento-hero-tile min-height: 220px` → iki hero stacked = 440+px sadece hero
- Kartlar çok küçük, yazılar okunamıyor

**Çözüm:** Mobile (`< 640px`) için tamamen ayrı single-column layout:
- Hero `minHeight: 320px`
- Mid paneller 2×2 grid `minHeight: 260px`
- Max-width kısıtlaması kaldırıldı

### 3. Tablet layout yoktu
`sm` breakpoint hiç kullanılmıyordu → tablet'te mobile layout çalışıyordu.

**Çözüm:** 640–1023px arası 2-col grid: hero full-width 400px, 2×2 mid, bottom OnThisDay+News yan yana.

### 4. Driver portrait kesim
Pilot görseli cropped, `hero` alt çizgisiyle aynı hizada düzgün kapanmıyordu.

**Çözüm:** `maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)'` → portrait alt kısmı hero zemin rengiyle fade.

## Değişen Dosyalar
- `components/home/CompactBentoDashboard.tsx` — 3 ayrı breakpoint layout katmanı
- `components/home/BentoNeonDivider.tsx` — col-span parent'a taşındı
- `components/home/BentoOnThisDayTile.tsx` — col-span kaldırıldı
- `components/home/BentoNewsTile.tsx` — col-span kaldırıldı
- `app/drivers/[driverId]/page.tsx` — portrait maskImage + numara büyütüldü
- `docs/apex-production-plan-20-06-2026.md` — §3.0.5 eklendi

## Build
`npm run build` → 0 hata. Tüm rotalar temiz.
