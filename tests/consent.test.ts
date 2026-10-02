import { describe, expect, it } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  clearConsent,
  isAnalyticsAllowed,
  readConsent,
  writeConsent,
  type ConsentStorage,
} from '@/lib/consent';

function memoryStorage(initial: Record<string, string> = {}): ConsentStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwingStorage: ConsentStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('analytics consent', () => {
  it('defaults to off when nothing is stored', () => {
    const value = readConsent(memoryStorage());
    expect(value).toBe('unknown');
    expect(isAnalyticsAllowed(value)).toBe(false);
  });

  it('treats unexpected stored values as off', () => {
    expect(readConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: 'yes' }))).toBe('unknown');
  });

  it('accept turns analytics on and persists', () => {
    const storage = memoryStorage();
    expect(writeConsent(storage, 'granted')).toBe(true);
    const value = readConsent(storage);
    expect(value).toBe('granted');
    expect(isAnalyticsAllowed(value)).toBe(true);
  });

  it('decline keeps analytics off and persists', () => {
    const storage = memoryStorage();
    expect(writeConsent(storage, 'denied')).toBe(true);
    const value = readConsent(storage);
    expect(value).toBe('denied');
    expect(isAnalyticsAllowed(value)).toBe(false);
  });

  it('revoke returns to off and asks again', () => {
    const storage = memoryStorage();
    writeConsent(storage, 'granted');
    expect(clearConsent(storage)).toBe(true);
    expect(readConsent(storage)).toBe('unknown');
    expect(isAnalyticsAllowed(readConsent(storage))).toBe(false);
  });

  it('stays off and never throws when storage is unavailable', () => {
    expect(readConsent(null)).toBe('unknown');
    expect(readConsent(throwingStorage)).toBe('unknown');
    expect(writeConsent(null, 'granted')).toBe(false);
    expect(writeConsent(throwingStorage, 'granted')).toBe(false);
    expect(clearConsent(null)).toBe(false);
    expect(clearConsent(throwingStorage)).toBe(false);
  });
});
