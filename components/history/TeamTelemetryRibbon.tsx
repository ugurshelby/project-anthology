import { useLocale, useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/i18n/format';

export interface TeamTelemetryRibbonProps {
  titles: number[];
  allTimeWins: number;
  allTimePodiums: number;
  allTimePoles: number;
  allTimeSeasons: number;
  year: number;
}

/**
 * Fast Facts strip (plan 10.3): the lineage's all-time record through the selected
 * year. Season numbers live in the season card and the hero line only, so no figure
 * appears twice on the page (owner, 2026-10-14).
 */
export function TeamTelemetryRibbon({
  titles,
  allTimeWins,
  allTimePodiums,
  allTimePoles,
  allTimeSeasons,
  year,
}: TeamTelemetryRibbonProps) {
  const t = useTranslations('history.stats');
  const tt = useTranslations('history.team');
  const locale = useLocale();

  const tiles = [
    {
      id: 'titles',
      label: t('titles'),
      value: titles.length,
      sub: titles.length > 0 ? t('lastTitle', { year: titles[titles.length - 1] }) : t('noTitle'),
      accent: titles.length > 0,
    },
    { id: 'wins', label: t('wins'), value: allTimeWins, sub: null, accent: false },
    { id: 'podiums', label: t('podiums'), value: allTimePodiums, sub: null, accent: false },
    { id: 'poles', label: t('poles'), value: allTimePoles, sub: null, accent: false },
    {
      id: 'seasons',
      label: t('seasons'),
      value: allTimeSeasons,
      sub: allTimeSeasons > 0 && allTimeWins > 0 ? t('winsPerSeason', { n: formatNumber(allTimeWins / allTimeSeasons, locale) }) : t('inF1'),
      accent: false,
    },
  ];

  return (
    <section aria-label={tt('lineageHeading', { year })} className="mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
