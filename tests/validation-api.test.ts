import { describe, expect, it } from 'vitest';
import { isErgastSlug } from '@/lib/api/validation';
import { parseKeyList } from '@/lib/media/keys';
import {
  circuitIdParam,
  f1SeasonQuery,
  hasUnknownKeys,
  MAX_PREFERENCE_KEYS,
  mediaQuery,
  pushRegisterBody,
  searchParamsToObject,
} from '@/lib/validation/api';

const VALID_TOKEN = 'ExponentPushToken[abc123]';

describe('pushRegisterBody', () => {
  it('accepts an Expo token with boolean preferences', () => {
    const parsed = pushRegisterBody.safeParse({ token: VALID_TOKEN, preferences: { raceStart: true, news: false } });
    expect(parsed.success && parsed.data).toEqual({ token: VALID_TOKEN, preferences: { raceStart: true, news: false } });
  });

  it.each([
    ['missing token', {}],
    ['empty token', { token: '' }],
    ['non-string token', { token: 42 }],
    ['non-Expo token', { token: 'not-a-token' }],
    ['null body', null],
    ['array body', []],
    ['string body', 'ExponentPushToken[abc123]'],
  ])('rejects %s', (_label, body) => {
    expect(pushRegisterBody.safeParse(body).success).toBe(false);
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['array', [true, false]],
    ['string', 'raceStart'],
  ])('turns %s preferences into {} without failing', (_label, preferences) => {
    const parsed = pushRegisterBody.safeParse({ token: VALID_TOKEN, preferences });
    expect(parsed.success && parsed.data.preferences).toEqual({});
  });

  it('drops non-boolean values', () => {
    const parsed = pushRegisterBody.safeParse({
      token: VALID_TOKEN,
      preferences: { good: true, str: 'yes', num: 1, obj: {}, nil: null },
    });
    expect(parsed.success && parsed.data.preferences).toEqual({ good: true });
  });

  it(`keeps only the first ${MAX_PREFERENCE_KEYS} boolean keys`, () => {
    const preferences = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, true]));
    const parsed = pushRegisterBody.safeParse({ token: VALID_TOKEN, preferences });
    expect(parsed.success && Object.keys(parsed.data.preferences)).toEqual(
      Array.from({ length: MAX_PREFERENCE_KEYS }, (_, i) => `k${i}`),
    );
  });
});

describe('f1SeasonQuery', () => {
  const parse = (qs: string) => f1SeasonQuery.safeParse(searchParamsToObject(new URLSearchParams(qs)));

  it.each([
    ['2024', '2024'],
    ['2024.json', '2024.json'],
    ['2024/driverStandings', '2024/driverStandings'],
    ['2024/constructorStandings.json', '2024/constructorStandings.json'],
    ['2024/5/results', '2024/5/results'],
    ['2024/12/qualifying', '2024/12/qualifying'],
    ['2024/3/sprint', '2024/3/sprint'],
    ['2024/3/pitstops', '2024/3/pitstops'],
    ['  /2024/5/results  ', '2024/5/results'],
    ['///2024', '2024'],
  ])('accepts path=%j as %j', (path, expected) => {
    const parsed = parse(`path=${encodeURIComponent(path)}`);
    expect(parsed.success && parsed.data.path).toBe(expected);
  });

  it.each([
    '',
    '   ',
    '24',
    '2024/',
    '2024/123/results',
    '2024/5/laps',
    '2024/drivers',
    '2024/5/results.json.json',
    '../2024',
    'https://evil.example/2024',
    '2024/5/results?x=1',
  ])('rejects path=%j as a path error, not an unknown key', (path) => {
    const parsed = parse(`path=${encodeURIComponent(path)}`);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(hasUnknownKeys(parsed.error)).toBe(false);
  });

  it('treats a missing path as a path error', () => {
    const parsed = parse('');
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(hasUnknownKeys(parsed.error)).toBe(false);
  });

  it.each(['path=2024&x=1', 'x=1', 'path=bad&callback=y'])('flags unknown keys in %j', (qs) => {
    const parsed = parse(qs);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(hasUnknownKeys(parsed.error)).toBe(true);
  });

  it('uses the first value of a repeated path, like URLSearchParams.get', () => {
    const parsed = parse('path=2024&path=evil');
    expect(parsed.success && parsed.data.path).toBe('2024');
  });
});

describe('mediaQuery', () => {
  it('accepts a known type and normalizes keys (trim, lowercase, dedupe)', () => {
    const parsed = mediaQuery.safeParse({ type: 'driver', keys: ' Hamilton, verstappen,,hamilton ' });
    expect(parsed.success && parsed.data).toEqual({ type: 'driver', keys: ['hamilton', 'verstappen'] });
  });

  it.each([null, '', 'drivers', 'DRIVER'])('fails on the type field for type=%j', (type) => {
    const parsed = mediaQuery.safeParse({ type, keys: 'hamilton' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.some((i) => i.path[0] === 'type')).toBe(true);
  });

  it('fails only on keys when the type is valid', () => {
    const parsed = mediaQuery.safeParse({ type: 'team', keys: null });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.every((i) => i.path[0] === 'keys')).toBe(true);
  });

  it.each([
    null,
    '',
    ',,,',
    'ok,bad key',
    'a'.repeat(81),
    'ok,<script>',
    Array.from({ length: 41 }, (_, i) => `k${i}`).join(','),
    Array.from({ length: 40 }, (_, i) => `k${i}`).join(','),
    'red_bull:2024,circuit.monza,a-b',
    'A,a',
  ])('matches parseKeyList for keys=%j', (keys) => {
    const parsed = mediaQuery.safeParse({ type: 'car', keys });
    expect(parsed.success ? parsed.data.keys : null).toEqual(parseKeyList(keys));
  });
});

describe('circuitIdParam', () => {
  it.each([
    'monza',
    'red_bull_ring',
    'marina-bay',
    'a',
    'a'.repeat(64),
    'a'.repeat(65),
    '',
    'Monza',
    '-monza',
    '_monza',
    'mon za',
    'monza/../x',
    'monaco%00',
  ])('matches isErgastSlug for %j', (id) => {
    expect(circuitIdParam.safeParse(id).success).toBe(isErgastSlug(id));
  });
});
