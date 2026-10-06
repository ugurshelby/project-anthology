import { beforeEach, describe, expect, it, vi } from 'vitest';

const orFilter = vi.fn();
let rows: unknown[] = [];
let failWith: string | null = null;

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          or: (expr: string) => {
            orFilter(expr);
            return Promise.resolve(failWith ? { data: null, error: { message: failWith } } : { data: rows, error: null });
          },
        }),
      }),
    }),
  }),
}));

const { getMediaBatch } = await import('@/lib/media/read');

const row = (key: string, aliases: string[] = []) => ({
  entity_type: 'driver', entity_key: key, aliases, width: 640, height: 800,
  variants: [{ w: 640, h: 800, path: `driver/${key}/ab/640.webp`, bytes: 1 }],
  blur_data_url: null, dominant_color: null, attribution: 'x / Wikimedia Commons, CC BY 4.0', author: 'x',
  license: 'CC BY 4.0', license_url: null, source_page_url: null, is_trademark: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  rows = [];
  failWith = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://proj.supabase.co';
});

describe('getMediaBatch', () => {
  it('answers every key; unknown ones are placeholders', async () => {
    rows = [row('norris')];
    const out = await getMediaBatch('driver', ['norris', 'nobody']);
    expect(out.get('norris')?.status).toBe('image');
    expect(out.get('nobody')).toMatchObject({ status: 'placeholder', placeholder: { kind: 'driver', seed: 'nobody' } });
  });

  it('matches a page that only knows the F1DB id through aliases, and echoes the requested key', async () => {
    rows = [row('hamilton', ['lewis-hamilton', 'lewis_hamilton'])];
    const out = await getMediaBatch('driver', ['lewis-hamilton']);
    expect(out.get('lewis-hamilton')).toMatchObject({ status: 'image', key: 'lewis-hamilton' });
    expect(orFilter.mock.calls[0]![0]).toContain('aliases.ov.{');
  });

  it('matches hyphen/underscore spellings of the entity key itself', async () => {
    rows = [row('max_verstappen')];
    const out = await getMediaBatch('driver', ['max-verstappen']);
    expect(out.get('max-verstappen')?.status).toBe('image');
  });

  it('prefers the exact entity_key over an alias collision', async () => {
    rows = [row('a_b', ['c']), row('c')];
    const out = await getMediaBatch('driver', ['c']);
    expect((out.get('c') as { image: { src: string } }).image.src).toContain('driver/c/');
  });

  it('never puts unsafe keys into the PostgREST filter', async () => {
    rows = [];
    const out = await getMediaBatch('driver', ['norris', 'x),entity_key.neq.(y', 'a b', '']);
    expect(orFilter).toHaveBeenCalledTimes(1);
    const expr = orFilter.mock.calls[0]![0] as string;
    expect(expr).toContain('norris');
    expect(expr).not.toMatch(/neq|\s/);
    expect(out.get('x),entity_key.neq.(y')?.status).toBe('placeholder');
    await getMediaBatch('driver', ['bad key!']);
    expect(orFilter).toHaveBeenCalledTimes(1); // nothing valid → no query at all
  });

  it('degrades to placeholders when the database errors', async () => {
    failWith = 'boom';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const out = await getMediaBatch('car', ['mclaren:2025']);
    expect(out.get('mclaren:2025')?.status).toBe('placeholder');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
