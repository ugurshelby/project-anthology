import { useTranslations } from 'next-intl';
import type { Totals } from '@/lib/history/career';

export interface DriverTelemetryRibbonProps {
  career: Totals;
  year: number;
}

/**
 * Career strip (plan 12.3): career totals through the selected year. Season numbers
 * live in the season card only, so no figure appears twice on the page
 * (owner, 2026-10-14).
 */
export function DriverTelemetryRibbon({ career, year }: DriverTelemetryRibbonProps) {
  const t = useTranslations('history.stats');
  const td = useTranslations('history.driver');

  const rate = (n: number) => (career.starts > 0 && n > 0 ? t('rate', { pct: ((n / career.starts) * 100).toFixed(1) }) : null);
  const points = Number.isInteger(career.points) ? career.points : career.points.toFixed(1);

  const tiles = [
    {
      id: 'titles',
      label: t('titles'),
      value: career.titles,
      sub: career.titleYears.length > 0 ? career.titleYears.join(' · ') : t('noTitle'),
      accent: career.titles > 0,
    },
    { id: 'starts', label: t('starts'), value: career.starts > 0 ? career.starts : '—', sub: `${career.seasons} ${t('seasons')}`, accent: false },
    { id: 'wins', label: t('wins'), value: career.wins, sub: rate(career.wins), accent: career.wins > 0 },
    { id: 'podiums', label: t('podiums'), value: career.podiums, sub: rate(career.podiums), accent: false },
    {
      id: 'poles',
      label: t('poles'),
      value: career.poles,
      sub: career.fastestLaps > 0 ? `${career.fastestLaps} ${t('fastestLaps')}` : null,
      accent: false,
    },
    {
      id: 'points',
      label: t('points'),
      value: points,
      sub: career.bestPosition != null ? `${t('bestFinish')}: P${career.bestPosition}` : null,
      accent: false,
    },
  ];

  return (
    <section aria-label={td('careerHeading', { year })} className="mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={[
              'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline/80 bg-surface p-4 transition-all duration-200 hover:border-white/20',
              tile.accent ? 'border-[var(--team-secondary)]/40 bg-[color-mix(in_srgb,var(--team-secondary)_4%,var(--surface))]' : '',
            ].join(' ')}
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
            {tile.accent ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-3 left-0 top-3 w-1 rounded-r-full"
                style={{ backgroundColor: 'var(--team-secondary, var(--accent))' }}
              />
            ) : null}

            <div>
              <span className="label-caps block font-mono text-[10px] tracking-[0.14em] text-text-low sm:text-[11px]">
                {tile.label}
              </span>
              <span
                className="font-condensed mt-2 block text-3xl font-800 tracking-tight text-text-hi sm:text-4xl"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {tile.value}
              </span>
            </div>

            {tile.sub ? (
              <div className="mt-3 line-clamp-1 border-t border-hairline/50 pt-2 font-mono text-xs text-text-mid">
                <span>{tile.sub}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
