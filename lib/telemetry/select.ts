/**
 * Pure selection helpers for the telemetry build (master-plan 13.2/13.3): match
 * a Jolpica race to its OpenF1 session, find the pole lap by time and car, and
 * reject a built lap that fails the plausibility gates.
 */

import type { LapMetrics } from './types';

/** Integrated lap length must be within this share of `CIRCUIT_FACTS` length (DECISIONS 2026-10-28 "13.3 Suzuka"). */
export const TELEMETRY_LENGTH_TOLERANCE = 0.03;
/** Share of lap time on the brake above which the lap's channels are treated as broken. */
export const TELEMETRY_MAX_BRAKING_PCT = 35;
/** How many seasons back a circuit may fall back when its newest pole lap fails a gate. */
export const TELEMETRY_FALLBACK_SEASONS = 2;

/** Why a built lap fails a plausibility gate, or null when it passes both. No facts length: length gate not applied. */
export function implausibleLap(
  metrics: Pick<LapMetrics, 'lapLengthM' | 'brakingPct'>,
  factsLengthKm: number | undefined,
): string | null {
  if (factsLengthKm) {
    const share = (metrics.lapLengthM - factsLengthKm * 1000) / (factsLengthKm * 1000);
    if (Math.abs(share) > TELEMETRY_LENGTH_TOLERANCE) {
      return `length ${share >= 0 ? '+' : ''}${(share * 100).toFixed(1)}% vs facts`;
    }
  }
  if (metrics.brakingPct > TELEMETRY_MAX_BRAKING_PCT) {
    return `brakingPct ${metrics.brakingPct} > ${TELEMETRY_MAX_BRAKING_PCT}`;
  }
  return null;
}

export interface GateResult<C, T> {
  chosen: { candidate: C; lap: T } | null;
  rejected: { candidate: C; reason: string }[];
}

/**
 * Builds candidates in order (newest season first) and returns the first lap
 * that passes the gates, with every gate rejection before it. Errors from
 * `build` are not caught: they end the circuit as before.
 */
export async function firstPlausibleLap<C, T extends { metrics: Pick<LapMetrics, 'lapLengthM' | 'brakingPct'> }>(
  candidates: readonly C[],
  build: (candidate: C) => Promise<T>,
  factsLengthKm: number | undefined,
): Promise<GateResult<C, T>> {
  const rejected: GateResult<C, T>['rejected'] = [];
  for (const candidate of candidates) {
    const lap = await build(candidate);
    const reason = implausibleLap(lap.metrics, factsLengthKm);
    if (reason === null) return { chosen: { candidate, lap }, rejected };
    rejected.push({ candidate, reason });
  }
  return { chosen: null, rejected };
}

/** The non-cancelled session whose start is nearest to `startMs`, within `toleranceMs`. */
export function matchSessionByStart<T extends { date_start: string; is_cancelled?: boolean }>(
  sessions: T[],
  startMs: number,
  toleranceMs = 6 * 3_600_000,
): T | null {
  let best: T | null = null;
  let bestDiff = Infinity;
  for (const s of sessions) {
    if (s.is_cancelled) continue;
    const diff = Math.abs(Date.parse(s.date_start) - startMs);
    if (!Number.isFinite(diff) || diff > toleranceMs) continue;
    if (diff < bestDiff) {
      best = s;
      bestDiff = diff;
    }
  }
  return best;
}

/**
 * That car's lap whose duration is within 1.5 ms of the official pole time and
 * is not a pit-out lap; the closest one when several match.
 */
export function pickPoleLap<T extends { driver_number: number; lap_duration: number | null; is_pit_out_lap: boolean }>(
  laps: T[],
  carNumber: number,
  poleTimeMs: number,
): T | null {
  let best: T | null = null;
  let bestDiff = Infinity;
  for (const lap of laps) {
    if (lap.driver_number !== carNumber || lap.is_pit_out_lap || lap.lap_duration === null) continue;
    const diff = Math.abs(lap.lap_duration * 1000 - poleTimeMs);
    if (diff <= 1.5 && diff < bestDiff) {
      best = lap;
      bestDiff = diff;
    }
  }
  return best;
}
