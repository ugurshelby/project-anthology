import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { resolveTeamUiColor } from '@/config/team-colors';
import { teamPatternStyle } from '@/lib/assets/team-pattern';
import type { DriverGridRow } from '@/lib/data/entities';

export interface GarageUnit {
  constructorId: string;
  constructorName: string;
  constructorPosition: string;
  points: string;
  wins: string;
  powerUnit: string | null;
  drivers: DriverGridRow[];
}

function DriverBay({
  row,
  season,
  color,
  divided,
}: {
  row: DriverGridRow;
  season: number;
  color: string;
  divided?: boolean;
}) {
  const t = useTranslations('ui.common');
  const number = row.carNumber ?? row.position;

  return (
    <Link
      href={`/drivers/${row.driverId}?season=${season}`}
      className={[
        'group relative flex min-h-24 flex-1 flex-col justify-end overflow-hidden p-3 md:min-h-52 md:p-4',
        divided ? 'border-l border-hairline' : '',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${color} 28%, transparent), transparent 62%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <MediaAssetView
          type="driver"
          entityKey={row.driverId}
          alt={row.driverName}
          name={row.driverName}
          driverCode={row.driverCode}
          driverNumber={number}
          teamColor={color}
          className="h-full w-full object-cover"
          showAttribution={false}
        />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-2/3 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent"
      />
      <div className="relative z-10 flex flex-col gap-0.5">
        <span
          className="font-condensed line-clamp-2 text-base font-700 uppercase leading-tight text-text-hi md:text-xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {row.driverName}
        </span>
        <div className="data-tabular flex justify-between text-xs text-text-mid md:text-sm">
          <span>P{row.position}</span>
          <span className="text-text-hi">{row.points} {t('pts')}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptySeat({ divided }: { divided?: boolean }) {
  const t = useTranslations('ui.common');
  return (
    <div
      className={[
        'relative flex min-h-24 flex-1 flex-col items-center justify-center overflow-hidden p-4 md:min-h-52',
        divided ? 'border-l border-hairline' : '',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.04) 11px, rgba(255,255,255,0.04) 12px), repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.04) 11px, rgba(255,255,255,0.04) 12px)',
        }}
      />
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
}: {
  d1: DriverGridRow;
  d2: DriverGridRow;
  color: string;
}) {
  const pts1 = parseFloat(d1.points) || 0;
  const pts2 = parseFloat(d2.points) || 0;
  const total = pts1 + pts2;
  const pct1 = total > 0 ? Math.round((pts1 / total) * 100) : 50;
  const pct2 = 100 - pct1;
  const pos1 = parseInt(d1.position, 10) || 99;
  const pos2 = parseInt(d2.position, 10) || 99;

  return (
    <div className="relative z-10 flex flex-col gap-1.5 border-t border-hairline bg-white/[0.015] px-3.5 py-2 md:px-4">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className={`font-600 uppercase ${pos1 < pos2 ? 'text-text-hi' : 'text-text-mid'}`}>
            {d1.driverCode || d1.driverName.slice(0, 3)}
          </span>
          {pos1 < pos2 ? (
            <span className="rounded-[3px] border border-[#00d26a]/25 bg-[#00d26a]/15 px-1 py-0.5 text-[9px] font-bold text-[#00d26a]">
              AHEAD
            </span>
          ) : null}
        </div>
        <span className="label-caps tracking-widest text-text-low text-[10px]">
          H2H · {pts1} : {pts2} PTS
        </span>
        <div className="flex items-center gap-1.5">
          {pos2 < pos1 ? (
            <span className="rounded-[3px] border border-[#00d26a]/25 bg-[#00d26a]/15 px-1 py-0.5 text-[9px] font-bold text-[#00d26a]">
              AHEAD
            </span>
          ) : null}
          <span className={`font-600 uppercase ${pos2 < pos1 ? 'text-text-hi' : 'text-text-mid'}`}>
            {d2.driverCode || d2.driverName.slice(0, 3)}
          </span>
        </div>
      </div>

      {/* Dual comparison bar */}
      <div className="relative flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${pct1}%`,
            backgroundColor: pos1 <= pos2 ? color : 'rgba(255, 255, 255, 0.25)',
          }}
        />
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${pct2}%`,
            backgroundColor: pos2 < pos1 ? color : 'rgba(255, 255, 255, 0.25)',
          }}
        />
      </div>
    </div>
  );
}

/**
 * One constructor = one paddock garage panel (team identity + both seats).
 */
export function GarageTeamPanel({ unit, season }: { unit: GarageUnit; season: number }) {
  const t = useTranslations('ui.common');
  const color = resolveTeamUiColor(undefined, unit.constructorName, season);
  const [d1, d2] = unit.drivers;

  return (
    <article
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-[#050505]"
      style={{ borderLeftWidth: 2, borderLeftColor: color }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={teamPatternStyle(unit.constructorId, color)}
      />

      <div className="relative z-10 flex flex-col lg:flex-row">
        <Link
          href={`/teams/${unit.constructorId}?season=${season}`}
          className="relative flex flex-col gap-3 border-b border-hairline p-4 lg:w-[38%] lg:border-b-0 lg:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                <MediaAssetView
                  type="team"
                  entityKey={unit.constructorId}
                  alt={unit.constructorName}
                  name={unit.constructorName}
                  teamColor={color}
                  className="h-full w-full object-contain"
                  showAttribution={false}
                />
              </span>
              <span
                className="font-condensed truncate text-xl font-700 uppercase leading-none text-text-hi sm:text-2xl"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {unit.constructorName}
              </span>
            </div>
            <span className="data-tabular shrink-0 text-accent">P{unit.constructorPosition}</span>
          </div>

          <div className="relative hidden h-16 w-full sm:block sm:h-20 lg:mt-auto lg:h-28">
            <MediaAssetView
              type="car"
              entityKey={`${unit.constructorId}:${season}`}
              alt={`${unit.constructorName} ${season} car`}
              name={`${unit.constructorName} ${season}`}
              teamColor={color}
              season={season}
              className="h-full w-full object-contain"
              showAttribution={false}
            />
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
        </Link>

        <div className="flex flex-col lg:min-h-0 lg:flex-1">
          <div className="grid grid-cols-2 flex-1">
            {d1 ? <DriverBay row={d1} season={season} color={color} /> : <EmptySeat />}
            {d2 ? <DriverBay row={d2} season={season} color={color} divided /> : <EmptySeat divided />}
          </div>
          {d1 && d2 ? <TeammateHeadToHead d1={d1} d2={d2} color={color} /> : null}
        </div>
      </div>
    </article>
  );
}
