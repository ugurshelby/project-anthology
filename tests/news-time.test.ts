import { describe, expect, it } from 'vitest';
import { formatDispatchAge } from '@/lib/news/time';

describe('formatDispatchAge', () => {
  const now = Date.parse('2026-09-03T12:00:00Z');

  it('returns JUST IN for very fresh items', () => {
    expect(formatDispatchAge(now - 30_000, now)).toBe('JUST IN');
  });

  it('formats hours', () => {
    expect(formatDispatchAge(now - 5 * 3600_000, now)).toBe('5 HOURS AGO');
    expect(formatDispatchAge(now - 3600_000, now)).toBe('1 HOUR AGO');
  });

  it('formats days under two weeks', () => {
    expect(formatDispatchAge(now - 2 * 24 * 3600_000, now)).toBe('2 DAYS AGO');
  });
});
