/**
 * Pure derivations for the track telemetry layer (master-plan 13.2). No I/O:
 * the build script feeds OpenF1 rows in, and the data test recomputes the
 * stored metrics from the stored samples with these same functions.
 */

import type { LapMetrics, SlowPoint, TelemetrySample } from './types';

export interface RawCarSample {
  date: string;
  speed: number;
  n_gear: number;
  throttle: number;
  brake: number;
}

export interface RawLocation {
  date: string;
  x: number;
  y: number;
}

const T = 0;
const D = 1;
const KMH = 2;
const GEAR = 3;
const THROTTLE = 4;
const BRAKE = 5;
const X = 6;
const Y = 7;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** `"1:21.786"` → `81786`; `"58.123"` → `58123` (milliseconds). */
export function parseLapTime(s: string): number {
  const parts = s.trim().split(':');
  const seconds = Number(parts.pop());
  const minutes = parts.length > 0 ? Number(parts.pop()) : 0;
  const hours = parts.length > 0 ? Number(parts.pop()) : 0;
  const ms = Math.round(((hours * 60 + minutes) * 60 + seconds) * 1000);
  if (!Number.isFinite(ms)) throw new Error(`invalid lap time: ${s}`);
  return ms;
}

/**
 * Fits the points into a `box`×`box` square with one scale (longer side =
 * `box`), flips y for SVG, centres the shorter axis and rounds to integers.
 */
export function normaliseTrace(points: { x: number; y: number }[], box = 1000): { x: number; y: number }[] {
  if (points.length === 0) return [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const span = Math.max(w, h);
  const scale = span > 0 ? box / span : 0;
  const offX = (box - w * scale) / 2;
  const offY = (box - h * scale) / 2;
  return points.map((p) => ({
    x: Math.round((p.x - minX) * scale + offX),
    y: Math.round((maxY - p.y) * scale + offY),
  }));
}

/**
 * Turns OpenF1 `car_data` and `location` rows of one lap into samples:
 * time from lap start, distance by trapezoid integration of speed, clamped
 * channels, and the position of the nearest-in-time location row.
 */
export function buildSamples(car: RawCarSample[], loc: RawLocation[], lapStartIso: string): TelemetrySample[] {
  const startMs = Date.parse(lapStartIso);
  const cars = car
    .map((c) => ({ ...c, ms: Date.parse(c.date) }))
    .sort((a, b) => a.ms - b.ms);
  const locs = loc
    .map((l) => ({ ...l, ms: Date.parse(l.date) }))
    .sort((a, b) => a.ms - b.ms);

  const positions: { x: number; y: number }[] = [];
  let j = 0;
  for (const c of cars) {
    if (locs.length === 0) {
      positions.push({ x: 0, y: 0 });
      continue;
    }
    while (j + 1 < locs.length && Math.abs(locs[j + 1].ms - c.ms) <= Math.abs(locs[j].ms - c.ms)) j++;
    positions.push({ x: locs[j].x, y: locs[j].y });
  }
  const trace = normaliseTrace(positions);

  const samples: TelemetrySample[] = [];
  let distance = 0;
  for (let i = 0; i < cars.length; i++) {
    const c = cars[i];
    if (i > 0) {
      const prev = cars[i - 1];
      const dtS = (c.ms - prev.ms) / 1000;
      distance += ((prev.speed + c.speed) / 2 / 3.6) * dtS;
    }
    samples.push([
      Math.round(c.ms - startMs),
      Math.round(distance),
      c.speed,
      clamp(c.n_gear, 0, 8),
      clamp(c.throttle, 0, 100),
      c.brake > 0 ? 1 : 0,
      trace[i].x,
      trace[i].y,
    ]);
  }
  return samples;
}

/** Duration share (%, 1 decimal) of the intervals whose starting sample matches. */
function durationShare(samples: readonly TelemetrySample[], match: (s: TelemetrySample) => boolean): number {
  if (samples.length < 2) return 0;
  const total = samples[samples.length - 1][T] - samples[0][T];
  if (total <= 0) return 0;
  let hit = 0;
  for (let i = 0; i + 1 < samples.length; i++) {
    if (match(samples[i])) hit += samples[i + 1][T] - samples[i][T];
  }
  return Math.round((hit / total) * 1000) / 10;
}

export function lapMetrics(samples: readonly TelemetrySample[]): LapMetrics {
  let top = 0;
  let min = samples.length > 0 ? Infinity : 0;
  let steps = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (s[KMH] > top) top = s[KMH];
    if (s[KMH] < min) min = s[KMH];
    if (i > 0) {
      const g0 = samples[i - 1][GEAR];
      const g1 = s[GEAR];
      if (g0 >= 1 && g1 >= 1) steps += Math.abs(g1 - g0);
    }
  }
  return {
    lapLengthM: samples.length > 0 ? samples[samples.length - 1][D] : 0,
    topSpeedKmh: top,
    minSpeedKmh: min,
    fullThrottlePct: durationShare(samples, (s) => s[THROTTLE] >= 98),
    brakingPct: durationShare(samples, (s) => s[BRAKE] === 1),
    gearShiftSteps: steps,
  };
}

function distanceAt(samples: readonly TelemetrySample[], tMs: number): number {
  if (samples.length === 0) return 0;
  if (tMs <= samples[0][T]) return samples[0][D];
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    if (tMs <= b[T]) {
      const span = b[T] - a[T];
      const f = span > 0 ? (tMs - a[T]) / span : 0;
      return a[D] + (b[D] - a[D]) * f;
    }
  }
  return samples[samples.length - 1][D];
}

/** Distances (integer m) at the end of sector 1 and sector 2, linearly interpolated. */
export function sectorBoundaries(samples: readonly TelemetrySample[], s1Ms: number, s2Ms: number): [number, number] {
  return [Math.round(distanceAt(samples, s1Ms)), Math.round(distanceAt(samples, s1Ms + s2Ms))];
}

/**
 * Local speed minima: sample i counts when speed rises by `minRiseKmh` on both
 * sides and i is the slowest sample between those two rises (first index on a
 * tie). A minimum with no such rise on one side (lap edge) does not count.
 */
export function slowPoints(samples: readonly TelemetrySample[], minRiseKmh = 25): SlowPoint[] {
  const out: SlowPoint[] = [];
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i][KMH];
    const target = v + minRiseKmh;

    let left = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (samples[j][KMH] >= target) {
        left = j;
        break;
      }
    }
    if (left < 0) continue;

    let right = -1;
    for (let k = i + 1; k < samples.length; k++) {
      if (samples[k][KMH] >= target) {
        right = k;
        break;
      }
    }
    if (right < 0) continue;

    let isMin = true;
    for (let m = left; m <= right; m++) {
      const w = samples[m][KMH];
      if (w < v || (w === v && m < i)) {
        isMin = false;
        break;
      }
    }
    if (!isMin) continue;

    const s = samples[i];
    out.push({ dM: s[D], kmh: s[KMH], gear: s[GEAR], x: s[X], y: s[Y] });
  }
  return out.sort((a, b) => a.dM - b.dM);
}

/** Whether a race's OpenF1 `race_control` rows deployed the safety car or the VSC. */
export function safetyCarFlags(rows: { category: string | null; message: string | null }[]): {
  safetyCar: boolean;
  vsc: boolean;
} {
  let safetyCar = false;
  let vsc = false;
  for (const r of rows) {
    if (r.category !== 'SafetyCar' || !r.message) continue;
    const msg = r.message.trim().toUpperCase();
    if (msg.startsWith('SAFETY CAR DEPLOYED')) safetyCar = true;
    if (msg.startsWith('VSC DEPLOYED') || msg.startsWith('VIRTUAL SAFETY CAR DEPLOYED')) vsc = true;
  }
  return { safetyCar, vsc };
}
