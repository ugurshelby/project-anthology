import { describe, it, expect } from 'vitest';
import en from '../messages/en.json';
import tr from '../messages/tr.json';

function getDeepKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.keys(obj).flatMap((key) => {
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return getDeepKeys(val as Record<string, unknown>, fullPath);
    }
    return [fullPath];
  });
}

describe('i18n Message Integrity', () => {
  it('en.json and tr.json must have the identical key set', () => {
    const enKeys = getDeepKeys(en).sort();
    const trKeys = getDeepKeys(tr).sort();

    expect(enKeys).toEqual(trKeys);
  });
});
