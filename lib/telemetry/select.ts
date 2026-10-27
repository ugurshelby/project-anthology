/**
 * Pure selection helpers for the telemetry build (master-plan 13.2): match a
 * Jolpica race to its OpenF1 session, and find the pole lap by time and car.
 */

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
