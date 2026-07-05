import { BentoCard } from '@/components/bento/BentoCard';
import { DriverRow, TeamRow } from './StandingsRow';
import { DriverLeaderCard, TeamLeaderCard } from './StandingsLeaderCard';
import { StandingsToggle } from './StandingsToggle';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

/**
 * Standings bento card (design.md §3.3) — single card with a Drivers/Teams
 * toggle. Both lists are rendered server-side; the client toggle only flips
 * which one is visible (§7). No separate constructors bar card. P1 in each
 * panel is broken out into a leader spotlight card.
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
  const [driverLeader, ...restDrivers] = drivers;
  const [teamLeader, ...restTeams] = teams;

  return (
    <BentoCard span={span} className="flex flex-col gap-4">
      <StandingsToggle
        driversPanel={
          <div className="flex flex-col gap-3">
            {driverLeader ? <DriverLeaderCard row={driverLeader} season={season} /> : null}
            <div className="flex flex-col">
              {restDrivers.map((row) => (
                <DriverRow key={row.driverId} row={row} season={season} />
              ))}
            </div>
          </div>
        }
        teamsPanel={
          <div className="flex flex-col gap-3">
            {teamLeader ? <TeamLeaderCard row={teamLeader} /> : null}
            <div className="flex flex-col">
              {restTeams.map((row) => (
                <TeamRow key={row.constructorId} row={row} />
              ))}
            </div>
          </div>
        }
      />
    </BentoCard>
  );
}
