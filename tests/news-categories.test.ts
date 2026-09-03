import { describe, expect, it } from 'vitest';
import {
  classifyNewsCategory,
  detectTeamTag,
  estimateReadMinutes,
  formatWireTime,
} from '@/lib/news/categories';

describe('classifyNewsCategory', () => {
  it('detects driver market stories', () => {
    expect(classifyNewsCategory('Norris close to new McLaren contract extension')).toBe(
      'driver-market',
    );
  });

  it('detects tech upgrades', () => {
    expect(classifyNewsCategory('Ferrari new floor upgrade confirmed for Monza FP1')).toBe('tech');
  });

  it('detects race recaps', () => {
    expect(classifyNewsCategory('Verstappen wins Dutch Grand Prix after late Safety Car')).toBe(
      'race-recaps',
    );
  });

  it('detects paddock rumors', () => {
    expect(classifyNewsCategory('Paddock rumour: Alpine reviewing team principal role')).toBe(
      'paddock',
    );
  });

  it('falls back to breaking for generic headlines', () => {
    expect(classifyNewsCategory('FIA confirms calendar update for 2027')).toBe('breaking');
  });
});

describe('detectTeamTag', () => {
  it('extracts Ferrari from title', () => {
    expect(detectTeamTag('Ferrari unveils livery for Italian GP')).toBe('FERRARI');
  });

  it('returns null when no team mentioned', () => {
    expect(detectTeamTag('FIA updates stewards guidelines')).toBeNull();
  });
});

describe('estimateReadMinutes', () => {
  it('clamps to a sensible editorial range', () => {
    expect(estimateReadMinutes('Short.')).toBeGreaterThanOrEqual(2);
    expect(estimateReadMinutes('word '.repeat(400))).toBeLessThanOrEqual(8);
  });
});

describe('formatWireTime', () => {
  it('formats UTC clock', () => {
    const ts = Date.UTC(2026, 8, 1, 14, 22, 0);
    expect(formatWireTime(ts)).toBe('14:22 UTC');
  });
});
