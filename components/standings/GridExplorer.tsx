'use client';

import { useState } from 'react';
import type { DriverGridRow } from '@/lib/data/entities';
import { GarageTeamPanel, type GarageUnit } from '@/components/standings/GarageTeamPanel';
import { GridDriverStandings } from '@/components/standings/GridDriverStandings';

type GridView = 'constructor' | 'driver';

export function GridExplorer({
  season,
  units,
  drivers,
}: {
  season: number;
  units: GarageUnit[];
  drivers: DriverGridRow[];
}) {
  const [view, setView] = useState<GridView>('constructor');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="label-caps text-text-mid">{season} Championship</span>
          <h1 className="headline-lg uppercase text-text-hi">Grid</h1>
        </div>
        <div
          role="group"
          aria-label="Grid view"
          className="flex shrink-0 gap-1 rounded-[var(--radius-pill)] border border-white/10 bg-white/[0.03] p-1"
        >
          {(
            [
              { id: 'constructor', label: 'By Constructor' },
              { id: 'driver', label: 'By Driver Standings' },
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
                  'label-caps rounded-[var(--radius-pill)] px-3 py-1.5 transition-colors',
                  selected ? 'border border-white/20 bg-white/5 text-text-hi' : 'text-zinc-500 hover:text-zinc-300',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </header>

      {units.length === 0 ? (
        <p className="body-md text-center text-text-mid">Grid data unavailable right now.</p>
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
