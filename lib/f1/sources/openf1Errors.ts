/**
 * OpenF1 answers 401 for EVERY unauthenticated request (past sessions too)
 * while a live F1 session is running: "Live F1 session in progress. Global API
 * access … is restricted to authenticated users until the session ends."
 * (measured R17 Singapore, 2026-10-11, logs/2026-10-11.md §2).
 *
 * Kept in its own module so route tests that stub the adapter can still
 * recognise the error.
 */
export class OpenF1RestrictedError extends Error {
  readonly restricted = true;

  constructor(path: string) {
    super(`OpenF1 401 for ${path} (live session: unauthenticated access restricted)`);
    this.name = 'OpenF1RestrictedError';
  }
}

export function isOpenF1Restricted(err: unknown): err is OpenF1RestrictedError {
  return err instanceof OpenF1RestrictedError || (typeof err === 'object' && err !== null && (err as { restricted?: unknown }).restricted === true);
}
