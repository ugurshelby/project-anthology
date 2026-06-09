# AGENT LOG — Visual Improvement Sprint

Tarih: 2026-06-09

## Bağlam

DESIGN_SYSTEM.md kurallarına uygun 5 görsel animasyon + paylaşılan hook altyapısı. Her özellik ayrı `feat:` commit; commit öncesi `npm run build` sıfır hata. Commit sırası risk bazlı (CSS-only önce, client dönüşüm/hydration riskli maddeler sonda).

## Commit özeti

| # | Commit | Dosyalar |
|---|--------|----------|
| 1 | `710e3f3` feat: hero slipstream lines | `AtmosphericHero.tsx`, `globals.css` |
| 2 | `6b77d53` feat: circuit lap line | `CircuitLapLine.tsx`, hook'lar, `globals.css`, `circuits/[id]/page.tsx` |
| 3 | `9580ce0` feat: calendar card tilt | `TiltCard.tsx`, `SeasonExplorer.tsx` |
| 4 | `579fca8` feat: constructor standings bar sweep | `AnimatedBar.tsx`, `BentoConstructorsTile.tsx`, `globals.css` |
| 5 | `d37746a` feat: countdown odometer flip | `FlipDigit.tsx`, `BentoCountdown.tsx` |

## 1. Hero slipstream lines

- Tek `hero-light-streak` → üç paralel çizgi (`hero-light-streak`, `-2`, `-3`)
- Çizgi 1: `#ff1801` %30, 2px, 8s
- Çizgi 2: beyaz %8, 1px, 11s, gecikme 2s, top +10px
- Çizgi 3: beyaz %5, 1px, 14s, gecikme 5s, top +20px
- `prefers-reduced-motion`: üç çizgi `display: none`

## 2. Circuit lap line

- `SafeImage` → `CircuitLapLine` (fetch + DOMParser + inline SVG)
- 24/24 pist SVG tek `<path>` — `querySelector('path')` güvenli
- `useInViewOnce` threshold 0.2 → `lapLine` 3s ease-in-out
- `getTotalLength()` ile stroke-dasharray/offset
- `will-change: stroke-dashoffset` animasyon süresince; `animationend`'de kaldır
- `prefers-reduced-motion`: offset direkt 0, animasyon yok
- Fetch hata → `SafeImage` fallback

### Paylaşılan hook'lar (`components/ui/`)

- `usePrefersReducedMotion.ts` — `useSyncExternalStore` + matchMedia
- `useInViewOnce.ts` — IntersectionObserver, bir kez tetikle
- `useWillChange.ts` — animasyon başı/sonu will-change yönetimi

## 3. Calendar card tilt

- `TiltCard` — perspective 600px, max ±8deg rotateX/Y
- `SeasonExplorer` race kartlarına uygulandı (Link + div varyantları)
- `prefers-reduced-motion`: mouse handler bağlanmaz
- `will-change: transform` yalnızca hover sırasında

## 4. Constructor standings bar sweep

- `AnimatedBarGroup` + `AnimatedBar` — `BentoConstructorsTile` RSC kaldı (leaf client child)
- `useInViewOnce` threshold 0.3 → `standings-bars-active` class
- Mobil: width 0 → `var(--bar-size)`; desktop: height 0 → `var(--bar-size)`
- Sıralı gecikme: `calc(var(--i) * 60ms)`; easing `cubic-bezier(0.77,0,0.18,1)` 800ms
- `prefers-reduced-motion`: `standings-bars-reduced` → transition none, anında final state
- Build: hydration mismatch yok

## 5. Countdown odometer flip

- `FlipDigit` — her rakam ayrı span, overflow hidden, 1em yükseklik
- Rakam değişince eski yukarı, yeni alttan iner; 300ms cubic-bezier
- `React.memo`; mounted gate ile ilk render'da flip yok (hydration güvenli)
- `prefers-reduced-motion`: anlık swap
- `BentoCountdown` full + compact variant

## Doğrulama

- `npm run build` — tüm commit'ler öncesi ve sprint sonu: **sıfır hata**
- TypeScript: geçti
- Static generation: 48/48 sayfa

## Değişen / yeni dosyalar

- `components/ui/AtmosphericHero.tsx`
- `components/ui/CircuitLapLine.tsx`
- `components/ui/TiltCard.tsx`
- `components/ui/AnimatedBar.tsx`
- `components/ui/FlipDigit.tsx`
- `components/ui/usePrefersReducedMotion.ts`
- `components/ui/useInViewOnce.ts`
- `components/ui/useWillChange.ts`
- `components/home/BentoConstructorsTile.tsx`
- `components/home/BentoCountdown.tsx`
- `components/season/SeasonExplorer.tsx`
- `app/circuits/[id]/page.tsx`
- `app/globals.css`
