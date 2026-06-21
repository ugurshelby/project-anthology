---
name: Apex Narrative
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e9bcb5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#af8781'
  outline-variant: '#5e3f3a'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690000'
  primary-container: '#dc0000'
  on-primary-container: '#ffece9'
  inverse-primary: '#c00000'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#b4c5ff'
  on-tertiary: '#002a77'
  tertiary-container: '#0060f9'
  on-tertiary-container: '#edefff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea7'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-hero:
    fontFamily: Barlow Condensed
    fontSize: 120px
    fontWeight: '700'
    lineHeight: 110px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Barlow Condensed
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max: 1440px
---

## Brand & Style

The design system is engineered to evoke the high-stakes, precision-oriented world of Formula 1. It adopts a **Cinematic Editorial** style, blending the immersive atmosphere of a premium sports documentary with the technical rigor of a race engineer's telemetry dashboard.

The aesthetic leans heavily into **Minimalism** and **Glassmorphism**, using vast amounts of negative space to allow high-resolution photography and critical data points to breathe. The emotional response is one of focused intensity—calm, authoritative, and sophisticated. It avoids typical "loud" sports tropes, opting instead for a "dark mode" environment that prioritizes legibility and visual hierarchy through tonal depth rather than excessive color.

## Colors

The palette is strictly controlled to maintain a premium, data-centric focus. 

- **The Void (#0A0A0A):** The primary background, providing a deep, infinite canvas that makes imagery and text pop.
- **Surface (#141414):** Used for card containers and structural elements to create a subtle lift from the background.
- **Apex Red (#DC0000):** A high-energy accent reserved exclusively for critical indicators: live status, fastest laps, record-breaking stats, and primary calls to action.
- **Typography & UI:** Functional elements use a scale of neutral greys (from #666666 for labels to #FFFFFF for headings) to ensure a clear information hierarchy without visual fatigue.

## Typography

This design system utilizes a tri-font strategy to balance impact with technical clarity.

- **Headlines:** Barlow Condensed provides the "speed" and verticality associated with racing liveries. It should be used for large hero numbers (lap times, positions) and section titles.
- **Body:** Inter provides a neutral, highly legible foundation for long-form storytelling and editorial analysis.
- **Technical Data:** JetBrains Mono is utilized for all "active" data points, such as intervals, sector times, and coordinates. The monospaced nature ensures that numbers do not jump or jitter during live updates.

## Layout & Spacing

The layout is governed by a **12-column Bento Grid** system. This allows for modular data "bricks" that can scale in complexity while maintaining a cohesive look.

- **Desktop:** 12 columns with 24px gutters. Content is often grouped into large editorial blocks (8 columns) and secondary stats (4 columns).
- **Tablet:** 8 columns with 20px gutters.
- **Mobile:** 4 columns with 16px gutters.
- **Rhythm:** All spacing (padding, margins) follows a 4px baseline grid to ensure mathematical alignment of technical data.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism** rather than traditional shadows.

1.  **Base Layer:** The deepest level (#0A0A0A).
2.  **Raised Surface:** Bento cards use #141414 with a 1px "hairline" border in #262626. This creates a sharp, machined look.
3.  **Floating Elements:** Global headers and hero overlays use a frosted glass effect (Backdrop Blur: 20px, Opacity: 60% of #141414) to maintain context of the content beneath.
4.  **Shadows:** When used, shadows must be extremely soft and "ambient"—large blur (32px+), low opacity (15%), and no offset, mimicking the diffused glow of a high-end monitor.

## Shapes

The shape language is "Soft-Tech." While F1 is a world of sharp aerodynamics, the UI utilizes a consistent **16px (rounded-lg)** corner radius for cards and major containers to feel approachable and modern. Smaller elements like buttons and chips follow a **8px (standard)** radius to maintain a precise, engineered feel.

## Components

- **Bento Cards:** The core container. Must feature a hairline border (#262626) and 16px corner radius. Internal padding should be a generous 24px or 32px.
- **Action Buttons:** Primary buttons are Solid White with Black text for maximum contrast. Secondary actions use the ghost style (hairline border, no fill).
- **Data Chips:** Small, pill-shaped indicators using JetBrains Mono. For example, "L5/56" or "SOFT TYRE" should be enclosed in a low-contrast grey stroke.
- **Live Indicators:** A pulsing 8px dot using Apex Red (#DC0000) paired with the "LIVE" label in JetBrains Mono.
- **Interactive Lists:** Used for driver standings. Each row should have a subtle hover state that lifts the background to #1C1C1C and reveals an Apex Red accent bar on the far left.
- **Inputs:** Dark, recessed fields with a 1px border. Focus state should change the border color to White, never Red (Red is for data/errors only).