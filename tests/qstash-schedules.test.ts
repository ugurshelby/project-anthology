import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  QSTASH_BUDGET_SHARE,
  QSTASH_FREE_LIMITS,
  QSTASH_SCHEDULES,
  buildScheduleRequest,
  runsPerDay,
  totalNormalMessagesPerDay,
  totalWorstCaseMessagesPerDay,
  worstCaseMessagesPerDay,
} from '@/lib/cron/qstashSchedules';

describe('runsPerDay', () => {
  it.each([
    ['*/5 * * * *', 288],
    ['*/10 * * * *', 144],
    ['*/30 * * * *', 48],
    ['11 * * * *', 24],
    ['0 6 * * *', 1],
    ['0,30 8-17 * * *', 20],
    ['15/20 * * * *', 3 * 24], // 15, 35, 55
  ])('%s fires %i times a day', (cron, runs) => {
    expect(runsPerDay(cron)).toBe(runs);
  });

  it('rejects what it cannot count instead of guessing', () => {
    expect(() => runsPerDay('0 6 * * 1')).toThrow(/minute\/hour/);
    expect(() => runsPerDay('* * * *')).toThrow(/5 fields/);
    expect(() => runsPerDay('61 * * * *')).toThrow();
    expect(() => runsPerDay('*/0 * * * *')).toThrow();
    expect(() => runsPerDay('a * * * *')).toThrow();
  });

  it('counts retries in the worst case', () => {
    expect(worstCaseMessagesPerDay({ cron: '*/30 * * * *', retries: 1 })).toBe(96);
    expect(worstCaseMessagesPerDay({ cron: '*/5 * * * *', retries: 0 })).toBe(288);
  });
});

describe('QStash free-plan budget', () => {
  it('the worst case (every run fails, every retry used) stays under 60% of the free daily quota', () => {
    const worst = totalWorstCaseMessagesPerDay();
    expect(worst).toBeLessThanOrEqual(QSTASH_FREE_LIMITS.messagesPerDay * QSTASH_BUDGET_SHARE);
    expect(totalNormalMessagesPerDay()).toBeLessThanOrEqual(worst);
  });

  it('stays well inside the active-schedule limit', () => {
    expect(QSTASH_SCHEDULES.length).toBeLessThanOrEqual(QSTASH_FREE_LIMITS.activeSchedules - 4);
  });

  it('the shipped plan: 384 messages on a normal day, 480 worst case', () => {
    expect(totalNormalMessagesPerDay()).toBe(384);
    expect(totalWorstCaseMessagesPerDay()).toBe(480);
  });
});

describe('QSTASH_SCHEDULES', () => {
  it('ids are unique and valid Upstash-Schedule-Ids', () => {
    const ids = QSTASH_SCHEDULES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9._-]+$/);
  });

  it.each(QSTASH_SCHEDULES.map((s) => [s.id, s.path] as const))('%s targets an existing, authenticated cron route', (_id, path) => {
    const file = join(process.cwd(), 'app', ...path.split('/').filter(Boolean), 'route.ts');
    expect(existsSync(file)).toBe(true);
    // AGENTS.md: a cron handler without isCronAuthorized (fail closed) is forbidden.
    expect(readFileSync(file, 'utf8')).toContain('isCronAuthorized(req)');
  });

  it('a timeout fits inside the route maxDuration plus headroom, and inside QStash free-plan 15 minutes', () => {
    for (const s of QSTASH_SCHEDULES) {
      const m = /^(\d+)(s|m)$/.exec(s.timeout);
      expect(m, s.id).not.toBeNull();
      const seconds = Number(m![1]) * (m![2] === 'm' ? 60 : 1);
      expect(seconds).toBeLessThanOrEqual(15 * 60);
      const file = join(process.cwd(), 'app', ...s.path.split('/').filter(Boolean), 'route.ts');
      const maxDuration = Number(/export const maxDuration = (\d+)/.exec(readFileSync(file, 'utf8'))?.[1]);
      expect(maxDuration, s.id).toBeGreaterThan(0);
      expect(seconds).toBeGreaterThanOrEqual(Math.min(maxDuration, 300) / 2); // never a timeout that abandons a healthy run
      expect(seconds).toBeLessThanOrEqual(maxDuration + 30);
    }
  });

  it('high-frequency jobs do not retry (the next tick is the retry)', () => {
    for (const s of QSTASH_SCHEDULES) if (runsPerDay(s.cron) >= 144) expect(s.retries).toBe(0);
  });

  it('no schedule needs more than the 60 s trigger throttle gap between ticks', () => {
    for (const s of QSTASH_SCHEDULES) expect(1440 / runsPerDay(s.cron)).toBeGreaterThanOrEqual(5);
  });
});

describe('buildScheduleRequest', () => {
  const input = { qstashUrl: 'https://qstash.upstash.io/', siteUrl: 'https://site.example/', token: 'tok_123', cronSecret: 'sec_456' };
  const sched = QSTASH_SCHEDULES[0]!;

  it('creates the schedule against our route, GET, with a stable id', () => {
    const req = buildScheduleRequest(sched, input);
    expect(req.url).toBe(`https://qstash.upstash.io/v2/schedules/https://site.example${sched.path}`);
    expect(req.init.method).toBe('POST');
    expect(req.init.headers).toMatchObject({
      'Upstash-Schedule-Id': sched.id,
      'Upstash-Cron': sched.cron,
      'Upstash-Method': 'GET',
      'Upstash-Retries': String(sched.retries),
      'Upstash-Timeout': sched.timeout,
    });
  });

  it('authenticates to QStash with the token and to our route with the forwarded cron secret', () => {
    const { headers } = buildScheduleRequest(sched, input).init;
    expect(headers.Authorization).toBe('Bearer tok_123');
    // QStash strips the "Upstash-Forward-" prefix, so the route sees "Authorization: Bearer sec_456".
    expect(headers['Upstash-Forward-Authorization']).toBe('Bearer sec_456');
  });

  it('the secret and the token never end up in the URL', () => {
    const { url } = buildScheduleRequest(sched, input);
    expect(url).not.toContain('tok_123');
    expect(url).not.toContain('sec_456');
  });
});
