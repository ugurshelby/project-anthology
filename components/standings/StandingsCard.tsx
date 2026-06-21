import { BentoCard } from '@/components/bento/BentoCard';
import { DriverRow, TeamRow } from './StandingsRow';
import { StandingsToggle } from './StandingsToggle';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

/**
 * Standings bento card (design.md §3.3) — single card with a Drivers/Teams
 * toggle. Both lists are rendered server-side; the client toggle only flips
 * which one is visible (§7). No separate constructors bar card.
 */
export function StandingsCard({
  drivers,
  teams,
  season,
  span = 4,
}: {
  drivers: DriverStandingRow[];
  teams: ConstructorStandingRow[];
  season: number;
  span?: 4 | 6 | 8 | 12;
}) {
  return (
    <BentoCard span={span} className="flex flex-col gap-4">
      <StandingsToggle
        driversPanel={
          <div className="flex flex-col">
            {drivers.map((row) => (
              <DriverRow key={row.driverId} row={row} season={season} />
            ))}
          </div>
        }
        teamsPanel={
          <div className="flex flex-col">
            {teams.map((row) => (
              <TeamRow key={row.constructorId} row={row} />
            ))}
          </div>
        }
      />
    </BentoCard>
  );
}
