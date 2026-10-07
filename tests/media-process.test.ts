import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setHostIntervalForTests } from '@/lib/media/http';
import {
  downloadImage,
  isAllowedDownloadUrl,
  MAX_DOWNLOAD_BYTES,
  processImage,
  sniffImageMime,
  VARIANT_WIDTHS,
} from '@/lib/media/process';

async function png(w: number, h: number, alpha = false): Promise<Buffer> {
  return sharp({
    create: { width: w, height: h, channels: alpha ? 4 : 3, background: alpha ? { r: 200, g: 30, b: 30, alpha: 0.5 } : { r: 200, g: 30, b: 30 } },
  })
    .png()
    .toBuffer();
}

describe('processImage', () => {
  it('produces WebP variants per type, never upscales, and adds blur + color', async () => {
    const out = await processImage(await png(2000, 1000), 'car');
    expect(out.variants.map((v) => v.w)).toEqual(VARIANT_WIDTHS.car);
    for (const v of out.variants) expect(sniffImageMime(v.buffer)).toBe('image/webp');
    expect(out.width).toBe(1600);
    expect(out.height).toBe(800);
    expect(out.blurDataUrl).toMatch(/^data:image\/webp;base64,/);
    expect(out.dominantColor).toMatch(/^#[0-9a-f]{6}$/);
    expect(out.sha256).toHaveLength(64);
  });

  it('keeps only the widths the source can supply', async () => {
    const out = await processImage(await png(500, 625), 'driver');
    expect(out.variants.map((v) => v.w)).toEqual([160, 320]);
    const tiny = await processImage(await png(100, 100), 'driver');
    expect(tiny.variants.map((v) => v.w)).toEqual([100]);
  });

  it('preserves transparency for logos', async () => {
    const out = await processImage(await png(600, 300, true), 'team');
    const meta = await sharp(out.variants[0]!.buffer).metadata();
    expect(meta.hasAlpha).toBe(true);
  });

  it('rejects garbage bytes', async () => {
    await expect(processImage(Buffer.from('not an image'), 'car')).rejects.toThrow();
  });
});

describe('download guards', () => {
  it('only allows https Wikimedia upload/thumb hosts', () => {
    expect(isAllowedDownloadUrl('https://upload.wikimedia.org/wikipedia/commons/a/a9/x.jpg')).toBe(true);
    expect(isAllowedDownloadUrl('https://thumb.wikimedia.org/wikipedia/commons/thumb/a/x.jpg/1280px-x.jpg')).toBe(true);
    for (const bad of ['http://upload.wikimedia.org/x.jpg', 'https://evil.example/x.jpg', 'https://upload.wikimedia.org.evil.example/x.jpg', 'file:///etc/passwd', 'not a url', 'https://169.254.169.254/latest']) {
      expect(isAllowedDownloadUrl(bad)).toBe(false);
    }
  });
  it('sniffs magic bytes', () => {
    expect(sniffImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffImageMime(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(sniffImageMime(Buffer.from('GIF89a'))).toBeNull();
  });
});

describe('downloadImage', () => {
  const ORIGIN = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/x.jpg';
  const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);

  setHostIntervalForTests('upload.wikimedia.org', 0);
  setHostIntervalForTests('thumb.wikimedia.org', 0);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetch(responses: Response[]) {
    const fetchMock = vi.fn(async () => responses.shift()!);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('follows a redirect that stays on an allowed host, checking every hop', async () => {
    const fetchMock = stubFetch([
      new Response(null, { status: 302, headers: { location: 'https://thumb.wikimedia.org/x.jpg' } }),
      new Response(JPEG, { status: 200 }),
    ]);
    await expect(downloadImage(ORIGIN, { maxRetries: 0 })).resolves.toEqual(JPEG);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((c) => (c as unknown[])[1])).toEqual([
      expect.objectContaining({ redirect: 'manual' }),
      expect.objectContaining({ redirect: 'manual' }),
    ]);
  });

  it('refuses a redirect to a host outside the allow-list without requesting it', async () => {
    const fetchMock = stubFetch([
      new Response(null, { status: 301, headers: { location: 'https://169.254.169.254/latest' } }),
    ]);
    await expect(downloadImage(ORIGIN, { maxRetries: 0 })).rejects.toThrow(/host not allowed/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('stops after too many redirects', async () => {
    const hop = () => new Response(null, { status: 302, headers: { location: ORIGIN } });
    stubFetch([hop(), hop(), hop(), hop(), hop()]);
    await expect(downloadImage(ORIGIN, { maxRetries: 0 })).rejects.toThrow(/too many redirects/);
  });

  it('rejects an oversized body even without a Content-Length header', async () => {
    const big = new Uint8Array(MAX_DOWNLOAD_BYTES + 1);
    big.set(JPEG);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < big.length; i += 1 << 20) controller.enqueue(big.subarray(i, i + (1 << 20)));
        controller.close();
      },
    });
    stubFetch([new Response(stream, { status: 200 })]);
    await expect(downloadImage(ORIGIN, { maxRetries: 0 })).rejects.toThrow(/file too large/);
  });

  it('rejects a declared Content-Length over the limit', async () => {
    stubFetch([
      new Response(JPEG, { status: 200, headers: { 'content-length': String(MAX_DOWNLOAD_BYTES + 1) } }),
    ]);
    await expect(downloadImage(ORIGIN, { maxRetries: 0 })).rejects.toThrow(/file too large/);
  });
});
