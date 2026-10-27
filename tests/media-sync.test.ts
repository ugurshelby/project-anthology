import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFile } from './media-helpers';
import { createMemoryRepo, uploadWithRetry } from '@/lib/media/repo';
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
vi.mock('@/lib/media/process', async (orig) => ({
  ...(await orig<typeof import('@/lib/media/process')>()),
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

const { runMediaSync, nextCheckFor, backoffFor, needsLargerVariants, RESOLVER_VERSION, DISCOVERY_VERSION } = await import('@/lib/media/sync');

const candidate = (title = 'File:A.jpg'): Candidate => ({
  file: makeFile({ title }),
  license: { ok: true, label: 'CC BY-SA 4.0', attributionRequired: true, shareAlike: true, url: null },
  source: 'wikidata-p18',
  score: 90,
});

const processed = {
  width: 1280, height: 1600, sha256: 'a'.repeat(64), blurDataUrl: 'data:image/webp;base64,xx', dominantColor: '#112233',
  variants: [
    { w: 640, h: 800, bytes: 10, buffer: Buffer.from('x') },
    { w: 1280, h: 1600, bytes: 20, buffer: Buffer.from('y') },
  ],
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

  it('retries every `missing` row once when RESOLVER_VERSION changes, then leaves them on their normal schedule', async () => {
    resolveEntity.mockResolvedValue({ best: null, inspected: 3, notes: ['x'] });
    const repo = createMemoryRepo();
    const first = await run(repo);
    expect(first.missing).toBe(4);
    // an older resolver wrote these rows; their re-check is weeks away
    repo.state.set('resolver_version', { version: RESOLVER_VERSION - 1 });
    const before = repo.records.get('driver|norris')!.nextCheckAt;
    expect(new Date(before).getTime()).toBeGreaterThan(Date.now());

    resolveEntity.mockResolvedValue({ best: candidate('File:Found.jpg'), inspected: 1, notes: [] });
    const upgraded = await run(repo);
    expect(upgraded).toMatchObject({ requeued: 4, due: 4, resolved: 4 });
    expect(repo.state.get('resolver_version')).toMatchObject({ version: RESOLVER_VERSION, requeued: 4 });

    // same version again: nothing is forced
    for (const r of repo.records.values()) {
      r.status = 'missing';
      r.nextCheckAt = new Date(Date.now() + 20 * 86_400_000).toISOString();
    }
    const quiet = await run(repo);
    expect(quiet).toMatchObject({ requeued: 0, due: 0 });
  });

  it('discovers finished seasons again when DISCOVERY_VERSION changes, not on the same version', async () => {
    resolveEntity.mockResolvedValue({ best: candidate(), inspected: 1, notes: [] });
    const repo = createMemoryRepo();
    const seasonsAsked = () => discoverSeason.mock.calls.map((c) => c[0]);

    await run(repo, { minSeason: 2024 });
    expect(seasonsAsked()).toEqual([2025, 2024]);
    expect(repo.state.get('discovered_seasons')).toEqual({ seasons: [2024], version: DISCOVERY_VERSION });

    discoverSeason.mockClear();
    await run(repo, { minSeason: 2024 });
    expect(seasonsAsked()).toEqual([2025]); // 2024 is already done on this version

    // state written before versioning (no `version`) or by an older discovery: discover everything again
    repo.state.set('discovered_seasons', { seasons: [2024] });
    discoverSeason.mockClear();
    await run(repo, { minSeason: 2024 });
    expect(seasonsAsked()).toEqual([2025, 2024]);
    expect(repo.state.get('discovered_seasons')).toEqual({ seasons: [2024], version: DISCOVERY_VERSION });
  });

  it('a driver added to the newest season is picked up and resolved on the next run; one added to a finished season is not (deliberate limit)', async () => {
    resolveEntity.mockResolvedValue({ best: candidate(), inspected: 1, notes: [] });
    const bySeason: Record<number, MediaEntity[]> = {
      2025: [{ ...driver('norris'), season: 2025 }],
      2024: [{ ...driver('alonso'), season: 2024 }],
    };
    discoverSeason.mockImplementation(async (season: number) => bySeason[season] ?? []);
    const repo = createMemoryRepo();
    const first = await run(repo, { minSeason: 2024 });
    expect(first).toMatchObject({ newEntities: 2, resolved: 2 });

    // the newest season gains a rookie, a finished season gains a driver the first discovery missed
    bySeason[2025] = [...bySeason[2025]!, { ...driver('rookie'), season: 2025 }];
    bySeason[2024] = [...bySeason[2024]!, { ...driver('latecomer'), season: 2024 }];
    const second = await run(repo, { minSeason: 2024 });
    expect(second).toMatchObject({ newEntities: 2, due: 1, resolved: 1 }); // norris is merged again, only the rookie is new and due
    expect(repo.records.get('driver|rookie')?.status).toBe('resolved');
    // 2024 is discovered once per DISCOVERY_VERSION: the latecomer waits for the next version bump
    expect(discoverSeason.mock.calls.filter((c) => c[0] === 2024)).toHaveLength(1);
    expect(repo.records.has('driver|latecomer')).toBe(false);
  });

  it('a failing resolver-version bookkeeping never fails the run', async () => {
    resolveEntity.mockResolvedValue({ best: candidate(), inspected: 1, notes: [] });
    const repo = createMemoryRepo();
    repo.requeueMissing = async () => {
      throw new Error('db down');
    };
    repo.state.set('resolver_version', { version: 0 });
    const report = await run(repo, { log: () => {} });
    expect(report).toMatchObject({ requeued: 0, resolved: 4 });
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

describe('variant ladder (8.5)', () => {
  const team = (key: string): MediaEntity => ({ type: 'team', key, season: 2025, displayName: key, wikipediaUrl: `https://en.wikipedia.org/wiki/${key}` });

  it('needsLargerVariants compares the stored widest variant with what the source supports now', () => {
    expect(needsLargerVariants([{ w: 640 }], 1400, 'driver')).toBe(true);
    expect(needsLargerVariants([{ w: 1280 }], 1400, 'driver')).toBe(false);
    expect(needsLargerVariants([{ w: 1280 }], 3000, 'driver')).toBe(false); // capped by the thumbnail width and the ladder
    expect(needsLargerVariants([{ w: 640 }], 700, 'driver')).toBe(false); // 700 px yields 640: must not requeue forever
    expect(needsLargerVariants([{ w: 320 }], 500, 'driver')).toBe(true);
    expect(needsLargerVariants([{ w: 500 }], 500, 'driver')).toBe(false);
    expect(needsLargerVariants([], 3000, 'driver')).toBe(true);
  });

  it('the same file is re-processed when the stored variants are short of the source, and left alone otherwise', async () => {
    resolveEntity.mockResolvedValue({ best: candidate('File:A.jpg'), inspected: 1, notes: [] });
    discoverSeason.mockResolvedValue([driver('norris'), driver('piastri')]);
    const repo = createMemoryRepo();
    await run(repo); // fixture source is 3000 px wide, processed variants reach 1280
    const due = () => {
      for (const r of repo.records.values()) r.nextCheckAt = new Date(0).toISOString();
    };
    repo.records.get('driver|norris')!.detail!.variants = [{ w: 640, h: 800, path: 'old/640.webp', bytes: 10 }];

    downloadImage.mockClear();
    due();
    const again = await run(repo);
    expect(again).toMatchObject({ resolved: 1, unchanged: 1 });
    expect(downloadImage).toHaveBeenCalledTimes(1);
    expect(Math.max(...repo.records.get('driver|norris')!.detail!.variants.map((v) => v.w))).toBe(1280);

    downloadImage.mockClear();
    due();
    expect(await run(repo)).toMatchObject({ resolved: 0, unchanged: 2 });
    expect(downloadImage).not.toHaveBeenCalled();
  });

  it('requeues only resolved rows of a type whose ladder changed, once; with no ladder recorded only drivers (the old ladder)', async () => {
    resolveEntity.mockResolvedValue({ best: candidate(), inspected: 1, notes: [] });
    discoverSeason.mockResolvedValue([driver('norris'), driver('piastri'), team('ferrari')]);
    const repo = createMemoryRepo();
    const first = await run(repo);
    expect(first).toMatchObject({ resolved: 3, requeued: 0 }); // nothing resolved yet at requeue time
    expect(repo.state.get('variant_ladder')).toMatchObject({ driver: [160, 320, 640, 1280] });
    const later = () => {
      for (const r of repo.records.values()) r.nextCheckAt = new Date(Date.now() + 20 * 86_400_000).toISOString();
    };

    later();
    repo.state.delete('variant_ladder'); // as on the first run after the 1280 px step shipped
    const migrated = await run(repo);
    expect(migrated).toMatchObject({ requeued: 2, due: 2 }); // the two drivers; the team row keeps its schedule

    later();
    expect(await run(repo)).toMatchObject({ requeued: 0, due: 0 });

    later();
    repo.state.set('variant_ladder', { ...(repo.state.get('variant_ladder') as object), team: [96, 192] });
    expect(await run(repo)).toMatchObject({ requeued: 1, due: 1 });
    expect(repo.state.get('variant_ladder')).toMatchObject({ team: [96, 192, 384] });
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

describe('uploadWithRetry (Storage gateway errors are transient)', () => {
  const body = Buffer.from('x');
  const bucket = (answers: Array<{ message?: string; status?: number } | null>) => {
    const calls: string[] = [];
    return {
      calls,
      upload: async (path: string) => {
        calls.push(path);
        return { error: answers[Math.min(calls.length - 1, answers.length - 1)] ?? null };
      },
    };
  };
  const noSleep = async () => {};

  it('retries an empty-message gateway failure (the 520 seen on hockenheimring) and then succeeds', async () => {
    const b = bucket([{ message: '', status: 520 }, { message: '', status: 520 }, null]);
    await expect(uploadWithRetry(b, 'circuit/x/aaa/1600.webp', body, noSleep)).resolves.toBeUndefined();
    expect(b.calls).toHaveLength(3);
  });

  it('gives up after three attempts and reports the status', async () => {
    const b = bucket([{ message: '', status: 502 }]);
    await expect(uploadWithRetry(b, 'p.webp', body, noSleep)).rejects.toThrow(/storage upload p\.webp: no message \(HTTP 502\)/);
    expect(b.calls).toHaveLength(3);
  });

  it('does not retry a client error (forbidden, too large, bad request)', async () => {
    const b = bucket([{ message: 'The object exceeded the maximum allowed size', status: 413 }]);
    await expect(uploadWithRetry(b, 'p.webp', body, noSleep)).rejects.toThrow(/maximum allowed size \(HTTP 413\)/);
    expect(b.calls).toHaveLength(1);
  });
});
