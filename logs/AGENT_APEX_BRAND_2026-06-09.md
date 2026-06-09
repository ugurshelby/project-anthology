# AGENT — APEX BRAND — 2026-06-09

## Ne yapıldı

### 1. Navbar brand — APEX
- `components/ui/SiteNav.tsx`: brand içeriği değişti.
  - Eski: `<span class="brand-top">FORMULA 1</span>` + `<span class="brand-main">HOME</span>` (mevcut kodda alt satır "HOME"du, task'taki "ANTHOLOGY" değil).
  - Yeni: üst satır kaldırıldı. Inline chevron SVG + `<span class="brand-main">APEX</span>`.
  - SVG: `14×18px`, `viewBox="0 0 14 18"`, iki iç içe sağa bakan ok, `stroke-width 2.5`, yuvarlak uç/köşe.
    - Ön ok `M0,16 L8,9 L0,2` → `#ff1801`
    - Arka ok `M6,16 L14,9 L6,2` → `#ffffff` `opacity 0.35`
    - Render sırası: önce beyaz (arka), sonra kırmızı (ön) — kırmızı önde okunur.
  - Link `href="/"` korundu, `aria-label="Apex — Home"`.

### 2. globals.css brand stilleri
- `.site-nav .brand`: `flex-direction: column` → `row`, `gap: 6px`, `justify-content: center`.
- `.brand-top` kuralı kaldırıldı (artık kullanılmıyor).
- `.brand-mark` eklendi (flex-shrink:0, display:block).
- `.brand-main`: `font-size 19px` → `22px`, `letter-spacing 0.12em` → `0.08em`, `color var(--paper)` → `#ffffff`.
- Responsive bloklar (`<1023px` brand-main 18px, `<380px` brand center) dokunulmadı; row layout merkezde sorunsuz çalışıyor.

### 3. Metadata
- `lib/seo.ts` (tek kaynak, layout.tsx buradan besleniyor):
  - `SITE_NAME`: `Project Anthology` → `Apex`
  - `SITE_TAGLINE`: yeni F1 archive açıklaması.
- `app/layout.tsx` title `default: SITE_NAME` → "Apex", template `%s — Apex`. JSON-LD/OpenGraph/Twitter de SITE_NAME üzerinden otomatik güncellendi.

### 4. DESIGN_SYSTEM.md
- `pre-plans/DESIGN_SYSTEM.md` Navbar bölümü: eski "FORMULA 1 / ANTHOLOGY" satırı yeni APEX brand tanımıyla (chevron mark + wordmark spec, path/renk detayları) değiştirildi.
- Not: CLAUDE.md `docs/DESIGN_SYSTEM.md` diyor ama dosya gerçekte `pre-plans/DESIGN_SYSTEM.md`'de; mevcut konumdaki güncellendi.

## Değişen dosyalar
- `components/ui/SiteNav.tsx`
- `app/globals.css`
- `lib/seo.ts`
- `pre-plans/DESIGN_SYSTEM.md`

## Çalıştırılan komutlar
- `npm run build` → ✓ sıfır hata, 48/48 sayfa.

## Kapsam dışı (dokunulmadı)
- Renk sistemi, tipografi, navbar yüksekliği/davranışı, diğer sayfalar.

## Sonraki adım
- Yok. Görev tamam.
