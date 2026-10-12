/**
 * Smaller renditions of news images, served by the publisher's own CDN.
 *
 * News covers are hotlinked press images (never copied to our storage). The
 * RSS feeds hand us the largest rendition — motorsport.com's `s6` is a
 * 1200 px, ~340 KB JPEG — even for a 64 px home thumbnail. These publishers
 * expose fixed size variants in the URL, so next/image can ask for the right
 * width through a custom loader (no Vercel image optimisation, no copies).
 * Measured 2026-10-12: motorsport s4 135×89 7 KB, s3 300×200 30 KB vs s6
 * 338 KB; Ghost `size/w160/format/webp` 5.5 KB vs 175 KB original; BBC
 * `240/….webp` 8 KB vs 54 KB PNG.
 *
 * Unknown hosts get `null`: the caller keeps the original URL.
 */

/** motorsport.com: `/images/amp/{id}/{size}/{slug}` — measured pixel widths per size code. */
const MOTORSPORT_SIZES: ReadonlyArray<[number, string]> = [
  [135, 's4'],
  [300, 's3'],
  [413, 's2'],
  [600, 's1'],
  [1000, 's1000'],
  [1200, 's1200'],
];

/** BBC ichef `/ace/standard/{w}/…` widths that the CDN serves. */
const BBC_WIDTHS = [240, 480, 800, 976];

/** Ghost image service widths we request (`/content/images/size/w{n}/format/webp/…`). */
const GHOST_WIDTHS = [160, 300, 600, 1000, 1600];

function pick<T>(sorted: ReadonlyArray<[number, T]>, width: number): T {
  return (sorted.find(([w]) => w >= width) ?? sorted[sorted.length - 1])[1];
}

const MOTORSPORT = /^(https:\/\/cdn-\d+\.motorsport\.com\/images\/amp\/[^/]+\/)s\d+(\/[^?#]+)$/i;
const BBC = /^(https:\/\/ichef\.bbci\.co\.uk\/(?:ace|news)\/(?:standard|ws)\/)\d+(\/[^?#]+?)(\.webp)?$/i;
const GHOST = /^(https:\/\/[^/]+\/(?:[^?#]*\/)?content\/images\/)(?!size\/)([^?#]+)$/i;

/** Publisher URL for `src` at least `width` px wide, or null when the host has no known size scheme. */
export function publisherImageUrl(src: string, width: number): string | null {
  let m = MOTORSPORT.exec(src);
  if (m) return `${m[1]}${pick(MOTORSPORT_SIZES, width)}${m[2]}`;

  m = BBC.exec(src);
  if (m) {
    const w = BBC_WIDTHS.find((x) => x >= width) ?? BBC_WIDTHS[BBC_WIDTHS.length - 1];
    return `${m[1]}${w}${m[2]}.webp`;
  }

  m = GHOST.exec(src);
  if (m && !/\.(gif|svg)$/i.test(m[2])) {
    const w = GHOST_WIDTHS.find((x) => x >= width) ?? GHOST_WIDTHS[GHOST_WIDTHS.length - 1];
    return `${m[1]}size/w${w}/format/webp/${m[2]}`;
  }

  return null;
}

/** True when `publisherImageUrl` can resize this URL (lets callers attach a next/image loader). */
export function hasPublisherSizes(src: string | null | undefined): src is string {
  return typeof src === 'string' && publisherImageUrl(src, 1) !== null;
}

/** next/image loader built on `publisherImageUrl` (falls back to the original URL). */
export function publisherImageLoader({ src, width }: { src: string; width: number }): string {
  return publisherImageUrl(src, width) ?? src;
}
