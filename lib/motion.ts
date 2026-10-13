/**
 * Shared spring presets (docs/design/apex-design.md §6). New motion code uses
 * these instead of ad-hoc durations so every spring in Apex feels the same.
 * Under `prefers-reduced-motion` callers jump to the target instead.
 */
export const APEX_MOTION = {
  spring: { type: 'spring', mass: 0.8, stiffness: 200, damping: 25 },
  snappy: { type: 'spring', mass: 0.6, stiffness: 280, damping: 30 },
  reduced: { duration: 0.01 },
} as const;

/** Same presets in the shape `useSpring` takes (no `type`). */
export const APEX_SPRING = { mass: 0.8, stiffness: 200, damping: 25 } as const;
export const APEX_SPRING_SNAPPY = { mass: 0.6, stiffness: 280, damping: 30 } as const;
