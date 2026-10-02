import { ApexImage } from '@/components/media/ApexImage';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';
import { getDriverLore } from '@/data/drivers';
import type { DriverStandingRow } from '@/lib/f1/mrdata';
import { YearScrubber } from '@/components/season/YearScrubber';

/**
 * Championship title-fight hero — split face-off portraits, telemetry gap bar,
 * and team-colour ambient glow. Replaces the dry year + leader summary strip.
 */
export function SeasonTitleFightHero({
  year,
  minSeason,
  currentSeason,
  leader,
  challenger,
}: {
  year: number;
  minSeason: number;
  currentSeason: number;
  leader: DriverStandingRow;
  challenger: DriverStandingRow | null;
}) {
  const leaderColor = resolveTeamUiColor(leader.constructorId, leader.constructorName, year);
  const challengerColor = challenger
    ? resolveTeamUiColor(challenger.constructorId, challenger.constructorName, year)
    : leaderColor;
  const leaderPortrait = driverIconSrc(leader.driverCode, leader.driverId, year);
  const challengerPortrait = challenger
    ? driverIconSrc(challenger.driverCode, challenger.driverId, year)
    : null;
  const gap =
    challenger != null
      ? Math.max(0, Number(leader.points) - Number(challenger.points))
      : Number(leader.points);
  const leaderNum = getDriverLore(leader.driverId)?.number;
  const challengerNum = challenger ? getDriverLore(challenger.driverId)?.number : null;

  return (
    <section className="relative -mx-5 mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/30 backdrop-blur-sm md:-mx-8 lg:-mx-16">
      <span aria-hidden className="film-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex items-center justify-between px-5 pt-4 md:px-8 md:pt-5 lg:px-10">
        <span className="label-caps text-text-mid">Championship</span>
        <YearScrubber year={year} minSeason={minSeason} currentSeason={currentSeason} />
      </div>

      <div className="relative z-10 grid grid-cols-1 items-end gap-3 px-5 pb-5 pt-1 md:min-h-[320px] md:grid-cols-[1fr_auto_1fr] md:gap-6 md:px-8 md:pb-8 md:pt-2 lg:px-10">
        <DriverSilhouette
          side="left"
          name={leader.driverName}
          team={leader.constructorName}
          points={leader.points}
          position="P1"
          number={leaderNum}
          portrait={leaderPortrait}
          color={leaderColor}
        />

        <div className="flex min-w-0 shrink-0 flex-col items-center gap-1.5 py-2 md:gap-2 md:py-8">
          <span className="label-caps text-text-mid">Points gap</span>
          <span className="hero-number text-[clamp(28px,5vw,56px)] text-text-hi">
            {challenger ? `+${gap}` : leader.points}
          </span>
          <span className="data-tabular text-text-mid">{challenger ? 'PTS GAP' : 'PTS LEAD'}</span>
          <div className="mt-1 flex w-full max-w-[200px] items-center gap-2 md:mt-2">
            <span className="h-1 flex-1 rounded-full blur-[1px]" style={{ backgroundColor: leaderColor, boxShadow: `0 0 12px ${leaderColor}` }} />
            <span className="h-1 w-1 rounded-full bg-text-low" />
            <span className="h-1 flex-1 rounded-full blur-[1px]" style={{ backgroundColor: challengerColor, boxShadow: `0 0 12px ${challengerColor}` }} />
          </div>
        </div>

        {challenger ? (
          <DriverSilhouette
            side="right"
            name={challenger.driverName}
            team={challenger.constructorName}
            points={challenger.points}
            position="P2"
            number={challengerNum}
            portrait={challengerPortrait}
            color={challengerColor}
          />
        ) : (
          <div className="hidden md:block" />
        )}
      </div>
    </section>
  );
}

function DriverSilhouette({
  side,
  name,
  team,
  points,
  position,
  number,
  portrait,
  color,
}: {
  side: 'left' | 'right';
  name: string;
  team: string;
  points: string;
  position: string;
  number: number | null | undefined;
  portrait: string | null;
  color: string;
}) {
  const align = side === 'left' ? 'items-start text-left' : 'items-end text-right';

  return (
    <div className={`relative flex min-w-0 flex-col ${align}`}>
      <span
        aria-hidden
        className={`pointer-events-none absolute ${side === 'left' ? '-left-8' : '-right-8'} top-0 h-40 w-40 rounded-full opacity-30 blur-3xl`}
        style={{ backgroundColor: color }}
      />
      {number != null ? (
        <span
          aria-hidden
          className={`hero-number pointer-events-none absolute -z-10 select-none leading-none ${
            side === 'left' ? 'left-0 sm:-left-2' : 'right-0 sm:-right-2'
          } -top-4 sm:-top-6 text-[clamp(56px,8vw,100px)] text-white/[0.035]`}
        >
          {number}
        </span>
      ) : null}
      {portrait ? (
        <div className={`relative z-10 mb-2 h-28 w-[5.5rem] sm:mb-3 sm:h-44 sm:w-32 ${side === 'right' ? 'self-end' : ''}`}>
          <ApexImage
            src={portrait}
            alt=""
            fill
            kind="driver"
            sizes="128px"
            className={`object-contain object-bottom grayscale contrast-125 ${side === 'right' ? 'scale-x-[-1]' : ''}`}
            priority
          />
        </div>
      ) : null}
      <div className="relative z-10 flex flex-col gap-0.5">
        <span className="label-caps text-text-mid">{position}</span>
        <span
          className="font-condensed text-xl font-700 uppercase leading-none text-text-hi sm:text-2xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {name.split(' ').pop()}
        </span>
        <span className="data-tabular text-sm font-medium" style={{ color }}>
          {team}
        </span>
        <span className="hero-number mt-1 text-3xl text-text-hi sm:text-4xl">{points}</span>
      </div>
    </div>
  );
}
