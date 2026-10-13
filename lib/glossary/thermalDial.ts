/**
 * Geometry and zones for the tyre thermal dial (components/glossary/TyreThermalWindows.tsx).
 * The dial sweeps 270°, from bottom-left (135°, SVG angles: 0° = +x, clockwise)
 * round the top to bottom-right; the 90° gap at the bottom is not part of the scale.
 */
export const T_MIN = 70;
export const T_MAX = 150;
export const SWEEP = 270;
export const START_DEG = 135;

/** Degrees along the sweep (0…270) for a temperature, clamped to the scale. */
export const uOf = (t: number) => ((Math.min(T_MAX, Math.max(T_MIN, t)) - T_MIN) / (T_MAX - T_MIN)) * SWEEP;

/** Temperature for a position along the sweep. */
export const tOf = (u: number) => T_MIN + (u / SWEEP) * (T_MAX - T_MIN);

/** Point on a circle of radius `r` around (`c`, `c`) at sweep position `u`. */
export function pointAt(u: number, r: number, c: number) {
  const a = ((START_DEG + u) * Math.PI) / 180;
  return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
}

/**
 * Temperature under a pointer at (`dx`, `dy`) from the dial centre. A pointer in
 * the open gap at the bottom snaps to the nearer end of the scale.
 */
export function tempAtOffset(dx: number, dy: number): number {
  let rel = ((Math.atan2(dy, dx) * 180) / Math.PI - START_DEG + 720) % 360;
  if (rel > SWEEP) rel = rel > SWEEP + (360 - SWEEP) / 2 ? 0 : SWEEP;
  return tOf(rel);
}

export type ThermalZone = 'cold' | 'optimal' | 'peak' | 'hot';

/** Where a temperature sits for a compound window; within 2°C of the peak counts as peak grip. */
export function zoneOf(t: number, w: { windowMinC: number; windowMaxC: number; peakC: number }): ThermalZone {
  if (t < w.windowMinC) return 'cold';
  if (t > w.windowMaxC) return 'hot';
  return Math.abs(t - w.peakC) <= 2 ? 'peak' : 'optimal';
}
