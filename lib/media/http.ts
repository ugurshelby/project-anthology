import { getSiteUrl } from '@/lib/data/siteUrl';

/**
 * Polite, throttled HTTP for the media sync. Wikimedia rate-limits per IP
 * (HTTP 429 + Retry-After) and its User-Agent policy asks for a descriptive UA
 * with contact info, so every call here goes through one per-host throttle.
 */

export class MediaHttpError extends Error {
  readonly status: number | null;
  /** True for 429 / 5xx / network errors: retry later, do NOT mark an entity as missing. */
  readonly transient: boolean;
  constructor(message: string, status: number | null, transient: boolean) {
    super(message);
    this.name = 'MediaHttpError';
    this.status = status;
    this.transient = transient;
  }
}

const lastCallAt = new Map<string, number>();

/** Min spacing between calls to the same host (ms). Overridable in tests. */
const hostIntervalMs = new Map<string, number>([
  ['commons.wikimedia.org', 1_100],
  ['www.wikidata.org', 1_100],
  ['en.wikipedia.org', 1_100],
  ['api.jolpi.ca', 1_200],
]);
const DEFAULT_INTERVAL_MS = 400;

export function setHostIntervalForTests(host: string, ms: number): void {
  hostIntervalMs.set(host, ms);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function mediaUserAgent(): string {
  const contact = process.env.MEDIA_CONTACT?.trim() || getSiteUrl();
  return `ApexF1FanArchive/1.0 (${contact}) project-anthology media-sync`;
}

export interface FetchOptions {
  timeoutMs?: number;
  /** Absolute epoch ms after which we stop waiting/retrying (the cron work budget). */
  deadlineMs?: number;
  maxRetries?: number;
  accept?: string;
  /** 'manual' returns 3xx responses to the caller instead of following them. */
  redirect?: 'follow' | 'manual';
}

/** Throttled fetch with 429/5xx backoff. Throws MediaHttpError. */
export async function throttledFetch(url: string, opts: FetchOptions = {}): Promise<Response> {
  const host = new URL(url).host;
  const interval = hostIntervalMs.get(host) ?? DEFAULT_INTERVAL_MS;
  const maxRetries = opts.maxRetries ?? 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const wait = Math.max(0, interval - (Date.now() - (lastCallAt.get(host) ?? 0)));
    if (opts.deadlineMs && Date.now() + wait > opts.deadlineMs) {
      throw new MediaHttpError('work budget exhausted before request', null, true);
    }
    if (wait > 0) await sleep(wait);
    lastCallAt.set(host, Date.now());

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 20_000);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: ctrl.signal,
        redirect: opts.redirect ?? 'follow',
        headers: { 'User-Agent': mediaUserAgent(), Accept: opts.accept ?? 'application/json' },
      });
    } catch (err) {
      clearTimeout(timer);
      if (attempt === maxRetries) throw new MediaHttpError(`network error: ${String(err)}`, null, true);
      await sleep(1_000 * 2 ** attempt);
      continue;
    }
    clearTimeout(timer);

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1_000 : 2_000 * 2 ** attempt;
      if (attempt === maxRetries || (opts.deadlineMs && Date.now() + backoffMs > opts.deadlineMs)) {
        throw new MediaHttpError(`HTTP ${res.status} from ${host}`, res.status, true);
      }
      await sleep(Math.min(backoffMs, 60_000));
      continue;
    }
    if (opts.redirect === 'manual' && res.status >= 300 && res.status < 400) return res;
    if (!res.ok) throw new MediaHttpError(`HTTP ${res.status} from ${host}`, res.status, false);
    return res;
  }
  throw new MediaHttpError(`retries exhausted for ${host}`, null, true);
}

export async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const res = await throttledFetch(url, opts);
  return (await res.json()) as T;
}
