import { describe, it, expect } from 'vitest';
import {
  buildSamples,
  lapMetrics,
  normaliseTrace,
  parseLapTime,
  safetyCarFlags,
  sectorBoundaries,
  slowPoints,
  type RawCarSample,
  type RawLocation,
} from '@/lib/telemetry/derive';
import { matchSessionByStart, pickPoleLap } from '@/lib/telemetry/select';
import type { TelemetrySample } from '@/lib/telemetry/types';

/**
 * Pure derivations of the track telemetry layer (master-plan 13.2), on
 * synthetic input. The data test recomputes stored files with the same code.
 */

const START = '2026-09-06T14:00:00.000Z';
const at = (ms: number) => new Date(Date.parse(START) + ms).toISOString();

function car(ms: number, speed: number, over: Partial<RawCarSample> = {}): RawCarSample {
  return { date: at(ms), speed, n_gear: 7, throttle: 100, brake: 0, ...over };
}

/** Sample with only the fields a test cares about. */
function s(tMs: number, kmh: number, over: { dM?: number; gear?: number; throttle?: number; brake?: 0 | 1 } = {}): TelemetrySample {
  return [tMs, over.dM ?? tMs, kmh, over.gear ?? 5, over.throttle ?? 50, over.brake ?? 0, 0, 0];
}

function speeds(values: number[]): TelemetrySample[] {
  return values.map((v, i) => s(i * 100, v, { dM: i * 10 }));
}

describe('parseLapTime', () => {
  it('reads minutes and seconds', () => {
    expect(parseLapTime('1:21.786')).toBe(81786);
  });
  it('reads seconds only', () => {
    expect(parseLapTime('58.123')).toBe(58123);
  });
});

describe('buildSamples', () => {
  it('integrates 360 km/h over 10 s to 1000 m', () => {
    const rows = Array.from({ length: 11 }, (_, i) => car(i * 1000, 360));
    const out = buildSamples(rows, [], START);
    expect(out[out.length - 1][1]).toBe(1000);
    expect(out[out.length - 1][0]).toBe(10_000);
  });

  it('clamps throttle and gear, and reduces brake to 0/1', () => {
    const out = buildSamples([car(0, 100, { throttle: 104, brake: 104, n_gear: 9 }), car(500, 100, { throttle: -1, brake: 0 })], [], START);
    expect(out[0][4]).toBe(100);
    expect(out[0][5]).toBe(1);
    expect(out[0][3]).toBe(8);
    expect(out[1][4]).toBe(0);
    expect(out[1][5]).toBe(0);
  });

  it('sorts by date and takes the nearest location in time', () => {
    const loc: RawLocation[] = [
      { date: at(0), x: 0, y: 0 },
      { date: at(900), x: 100, y: 50 },
    ];
    const out = buildSamples([car(1000, 200), car(0, 200)], loc, START);
    expect(out.map((r) => r[0])).toEqual([0, 1000]);
    expect([out[0][6], out[0][7]]).toEqual([0, 750]);
    expect([out[1][6], out[1][7]]).toEqual([1000, 250]);
  });
});

describe('lapMetrics', () => {
  it('weights full throttle and braking by duration, not sample count', () => {
    const samples = [
      s(0, 300, { throttle: 100 }),
      s(3000, 200, { throttle: 0, brake: 1 }),
      s(3500, 150, { throttle: 98 }),
      s(4000, 160, { throttle: 50 }),
    ];
    const m = lapMetrics(samples);
    expect(m.fullThrottlePct).toBe(87.5);
    expect(m.brakingPct).toBe(12.5);
    expect(m.topSpeedKmh).toBe(300);
    expect(m.minSpeedKmh).toBe(150);
    expect(m.lapLengthM).toBe(4000);
  });

  it('counts gear steps and ignores steps into or out of neutral', () => {
    const gears = [8, 7, 6, 5, 4, 3];
    expect(lapMetrics(gears.map((g, i) => s(i, 100, { gear: g }))).gearShiftSteps).toBe(5);
    expect(lapMetrics([8, 3].map((g, i) => s(i, 100, { gear: g }))).gearShiftSteps).toBe(5);
    expect(lapMetrics([3, 0, 3].map((g, i) => s(i, 100, { gear: g }))).gearShiftSteps).toBe(0);
  });
});

describe('sectorBoundaries', () => {
  it('interpolates distance between two samples', () => {
    const samples = [s(0, 100, { dM: 0 }), s(1000, 100, { dM: 100 }), s(2000, 100, { dM: 300 }), s(3000, 100, { dM: 600 })];
    expect(sectorBoundaries(samples, 500, 2000)).toEqual([50, 450]);
  });
});

describe('slowPoints', () => {
  it('finds a 300 → 80 → 300 corner', () => {
    const out = slowPoints(speeds([300, 200, 80, 200, 300]));
    expect(out).toHaveLength(1);
    expect(out[0].kmh).toBe(80);
    expect(out[0].dM).toBe(20);
  });

  it('ignores a 10 km/h dip', () => {
    expect(slowPoints(speeds([300, 295, 290, 295, 300]))).toEqual([]);
  });

  it('ignores a minimum at the lap edge with no rise on one side', () => {
    expect(slowPoints(speeds([80, 150, 300]))).toEqual([]);
    expect(slowPoints(speeds([300, 150, 80]))).toEqual([]);
  });

  it('takes the first index on a tie and sorts by distance', () => {
    const out = slowPoints(speeds([300, 90, 90, 300, 100, 300]));
    expect(out.map((p) => [p.dM, p.kmh])).toEqual([
      [10, 90],
      [40, 100],
    ]);
  });
});

describe('normaliseTrace', () => {
  it('fits the long side to the box, keeps aspect ratio, flips y and centres', () => {
    const out = normaliseTrace([
      { x: 0, y: 0 },
      { x: 200, y: 100 },
    ]);
    expect(out).toEqual([
      { x: 0, y: 750 },
      { x: 1000, y: 250 },
    ]);
  });

  it('honours a custom box', () => {
    const out = normaliseTrace(
      [
        { x: 10, y: 0 },
        { x: 10, y: 40 },
      ],
      100,
    );
    expect(out).toEqual([
      { x: 50, y: 100 },
      { x: 50, y: 0 },
    ]);
  });
});

describe('safetyCarFlags', () => {
  const sc = (message: string, category = 'SafetyCar') => ({ category, message });

  it('reads the four deployment messages', () => {
    expect(safetyCarFlags([sc('SAFETY CAR DEPLOYED')])).toEqual({ safetyCar: true, vsc: false });
    expect(safetyCarFlags([sc('SAFETY CAR DEPLOYED - TURN 4')])).toEqual({ safetyCar: true, vsc: false });
    expect(safetyCarFlags([sc('VSC DEPLOYED')])).toEqual({ safetyCar: false, vsc: true });
    expect(safetyCarFlags([sc('VIRTUAL SAFETY CAR DEPLOYED')])).toEqual({ safetyCar: false, vsc: true });
  });

  it('ignores other categories and non-deployment messages', () => {
    expect(safetyCarFlags([sc('SAFETY CAR LIGHTS ON', 'Other')])).toEqual({ safetyCar: false, vsc: false });
    expect(safetyCarFlags([sc('SAFETY CAR DEPLOYED', 'Other'), sc('SAFETY CAR IN THIS LAP'), { category: null, message: null }])).toEqual({
      safetyCar: false,
      vsc: false,
    });
  });
});

describe('matchSessionByStart', () => {
  const t0 = Date.parse(START);
  const sessions = [
    { id: 1, date_start: new Date(t0 + 60_000).toISOString(), is_cancelled: true },
    { id: 2, date_start: new Date(t0 + 3_600_000).toISOString() },
    { id: 3, date_start: new Date(t0 - 2 * 3_600_000).toISOString() },
  ];

  it('picks the nearest non-cancelled session', () => {
    expect(matchSessionByStart(sessions, t0)?.id).toBe(2);
  });

  it('returns null outside the tolerance', () => {
    expect(matchSessionByStart(sessions, t0 + 10 * 3_600_000)).toBeNull();
    expect(matchSessionByStart(sessions, t0, 30 * 60_000)).toBeNull();
  });
});

describe('pickPoleLap', () => {
  const lap = (n: number, d: number | null, pitOut = false, driver = 10) => ({
    lap: n,
    driver_number: driver,
    lap_duration: d,
    is_pit_out_lap: pitOut,
  });

  it('matches within 1.5 ms and rejects beyond', () => {
    expect(pickPoleLap([lap(1, 81.7875)], 10, 81786)?.lap).toBe(1);
    expect(pickPoleLap([lap(1, 81.7876)], 10, 81786)).toBeNull();
  });

  it('skips pit-out laps, other cars and null durations, and takes the closest', () => {
    const laps = [lap(1, 81.786, true), lap(2, 81.786, false, 44), lap(3, null), lap(4, 81.787), lap(5, 81.7865)];
    expect(pickPoleLap(laps, 10, 81786)?.lap).toBe(5);
  });
});
