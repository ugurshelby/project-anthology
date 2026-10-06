import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFile } from './media-helpers';
import { createMemoryRepo } from '@/lib/media/repo';
import type { Candidate, MediaEntity } from '@/lib/media/types';
import { MediaHttpError } from '@/lib/media/http';

const resolveEntity = vi.fn();
const downloadImage = vi.fn();
const processImage = vi.fn();
const discoverSeason = vi.fn();
const extraCircuitEntities = vi.fn();
const resolveQids = vi.fn();
const getWikidataMedia = vi.fn();
const getCommonsFileInfos = vi.fn();

vi.mock('@/lib/media/resolve', () => ({
  resolveEntity: (...a: unknown[]) => resolveEntity(...a),
  describeMiss: () => 'no candidate',
}));
vi.mock('@/lib/media/process', () => ({
  downloadImage: (...a: unknown[]) => downloadImage(...a),
  processImage: (...a: unknown[]) => processImage(...a),
}));
vi.mock('@/lib/media/universe', async (orig) => ({
  ...(await orig<typeof import('@/lib/media/universe')>()),
  discoverSeason: (...a: unknown[]) => discoverSeason(...a),
  extraCircuitEntities: (...a: unknown[]) => extraCircuitEntities(...a),
  curatedCarEntities: () => [],
}));
vi.mock('@/lib/media/wikimedia', async (orig) => ({
  ...(await orig<typeof import('@/lib/media/wikimedia')>()),
  resolveQids: (...a: unknown[]) => resolveQids(...a),
  getWikidataMedia: (...a: unknown[]) => getWikidataMedia(...a),
  getCommonsFileInfos: (...a: unknown[]) => getCommonsFileInfos(...a),
}));

const { runMediaSync, nextCheckFor, backoffFor } = await import('@/lib/media/sync');

const candidate = (title = 'File:A.jpg'): Candidate => ({
  file: makeFile({ title }),
  license: { ok: true, label: 'CC BY-SA 4.0', attributionRequired: true, shareAlike: true, url: null },
  source: 'wikidata-p18',
  score: 90,
});

const processed = {
  width: 640, height: 800, sha256: 'a'.repeat(64), blurDataUrl: 'data:image/webp;base64,xx', dominantColor: '#112233',
  variants: [{ w: 640, h: 800, bytes: 10, buffer: Buffer.from('x') }],
};

const driver = (key: string): MediaEntity => ({ type: 'driver', key, season: 2025, displayName: key, wikipediaUrl: `https://en.wikipedia.org/wiki/${key}` });

beforeEach(() => {
  vi.clearAllMocks();
  discoverSeason.mockResolvedValue([driver('norris'), driver('piastri'), driver('leclerc'), driver('russell')]);
  extraCircuitEntities.mockResolvedValue([]);
  resolveQids.mockResolvedValue(new Map());
  getWikidataMedia.mockResolvedValue(new Map());
  downloadImage.mockResolvedValue(Buffer.from('img'));
  processImage.mockResolvedValue(processed);
  getCommonsFileInfos.mockResolvedValue(new Map());
});

const run = (repo: ReturnType<typeof createMemoryRepo>, over = {}) =>
  runMediaSync({ repo, budgetMs: 60_000, minSeason: 2025, maxSeason: 2025, ...over });

describe('runMediaSync', () => {
  it('discovers entities, resolves them and schedules the next check', async () => {
    resolveEntity.mockResolvedValue({ best: candidate(), inspected: 1, notes: [] });
    const repo = createMemoryRepo();
    const report = await run(repo);
    expect(report).toMatchObject({ newEntities: 4, due: 4, resolved: 4, missing: 0, errors: 0, stoppedEarly: false });
    const rec = repo.records.get('driver|norris')!;
    expect(rec.status).toBe('resolved');
    expect(rec.detail?.attribution).toBe('Jane Doe / Wikimedia Commons, CC BY-SA 4.0');
    expect(rec.detail?.variants[0]?.path).toMatch(/^driver\/norris\/aaaaaaaaaa\/640\.webp$/);
    expect(new Date(rec.nextCheckAt).getTime()).toBeGreaterThan(Date.now() + 80 * 86_400_000);
  });

  it('marks entities with no qualifying image as missing (placeholder) and retries later, not never', async () => {
    resolveEntity.mockResolvedValue({ best: null, inspected: 3, notes: ['x'] });
    const repo = createMemoryRepo();
    const report = await run(repo);
    expect(report.missing).toBe(4);
    const rec = repo.records.get('driver|norris')!;
    expect(rec.status).toBe('missing');
    expect(downloadImage).not.toHaveBeenCalled();
    expect(new Date(rec.nextCheckAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('does not re-download when the best file is unchanged', async () => {
    resolveEntity.mockResolvedValue({ best: candidate('File:A.jpg'), inspected: 1, notes: [] });
    const repo = createMemoryRepo();
    await run(repo);
    downloadImage.mockClear();
    for (const r of repo.records.values()) r.nextCheckAt = new Date(0).toISOString(); // force due
    const again = await run(repo);
    expect(again).toMatchObject({ resolved: 0, unchanged: 4 });
    expect(downloadImage).not.toHaveBeenCalled();
  });

  it('keeps a resolved image when a recheck finds nothing but the old file is still valid', async () => {
    resolveEntity.mockResolvedValueOnce({ best: candidate('File:Old.jpg'), inspected: 1, notes: [] });
    discoverSeason.mockResolvedValue([driver('norris')]);
    const repo = createMemoryRepo();
    await run(repo);
    for (const r of repo.records.values()) r.nextCheckAt = new Date(0).toISOString();
    resolveEntity.mockResolvedValue({ best: null, inspected: 0, notes: [] });
    getCommonsFileInfos.mockResolvedValue(new Map([['File:Old.jpg', makeFile({ title: 'File:Old.jpg' })]]));
    await run(repo);
    expect(repo.records.get('driver|norris')!.status).toBe('resolved');
  });

  it('drops a resolved image whose license is no longer acceptable', async () => {
    resolveEntity.mockResolvedValueOnce({ best: candidate('File:Old.jpg'), inspected: 1, notes: [] });
    discoverSeason.mockResolvedValue([driver('norris')]);
    const repo = createMemoryRepo();
    await run(repo);
    for (const r of repo.records.values()) r.nextCheckAt = new Date(0).toISOString();
    resolveEntity.mockResolvedValue({ best: null, inspected: 0, notes: [] });
    getCommonsFileInfos.mockResolvedValue(
      new Map([['File:Old.jpg', makeFile({ title: 'File:Old.jpg', licenseCode: 'cc-by-nc-4.0', licenseShortName: 'CC BY-NC 4.0' })]]),
    );
    await run(repo);
    expect(repo.records.get('driver|norris')!.status).toBe('missing');
  });

  it('an owner-rejected image is never re-picked and the replacement is not left hidden', async () => {
    resolveEntity.mockResolvedValueOnce({ best: candidate('File:Wrong.jpg'), inspected: 1, notes: [] });
    discoverSeason.mockResolvedValue([driver('norris')]);
    const repo = createMemoryRepo();
    await run(repo);
    // owner marks it rejected (what `update media_assets set review='rejected'` does) and makes it due
    const original = repo.claimDue.bind(repo);
    repo.claimDue = async (limit, now) => (await original(limit, now)).map((r) => ({ ...r, review: 'rejected' as const, status: 'resolved' as const }));
    for (const r of repo.records.values()) r.nextCheckAt = new Date(0).toISOString();
    const ack = vi.spyOn(repo, 'acknowledgeRejection');
    resolveEntity.mockResolvedValue({ best: candidate('File:Better.jpg'), inspected: 1, notes: [] });
    await run(repo);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ key: 'norris' }), ['File:Wrong.jpg']);
    // the resolver was told to skip the rejected file
    expect(resolveEntity.mock.calls.at(-1)?.[1]).toEqual(['File:Wrong.jpg']);
    expect(repo.records.get('driver|norris')!.detail?.file).toBe('File:Better.jpg');
  });

  it('transient failures back off and trip the circuit breaker instead of hammering the API', async () => {
    resolveEntity.mockRejectedValue(new MediaHttpError('HTTP 429 from commons.wikimedia.org', 429, true));
    discoverSeason.mockResolvedValue(Array.from({ length: 10 }, (_, i) => driver(`d${i}`)));
    const repo = createMemoryRepo();
    const report = await run(repo);
    expect(report.errors).toBe(3);
    expect(report.stoppedEarly).toBe(true);
    expect(report.stopReason).toMatch(/circuit breaker/);
    expect(resolveEntity).toHaveBeenCalledTimes(3);
    const failed = Array.from(repo.records.values()).filter((r) => r.attempts === 1);
    expect(failed).toHaveLength(3);
    expect(new Date(failed[0]!.nextCheckAt).getTime()).toBeGreaterThan(Date.now());
    expect(failed[0]!.status).toBe('pending'); // an error never turns into "missing"
  });

  it('a non-transient failure on one entity does not stop the others', async () => {
    resolveEntity
      .mockRejectedValueOnce(new Error('sharp: bad image'))
      .mockResolvedValue({ best: candidate(), inspected: 1, notes: [] });
    const repo = createMemoryRepo();
    const report = await run(repo);
    expect(report).toMatchObject({ errors: 1, resolved: 3 });
  });

  it('respects the time budget', async () => {
    resolveEntity.mockResolvedValue({ best: null, inspected: 0, notes: [] });
    const repo = createMemoryRepo();
    await repo.upsertDiscovered([driver('norris'), driver('piastri')]);
    const report = await run(repo, { budgetMs: 1, skipDiscovery: true });
    expect(report.due).toBe(2);
    expect(resolveEntity).not.toHaveBeenCalled();
    expect(report.stoppedEarly).toBe(true);
    expect(report.stopReason).toBe('time budget');
  });

  it('can be limited to specific entities', async () => {
    resolveEntity.mockResolvedValue({ best: null, inspected: 0, notes: [] });
    const repo = createMemoryRepo();
    const report = await run(repo, { only: [{ type: 'driver', key: 'norris' }] });
    expect(report.due).toBe(1);
    expect(resolveEntity).toHaveBeenCalledTimes(1);
  });
});

describe('scheduling helpers', () => {
  const now = new Date('2026-10-06T00:00:00Z');
  it('rechecks missing recent cars weekly and other missing entities every 3 weeks', () => {
    const days = (iso: string) => Math.round((new Date(iso).getTime() - now.getTime()) / 86_400_000);
    expect(days(nextCheckFor('missing', { type: 'car', season: 2026 }, now))).toBe(7);
    expect(days(nextCheckFor('missing', { type: 'car', season: 2019 }, now))).toBe(21);
    expect(days(nextCheckFor('missing', { type: 'driver', season: 2026 }, now))).toBe(21);
    expect(days(nextCheckFor('resolved', { type: 'driver', season: 2026 }, now))).toBe(90);
    expect(days(nextCheckFor('approved', { type: 'driver', season: 2026 }, now))).toBe(180);
  });
  it('backs off exponentially, capped at 6 hours', () => {
    const mins = (a: number) => Math.round((new Date(backoffFor(a, now)).getTime() - now.getTime()) / 60_000);
    expect([mins(1), mins(2), mins(3)]).toEqual([20, 40, 80]);
    expect(mins(10)).toBe(360);
  });
});
