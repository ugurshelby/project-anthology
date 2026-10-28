import { useLocale, useTranslations } from 'next-intl';
import { BentoCard } from '@/components/bento/BentoCard';
import type { SeasonHighlights } from '@/lib/f1/mrdata';
import { formatPercent } from '@/lib/i18n/format';

/**
 * Compact editorial highlight tiles — fastest-lap king and season DNF rate.
 */
export function SeasonHighlightTiles({
  highlights,
}: {
  highlights: SeasonHighlights;
}) {
  const t = useTranslations('ui.season');
  const locale = useLocale();
  const fl = highlights.fastestLapKing;

  return (
    <>
      <BentoCard span={4} className="flex flex-col justify-between gap-3 border border-white/[0.08] bg-surface/50">
        <span className="label-caps text-text-mid">{t('fastestLapKing')}</span>
        {fl ? (
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="hero-number text-4xl text-accent">{fl.count}</span>
              <span lang="en" className="font-condensed text-sm font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {fl.driverName.split(' ').pop()}
              </span>
              <span className="data-tabular text-xs text-text-low">{t('fastestLaps')}</span>
            </div>
          </div>
        ) : (
          <span className="data-tabular text-text-low">{t('noData')}</span>
        )}
      </BentoCard>

      <BentoCard span={4} className="flex flex-col justify-between gap-3 border border-white/[0.08] bg-surface/50">
        <span className="label-caps text-text-mid">{t('hardship')}</span>
        <div className="flex flex-col gap-1">
          <span className="hero-number text-4xl text-text-hi">{formatPercent(highlights.dnfRatePercent, locale, 0)}</span>
          <span className="data-tabular text-sm text-text-mid">{t('dnfRate')}</span>
          <span className="data-tabular text-xs text-text-low">
            {t('retirements', { dnf: highlights.dnfCount, starters: highlights.starterCount })}
          </span>
        </div>
      </BentoCard>
    </>
  );
}
