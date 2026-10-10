'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { WeekendSessionChip } from '@/lib/f1Calendar';
import { intlTag } from '@/lib/i18n/format';

/**
 * Hero weekend schedule (owner rule, apex-component-rules.md §2.3): a reader
 * must see at a glance WHEN each session is and IN WHICH TIMEZONE. The panel
 * states the timezone once in its header (the visitor's own, e.g. GMT+3); each
 * row shows day + time large, the circuit's local time small underneath, and
 * the race row is accented. Before hydration the times are UTC and the header
 * says so, so the server paint is never mislabelled.
 */

function parts(ms: number, locale: string, timeZone?: string) {
  const d = new Date(ms);
  const tag = intlTag(locale);
  return {
    day: d.toLocaleDateString(tag, { weekday: 'short', timeZone }),
    date: d.toLocaleDateString(tag, { day: 'numeric', month: 'short', timeZone }),
    clock: d.toLocaleTimeString(tag, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }),
  };
}

function offsetLabel(locale: string): string {
  try {
    const p = new Intl.DateTimeFormat(intlTag(locale), { timeZoneName: 'shortOffset' }).formatToParts(new Date());
    return p.find((x) => x.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

export function WeekendSchedule({
  sessions,
  circuitTimeZone,
}: {
  sessions: WeekendSessionChip[];
  circuitTimeZone?: string | null;
}) {
  const t = useTranslations('ui.home.schedule');
  const locale = useLocale();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(id);
  }, []);

  if (sessions.length === 0) return null;
  const mounted = now !== null;
  const zone = mounted ? offsetLabel(locale) : 'UTC';

  return (
    <section
      aria-label={t('heading')}
      className="w-full rounded-[var(--radius-lg)] border border-white/15 bg-black/55 p-4 backdrop-blur-md sm:p-5 lg:w-[26rem]"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-white/10 pb-3">
        <h2 className="label-caps text-text-hi">{t('heading')}</h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-mid">
          {t('yourTime', { zone })}
        </span>
      </header>
      <ol className="mt-1 flex flex-col">
        {sessions.map((s) => {
          const isRace = s.id === 'race';
          const local = parts(s.startMs, locale, mounted ? undefined : 'UTC');
          const track = mounted && circuitTimeZone ? parts(s.startMs, locale, circuitTimeZone) : null;
          const showTrack = track && (track.clock !== local.clock || track.day !== local.day);
          const done = mounted && now >= s.startMs + 2 * 60 * 60 * 1000;
          return (
            <li
              key={s.id}
              className={[
                'relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-white/[0.06] py-2.5 pl-3 last:border-b-0',
                done ? 'opacity-45' : '',
              ].join(' ')}
            >
              <span
                aria-hidden
                className={['absolute inset-y-2 left-0 w-0.5 rounded-full', isRace ? 'bg-accent' : 'bg-white/20'].join(' ')}
              />
              <span className="min-w-0">
                <span className={['label-caps block text-[12px]', isRace ? 'text-accent' : 'text-text-hi'].join(' ')}>
                  {s.label}
                  {done ? <span className="ml-2 text-text-low">{t('done')}</span> : null}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-mid">
                  {local.day} · {local.date}
                </span>
              </span>
              <span className="text-right">
                <span
                  className={[
                    'block font-mono font-bold tabular-nums leading-none',
                    isRace ? 'text-2xl text-text-hi sm:text-[1.75rem]' : 'text-xl text-text-hi',
                  ].join(' ')}
                >
                  {local.clock}
                </span>
                {showTrack ? (
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-text-low">
                    {t('trackTime', { time: `${track.day} ${track.clock}` })}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
