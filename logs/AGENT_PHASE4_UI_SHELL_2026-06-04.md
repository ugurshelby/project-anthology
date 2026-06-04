# AGENT_PHASE4_UI_SHELL — 2026-06-04

## Summary
Phase 4 core UI shell: design tokens in `globals.css`, `next/font` layout, navigation, atmospheric hero, Framer Motion page transitions, RSC pages reading Supabase/fallback data, and safe image loading.

## Done
- **app/globals.css** — Tailwind v4 `@theme`: Bebas/Barlow/Inter/IBM Plex Mono, accent `#ff1801`, surface/card/border tokens, `--radius: 0`, carbon grid, nav/mobile-nav/shimmer/hero/section/card CSS.
- **app/layout.tsx** — Google fonts as CSS variables; `SiteNav`, `PageTransition`, `MobileBottomNav`.
- **components/ui/** — `SiteNav`, `MobileBottomNav`, `ShimmerSkeleton`/`ShimmerGrid`, `AtmosphericHero` (layer stack per DESIGN_SYSTEM), `SafeImage`, `SectionDivider`.
- **components/providers/PageTransition.tsx** — `#ff1801` sweep via Framer Motion; `useReducedMotion` → instant swap.
- **Pages (RSC)** — `/` hub (standings top 5, race countdown, news x6), `/season`, `/circuits` (24 SVGs), `/radio`, `/news`.
- **lib/f1/mrdata.ts** — calendar/standings parsers, countdown helper.
- **lib/data/radio.ts** — published `radio_moments` query.
- **lib/circuits-public.ts** — 24 circuit SVG manifest.
- **public/placeholder.svg** — fallback when assets missing.
- **framer-motion** added to dependencies.

## Files created/changed
| Path | Action |
|------|--------|
| app/globals.css | Rewritten |
| app/layout.tsx | Rewritten |
| app/page.tsx | Rewritten |
| app/season/page.tsx | Created |
| app/circuits/page.tsx | Created |
| app/radio/page.tsx | Created |
| app/news/page.tsx | Created |
| components/ui/*.tsx | Created |
| components/providers/PageTransition.tsx | Created |
| lib/f1/mrdata.ts | Created |
| lib/data/radio.ts | Created |
| lib/circuits-public.ts | Created |
| public/placeholder.svg | Created |
| package.json / package-lock.json | framer-motion |
| plans/project-anthology-masterplan.md | Phase 1 token + Phase 4 checkboxes |

## Commands
```bash
npm install framer-motion
npm run build   # exit 0 (~253s)
```

## Build result
- **Status:** SUCCESS (exit 0)
- **Routes:** `/`, `/season`, `/circuits`, `/radio`, `/news` static; cron/API dynamic.
- **Runtime notes:** Build-time Supabase reads succeeded for news/radio; some F1 snapshots fell back to Jolpica proxy when DB rows empty (expected before cron/seed).

## Issues / follow-ups
- Driver SVG paths use Ergast `code` lowercased (`/drivers/{code}.svg`); mismatched codes show placeholder (by design).
- News external images may need `images.remotePatterns` in `next.config.ts` when domains are known (SafeImage still degrades to placeholder).
- Page transition overlay is visual-only; tune timing if UX feels heavy.
- **Next:** Phase 6 anthology/glossary or Phase 3 remaining tests/migration-source (Claude).
