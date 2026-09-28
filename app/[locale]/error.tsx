'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-[var(--container-max)] flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center md:px-8 lg:px-16">
      <span className="label-caps text-text-mid">Error</span>
      <h1
        className="font-condensed uppercase text-text-hi"
        style={{
          fontFamily: 'var(--font-condensed)',
          fontWeight: 700,
          fontSize: 'clamp(40px, 6vw, 72px)',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
        }}
      >
        Retired
      </h1>
      <p className="body-md max-w-[48ch] text-text-mid">
        Something went wrong loading this page. The pit crew has been notified.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="label-caps mt-2 cursor-pointer rounded-[var(--radius-pill)] border border-hairline bg-surface px-6 py-3 text-text-hi transition-colors hover:border-accent"
      >
        Try Again
      </button>
    </main>
  );
}
