import { Expo } from 'expo-server-sdk';
import { z } from 'zod';
import { ERGAST_SLUG_MAX_LEN, ERGAST_SLUG_PATTERN } from '@/lib/api/validation';
import { isMediaEntityType, MEDIA_KEY_PATTERN, MEDIA_MAX_KEYS_PER_REQUEST } from '@/lib/media/keys';
import type { MediaEntityType } from '@/lib/media/types';

/**
 * Zod schemas for the public API routes' input. Each one mirrors the rule the
 * route enforced by hand before (same allowed values, patterns and lengths), so
 * a route answers the same status and body for the same input.
 */

// ── POST /api/push/register ─────────────────────────────────────────────────

export const MAX_PREFERENCE_KEYS = 20;

/**
 * Lenient on purpose: a non-object becomes `{}`, non-boolean values are
 * dropped and only the first MAX_PREFERENCE_KEYS keys are kept. Preferences
 * never fail the request; only the token does.
 */
const preferences = z
  .record(z.string(), z.unknown())
  .catch({})
  .transform((prefs) =>
    Object.fromEntries(
      Object.entries(prefs)
        .filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
        .slice(0, MAX_PREFERENCE_KEYS),
    ),
  );

export const pushRegisterBody: z.ZodType<{ token: string; preferences: Record<string, boolean> }> =
  z.object({
    token: z.string().min(1).refine((token) => Expo.isExpoPushToken(token)),
    preferences,
  });

export type PushRegisterBody = z.infer<typeof pushRegisterBody>;

// ── GET /api/f1-season ──────────────────────────────────────────────────────

/**
 * Allowed `path` shapes (Jolpica F1 endpoints we actually use):
 *   {year}
 *   {year}/driverStandings
 *   {year}/constructorStandings
 *   {year}/{round}/results
 *   {year}/{round}/qualifying
 *   {year}/{round}/sprint
 *   {year}/{round}/pitstops
 * Trailing `.json` is optional. Anything else is rejected.
 */
export const F1_SEASON_PATH_WHITELIST =
  /^\d{4}(?:\/(?:driverStandings|constructorStandings)|\/\d{1,2}\/(?:results|qualifying|sprint|pitstops))?(?:\.json)?$/;

/**
 * Only `path` is allowed (strict: any other key is an `unrecognized_keys`
 * issue). The value is trimmed and loses leading slashes before the whitelist.
 */
export const f1SeasonQuery = z.strictObject({
  path: z
    .string()
    .transform((raw) => raw.trim().replace(/^\/+/, ''))
    .pipe(z.string().regex(F1_SEASON_PATH_WHITELIST)),
});

export type F1SeasonQuery = z.infer<typeof f1SeasonQuery>;

/** True when the failure includes a query key other than the allowed ones. */
export function hasUnknownKeys(error: z.ZodError): boolean {
  return error.issues.some((issue) => issue.code === 'unrecognized_keys');
}

/**
 * Query params as a plain object for a schema. A repeated key keeps its first
 * value, the same one `URLSearchParams.get` returns.
 */
export function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of params) {
    if (!(key in out)) out[key] = value;
  }
  return out;
}

// ── GET /api/media ──────────────────────────────────────────────────────────

/**
 * Comma-separated keys: trimmed, lowercased, empties dropped, then every key
 * must match MEDIA_KEY_PATTERN (1..MEDIA_MAX_KEYS_PER_REQUEST of them) and the
 * list is de-duplicated. One bad key fails the whole list, never a partial result.
 */
const mediaKeyList = z
  .string()
  .transform((raw) =>
    raw
      .split(',')
      .map((key) => key.trim().toLowerCase())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().regex(MEDIA_KEY_PATTERN)).min(1).max(MEDIA_MAX_KEYS_PER_REQUEST))
  .transform((keys) => Array.from(new Set(keys)));

export const mediaQuery = z.object({
  type: z.custom<MediaEntityType>((value) => isMediaEntityType(value)),
  keys: mediaKeyList,
});

export type MediaQuery = z.infer<typeof mediaQuery>;

// ── GET /api/circuits/[id] ──────────────────────────────────────────────────

export const circuitIdParam = z
  .string()
  .min(1)
  .max(ERGAST_SLUG_MAX_LEN)
  .regex(ERGAST_SLUG_PATTERN);

export type CircuitIdParam = z.infer<typeof circuitIdParam>;
