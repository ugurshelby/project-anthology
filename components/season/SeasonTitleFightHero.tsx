import Image from 'next/image';
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
  const leaderColor = resolveTeamUiColor(leader.constructorId, leader.constructorName);
  const challengerColor = challenger
    ? resolveTeamUiColor(challenger.constructorId, challenger.constructorName)
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
    <section className="relative -mx-5 mb-6 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/30 backdrop-blur-sm md:-mx-8 lg:-mx-16">
      <span aria-hidden className="film-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-8 lg:px-10">
        <span className="label-caps text-text-mid">Championship</span>
        <YearScrubber year={year} minSeason={minSeason} currentSeason={currentSeason} />
      </div>

      <div className="relative z-10 grid min-h-[280px] grid-cols-1 items-end gap-4 px-5 pb-6 pt-2 md:min-h-[320px] md:grid-cols-[1fr_auto_1fr] md:gap-6 md:px-8 md:pb-8 lg:px-10">
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

        <div className="order-first flex flex-col items-center gap-2 py-4 md:order-none md:py-8">
          <span className="label-caps text-text-low">Points gap</span>
          <span className="hero-number text-[clamp(32px,5vw,56px)] text-text-hi">
            {challenger ? `+${gap}` : leader.points}
          </span>
          <span className="data-tabular text-text-mid">{challenger ? 'PTS GAP' : 'PTS LEAD'}</span>
          <div className="mt-2 flex w-full max-w-[200px] items-center gap-2">
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
    <div className={`relative flex flex-col ${align}`}>
      <span
        aria-hidden
        className={`pointer-events-none absolute ${side === 'left' ? '-left-8' : '-right-8'} top-0 h-40 w-40 rounded-full opacity-40 blur-3xl`}
        style={{ backgroundColor: color }}
      />
      {number != null ? (
        <span
          aria-hidden
          className={`hero-number pointer-events-none absolute ${side === 'left' ? 'left-0' : 'right-0'} -top-4 select-none text-[clamp(72px,12vw,120px)] leading-none text-text-hi/[0.06]`}
        >
          {number}
        </span>
      ) : null}
      {portrait ? (
        <div className={`relative mb-3 h-36 w-28 sm:h-44 sm:w-32 ${side === 'right' ? 'self-end' : ''}`}>
          <Image
            src={portrait}
            alt=""
            fill
            sizes="128px"
            className={`object-contain object-bottom grayscale contrast-125 ${side === 'right' ? 'scale-x-[-1]' : ''}`}
            priority
          />
        </div>
      ) : null}
      <span className="label-caps text-text-low">{position}</span>
      <span
        className="font-condensed text-xl font-700 uppercase leading-none text-text-hi sm:text-2xl"
        style={{ fontFamily: 'var(--font-condensed)' }}
      >
        {name.split(' ').pop()}
      </span>
      <span className="data-tabular text-sm" style={{ color }}>
        {team}
      </span>
      <span className="hero-number mt-1 text-3xl text-text-hi sm:text-4xl">{points}</span>
    </div>
  );
}
