'use client';

import { useLocale, useTranslations } from 'next-intl';
import { displayUpper } from '@/lib/i18n/caps';
import { GarageTeamPanel, type GarageUnit } from '@/components/standings/GarageTeamPanel';

/**
 * The grid, one garage panel per constructor. Owner rule (apex-component-rules.md §4):
 * always grouped by team — there is no team / driver-order toggle.
 */
export function GridExplorer({ season, units }: { season: number; units: GarageUnit[] }) {
  const t = useTranslations('ui.grid');
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="label-caps text-text-mid">{t('championship', { season })}</span>
        <h1 className="headline-lg uppercase text-text-hi">{displayUpper(t('title'), locale)}</h1>
      </header>

      {units.length === 0 ? (
        <p className="body-md text-center text-text-mid">{t('unavailable')}</p>
      ) : (
        <div className="flex flex-col gap-4 md:gap-5">
          {units.map((unit, i) => (
            <GarageTeamPanel key={unit.constructorId} unit={unit} season={season} priority={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
