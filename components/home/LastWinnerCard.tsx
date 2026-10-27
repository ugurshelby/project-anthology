import { useLocale, useTranslations } from 'next-intl';
import { displayUpper, latinUpper } from '@/lib/i18n/caps';
import { Link } from '@/i18n/routing';
import { ApexImage } from '@/components/media/ApexImage';
import { MediaCredit } from '@/components/media/MediaCredit';
import type { LastRaceRecap } from '@/lib/f1/mrdata';
import type { MediaResult } from '@/lib/media/read';
import { circuitName, formatDate, raceName } from '@/lib/i18n/format';

/**
 * Home bento: last race winner. Shares the anthology card's shell and height
 * (apex-component-rules.md §2.4) — the two are stacked as equals in the right
 * column. Identity comes from the team colour (left bar, number, glow), the
 * race number and the surname; the race and circuit sit underneath.
 *
 * The whole card is clickable through a stretched overlay link, so the photo
 * credit can keep its own link to the source page (no <a> inside <a>).
 */
export function LastWinnerCard({
  recap,
  teamColor,
  driverMedia,
}: {
  recap: LastRaceRecap;
  teamColor: string;
  driverMedia?: MediaResult | null;
}) {
  const t = useTranslations('ui.home');
  const locale = useLocale();
  const winner = recap.podium[0];
  if (!winner) return null;

  const [first, ...rest] = winner.driverName.split(' ');
  const surname = rest.join(' ') || first;
  const photo = driverMedia?.status === 'image' ? driverMedia : null;
  const race = raceName(recap.raceName, locale);
  const circuit = circuitName(recap.circuitName ?? undefined, locale);
  const date = recap.date
    ? formatDate(`${recap.date}T12:00:00Z`, locale, { day: 'numeric', month: 'long', timeZone: 'UTC' })
    : null;
  const href = recap.season ? `/season/${recap.season}/round/${recap.round}` : '/season';

  return (
    <article className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out hover:border-white/20 has-[a:active]:scale-[0.98]">
      {/* Team-colour glow + driver photo (right side, fades into the card) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 70% 90% at 85% 40%, color-mix(in srgb, ${teamColor} 28%, transparent), transparent 70%)` }}
      />
      {photo ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[52%] [mask-image:linear-gradient(to_right,transparent,black_55%),linear-gradient(to_top,transparent,black_40%)] [mask-composite:intersect]">
          <ApexImage
            src={photo.image.src}
            variants={photo.image.variants}
            alt=""
            fill
            kind="media"
            sizes="(max-width: 1024px) 50vw, 20vw"
            className="object-cover object-top opacity-70 transition-opacity duration-500 group-hover:opacity-85"
          />
        </div>
      ) : null}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1" style={{ backgroundColor: teamColor }} />

      <Link
        href={href}
        aria-label={`${t('lastRoundWinner')}: ${winner.driverName}, ${race}`}
        className="absolute inset-0 z-10 rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      />

      <div className="pointer-events-none relative z-[5] flex items-center justify-between gap-2 p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t('lastRoundWinner')}
        </span>
        <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-hi/80">
          {t('latest.round', { round: recap.round })}
        </span>
      </div>

      <div className="pointer-events-none relative z-[5] flex flex-col gap-2 p-5 sm:p-6">
        {/* Container query: the surname scales with the card, so "VERSTAPPEN" fits a narrow column instead of being cut. */}
        <div className="@container flex items-end gap-3">
          {winner.number ? (
            <span
              className="hero-number text-6xl italic leading-[0.8]"
              style={{ color: teamColor }}
              aria-hidden
            >
              {winner.number}
            </span>
          ) : null}
          <div className="min-w-0 pb-0.5">
            {first !== surname ? <span lang="en" className="label-caps block text-text-mid">{first}</span> : null}
            <span
              lang="en"
              className="block font-condensed text-[clamp(1.25rem,8.5cqi,1.875rem)] font-bold uppercase italic leading-none tracking-tight text-white transition-colors duration-200 [overflow-wrap:anywhere] group-hover:text-accent"
              style={{ fontFamily: 'var(--font-condensed)', textShadow: '0 2px 12px rgba(0,0,0,0.85)' }}
            >
              {latinUpper(surname)}
            </span>
          </div>
        </div>
        <span lang="en" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: teamColor }} />
          {winner.constructorName}
        </span>
        <span className="line-clamp-2 text-sm leading-snug text-text-mid">
          {[race, circuit !== race ? circuit : null, date].filter(Boolean).join(' · ')}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-accent transition-colors duration-150 group-hover:text-white">
          {t('latest.fullResults')}
        </span>
      </div>

      {photo ? (
        <div className="absolute bottom-2 right-3 z-20 flex max-w-[50%] justify-end">
          <MediaCredit attribution={photo.attribution} />
        </div>
      ) : null}
    </article>
  );
}

/**
 * Same slot, between the chequered flag and the official classification
 * (Jolpica usually publishes 1–3 h after the race): names the race that just
 * finished and says results are on the way, instead of an endless skeleton or
 * the previous round's winner presented as "last race" (plan 1.7 follow-up,
 * measured R17 2026-10-11).
 */
export function LastWinnerPendingCard({
  raceNameRaw,
  circuitNameRaw,
  dateIso,
  round,
  season,
}: {
  raceNameRaw?: string | null;
  circuitNameRaw?: string | null;
  dateIso?: string | null;
  round: string;
  season: number;
}) {
  const t = useTranslations('ui.home');
  const locale = useLocale();
  const race = raceName(raceNameRaw ?? undefined, locale);
  const circuit = circuitName(circuitNameRaw ?? undefined, locale);
  const date = dateIso
    ? formatDate(`${dateIso}T12:00:00Z`, locale, { day: 'numeric', month: 'long', timeZone: 'UTC' })
    : null;

  return (
    <article className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out hover:border-white/20">
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-accent/60" />
      <Link
        href={`/season/${season}/round/${round}`}
        aria-label={`${t('lastRoundWinner')}: ${race} — ${t('resultsPending')}`}
        className="absolute inset-0 z-10 rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      />
      <div className="pointer-events-none relative z-[5] flex items-center justify-between gap-2 p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {t('lastRoundWinner')}
        </span>
        <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-hi/80">
          {t('latest.round', { round })}
        </span>
      </div>
      <div className="pointer-events-none relative z-[5] flex flex-col gap-2 p-5 sm:p-6">
        <span
          className="block font-condensed text-3xl font-bold uppercase italic leading-none tracking-tight text-white"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {displayUpper(race, locale)}
        </span>
        <span className="text-sm leading-snug text-text-mid">
          {[circuit !== race ? circuit : null, date].filter(Boolean).join(' · ')}
        </span>
        <span className="label-caps text-accent">{t('resultsPending')}</span>
      </div>
    </article>
  );
}
