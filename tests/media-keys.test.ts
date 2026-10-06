import { describe, expect, it } from 'vitest';
import { carKey, iconicCarKey, isMediaEntityType, isValidMediaKey, keyToPathSegment, parseKeyList } from '@/lib/media/keys';

describe('media keys', () => {
  it('validates keys', () => {
    for (const ok of ['norris', 'max_verstappen', 'mclaren:2025', 'iconic:ferrari-f2004', 'a.b-c_d']) {
      expect(isValidMediaKey(ok)).toBe(true);
    }
    for (const bad of ['', 'UPPER', 'a b', 'a/b', '../etc', 'a;drop', 'x'.repeat(81), 'é', 'a%20b', 'http://x']) {
      expect(isValidMediaKey(bad)).toBe(false);
    }
    expect(isValidMediaKey(undefined)).toBe(false);
  });

  it('validates entity types', () => {
    expect(isMediaEntityType('driver')).toBe(true);
    expect(isMediaEntityType('tyre')).toBe(false);
    expect(isMediaEntityType(null)).toBe(false);
  });

  it('builds car keys per season (no borrowing across seasons)', () => {
    expect(carKey('McLaren', 2025)).toBe('mclaren:2025');
    expect(carKey('mclaren', 2025)).not.toBe(carKey('mclaren', 2024));
    expect(iconicCarKey('Ferrari-F2004')).toBe('iconic:ferrari-f2004');
    expect(keyToPathSegment('mclaren:2025')).toBe('mclaren__2025');
  });

  it('parses key lists strictly: one bad key rejects the whole list', () => {
    expect(parseKeyList('norris, Hamilton ,norris')).toEqual(['norris', 'hamilton']);
    expect(parseKeyList(null)).toBeNull();
    expect(parseKeyList('')).toBeNull();
    expect(parseKeyList('norris,../x')).toBeNull();
    expect(parseKeyList(Array.from({ length: 41 }, (_, i) => `k${i}`).join(','))).toBeNull();
    expect(parseKeyList(Array.from({ length: 40 }, (_, i) => `k${i}`).join(','))).toHaveLength(40);
  });
});
