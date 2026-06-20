# AGENT LOG — FAZ 3 Tasarım Dili Parlatma
**Tarih:** 2026-06-21  
**Commit hedefi:** `style: phase 3 — cinematic brutalist design polish`

---

## Yapılanlar

### Tasarım otoritesi tek kaynağa taşındı
- `docs/apex-final-design.md` → tek geçerli tasarım anayasası
- `docs/README.md` güncellendi: `apex-design-system.md` DEPRECATED işaretlendi
- `docs/apex-production-plan-20-06-2026.md` tasarım otoritesi satırı güncellendi

### A1 — Accent kırmızı disiplini (81 → ~6 statik kullanım)
Kaldırılanlar:
- `app/globals.css`: `bento-panel-accent` border → `var(--border-hover)`, `anthology-card` border → `var(--border-hover)` + hover `var(--paper)`, mobile dropdown active → `var(--paper)`, mobile bottom nav active → `var(--paper)`, `story-prose blockquote` → `rgba(244,241,234,0.3)`
- `app/anthology/_components/StoryCard.tsx`: category eyebrow → `var(--muted)`, "Read Story →" → `var(--paper)`
- `app/anthology/_components/RadioMomentCard.tsx`: meta eyebrow → `var(--muted)`
- `app/anthology/[slug]/page.tsx`: category eyebrow → `var(--muted)`
- `app/circuits/page.tsx`: "Round X" → `var(--muted)`, hover:border-accent kaldırıldı
- `app/circuits/[id]/page.tsx`: tüm eyebrow'lar → `var(--muted)`
- `app/news/page.tsx`: "Read story →" → `var(--paper)`
- `app/tech-glossary/page.tsx`: tyre kicker eyebrow → `var(--muted)`
- `app/season/page.tsx`: lider puanı → `resolveTeamUiColor()` (takım rengi)
- `app/season/[year]/round/[n]/page.tsx`: podium satır bg → `color-mix(in srgb, teamColor 6-8%, transparent)`, FL badge → `var(--muted)` + "FL ⬦" ikon
- `components/profile/RelatedNews.tsx`: "Read story →" → `var(--paper)`
- `components/ui/AssetFallback.tsx`: border-left → `var(--border-hover)`
- `components/ui/NewsFeaturedHero.tsx`: link rengi → `var(--paper)`, translate-x-1 arrow kaldırıldı

Kalan izinli accent (A1 §4 statik kural):
1. `nav-link::after` aktif indikatör çizgisi
2. `skip-to-content` CTA bg (WCAG accessibility, transient)
3. `page-transition-sweep` (transient)
4. `BentoLeaderTile` pulse dot → **takım rengiyle değiştirildi** (artık accent değil)

### B4 — Hover narrative (renk körü uyumlu)
- `anthology-card:hover` → border 3px→5px + renk `var(--paper)` (2 sinyal ✅)
- `entity-grid-card:hover` → border 3px→5px + bg tint (2 sinyal ✅)
- Kaldırılan layout-shift hover: `hover:translate-x-1` (NewsFeaturedHero arrow)
- Opacity hover'lar → izinli (layout-safe)

### Signature element güçlendirildi
- `BentoLeaderTile`: `resolveTeamUiColor()` import eklendi
- Border-left + pulse dot → takım rengi dinamik
- Lider puanı 120px Bebas Neue — home'un tek "bağıran" öğesi

### prefers-reduced-motion coverage (doğrulandı ✅)
PageTransition, OdometerDigit, RaceCountdown, EntityDrawer, CircuitLapLine, AnimatedBar, GlossaryCard, MobileBottomNav

---

## Build
`npm run build` → 0 hata ✓

## Değişen dosyalar
- `docs/apex-production-plan-20-06-2026.md`
- `docs/README.md`
- `app/globals.css`
- `app/anthology/_components/StoryCard.tsx`
- `app/anthology/_components/RadioMomentCard.tsx`
- `app/anthology/[slug]/page.tsx`
- `app/circuits/page.tsx`
- `app/circuits/[id]/page.tsx`
- `app/news/page.tsx`
- `app/tech-glossary/page.tsx`
- `app/season/page.tsx`
- `app/season/[year]/round/[n]/page.tsx`
- `components/profile/RelatedNews.tsx`
- `components/ui/AssetFallback.tsx`
- `components/ui/NewsFeaturedHero.tsx`
- `components/home/BentoLeaderTile.tsx`
