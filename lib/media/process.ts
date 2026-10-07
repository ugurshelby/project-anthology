import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { MediaHttpError, throttledFetch, type FetchOptions } from '@/lib/media/http';
import type { MediaEntityType, ProcessedImage } from '@/lib/media/types';

/**
 * Download + re-encode. The site serves OUR re-encoded WebP copies (small,
 * immutable, CDN-cached), never the upstream file. Re-encoding also strips all
 * EXIF/metadata and neutralises hostile payloads (SVGs arrive from Commons as
 * server-rendered PNG and are rasterised again here; no SVG is ever stored).
 */

/** Variant widths per type. Smallest first; the largest never exceeds the source. */
export const VARIANT_WIDTHS: Record<MediaEntityType, number[]> = {
  driver: [160, 320, 640],
  team: [96, 192, 384],
  car: [480, 960, 1600],
  circuit: [480, 960, 1600],
};

const WEBP_QUALITY: Record<MediaEntityType, number> = { driver: 78, team: 90, car: 76, circuit: 74 };

/** Hard ceilings so a hostile/huge file cannot exhaust a serverless function. */
export const MAX_DOWNLOAD_BYTES = 12 * 1024 * 1024;
const MAX_INPUT_PIXELS = 60_000_000;

const MAGIC: Array<{ mime: string; test: (b: Buffer) => boolean }> = [
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: 'image/webp',
    test: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  },
];

export function sniffImageMime(buf: Buffer): string | null {
  return MAGIC.find((m) => m.test(buf))?.mime ?? null;
}

/** Only Wikimedia upload/thumb hosts are ever downloaded (no user-supplied URLs reach here). */
const ALLOWED_DOWNLOAD_HOSTS = new Set(['upload.wikimedia.org', 'thumb.wikimedia.org']);

export function isAllowedDownloadUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_DOWNLOAD_HOSTS.has(u.host);
  } catch {
    return false;
  }
}

const MAX_DOWNLOAD_REDIRECTS = 3;

/**
 * Read a response body but stop as soon as it passes `limit` bytes, so a file
 * without (or with a lying) Content-Length is never buffered in full.
 */
async function readCapped(res: Response, limit: number): Promise<Buffer> {
  if (!res.body) return Buffer.alloc(0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      throw new MediaHttpError(`file too large (>${limit} bytes)`, null, false);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks, total);
}

export async function downloadImage(url: string, opts: FetchOptions = {}): Promise<Buffer> {
  // Redirects are followed by hand so the host allow-list applies to EVERY hop,
  // not just the first URL.
  let current = url;
  let res: Response | null = null;
  for (let hop = 0; hop <= MAX_DOWNLOAD_REDIRECTS; hop++) {
    if (!isAllowedDownloadUrl(current)) {
      throw new MediaHttpError(`download host not allowed: ${current}`, null, false);
    }
    const r = await throttledFetch(current, {
      ...opts,
      accept: 'image/*',
      timeoutMs: opts.timeoutMs ?? 30_000,
      redirect: 'manual',
    });
    if (r.status < 300 || r.status >= 400) {
      res = r;
      break;
    }
    const location = r.headers.get('location');
    await r.body?.cancel().catch(() => {});
    if (!location) throw new MediaHttpError(`redirect without location from ${current}`, r.status, false);
    current = new URL(location, current).toString();
  }
  if (!res) throw new MediaHttpError(`too many redirects for ${url}`, null, false);

  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_DOWNLOAD_BYTES) {
    await res.body?.cancel().catch(() => {});
    throw new MediaHttpError(`file too large (${declared} bytes)`, null, false);
  }
  const buf = await readCapped(res, MAX_DOWNLOAD_BYTES);
  if (!sniffImageMime(buf)) throw new MediaHttpError('downloaded bytes are not jpeg/png/webp', null, false);
  return buf;
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
}

export async function processImage(input: Buffer, type: MediaEntityType): Promise<ProcessedImage> {
  const base = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' }).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error('image has no dimensions');

  const isLogo = type === 'team';
  // Never upscale: keep configured widths the source can supply, else just the source width.
  const fitting = VARIANT_WIDTHS[type].filter((w) => w <= meta.width!);
  const widths = fitting.length ? fitting : [meta.width];
  const variants: ProcessedImage['variants'] = [];
  for (const w of widths) {
    const targetW = Math.min(w, meta.width);
    const pipeline = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();
    const resized = isLogo
      ? pipeline.resize({ width: targetW, fit: 'inside', withoutEnlargement: true })
      : pipeline.resize({ width: targetW, withoutEnlargement: true });
    const { data, info } = await resized
      .webp({ quality: WEBP_QUALITY[type], effort: 5, alphaQuality: 100 })
      .toBuffer({ resolveWithObject: true });
    // De-duplicate when a small source collapses several widths to the same size.
    if (variants.some((v) => v.w === info.width)) continue;
    variants.push({ w: info.width, h: info.height, bytes: data.length, buffer: data });
  }

  const tiny = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({ width: 16, withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();
  const stats = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).rotate().resize({ width: 64 }).stats();
  const [r, g, b] = stats.channels;

  const largest = variants[variants.length - 1]!;
  return {
    width: largest.w,
    height: largest.h,
    sha256: createHash('sha256').update(input).digest('hex'),
    blurDataUrl: `data:image/webp;base64,${tiny.toString('base64')}`,
    dominantColor: toHex(r?.mean ?? 0, g?.mean ?? 0, b?.mean ?? 0),
    variants,
  };
}
