/**
 * Normalize telemetry frame type for APEX dataviz.
 * Aligned with the f1-race-replay reference schema (R1) from docs/apex-production-plan.
 * Current fields: what OpenF1 / our snapshots can provide today.
 * Faz 6 (live telemetry): extend speed, gear, drs, throttle fields.
 */

/** A single telemetry data point for a driver at a moment in time. */
export interface TelemetryFrame {
  /** Driver three-letter code (e.g. "VER") */
  driverCode: string;
  /** Constructor name (e.g. "Red Bull Racing") */
  constructorName: string;
  /** Relative distance along the track: 0.0–1.0 */
  relativeDistance: number;

  // ── Fields available today (from race results snapshots) ──────────
  /** Grid position at race start */
  gridPosition?: number;
  /** Finishing position */
  finishPosition?: number;
  /** Points scored in this session */
  points?: number;
  /** Tyre compound used in last stint (from stint data if available) */
  tyre?: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | string;

  // ── Faz 6 extensions (live/replay, not yet wired) ──────────────────
  /** Speed in km/h — live telemetry only */
  speed?: number;
  /** Gear (1–8) — live telemetry only */
  gear?: number;
  /** DRS active — live telemetry only */
  drs?: boolean;
  /** Throttle 0–100 — live telemetry only */
  throttle?: number;

  // ── Session context ────────────────────────────────────────────────
  /** Track status: 1=clear, 2=yellow, 4=SC, 5=VSC, 6=red */
  trackStatus?: number;
  /** Air temperature °C */
  airTempC?: number;
  /** Track temperature °C */
  trackTempC?: number;
  /** Rainfall boolean */
  rain?: boolean;
}

/** Weather snapshot for a session (aligns with f1-race-replay R7 field set). */
export interface SessionWeather {
  airTempC: number;
  trackTempC: number;
  humidityPct: number;
  windKmh: number;
  rain: boolean;
}
