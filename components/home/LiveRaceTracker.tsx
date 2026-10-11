'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { LiveTimingResponse } from '@/app/api/live-timing/route';
import { nextPollDelay } from '@/lib/home/livePoll';

const MAX_ROWS = 8;
/** Light i comes on at i × LIGHT_STEP_S; all five go out together at LIGHTS_OUT_S. */
const LIGHT_STEP_S = 0.45;
const LIGHTS_OUT_S = 2.6;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Home hero during the race window. With live timing (OpenF1 paid access) it
 * shows the running order; on the free tier OpenF1 locks the session, so it
 * shows the race-day panel instead: start lights going out, a race clock
 * counting from the green light, and where results will appear. After the
 * flag it says results are on the way and links to the round page.
 * Polling slows down while the source is locked or failing (plan 1.7).
 */
export function LiveRaceTracker({ startMs, resultsHref }: { startMs?: number | null; resultsHref?: string }) {
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

  // Running order available (paid live access).
  if (data?.live && !data.restricted && data.rows.length > 0) {
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

  // The session is over (OpenF1 unlocked, not live any more): results are on the way.
  if (data && !data.live) {
    return (
      <div className="flex max-w-md flex-col gap-2">
        <span className="flex items-center gap-3">
          <ChequeredFlag />
          <span className="font-condensed text-3xl font-bold uppercase italic leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {t('finishedTitle')}
          </span>
        </span>
        <span className="text-sm leading-snug text-text-mid">{t('finishedBody')}</span>
        {resultsHref ? (
          <Link href={resultsHref} className="label-caps w-fit text-accent transition-colors hover:text-text-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            {t('resultsLink')}
          </Link>
        ) : null}
      </div>
    );
  }

  // Race running without a running order (free tier lock, or the proxy is down / still connecting).
  return <LightsOutPanel startMs={startMs ?? null} connecting={!data && !failed} />;
}

export function LightsOutPanel({ startMs, connecting }: { startMs: number | null; connecting: boolean }) {
  const t = useTranslations('ui.home.live');
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const elapsed = now !== null && startMs !== null ? Math.max(0, now - startMs) : null;
  const clock =
    elapsed === null
      ? '--:--:--'
      : `${pad(Math.floor(elapsed / 3_600_000))}:${pad(Math.floor((elapsed % 3_600_000) / 60_000))}:${pad(Math.floor((elapsed % 60_000) / 1000))}`;

  return (
    <div className="flex max-w-md flex-col gap-3" aria-busy={connecting}>
      <div className="flex items-center gap-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1.5"
          role="img"
          lang="en"
          aria-label={t('lightsOut')}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              aria-hidden
              className="h-3 w-3 rounded-full bg-surface-raised ring-1 ring-white/10"
              style={{
                animation: `apexStartLight ${LIGHTS_OUT_S - i * LIGHT_STEP_S}s linear ${i * LIGHT_STEP_S}s both`,
              }}
            />
          ))}
        </span>
        {/* F1's own phrase in every locale; lang keeps Turkish casing from turning I into İ. */}
        <span lang="en" className="font-condensed text-3xl font-bold uppercase italic leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
          {t('lightsOut')}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="label-caps text-accent">{t('raceClock')}</span>
        <span className="font-mono text-[clamp(1.4rem,3.5vw,2.25rem)] leading-none tabular-nums text-text-hi" role="timer" aria-live="off">
          {clock}
        </span>
      </div>
      <span className="text-sm leading-snug text-text-mid">{t('lockedBody')}</span>
    </div>
  );
}

function ChequeredFlag() {
  return (
    <svg viewBox="0 0 20 20" className="h-7 w-7 shrink-0" aria-hidden>
      <rect width="20" height="20" rx="3" fill="var(--text-hi)" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) =>
          (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={c * 5} y={r * 5} width="5" height="5" fill="var(--bg)" /> : null,
        ),
      )}
    </svg>
  );
}
