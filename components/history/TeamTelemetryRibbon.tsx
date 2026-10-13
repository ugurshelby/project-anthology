import { useTranslations } from 'next-intl';

export interface TeamTelemetryRibbonProps {
  titles: number[];
  allTimeWins: number;
  allTimePodiums: number;
  allTimePoles: number;
  allTimeSeasons: number;
  seasonPosition: number | null;
  seasonPoints: number;
  seasonWins: number;
  seasonPodiums: number;
  seasonPoles: number;
  year: number;
}

/**
 * Fast Facts Bento — Horizontal Telemetry Strip (Item 10.3):
 * Sculptured, high-density monospaced data tiles displaying team heritage
 * and active season telemetry with high-contrast Apex/Apple aesthetics.
 */
export function TeamTelemetryRibbon({
  titles,
  allTimeWins,
  allTimePodiums,
  allTimePoles,
  allTimeSeasons,
  seasonPosition,
  seasonPoints,
  seasonWins,
  seasonPodiums,
  seasonPoles,
  year,
}: TeamTelemetryRibbonProps) {
  const t = useTranslations('history.stats');
  const tt = useTranslations('history.team');

  const tiles = [
    {
      id: 'titles',
      label: t('titles'),
      value: titles.length > 0 ? titles.length : '0',
      sub: titles.length > 0 ? t('lastTitle', { year: titles[titles.length - 1] }) : t('noTitle'),
      accent: titles.length > 0,
    },
    {
      id: 'wins',
      label: t('wins'),
      value: allTimeWins,
      sub: seasonWins > 0 ? `+${seasonWins} (${year})` : t('seasonOf', { year }),
      accent: false,
    },
    {
      id: 'podiums',
      label: t('podiums'),
      value: allTimePodiums,
      sub: seasonPodiums > 0 ? `+${seasonPodiums} (${year})` : t('seasonOf', { year }),
      accent: false,
    },
    {
      id: 'poles',
      label: t('poles'),
      value: allTimePoles,
      sub: seasonPoles > 0 ? `+${seasonPoles} (${year})` : t('seasonOf', { year }),
      accent: false,
    },
    {
      id: 'standing',
      label: `${year} ${t('position')}`,
      value: seasonPosition != null ? `P${seasonPosition}` : '-',
      sub: `${Number.isInteger(seasonPoints) ? seasonPoints : seasonPoints.toFixed(1)} ${t('ptsShort')}`,
      accent: seasonPosition === 1,
    },
    {
      id: 'seasons',
      label: t('seasons'),
      value: allTimeSeasons,
      sub: allTimeSeasons > 0 && allTimeWins > 0 ? t('winsPerSeason', { n: (allTimeWins / allTimeSeasons).toFixed(1) }) : t('inF1'),
      accent: false,
    },
  ];

  return (
    <section aria-label={tt('lineageHeading', { year })} className="mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={[
              'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline/80 bg-surface p-4 transition-all duration-200 hover:border-white/20',
              tile.accent ? 'border-[var(--team-secondary)]/40 bg-[color-mix(in_srgb,var(--team-secondary)_4%,var(--surface))]' : '',
            ].join(' ')}
          >
            {/* Specular hairline top-edge highlight */}
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

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
