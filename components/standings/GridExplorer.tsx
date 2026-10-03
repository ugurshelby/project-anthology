'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DriverGridRow } from '@/lib/data/entities';
import { GarageTeamPanel, type GarageUnit } from '@/components/standings/GarageTeamPanel';
import { GridDriverStandings } from '@/components/standings/GridDriverStandings';

type GridView = 'constructor' | 'driver';

export function GridExplorer({
  season,
  units,
  drivers,
  initialView = 'constructor',
}: {
  season: number;
  units: GarageUnit[];
  drivers: DriverGridRow[];
  initialView?: GridView;
}) {
  const t = useTranslations('ui.grid');
  const [view, setView] = useState<GridView>(initialView);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="label-caps text-text-mid">{t('championship', { season })}</span>
          <h1 className="headline-lg uppercase text-text-hi">{t('title')}</h1>
        </div>
        <div
          role="group"
          aria-label={t('viewLabel')}
          className="flex shrink-0 gap-1 rounded-[var(--radius-pill)] border border-white/10 bg-white/[0.03] p-1"
        >
          {(
            [
              { id: 'constructor', label: t('byConstructor') },
              { id: 'driver', label: t('byDriver') },
            ] as const
          ).map((opt) => {
            const selected = view === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setView(opt.id)}
                className={[
                  'touch-target label-caps flex min-h-11 items-center rounded-[var(--radius-pill)] px-3 py-2 transition-colors',
                  selected ? 'border border-white/20 bg-white/5 text-text-hi' : 'text-text-low hover:text-text-mid',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </header>

      {units.length === 0 ? (
        <p className="body-md text-center text-text-mid">{t('unavailable')}</p>
      ) : view === 'constructor' ? (
        <div className="flex flex-col gap-4 md:gap-5">
          {units.map((unit) => (
            <GarageTeamPanel key={unit.constructorId} unit={unit} season={season} />
          ))}
        </div>
      ) : (
        <GridDriverStandings rows={drivers} season={season} />
      )}
    </div>
  );
}
