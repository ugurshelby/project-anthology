'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LiveTimingResponse } from '@/app/api/live-timing/route';
import { nextPollDelay } from '@/lib/home/livePoll';

const MAX_ROWS = 8;

/**
 * Simple live classification strip for the home hero's "live" phase.
 * Polls /api/live-timing (server-side OpenF1 proxy) while mounted; the parent
 * only mounts this during lib/f1Calendar's RACE_LIVE_WINDOW_MS. Polling slows
 * down while the data source is locked or failing (plan 1.7).
 */
export function LiveRaceTracker() {
  const t = useTranslations('ui.home.live');
  const [data, setData] = useState<LiveTimingResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    async function poll() {
      let restricted = false;
      try {
        const res = await fetch('/api/live-timing', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as LiveTimingResponse;
        restricted = json.restricted === true;
        failures = 0;
        if (!cancelled) {
          setData(json);
          setFailed(false);
        }
      } catch {
        failures += 1;
        if (!cancelled) setFailed(true);
      }
      if (!cancelled) timer = setTimeout(poll, nextPollDelay({ failures, restricted }));
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (data?.restricted) {
    return (
      <div className="flex max-w-sm flex-col gap-1">
        <span className="label-caps flex items-center gap-2 text-accent">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {t('restrictedTitle')}
        </span>
        <span className="text-sm leading-snug text-text-mid">{t('restrictedBody')}</span>
      </div>
    );
  }

  if (failed && !data) {
    return <span className="label-caps text-text-low">{t('unavailable')}</span>;
  }

  if (!data) {
    return <span className="label-caps text-text-low">{t('connecting')}</span>;
  }

  if (!data.live || data.rows.length === 0) {
    return <span className="label-caps text-accent">{t('pending')}</span>;
  }

  const rows = data.rows.slice(0, MAX_ROWS);

  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps flex items-center gap-2 text-accent">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        {t('live')} · {data.sessionName ?? t('session')}
      </span>
      <ol className="flex max-w-md flex-col gap-1 font-mono text-[13px]">
        {rows.map((row) => (
          <li key={row.driverNumber} className="flex items-center gap-2 text-text-mid">
            <span className="w-4 text-right text-text-hi">{row.position}</span>
            <span aria-hidden className="h-3 w-1 rounded-sm" style={{ backgroundColor: row.teamColour }} />
            <span className="text-text-hi">{row.code}</span>
            {row.interval ? <span className="text-text-low">{row.interval}</span> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
