import { useLocale, useTranslations } from 'next-intl';
import { ApexImage } from '@/components/media/ApexImage';
import { MediaCredit } from '@/components/media/MediaCredit';
import type { MediaAttribution } from '@/lib/media/read';
import { weatherSummary } from '@/lib/i18n/labels';
import { Link } from '@/i18n/routing';
import type { WeekendSessionChip } from '@/lib/f1Calendar';
import type { CircuitWeather } from '@/lib/data/circuits';
import { Countdown } from './Countdown';
import { LiveRaceTracker } from './LiveRaceTracker';
import { LocalTime } from '@/components/time/LocalTime';

export function WeekendHero({
  eyebrow,
  title,
  subtitle,
  countdownTargetMs,
  circuitCoverSrc,
  circuitCoverVariants,
  circuitCoverCredit,
  sessions,
  circuitTimeZone,
  lastWinnerName,
  lastRaceName,
  weather,
  isLive = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  countdownTargetMs: number | null;
  circuitCoverSrc: string | null;
  /** WebP variants of the cover (media system) so phones get a smaller file. */
  circuitCoverVariants?: ReadonlyArray<{ w: number; src: string }>;
  /** Credit for a license-checked cover photo; CC BY / BY-SA require it on screen. */
  circuitCoverCredit?: MediaAttribution | null;
  sessions: WeekendSessionChip[];
  /** Circuit's IANA timezone (data/circuits/facts.ts) — shown as secondary reference next to each session's visitor-local time. */
  circuitTimeZone?: string | null;
  lastWinnerName?: string | null;
  lastRaceName?: string | null;
  weather?: CircuitWeather | null;
  /** True while the current session falls within RACE_LIVE_WINDOW_MS — swaps the countdown for LiveRaceTracker. */
  isLive?: boolean;
}) {
  const t = useTranslations('ui.home');
  const locale = useLocale();
  const featuredSessions = sessions.filter((s) =>
    ['fp1', 'qualifying', 'race'].includes(s.id),
  );
  const bar = featuredSessions.length > 0 ? featuredSessions : sessions.slice(0, 3);

  return (
    <section className="relative -mx-5 h-[520px] overflow-hidden md:-mx-8 md:h-[600px] lg:-mx-16">
      {circuitCoverSrc ? (
        <ApexImage
          src={circuitCoverSrc}
          alt=""
          fill
          priority
          kind="circuit"
          sizes="100vw"
          variants={circuitCoverVariants}
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
          <span className="label-caps block text-text-mid">{t('lastRoundWinner')}</span>
          <span
            className="mt-0.5 block truncate font-condensed text-sm font-700 uppercase leading-tight text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {'// '}{lastWinnerName}
          </span>
          {lastRaceName ? <span className="data-tabular text-xs text-text-mid">{lastRaceName}</span> : null}
        </Link>
      ) : null}

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-6 md:px-8 md:pb-10 lg:px-16">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-caps text-accent">{eyebrow}</span>
          {weather ? (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-xs text-text-mid backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-text-hi">{weather.temperatureC}°C</span>
              <span>·</span>
              <span>{weatherSummary(weather.weatherCode, weather.summary, locale)}</span>
              {weather.windKmh ? <span>· {t('wind', { kmh: weather.windKmh })}</span> : null}
            </div>
          ) : null}
        </div>
        <h1
          lang={locale}
          className="display-hero mt-2 max-w-[18ch] italic leading-[0.86] text-text-hi"
        >
          {title.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US')}
        </h1>
        {subtitle ? <p className="data-tabular mt-2 text-text-mid">{subtitle}</p> : null}

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          {isLive ? (
            <LiveRaceTracker />
          ) : countdownTargetMs ? (
            <Countdown targetMs={countdownTargetMs} />
          ) : (
            <span className="label-caps text-text-low">{t('scheduleTbc')}</span>
          )}
          {bar.length > 0 ? (
            <div className="flex max-w-xl flex-col gap-2 font-mono text-[13px] uppercase tracking-wide text-text-mid sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              {bar.map((s) => (
                <span key={s.id}>
                  <span className="text-text">{s.label}</span>
                  <span className="text-text-low">{' · '}</span>
                  <LocalTime startMs={s.startMs} fallback={s.when} circuitTimeZone={circuitTimeZone} />
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {circuitCoverSrc && circuitCoverCredit ? (
        <MediaCredit
          attribution={circuitCoverCredit}
          className="absolute bottom-1.5 right-5 z-20 max-w-[calc(100%-2.5rem)] md:right-8 lg:right-16"
        />
      ) : null}
    </section>
  );
}
