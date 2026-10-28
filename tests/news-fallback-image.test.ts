import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickNewsEntity, type NewsEntity } from '@/lib/news/fallbackImage';
import type { RawNewsItem } from '@/lib/news/aggregate';
import type { NewsItem } from '@/lib/data/types';
import type { MediaResult } from '@/lib/media/read';

// ── collaborators of withFallbackMedia and buildStoryRows ────────────────────
const mockSnapshot = vi.fn();
const mockMediaBatch = vi.fn();
const mockProbe = vi.fn();

vi.mock('@/lib/data/f1', () => ({
  fetchSeasonSnapshotTyped: (...a: unknown[]) => mockSnapshot(...a),
}));
vi.mock('@/lib/media/read', () => ({
  getMediaBatch: (...a: unknown[]) => mockMediaBatch(...a),
}));
vi.mock('@/lib/news/aggregate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/news/aggregate')>()),
  probeImage: (...a: unknown[]) => mockProbe(...a),
}));
vi.mock('@/lib/news/rewrite', () => ({
  aiRewriteConfigured: () => false,
  enabledProviderCount: () => 0,
  rewriteBatch: async () => ({ results: [], exhausted: [], vertex: { calls: 0, dayCount: null, promptTokens: 0, outputTokens: 0 } }),
}));
vi.mock('@/lib/news/translate', () => ({ translateToTurkish: async () => null }));

afterEach(() => vi.clearAllMocks());

const ENTITIES: NewsEntity[] = [
  { type: 'driver', key: 'max_verstappen', names: ['Verstappen', 'Max Verstappen'] },
  { type: 'driver', key: 'leclerc', names: ['Leclerc', 'Charles Leclerc'] },
  { type: 'team', key: 'ferrari', names: ['Ferrari'] },
  { type: 'circuit', key: 'rodriguez', names: ['Mexico City', 'Mexico City Grand Prix'] },
];

describe('pickNewsEntity (8.9)', () => {
  it('finds a driver, a team and a calendar circuit', () => {
    expect(pickNewsEntity('Verstappen eyes podium in Mexico', '', ENTITIES)).toEqual({ type: 'driver', key: 'max_verstappen' });
    expect(pickNewsEntity('Ferrari confirms upgrade plan', '', ENTITIES)).toEqual({ type: 'team', key: 'ferrari' });
    expect(pickNewsEntity('Mexico City GP preview', '', ENTITIES)).toEqual({ type: 'circuit', key: 'rodriguez' });
  });

  it('returns null without a match and takes the name that comes first', () => {
    expect(pickNewsEntity('FIA publishes new sporting code', 'No names here.', ENTITIES)).toBeNull();
    expect(pickNewsEntity('Leclerc beats Verstappen in Mexico City', '', ENTITIES)).toEqual({ type: 'driver', key: 'leclerc' });
  });

  it('falls back to the summary and matches whole words only', () => {
    expect(pickNewsEntity('A tense Friday', 'Charles Leclerc topped FP1.', ENTITIES)).toEqual({ type: 'driver', key: 'leclerc' });
    expect(pickNewsEntity('Ferraris of the past', '', ENTITIES)).toBeNull();
  });
});

function item(id: string, title: string, image = ''): NewsItem {
  return { id, title, summary: '', url: '', sourceName: 'RaceFans', sources: [], image, publishedAt: '', publishedTs: 0, dateLabel: '' };
}

const IMAGE: MediaResult = { status: 'image' } as unknown as MediaResult;

describe('withFallbackMedia (8.9, K6 news)', () => {
  it('attaches the archive image of the matched driver to an imageless item, and the car for a team', async () => {
    mockSnapshot.mockImplementation(async (_season: number, type: string) => {
      if (type === 'standings_drivers') {
        return { MRData: { StandingsTable: { StandingsLists: [{ DriverStandings: [{ position: '1', points: '1', Driver: { driverId: 'max_verstappen', givenName: 'Max', familyName: 'Verstappen' }, Constructors: [{ constructorId: 'red_bull', name: 'Red Bull' }] }] }] } } };
      }
      if (type === 'standings_constructors') {
        return { MRData: { StandingsTable: { StandingsLists: [{ ConstructorStandings: [{ position: '1', points: '1', wins: '0', Constructor: { constructorId: 'ferrari', name: 'Ferrari' } }] }] } } };
      }
      return null;
    });
    mockMediaBatch.mockImplementation(async (_type: string, keys: string[]) => new Map(keys.map((k) => [k, IMAGE])));
    const { withFallbackMedia } = await import('@/lib/data/news');
    const out = await withFallbackMedia([
      item('a', 'Verstappen eyes podium'),
      item('b', 'Ferrari confirms upgrade plan'),
      item('c', 'No names', 'https://cdn.test/real.jpg'),
    ]);
    expect(out[0].fallbackMedia).toMatchObject({ type: 'driver', key: 'max_verstappen' });
    expect(out[1].fallbackMedia).toMatchObject({ type: 'car', key: expect.stringMatching(/^ferrari:\d{4}$/) });
    expect(out[2].fallbackMedia).toBeUndefined();
    expect(mockMediaBatch).not.toHaveBeenCalledWith('team', expect.anything());
  });

  it('leaves items unchanged when the archive has no image for the match', async () => {
    mockSnapshot.mockResolvedValue(null);
    const { withFallbackMedia } = await import('@/lib/data/news');
    const out = await withFallbackMedia([item('a', 'Verstappen eyes podium')]);
    expect(out[0].fallbackMedia).toBeUndefined();
  });
});

describe('buildStoryRows re-probes stored covers (8.9, K4)', () => {
  const now = Date.now();
  const member = (url: string, image: string, sourceName = 'RaceFans'): RawNewsItem => ({
    title: 'Antonelli wins in Austin',
    summary: 'Kimi Antonelli won the race.',
    url,
    canonicalUrl: url,
    sourceName,
    image,
    publishedTs: now - 3_600_000,
    publishedISO: new Date(now - 3_600_000).toISOString(),
  });

  async function runWithStoredCover(stored: string, members: RawNewsItem[]) {
    const { buildStoryRows, draftStories } = await import('@/lib/news/stories');
    const [draft] = draftStories(members, [], now);
    const existing = {
      id: draft.id,
      title: members[0].title,
      summary: members[0].summary,
      title_tr: null,
      summary_tr: null,
      image_url: stored,
      published_at: new Date(draft.publishedTs).toISOString(),
      sources: draft.sources,
      fingerprint: draft.fingerprint,
      rewritten: true,
      cached_at: new Date().toISOString(),
    };
    const { rows } = await buildStoryRows(members, [existing as never], { deadlineMs: now + 60_000 });
    return rows[0].image_url;
  }

  it('replaces a stored cover that now 404s with another member image', async () => {
    mockProbe.mockImplementation(async (url: string) => (url.includes('dead') ? null : 5000));
    const cover = await runWithStoredCover('https://cdn.test/dead.jpg', [
      member('https://a.test/1', 'https://cdn.test/dead.jpg'),
      member('https://b.test/2', 'https://cdn.test/alive.jpg', 'Autosport'),
    ]);
    expect(cover).toBe('https://cdn.test/alive.jpg');
  });

  it('drops the cover when nothing reachable is left', async () => {
    mockProbe.mockResolvedValue(null);
    const cover = await runWithStoredCover('https://cdn.test/dead.jpg', [member('https://a.test/1', 'https://cdn.test/dead.jpg')]);
    expect(cover).toBeNull();
  });
});
