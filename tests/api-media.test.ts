import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getMediaBatch = vi.fn();

vi.mock('@/lib/media/read', async (orig) => ({
  ...(await orig<typeof import('@/lib/media/read')>()),
  getMediaBatch: (...a: unknown[]) => getMediaBatch(...a),
}));
vi.mock('@/lib/rateLimit', () => ({
  getClientIP: () => 'unknown',
  rateLimit: vi.fn(async () => ({ success: true, retryAfter: 0 })),
}));

const { GET } = await import('@/app/api/media/route');
const { placeholderResult, rowToResult } = await import('@/lib/media/read');

const req = (qs: string) => new NextRequest(`http://localhost/api/media${qs}`);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://proj.supabase.co';
});

describe('GET /api/media', () => {
  it.each([
    ['', 'missing params'],
    ['?type=driver', 'missing keys'],
    ['?keys=norris', 'missing type'],
    ['?type=tyre&keys=norris', 'unknown type'],
    ['?type=driver&keys=norris,../etc/passwd', 'path traversal in keys'],
    ['?type=driver&keys=https://evil.example/x.png', 'URL as key'],
    ['?type=driver&keys=NORRIS%20DROP', 'whitespace/sql-ish'],
    [`?type=driver&keys=${Array.from({ length: 41 }, (_, i) => `k${i}`).join(',')}`, 'too many keys'],
  ])('rejects %s (%s) with 400 before any database work', async (qs) => {
    const res = await GET(req(qs));
    expect(res.status).toBe(400);
    expect(getMediaBatch).not.toHaveBeenCalled();
  });

  it('answers every requested key (image or placeholder) with CDN cache headers', async () => {
    getMediaBatch.mockResolvedValue(
      new Map([
        ['norris', rowToResult({
          entity_type: 'driver', entity_key: 'norris', width: 640, height: 800,
          variants: [{ w: 320, h: 400, path: 'driver/norris/ab12/320.webp', bytes: 1 }, { w: 640, h: 800, path: 'driver/norris/ab12/640.webp', bytes: 2 }],
          blur_data_url: 'data:image/webp;base64,xx', dominant_color: '#112233',
          attribution: 'Jane / Wikimedia Commons, CC BY-SA 4.0', author: 'Jane', license: 'CC BY-SA 4.0',
          license_url: null, source_page_url: 'https://commons.wikimedia.org/wiki/File:X.jpg', is_trademark: false,
        })],
        ['unknown_guy', placeholderResult('driver', 'unknown_guy')],
      ]),
    );
    const res = await GET(req('?type=driver&keys=norris,unknown_guy'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=3600');
    const body = await res.json();
    expect(Object.keys(body.items)).toEqual(['norris', 'unknown_guy']);
    expect(body.items.norris).toMatchObject({
      status: 'image',
      image: {
        src: 'https://proj.supabase.co/storage/v1/object/public/media/driver/norris/ab12/640.webp',
        srcSet: expect.stringContaining('320w'),
        width: 640,
        height: 800,
      },
      attribution: { text: expect.stringContaining('CC BY-SA 4.0'), trademark: false },
    });
    expect(body.items.unknown_guy).toEqual({ status: 'placeholder', type: 'driver', key: 'unknown_guy', placeholder: { kind: 'driver', seed: 'unknown_guy' } });
  });

  it('never leaks internal/private columns', async () => {
    getMediaBatch.mockResolvedValue(new Map([['norris', placeholderResult('driver', 'norris')]]));
    const res = await GET(req('?type=driver&keys=norris'));
    const text = JSON.stringify(await res.json());
    for (const secret of ['last_error', 'attempts', 'content_sha256', 'rejected_files', 'next_check_at']) {
      expect(text).not.toContain(secret);
    }
  });
});

describe('rowToResult', () => {
  it('falls back to a placeholder when variants are missing or malformed', () => {
    const base = {
      entity_type: 'car' as const, entity_key: 'mclaren:2025', width: null, height: null, blur_data_url: null, dominant_color: null,
      attribution: null, author: null, license: null, license_url: null, source_page_url: null, is_trademark: false,
    };
    expect(rowToResult({ ...base, variants: [] }).status).toBe('placeholder');
    expect(rowToResult({ ...base, variants: 'garbage' }).status).toBe('placeholder');
    expect(rowToResult({ ...base, variants: [{ nope: 1 }] }).status).toBe('placeholder');
  });
});
