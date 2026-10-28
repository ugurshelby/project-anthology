import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { resolveTeamUiColor } from '@/config/team-colors';
import { paletteFor } from '@/lib/history/palette';
import { teamPatternStyle } from '@/lib/assets/team-pattern';
import { getDriverObjectPosition, shouldFlipDriver } from '@/lib/data/driverPositions';
import type { DriverGridRow } from '@/lib/data/entities';
import type { MediaResult } from '@/lib/media/read';

import type { TeamHeadToHead } from '@/lib/f1/headToHead';
import type { TeamPointsShare } from '@/lib/f1/mrdata';

export interface GarageUnit {
  constructorId: string;
  constructorName: string;
  constructorPosition: string;
  points: string;
  wins: string;
  powerUnit: string | null;
  drivers: DriverGridRow[];
  headToHead?: TeamHeadToHead;
  /** Per driverId: season points scored for other constructors (mid-season seat changes). */
  pointsElsewhere?: Record<string, TeamPointsShare[]>;
  /** Drivers outside the two seats shown whose points count in the team total. */
  formerScorers?: Array<{ driverId: string; name: string; points: number }>;
  /** Media read on the server (per driverId, and the car), so the photos are in the HTML instead of a client fetch. */
  driverMedia?: Record<string, MediaResult>;
  carMedia?: MediaResult;
}

export {
  DRIVER_GRID_POSITIONS,
  DRIVER_IMAGE_FLIP,
  getDriverObjectPosition,
  shouldFlipDriver,
} from '@/lib/data/driverPositions';

/**
 * Constructor car silhouette / livery framing object-position map (apex-component-rules.md §4.1).
 * Standardized left-to-right flow with min 10% breathing room.
 */
const CAR_GRID_POSITIONS: Record<string, string> = {
  mercedes: 'center 60%',
  'mercedes-amg': 'center 60%',
  ferrari: 'center 50%',
  mclaren: 'center 45%',
  'red-bull': '55% 50%',
  red_bull: '55% 50%',
  'racing-bulls': 'center 50%',
  racing_bulls: 'center 50%',
  rb: 'center 50%',
  alpine: '60% 50%',
  haas: '65% 50%',
  audi: 'center 50%',
  sauber: 'center 50%',
  'kick-sauber': 'center 50%',
  'kick_sauber': 'center 50%',
  williams: 'center 55%',
  'aston-martin': 'center 50%',
  aston_martin: 'center 50%',
  cadillac: '60% 50%',
};

function getCarObjectPosition(constructorId: string): string {
  const norm = constructorId.toLowerCase().trim().replace(/_/g, '-');
  return CAR_GRID_POSITIONS[norm] ?? 'center 50%';
}

function DriverBay({
  row,
  season,
  color,
  divided,
  elsewhere,
  media,
  priority = false,
}: {
  row: DriverGridRow;
  season: number;
  color: string;
  divided?: boolean;
  elsewhere?: TeamPointsShare[];
  media?: MediaResult;
  /** First panel on the page: its portraits are the LCP candidates. */
  priority?: boolean;
}) {
  const t = useTranslations('ui.common');
  const number = row.carNumber ?? row.position;
  const isFlipped = shouldFlipDriver(row.driverId);
  const objectPosition = getDriverObjectPosition(row.driverId);

  return (
    <Link
      href={`/drivers/${row.driverId}?season=${season}`}
      className={[
        'group relative flex min-h-28 flex-1 flex-col justify-end overflow-hidden p-3.5 md:min-h-56 md:p-4',
        divided ? 'border-l border-hairline' : '',
      ].join(' ')}
    >
      {/* Apple material top specular edge highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/[0.06]"
      />

      {/* Atmospheric team color glow behind driver */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${color} 26%, transparent), transparent 64%)`,
        }}
      />

      {/* Giant Race Number Watermark in top-right (Barlow Condensed, 8-12% opacity) */}
      {number ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-0 z-[2] select-none font-condensed text-7xl font-800 leading-none tracking-tighter text-white/[0.08] transition-opacity duration-300 group-hover:text-white/[0.14] md:right-3 md:text-8xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {number}
        </span>
      ) : null}

      {/* Driver portrait with Apple color grading filter & inward gaze flip */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-transform duration-500 group-hover:scale-[1.02]"
        style={{
          filter: 'contrast(1.05) saturate(0.9)',
          transform: isFlipped ? 'scaleX(-1)' : undefined,
        }}
      >
        <MediaAssetView
          type="driver"
          entityKey={row.driverId}
          alt={row.driverName}
          name={row.driverName}
          driverCode={row.driverCode}
          driverNumber={number}
          teamColor={color}
          objectPosition={objectPosition}
          sizes="(min-width: 1024px) 31vw, 50vw"
          className="h-full w-full object-cover"
          showAttribution={false}
          initialResult={media}
          priority={priority}
        />
      </div>

      {/* Apple bottom vignette / scrim gradient for typographic contrast */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-full"
        style={{
          background:
            'linear-gradient(to top, rgba(10, 10, 10, 0.90) 0%, rgba(10, 10, 10, 0.35) 42%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-0.5">
        <span
          lang="en"
          className="font-condensed line-clamp-2 text-base font-700 uppercase leading-tight text-text-hi md:text-xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {row.driverName}
        </span>
        <div className="data-tabular flex justify-between text-xs text-text-mid md:text-sm">
          <span>P{row.position}</span>
          <span className="text-text-hi">{row.points} {t('pts')}</span>
        </div>
        {elsewhere?.map((share) => (
          <span key={share.constructorId} className="data-tabular text-right text-[11px] leading-tight text-text-low font-mono">
            {t('ptsWithTeam', { points: share.points, team: share.constructorName })}
          </span>
        ))}
      </div>
    </Link>
  );
}

function EmptySeat({ divided }: { divided?: boolean }) {
  const t = useTranslations('ui.common');
  return (
    <div
      className={[
        'relative flex min-h-28 flex-1 flex-col items-center justify-center overflow-hidden p-4 md:min-h-56',
        divided ? 'border-l border-hairline' : '',
      ].join(' ')}
    >
      {/* Top hairline specular highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/[0.06]"
      />

      {/* Grid blueprint pattern */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px), repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px)',
        }}
      />

      {/* Architectural wireframe silhouette watermark (vacant seat fallback) */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 m-auto h-20 w-20 text-white/[0.06]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="50" cy="38" r="16" strokeDasharray="3 3" />
        <path d="M 28 80 C 28 62 38 56 50 56 C 62 56 72 62 72 80" strokeDasharray="3 3" />
      </svg>

      <span className="relative z-10 font-mono text-xs font-700 uppercase tracking-wider text-text-low">
        {t('seatTbc')}
      </span>
    </div>
  );
}

function TeammateHeadToHead({
  d1,
  d2,
  color,
  h2h,
}: {
  d1: DriverGridRow;
  d2: DriverGridRow;
  color: string;
  h2h?: TeamHeadToHead;
}) {
  const t = useTranslations('ui.common');
  const pts1 = parseFloat(d1.points) || 0;
  const pts2 = parseFloat(d2.points) || 0;
  const pos1 = parseInt(d1.position, 10) || 99;
  const pos2 = parseInt(d2.position, 10) || 99;

  let quali1 = 0;
  let quali2 = 0;
  let race1 = 0;
  let race2 = 0;
  let hasH2H = false;

  if (h2h && (h2h.qualifying.compared > 0 || h2h.race.compared > 0)) {
    const id1 = d1.driverId.toLowerCase();
    const id2 = d2.driverId.toLowerCase();
    const hId0 = h2h.drivers[0]?.driverId.toLowerCase();
    const hId1 = h2h.drivers[1]?.driverId.toLowerCase();

    if (id1 === hId0 && id2 === hId1) {
      quali1 = h2h.qualifying.wins[0];
      quali2 = h2h.qualifying.wins[1];
      race1 = h2h.race.wins[0];
      race2 = h2h.race.wins[1];
      hasH2H = true;
    } else if (id1 === hId1 && id2 === hId0) {
      quali1 = h2h.qualifying.wins[1];
      quali2 = h2h.qualifying.wins[0];
      race1 = h2h.race.wins[1];
      race2 = h2h.race.wins[0];
      hasH2H = true;
    }
  }

  const raceTotal = race1 + race2;
  const racePct1 = raceTotal > 0 ? Math.round((race1 / raceTotal) * 100) : 50;
  const racePct2 = 100 - racePct1;

  const qualiTotal = quali1 + quali2;
  const qualiPct1 = qualiTotal > 0 ? Math.round((quali1 / qualiTotal) * 100) : 50;
  const qualiPct2 = 100 - qualiPct1;

  const ptsTotal = pts1 + pts2;
  const ptsPct1 = ptsTotal > 0 ? Math.round((pts1 / ptsTotal) * 100) : 50;
  const ptsPct2 = 100 - ptsPct1;

  const d1Ahead = hasH2H
    ? race1 > race2 || (race1 === race2 && (quali1 > quali2 || (quali1 === quali2 && pos1 < pos2)))
    : pos1 < pos2;
  const d2Ahead = hasH2H
    ? race2 > race1 || (race2 === race1 && (quali2 > quali1 || (quali2 === quali1 && pos2 < pos1)))
    : pos2 < pos1;

  return (
    <div className="relative z-10 flex flex-col gap-1.5 border-t border-hairline bg-white/[0.015] px-3.5 py-2 md:px-4">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className={`font-600 uppercase ${d1Ahead ? 'text-text-hi' : 'text-text-mid'}`}>
            {d1.driverCode || d1.driverName.slice(0, 3)}
          </span>
          {d1Ahead ? (
            <span className="rounded-[3px] border border-[#00d26a]/25 bg-[#00d26a]/15 px-1 py-0.5 text-[11px] font-bold text-[#00d26a]">
              {t('ahead')}
            </span>
          ) : null}
        </div>

        {hasH2H ? (
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider">
            <span className="text-text-mid">
              <span className="text-text-low font-semibold">Q</span> {quali1}:{quali2}
            </span>
            <span className="text-hairline">·</span>
            <span className="text-text-mid">
              <span className="text-text-low font-semibold">R</span> {race1}:{race2}
            </span>
            <span className="text-hairline">·</span>
            <span className="text-text-low">
              {pts1}:{pts2} {t('pts')}
            </span>
          </div>
        ) : (
          <span className="label-caps tracking-widest text-text-low text-[11px]">
            {t('headToHead')} · {pts1} : {pts2} {t('pts')}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          {d2Ahead ? (
            <span className="rounded-[3px] border border-[#00d26a]/25 bg-[#00d26a]/15 px-1 py-0.5 text-[11px] font-bold text-[#00d26a]">
              {t('ahead')}
            </span>
          ) : null}
          <span className={`font-600 uppercase ${d2Ahead ? 'text-text-hi' : 'text-text-mid'}`}>
            {d2.driverCode || d2.driverName.slice(0, 3)}
          </span>
        </div>
      </div>

      {hasH2H ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 text-[11px] font-mono font-bold text-text-low">R</span>
            <div className="relative flex h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${racePct1}%`,
                  backgroundColor: race1 >= race2 ? color : 'rgba(255, 255, 255, 0.25)',
                }}
              />
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${racePct2}%`,
                  backgroundColor: race2 > race1 ? color : 'rgba(255, 255, 255, 0.25)',
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 text-[11px] font-mono font-bold text-text-low">Q</span>
            <div className="relative flex h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${qualiPct1}%`,
                  backgroundColor: quali1 >= quali2 ? color : 'rgba(255, 255, 255, 0.25)',
                }}
              />
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${qualiPct2}%`,
                  backgroundColor: quali2 > quali1 ? color : 'rgba(255, 255, 255, 0.25)',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${ptsPct1}%`,
              backgroundColor: pos1 <= pos2 ? color : 'rgba(255, 255, 255, 0.25)',
            }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${ptsPct2}%`,
              backgroundColor: pos2 < pos1 ? color : 'rgba(255, 255, 255, 0.25)',
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * One constructor = one paddock garage panel (team identity + both seats).
 */
export function GarageTeamPanel({ unit, season, priority = false }: { unit: GarageUnit; season: number; priority?: boolean }) {
  const t = useTranslations('ui.common');
  const color = resolveTeamUiColor(undefined, unit.constructorName, season);
  const livery = paletteFor(unit.constructorName, season);
  const [d1, d2] = unit.drivers;

  return (
    <article
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-[#0a0a0a]"
      style={{ borderLeftWidth: 2, borderLeftColor: color }}
    >
      {/* Apple material top specular edge highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/[0.06]"
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={teamPatternStyle(unit.constructorId, color)}
      />

      <div className="relative z-10 flex flex-col lg:flex-row">
        <Link
          href={`/teams/${unit.constructorId}?season=${season}`}
          className="group relative flex flex-col gap-3 overflow-hidden border-b border-hairline p-4 lg:w-[38%] lg:border-b-0 lg:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="h-6 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                lang="en"
                className="font-condensed truncate text-xl font-700 uppercase leading-none text-text-hi sm:text-2xl"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {unit.constructorName}
              </span>
            </div>
            <span className="data-tabular shrink-0 text-accent font-mono text-sm font-semibold">
              P{unit.constructorPosition}
            </span>
          </div>

          {/* Owner rule (apex-component-rules.md §4): 16:9 slot, car contained with >=10% breathing room on a dark team-tinted panel; hidden on phones */}
          <div
            aria-hidden
            className="relative hidden aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)] p-[10%] sm:block lg:mt-auto"
            style={{
              background: `radial-gradient(ellipse 80% 90% at 50% 55%, color-mix(in srgb, ${color} 22%, transparent), transparent 75%), #0d0d0d`,
            }}
          >
            <div className="relative h-full w-full" style={{ filter: 'contrast(1.05) saturate(0.9)' }}>
              <MediaAssetView
                type="car"
                entityKey={`${unit.constructorId}:${season}`}
                alt=""
                name={`${unit.constructorName} ${season}`}
                teamColor={livery.curated ? livery.secondary : color}
                teamAccent={livery.curated ? livery.accent : undefined}
                season={season}
                objectPosition={getCarObjectPosition(unit.constructorId)}
                objectFit="contain"
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="h-full w-full object-contain"
                showAttribution={false}
                initialResult={unit.carMedia}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            {unit.powerUnit ? (
              <span className="data-tabular text-xs uppercase tracking-wider text-text-low">
                {unit.powerUnit}
              </span>
            ) : (
              <span />
            )}
            <span className="data-tabular text-xs text-text-mid">
              {unit.wins} {t('winsShort')} · {unit.points} {t('pts')}
            </span>
          </div>
          {unit.formerScorers?.map((s) => (
            <span key={s.driverId} className="data-tabular -mt-2 text-right text-[11px] leading-tight text-text-low">
              {t('ptsFromDriver', { points: s.points, driver: s.name })}
            </span>
          ))}
        </Link>

        <div className="flex flex-col lg:min-h-0 lg:flex-1">
          <div className="grid grid-cols-2 flex-1">
            {d1 ? <DriverBay row={d1} season={season} color={color} elsewhere={unit.pointsElsewhere?.[d1.driverId]} media={unit.driverMedia?.[d1.driverId]} priority={priority} /> : <EmptySeat />}
            {d2 ? (
              <DriverBay row={d2} season={season} color={color} divided elsewhere={unit.pointsElsewhere?.[d2.driverId]} media={unit.driverMedia?.[d2.driverId]} priority={priority} />
            ) : (
              <EmptySeat divided />
            )}
          </div>
          {d1 && d2 ? <TeammateHeadToHead d1={d1} d2={d2} color={color} h2h={unit.headToHead} /> : null}
        </div>
      </div>
    </article>
  );
}
