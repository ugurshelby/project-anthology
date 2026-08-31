/**
 * Unit tests for lib/api/validation — Ergast slug guard used by public API routes.
 */

import { describe, expect, it } from 'vitest';
import { isErgastSlug } from '@/lib/api/validation';

describe('isErgastSlug', () => {
  const valid = [
    'hamilton',
    'lewis-hamilton',
    'red_bull',
    'kick_sauber',
    'catalunya',
    'monaco',
    'rb',
    'a',
  ];

  it.each(valid)('accepts %s', (id) => {
    expect(isErgastSlug(id)).toBe(true);
  });

  const invalid = [
    '',
    'Hamilton',
    'hamilton!',
    '../etc/passwd',
    'a'.repeat(65),
    ' hamilton',
    'hamilton ',
    'hamilton\n',
    'hamilton%20',
    'hamilton/sainz',
  ];

  it.each(invalid)('rejects %j', (id) => {
    expect(isErgastSlug(id)).toBe(false);
  });
});
