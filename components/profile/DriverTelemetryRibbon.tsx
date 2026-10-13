import { useTranslations } from 'next-intl';
import type { Totals } from '@/lib/history/career';

export interface DriverTelemetryRibbonProps {
  career: Totals;
  seasonPoints: number;
  seasonWins: number;
  seasonPodiums: number;
  seasonPoles: number;
  year: number;
}

/**
 * Career Telemetry Bento — Heykelsi Metrik Şeridi (Faz 12.3):
 * 6 sculptured, high-density monospaced data tiles displaying driver career
 * totals and active season contributions with high-contrast Apex/Apple aesthetics.
 */
export function DriverTelemetryRibbon({
  career,
  seasonPoints,
  seasonWins,
  seasonPodiums,
  seasonPoles,
  year,
}: DriverTelemetryRibbonProps) {
  const t = useTranslations('history.stats');
  const td = useTranslations('history.driver');

  const winRate =
    career.starts > 0 && career.wins > 0
      ? ((career.wins / career.starts) * 100).toFixed(1)
      : null;

  const tiles = [
    {
      id: 'titles',
      label: t('titles'),
      value: career.titles > 0 ? career.titles : '0',
      sub:
        career.titleYears.length > 0
          ? career.titleYears.join(' · ')
          : `${career.seasons} ${t('seasons')}`,
      accent: career.titles > 0,
    },
    {
      id: 'starts',
      label: t('starts'),
      value: career.starts > 0 ? career.starts : '—',
      sub: `${career.seasons} ${t('seasons')}`,
      accent: false,
    },
    {
      id: 'wins',
      label: t('wins'),
      value: career.wins,
      sub:
        winRate != null
          ? t('rate', { pct: winRate })
          : seasonWins > 0
            ? `+${seasonWins} (${year})`
            : t('seasonOf', { year }),
      accent: career.wins > 0,
    },
    {
      id: 'podiums',
      label: t('podiums'),
      value: career.podiums,
      sub:
        seasonPodiums > 0
          ? `+${seasonPodiums} (${year})`
          : career.starts > 0 && career.podiums > 0
            ? t('rate', { pct: ((career.podiums / career.starts) * 100).toFixed(1) })
            : t('seasonOf', { year }),
      accent: false,
    },
    {
      id: 'poles',
      label: t('poles'),
      value: career.poles,
      sub:
        seasonPoles > 0
          ? `+${seasonPoles} (${year})`
          : career.fastestLaps > 0
            ? `${career.fastestLaps} ${t('fastestLaps')}`
            : t('seasonOf', { year }),
      accent: false,
    },
    {
      id: 'points',
      label: t('points'),
      value:
        Number.isInteger(career.points)
          ? career.points
          : career.points.toFixed(1),
      sub:
        seasonPoints > 0
          ? `+${Number.isInteger(seasonPoints) ? seasonPoints : seasonPoints.toFixed(1)} (${year})`
          : career.bestPosition != null
            ? `${t('bestFinish')}: P${career.bestPosition}`
            : t('seasonOf', { year }),
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
              tile.accent
                ? 'border-[var(--team-secondary)]/40 bg-[color-mix(in_srgb,var(--team-secondary)_4%,var(--surface))]'
                : '',
            ].join(' ')}
          >
            {/* Specular hairline top-edge highlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]"
            />

            {/* Micro accent signal bar for highlighted items */}
            {tile.accent ? (
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                style={{ backgroundColor: 'var(--team-secondary, var(--accent))' }}
              />
            ) : null}

            <div>
              <span className="label-caps block text-[10px] sm:text-[11px] font-mono tracking-[0.14em] text-text-low">
                {tile.label}
              </span>
              <span
                className="font-condensed mt-2 block text-3xl sm:text-4xl font-800 tracking-tight text-text-hi"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {tile.value}
              </span>
            </div>

            <div className="mt-3 border-t border-hairline/50 pt-2 font-mono text-xs text-text-mid line-clamp-1">
              <span>{tile.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
