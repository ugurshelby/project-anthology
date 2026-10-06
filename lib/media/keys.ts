import { MEDIA_ENTITY_TYPES, type MediaEntityType } from '@/lib/media/types';

/**
 * Entity keys are Jolpica/Ergast ids (lowercase, digits, `_ . : -`). The same
 * pattern is enforced by a CHECK constraint in the database; the public API
 * validates with it too, so user input never reaches a query unchecked.
 */
export const MEDIA_KEY_PATTERN = /^[a-z0-9_.:-]{1,80}$/;

/** Max keys per public API request (keeps one query small and cacheable). */
export const MEDIA_MAX_KEYS_PER_REQUEST = 40;

export function isMediaEntityType(value: unknown): value is MediaEntityType {
  return typeof value === 'string' && (MEDIA_ENTITY_TYPES as readonly string[]).includes(value);
}

export function isValidMediaKey(value: unknown): value is string {
  return typeof value === 'string' && MEDIA_KEY_PATTERN.test(value);
}

/** Per-season car key: a team's car changes every year; seasons never borrow each other's image. */
export function carKey(constructorId: string, season: number): string {
  return `${constructorId.toLowerCase()}:${season}`;
}

/** Curated, season-independent iconic car key. */
export function iconicCarKey(slug: string): string {
  return `iconic:${slug.toLowerCase()}`;
}

/** Filesystem/URL-safe folder name for a key (':' is not safe in every storage path). */
export function keyToPathSegment(key: string): string {
  return key.replace(/:/g, '__');
}

/**
 * Parse a comma-separated `keys` query value. Returns null if ANY key is
 * invalid or the list is empty/too long — callers answer 400, never a partial result.
 */
export function parseKeyList(raw: string | null): string[] | null {
  if (!raw) return null;
  const keys = raw
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  if (keys.length === 0 || keys.length > MEDIA_MAX_KEYS_PER_REQUEST) return null;
  if (!keys.every(isValidMediaKey)) return null;
  return Array.from(new Set(keys));
}
