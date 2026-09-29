'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Visitor-local wall-clock time display — the general rule for showing any
 * session/race time on Apex: PRIMARY = the viewer's own device timezone
 * (never assumed from where the team/circuit is), SECONDARY (smaller, muted)
 * = the circuit's local time as reference context. Server-renders the UTC
 * fallback (`fallback` prop) so there's no layout shift; swaps to the real
 * local time once mounted in the browser.
 */

function formatIn(ms: number, timeZone?: string): string {
  const d = new Date(ms);
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long', timeZone });
  const clock = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  });
  return `${weekday} ${clock}`;
}

export function LocalTime({
  startMs,
  fallback,
  circuitTimeZone,
  className = '',
}: {
  /** UTC epoch ms of the session/race start. */
  startMs: number;
  /** UTC-formatted string to paint before hydration (avoids a flash/mismatch). */
  fallback: string;
  /** Circuit's IANA timezone (data/circuits/facts.ts) — shown as secondary reference. */
  circuitTimeZone?: string | null;
  className?: string;
}) {
  const t = useTranslations('common');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Deferred via setTimeout (not called synchronously in the effect body)
    // — same idiom as components/home/Countdown.tsx.
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return <span className={className}>{fallback}</span>;
  }

  const local = formatIn(startMs);
  const circuitLocal = circuitTimeZone ? formatIn(startMs, circuitTimeZone) : null;
  // Skip the secondary line entirely when it would just repeat the primary
  // (viewer happens to share the circuit's timezone).
  const showCircuitLocal = circuitLocal && circuitLocal !== local;

  return (
    <span className={className}>
      {local}
      {showCircuitLocal ? (
        <span className="ml-1.5 text-text-low">
          {'('}
          {t('circuitLocalTime')}
          {': '}
          {circuitLocal}
          {')'}
        </span>
      ) : null}
    </span>
  );
}
