import { isValidMediaKey, MEDIA_MAX_KEYS_PER_REQUEST } from '@/lib/media/keys';
import type { MediaResult } from '@/lib/media/read';
import type { MediaEntityType } from '@/lib/media/types';

/**
 * Browser-side media lookup for components that render without a server
 * result. Lookups made in the same tick are sent as one `/api/media` request
 * per type, and answers are kept for the page's lifetime, so a list of
 * twenty cards costs one request and a revisit renders straight from memory.
 * A failed request answers `placeholder`; it never throws.
 */

const resolved = new Map<string, MediaResult>();
const inflight = new Map<string, Promise<MediaResult>>();
const queued = new Map<MediaEntityType, Map<string, (r: MediaResult) => void>>();
let flushScheduled = false;

/** Same shape as `placeholderResult` in read.ts, which stays out of the browser bundle (it imports the DB client). */
function placeholderResult(type: MediaEntityType, key: string): MediaResult {
  return { status: 'placeholder', type, key, placeholder: { kind: type, seed: key } };
}

const cacheKey = (type: MediaEntityType, key: string) => `${type}|${key}`;

/** Already-known answer for a key, or undefined while it has never been asked. */
export function peekMedia(type: MediaEntityType, key: string): MediaResult | undefined {
  return resolved.get(cacheKey(type, key.toLowerCase()));
}

/** Items by key, or null when the request failed (then nothing is cached, a later mount asks again). */
async function fetchChunk(type: MediaEntityType, keys: string[]): Promise<Record<string, MediaResult> | null> {
  try {
    const res = await fetch(`/api/media?type=${type}&keys=${keys.map(encodeURIComponent).join(',')}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: Record<string, MediaResult> };
    return data.items ?? {};
  } catch {
    return null;
  }
}

function flush(): void {
  flushScheduled = false;
  const batches = Array.from(queued.entries());
  queued.clear();
  for (const [type, waiting] of batches) {
    const keys = Array.from(waiting.keys());
    for (let i = 0; i < keys.length; i += MEDIA_MAX_KEYS_PER_REQUEST) {
      const chunk = keys.slice(i, i + MEDIA_MAX_KEYS_PER_REQUEST);
      void fetchChunk(type, chunk).then((items) => {
        for (const key of chunk) {
          const result = items?.[key] ?? placeholderResult(type, key);
          if (items) resolved.set(cacheKey(type, key), result);
          inflight.delete(cacheKey(type, key));
          waiting.get(key)?.(result);
        }
      });
    }
  }
}

export function loadMedia(type: MediaEntityType, rawKey: string): Promise<MediaResult> {
  const key = rawKey.toLowerCase();
  const id = cacheKey(type, key);
  const known = resolved.get(id);
  if (known) return Promise.resolve(known);
  if (!isValidMediaKey(key)) return Promise.resolve(placeholderResult(type, key));
  const pending = inflight.get(id);
  if (pending) return pending;

  const promise = new Promise<MediaResult>((resolve) => {
    let waiting = queued.get(type);
    if (!waiting) {
      waiting = new Map();
      queued.set(type, waiting);
    }
    waiting.set(key, resolve);
  });
  inflight.set(id, promise);
  if (!flushScheduled) {
    flushScheduled = true;
    setTimeout(flush, 0);
  }
  return promise;
}
