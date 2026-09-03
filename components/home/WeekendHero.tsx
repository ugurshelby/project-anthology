import Image from 'next/image';
import Link from 'next/link';
import type { WeekendSessionChip } from '@/lib/f1Calendar';
import { Countdown } from './Countdown';

export function WeekendHero({
  eyebrow,
  title,
  subtitle,
  countdownTargetMs,
  circuitCoverSrc,
  sessions,
  lastWinnerName,
  lastRaceName,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  countdownTargetMs: number | null;
  circuitCoverSrc: string | null;
  sessions: WeekendSessionChip[];
  lastWinnerName?: string | null;
  lastRaceName?: string | null;
}) {
  const featuredSessions = sessions.filter((s) =>
    ['fp1', 'qualifying', 'race'].includes(s.id),
  );
  const bar = featuredSessions.length > 0 ? featuredSessions : sessions.slice(0, 3);

  return (
    <section className="relative -mx-5 h-[520px] overflow-hidden md:-mx-8 md:h-[600px] lg:-mx-16">
      {circuitCoverSrc ? (
        <Image
          src={circuitCoverSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover object-center"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 30%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)',
          }}
        />
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/55 to-black/25" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />

      {lastWinnerName ? (
        <Link
          href="/season"
          className="absolute right-4 top-4 z-20 max-w-[min(70%,280px)] rounded-[var(--radius-chip)] border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md md:right-8 md:top-8 lg:right-16"
        >
          <span className="label-caps block text-zinc-400">Last Round Winner</span>
          <span
            className="mt-0.5 block truncate font-condensed text-sm font-700 uppercase leading-tight text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            // {lastWinnerName}
          </span>
          {lastRaceName ? <span className="data-tabular text-[10px] text-zinc-500">{lastRaceName}</span> : null}
        </Link>
      ) : null}

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-6 md:px-8 md:pb-10 lg:px-16">
        <span className="label-caps text-accent">{eyebrow}</span>
        <h1 className="display-hero mt-2 max-w-[18ch] italic uppercase leading-[0.86] text-text-hi">{title}</h1>
        {subtitle ? <p className="data-tabular mt-2 text-zinc-400">{subtitle}</p> : null}

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {countdownTargetMs ? <Countdown targetMs={countdownTargetMs} /> : (
            <span className="label-caps text-zinc-500">Schedule to be confirmed</span>
          )}
          {bar.length > 0 ? (
            <div className="flex max-w-xl flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-wide text-zinc-400">
              {bar.map((s) => (
                <span key={s.id}>
                  <span className="text-zinc-200">{s.label}</span>
                  <span className="text-zinc-600"> · </span>
                  {s.when}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
