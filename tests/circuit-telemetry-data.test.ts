import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { TELEMETRY_LOADERS } from '@/data/circuits/telemetry';
import { CIRCUIT_FACTS } from '@/data/circuits/facts';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { lapMetrics, sectorBoundaries, slowPoints } from '@/lib/telemetry/derive';
import { isCircuitTelemetry } from '@/lib/telemetry/types';

/**
 * No-invented-data gate for the committed track telemetry (master-plan 13.2,
 * DECISIONS 2026-10-21 "13.1"): every stored value must follow from the stored
 * OpenF1 samples, and the samples must look like a real lap.
 */

const DIR = join(process.cwd(), 'data', 'circuits', 'telemetry');
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();

describe('circuit telemetry index', () => {
  it('lists exactly the JSON files present', () => {
    expect(Object.keys(TELEMETRY_LOADERS).sort()).toEqual(files.map((f) => f.slice(0, -'.json'.length)));
  });
});

describe.each(files)('%s', (file) => {
  const id = file.slice(0, -'.json'.length);
  const data: unknown = JSON.parse(readFileSync(join(DIR, file), 'utf8'));

  it('has the CircuitTelemetry shape and a complete source', () => {
    expect(isCircuitTelemetry(data)).toBe(true);
    if (!isCircuitTelemetry(data)) return;
    expect(data.circuitId).toBe(id);
    const src = data.source;
    expect(src.provider).toBe('OpenF1');
    expect(src.year).toBeGreaterThanOrEqual(2023);
    expect(src.year).toBeLessThanOrEqual(CURRENT_SEASON);
    expect(src.raceName).not.toBe('');
    expect(src.driverId).not.toBe('');
    expect(src.driverCode).not.toBe('');
    expect(src.lapTime).not.toBe('');
    expect(src.fetchedAt).not.toBe('');
    expect(Number.isNaN(Date.parse(src.fetchedAt))).toBe(false);
    for (const n of [src.round, src.sessionKey, src.meetingKey, src.driverNumber, src.lapNumber, src.lapDurationMs]) {
      expect(n).toBeGreaterThan(0);
    }
  });

  it('stores metrics that recompute from its samples', () => {
    if (!isCircuitTelemetry(data)) throw new Error('invalid file');
    expect(data.metrics).toEqual(lapMetrics(data.samples));
    expect(data.sectors.boundariesM).toEqual(sectorBoundaries(data.samples, data.sectors.s1Ms, data.sectors.s2Ms));
    expect(data.slowPoints).toEqual(slowPoints(data.samples));
  });

  it('spans the lap and matches the official length', () => {
    if (!isCircuitTelemetry(data)) throw new Error('invalid file');
    const last = data.samples[data.samples.length - 1];
    expect(Math.abs(last[0] - data.source.lapDurationMs)).toBeLessThanOrEqual(1500);
    const km = CIRCUIT_FACTS[id]?.lengthKm;
    if (km) {
      expect(Math.abs(data.metrics.lapLengthM - km * 1000) / (km * 1000)).toBeLessThanOrEqual(0.03);
    }
  });

  it('has monotonic time and distance and values in range', () => {
    if (!isCircuitTelemetry(data)) throw new Error('invalid file');
    data.samples.forEach((s, i) => {
      const [tMs, dM, kmh, gear, throttle] = s;
      if (i > 0) {
        expect(tMs).toBeGreaterThanOrEqual(data.samples[i - 1][0]);
        expect(dM).toBeGreaterThanOrEqual(data.samples[i - 1][1]);
      }
      expect(kmh).toBeGreaterThanOrEqual(0);
      expect(kmh).toBeLessThanOrEqual(400);
      expect(gear).toBeGreaterThanOrEqual(0);
      expect(gear).toBeLessThanOrEqual(8);
      expect(throttle).toBeGreaterThanOrEqual(0);
      expect(throttle).toBeLessThanOrEqual(100);
    });
    const [b1, b2] = data.sectors.boundariesM;
    expect(b1).toBeGreaterThan(0);
    expect(b1).toBeLessThan(b2);
    expect(b2).toBeLessThan(data.metrics.lapLengthM);
  });
});

if (files.length === 0) {
  describe('circuit telemetry data', () => {
    it('has an empty loader map when no file exists', () => {
      expect(TELEMETRY_LOADERS).toEqual({});
    });
  });
}
