/**
 * Analytics consent — pure logic plus a tiny external store.
 * Default is "unknown", which counts as NOT consented. Only an explicit
 * "granted" allows loading @vercel/analytics and @vercel/speed-insights.
 * The choice lives in localStorage only; it is never sent anywhere.
 */

export const CONSENT_STORAGE_KEY = 'apex-analytics-consent';

export type ConsentValue = 'unknown' | 'granted' | 'denied';

/** The subset of Storage the consent logic needs (lets tests inject a fake). */
export interface ConsentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Browser storage, or null when it is unavailable or throws (private mode, blocked). */
export function getBrowserStorage(): ConsentStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Stored choice; anything missing, unreadable or unexpected is "unknown". */
export function readConsent(storage: ConsentStorage | null): ConsentValue {
  if (!storage) return 'unknown';
  try {
    const raw = storage.getItem(CONSENT_STORAGE_KEY);
    return raw === 'granted' || raw === 'denied' ? raw : 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Persist a choice. Returns false when storage is unavailable (choice then lasts for this page view only). */
export function writeConsent(storage: ConsentStorage | null, value: 'granted' | 'denied'): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CONSENT_STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

/** Forget the choice (revoke): back to "unknown", so the notice asks again. */
export function clearConsent(storage: ConsentStorage | null): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(CONSENT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function isAnalyticsAllowed(value: ConsentValue): boolean {
  return value === 'granted';
}

/* ------------------------------------------------------------------ */
/* Client store for useSyncExternalStore                               */
/* ------------------------------------------------------------------ */

export interface ConsentSnapshot {
  hydrated: boolean;
  consent: ConsentValue;
  /** The notice was reopened from the footer while a choice already exists. */
  reopened: boolean;
}

export const SERVER_SNAPSHOT: ConsentSnapshot = { hydrated: false, consent: 'unknown', reopened: false };

let snapshot: ConsentSnapshot | null = null;
const listeners = new Set<() => void>();

function emit(next: ConsentSnapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

export function getConsentSnapshot(): ConsentSnapshot {
  if (!snapshot) {
    snapshot = { hydrated: true, consent: readConsent(getBrowserStorage()), reopened: false };
  }
  return snapshot;
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Accept or decline. Works for the current page view even when storage fails. */
export function setConsent(value: 'granted' | 'denied'): void {
  writeConsent(getBrowserStorage(), value);
  emit({ hydrated: true, consent: value, reopened: false });
}

/** Footer link: show the notice again so the choice can be changed. */
export function reopenConsent(): void {
  emit({ ...getConsentSnapshot(), reopened: true });
}

/** Close a reopened notice without changing the choice. */
export function dismissReopened(): void {
  emit({ ...getConsentSnapshot(), reopened: false });
}
