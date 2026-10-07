import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFile } from './media-helpers';
import type { MediaEntity } from '@/lib/media/types';

const searchCommonsFiles = vi.fn();
const listCategoryFiles = vi.fn();
const getCommonsFileInfos = vi.fn();

vi.mock('@/lib/media/wikimedia', async (orig) => ({
  ...(await orig<typeof import('@/lib/media/wikimedia')>()),
  searchCommonsFiles: (...a: unknown[]) => searchCommonsFiles(...a),
  listCategoryFiles: (...a: unknown[]) => listCategoryFiles(...a),
  getCommonsFileInfos: (...a: unknown[]) => getCommonsFileInfos(...a),
}));

const { resolveEntity } = await import('@/lib/media/resolve');

beforeEach(() => {
  vi.clearAllMocks();
  searchCommonsFiles.mockResolvedValue([]);
  listCategoryFiles.mockResolvedValue([]);
  getCommonsFileInfos.mockResolvedValue(new Map());
});

const queriesSent = (): string[] => searchCommonsFiles.mock.calls.map((c) => String(c[0]));

describe('resolveEntity stages', () => {
  it('searches by chassis designation from the curated registry, even for a row stored before the entry existed', async () => {
    // The stored row has no `carModel`: seasons already discovered are never re-discovered, so the registry is read here.
    const car: MediaEntity = {
      type: 'car', key: 'red_bull:2021', season: 2021, displayName: 'Red Bull',
      extra: { constructorId: 'red_bull', nameHints: ['Red Bull Racing'] },
    };
    await resolveEntity(car, [], { fetchOpts: {} });
    expect(queriesSent()).toEqual(expect.arrayContaining(['Red Bull RB16B', 'Red Bull RB16B 2021']));
  });

  it('adds no designation query for a team-season that is not in the registry', async () => {
    const car: MediaEntity = { type: 'car', key: 'ferrari:2024', season: 2024, displayName: 'Ferrari', extra: { nameHints: ['Scuderia Ferrari'] } };
    await resolveEntity(car, [], { fetchOpts: {} });
    expect(queriesSent().some((q) => /RB16B|R\.S\.20|AT02|VF-26/.test(q))).toBe(false);
  });

  it("files from the venue's own Commons category are candidates of source 'commons-category'", async () => {
    listCategoryFiles.mockResolvedValue(['File:Luftaufnahme (c)Red Bull Ring.jpg']);
    getCommonsFileInfos.mockResolvedValue(
      new Map([['File:Luftaufnahme (c)Red Bull Ring.jpg', makeFile({ title: 'File:Luftaufnahme (c)Red Bull Ring.jpg', width: 5016, height: 3344, categories: ['Red Bull Ring'] })]]),
    );
    const circuit: MediaEntity = { type: 'circuit', key: 'red_bull_ring', season: 2026, displayName: 'Red Bull Ring', extra: { locality: 'Spielberg' } };
    const out = await resolveEntity(circuit, [], {
      fetchOpts: {},
      wikidata: { p18: [], p154: [], commonsCategory: 'Red Bull Ring' },
    });
    expect(out.best?.source).toBe('commons-category');
    expect(out.candidates[0]?.file.title).toContain('Luftaufnahme');
  });

  it('asks for venue parts and the locality Grand Prix when the first searches find nothing', async () => {
    const circuit: MediaEntity = { type: 'circuit', key: 'miami', season: 2026, displayName: 'Miami International Autodrome', extra: { locality: 'Miami' } };
    await resolveEntity(circuit, [], { fetchOpts: {} });
    expect(queriesSent()).toEqual(
      expect.arrayContaining(['Miami International Autodrome grandstand', 'Miami International Autodrome paddock pit lane', 'Miami Grand Prix']),
    );
  });

  it('keeps near misses ordered best first so a miss can be diagnosed', async () => {
    searchCommonsFiles.mockResolvedValue(['File:A.jpg', 'File:B.jpg']);
    getCommonsFileInfos.mockResolvedValue(
      new Map([
        ['File:A.jpg', makeFile({ title: 'File:Miami Autodrome grandstand.jpg', width: 1500, height: 1000, categories: ['Miami International Autodrome'] })],
        ['File:B.jpg', makeFile({ title: 'File:Miami Autodrome grandstand aerial.jpg', width: 3000, height: 2000, categories: ['Miami International Autodrome'] })],
      ]),
    );
    const circuit: MediaEntity = { type: 'circuit', key: 'miami', season: 2026, displayName: 'Miami International Autodrome', extra: {} };
    const out = await resolveEntity(circuit, [], { fetchOpts: {} });
    const scores = out.candidates.map((c) => c.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
