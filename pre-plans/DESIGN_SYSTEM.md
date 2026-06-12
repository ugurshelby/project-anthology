# Frontend Design System

This document is the single source of truth for frontend decisions in this project.

Usage rule: every frontend agent reads this file first before any frontend work.

## Typography

- Display/hero titles: Bebas Neue, letter-spacing `0.04em`, line-height `0.88`
- Subheadings/nav/labels: Barlow Condensed, letter-spacing `0.12-0.2em`, uppercase
- Body text: Inter, font-weight `300-400`, line-height `1.7`
- Data/stats/mono: IBM Plex Mono, letter-spacing `0.05em`
- Scale: hero `clamp(3rem,12vw,8rem)`, section `2.5rem`, card `1.3rem`, body `1rem`

## Navbar

- Fixed top, `52px` height, `z-index: 100`
- Default state: background transparent, `backdrop-filter: blur(8px)`, border-bottom `0.5px solid rgba(255,255,255,0.06)`
- Hover/scroll state: background `rgba(10,10,10,0.92)`, `backdrop-filter: blur(16px)`, border-bottom `2px solid #ff1801`
- Transition: background `300ms ease`, border `300ms ease`
- Brand (center, links Home): inline chevron mark + "APEX" wordmark, laid out in a row with `6px` gap
  - Wordmark: "APEX" Bebas Neue `22px`, `letter-spacing 0.08em`, color `#ffffff`
  - Chevron mark: nested right-pointing arrows, inline SVG `14×18px` (`viewBox="0 0 14 18"`), `stroke-width 2.5px`, rounded caps/joins
    - Front arrow (`M0,16 L8,9 L0,2`): `#ff1801`
    - Back arrow (`M6,16 L14,9 L6,2`): `#ffffff` at `opacity 0.35`
- Center-right: nav links Barlow Condensed `11px` uppercase `tracking-[0.12em]`
- Active link: color white + `4px` red dot below via `::after`
- Far right: hamburger (3 lines, `18px`, `1.5px` each)
- Mobile: brand center, hamburger left, no inline links

## Cards

- Background: `#141414`
- Full-bleed image top half (`object-fit: cover`, `aspect-ratio: 16/9`)
- Dark gradient overlay on image: transparent `30%` -> `rgba(0,0,0,0.85) 100%`
- Category label: IBM Plex Mono `9px` red/70 uppercase
- Title: Bebas Neue `1.3rem` over image bottom-left
- In-place expand on click: slides down `300ms cubic-bezier(0.77,0,0.18,1)`
- Expanded content: Inter `12px` weight `300`, story excerpt 2-3 lines, + "READ STORY ->" Barlow Condensed `10px` red link
- Border-left: `3px solid #ff1801`, grows to `6px` on hover
- No shadows, no border-radius

## Page Transitions

- Red sweep: `#ff1801` band slides left->right (`250ms ease-in`), page swaps, band exits right->off (`250ms ease-out`)
- Total duration: `500ms`
- Implement via Framer Motion AnimatePresence with custom variant
- `prefers-reduced-motion`: instant swap, no animation

## Color System

- Background: `#0a0a0a` + `45deg` carbon grid `repeating-linear-gradient(45deg,rgba(255,255,255,0.018) 0 1px,transparent 1px 9px)`
- Surface: `#131313`
- Card: `#141414`
- Accent: `#ff1801` only
- Text primary: `#f4f1ea` (warm off-white)
- Text muted: `rgba(244,241,234,0.5)`
- Border default: `rgba(255,255,255,0.07)`
- Border hover: `rgba(255,255,255,0.14)`

## Atmospheric Hero Layers (ordered stack)

Order bottom->top:

1. background `#0a0a0a` + carbon grid
2. radial-gradient spotlight left: `20% 0%`, `rgba(255,255,255,0.05)->transparent`
3. radial-gradient spotlight right: `80% 0%`, `rgba(255,255,255,0.04)->transparent`
4. radial-gradient red glow bottom: `50% 100%`, `rgba(255,24,1,0.12)->transparent`
5. film grain: SVG `feTurbulence`, opacity `0.04`, `mix-blend-mode: overlay`
6. animated light streak: horizontal blurred band, `8s` infinite drift
7. content (eyebrow + title + subtitle + HUD)

## Spacing

- Max content width: `1180px` centered
- Section gap: `80px` desktop, `48px` mobile
- Card padding: `24px`
- Card grid gap: `16px`
- Navbar height offset: `52px`

## Section Dividers

- Barlow Condensed `13px` uppercase `tracking-[0.2em]` color paper
- Below: `2px x 40px` block `#ff1801`
- Left-aligned always

## Shimmer Skeleton

- Background: `linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)`
- Background-size: `200%`
- Animation: shimmer `1.5s` infinite (shifts background-position)
- `border-radius: 0`

## Mobile Bottom Nav

- Fixed bottom, `64px` height (`--mobile-nav-height`), background `#0a0a0a`
- Border-top: `0.5px solid rgba(255,255,255,0.08)`
- Touch targets: minimum `44px` per item
- 5 items: Home (`/`) / Season (`/season`) / Circuits (`/circuits`) / Anthology (`/anthology`) / More
- Active: `4px` red dot above icon + label `#ff1801`
- More: popup drawer above bar — News (`/news`), Glossary (`/tech-glossary`)
- Hidden on desktop (`lg+`, `min-width: 1024px`)
- Main content: `padding-bottom: var(--mobile-nav-height)` on viewports where the bar is visible
- `prefers-reduced-motion`: drawer open/close without slide animation (instant swap)

## Mobile Top Nav (paired with bottom nav)

- Below `lg`: inline desktop links hidden; brand centered; hamburger left (`44px` touch target)
- Hamburger menu: same secondary routes as More drawer (News, Glossary)
- Desktop (`lg+`): full inline link row flanking centered brand; no hamburger; no bottom nav

## Implementation Notes

- Respect `prefers-reduced-motion`: disable non-essential motion and use instant state swaps where defined
- No radius/shadow on core card and skeleton surfaces
- Accent-only rule: use `#ff1801` as the only accent color
