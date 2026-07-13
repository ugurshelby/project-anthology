import { BentoCard } from '@/components/bento/BentoCard';
import { DriverRow, TeamRow } from './StandingsRow';
import { DriverLeaderCard, TeamLeaderCard } from './StandingsLeaderCard';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

type Span = 4 | 5 | 6 | 7 | 8 | 12;

/**
 * Drivers standings bento card — its own tile (no toggle; see TeamsStandingsCard
 * for the sibling). 22 drivers vs 11 teams means the two naturally want
 * different card weights, so they're separate bento tiles rather than one
 * toggle-shared card (design.md §3.3 superseded 2026-07 for asymmetric season layout).
 */
export function StandingsCard({
  drivers,
  season,
  span = 7,
}: {
  drivers: DriverStandingRow[];
  season: number;
  span?: Span;
}) {
  const [leader, ...rest] = drivers;

  return (
    <BentoCard span={span} className="flex flex-col gap-4">
      <span className="label-caps text-text-mid">Drivers</span>
      <div className="flex flex-col gap-3">
        {leader ? <DriverLeaderCard row={leader} season={season} /> : null}
        <div className="flex flex-col">
          {rest.map((row) => (
            <DriverRow key={row.driverId} row={row} season={season} />
          ))}
        </div>
      </div>
    </BentoCard>
  );
}

/** Constructors standings bento card — sibling of StandingsCard, see its doc comment. */
export function TeamsStandingsCard({
  teams,
  span = 5,
}: {
  teams: ConstructorStandingRow[];
  span?: Span;
}) {
  const [leader, ...rest] = teams;

  return (
    <BentoCard span={span} className="flex flex-col gap-4">
      <span className="label-caps text-text-mid">Teams</span>
      <div className="flex flex-col gap-3">
        {leader ? <TeamLeaderCard row={leader} /> : null}
        <div className="flex flex-col">
          {rest.map((row) => (
            <TeamRow key={row.constructorId} row={row} />
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
