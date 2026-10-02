import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { resolveTeamUiColor } from '@/config/team-colors';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { ApexImage } from '@/components/media/ApexImage';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

export function ChampionshipPulse({
  drivers,
  constructors,
  season,
}: {
  drivers: DriverStandingRow[];
  constructors: ConstructorStandingRow[];
  season: number;
}) {
  const t = useTranslations('ui.home.pulse');
  const [leader, ...rest] = drivers;
  const leaderPts = Number(leader?.points) || 0;
  const chasing = rest.slice(0, 4);
  const topConstructors = constructors.slice(0, 3);
  const constructorLead = Number(topConstructors[0]?.points) || 1;

  const leaderTeamColor = leader ? resolveTeamUiColor(undefined, leader.constructorName) : '#ff1801';
  const leaderPortrait = leader ? driverIconSrc(leader.driverCode, leader.driverId, season) : null;

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      {/* Card Header with Apple-grade typography & arrow link */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: leaderTeamColor }}
            aria-hidden="true"
          />
          <h2 className="label-caps tracking-wider text-text-mid">{t('heading')}</h2>
        </div>
        <Link
          href="/season"
          className="group/link inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-text-mid transition-colors duration-150 hover:text-white active:scale-95"
        >
          <span>{t('standings')}</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-150 ease-out group-hover/link:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      {/* Leader Spotlight: Apple Frosted Glass Card */}
      {leader ? (
        <Link
          href={`/drivers/${leader.driverId}`}
          className="group relative flex min-h-[104px] items-center justify-between overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.02] p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 ease-out hover:border-white/20 active:scale-[0.98]"
        >
          {/* Top specular edge reflection */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Ambient team color glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full opacity-35 blur-2xl transition-opacity duration-300 group-hover:opacity-50"
            style={{ backgroundColor: leaderTeamColor }}
          />

          {/* Leader Details */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1 pr-3">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-text-hi/90"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: leaderTeamColor }}
                />
                {t('leader')}
              </span>
            </div>

            <h3
              className="line-clamp-1 font-condensed text-xl font-700 uppercase tracking-tight text-white sm:text-2xl"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {leader.driverName}
            </h3>

            <span className="font-mono text-xs text-text-mid/90">
              {leader.constructorName}
            </span>
          </div>

          {/* Points & Cutout Area */}
          <div className="relative z-10 flex shrink-0 flex-col items-end justify-center pl-2">
            <div className="flex items-baseline gap-1">
              <span className="font-condensed text-3xl font-700 tabular-nums leading-none tracking-tight text-white sm:text-4xl">
                {leader.points}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-low">
                {t('pts')}
              </span>
            </div>
          </div>

          {/* Subtly blended driver portrait */}
          {leaderPortrait ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-32 select-none opacity-40 transition-opacity duration-300 group-hover:opacity-60 sm:w-36">
              <ApexImage
                src={leaderPortrait}
                alt=""
                fill
                kind="driver"
                fallbackLabel={leader.driverName}
                sizes="144px"
                className="object-contain object-bottom"
                style={{
                  maskImage: 'linear-gradient(to left, rgba(0,0,0,0.85) 30%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.85) 30%, transparent 95%)',
                }}
              />
            </div>
          ) : null}
        </Link>
      ) : (
        <p className="body-md text-text-mid">{t('unavailable')}</p>
      )}

      {/* Chasing Drivers (P2-P5) */}
      <div className="flex flex-col gap-1">
        {chasing.map((row) => {
          const pts = Number(row.points) || 0;
          const delta = leaderPts - pts;
          const color = resolveTeamUiColor(undefined, row.constructorName);
          const width = leaderPts > 0 ? Math.max(8, (pts / leaderPts) * 100) : 8;

          return (
            <Link
              key={row.driverId}
              href={`/drivers/${row.driverId}`}
              className="group/row flex flex-col gap-1.5 rounded-[var(--radius-chip)] px-2.5 py-1.5 transition-all duration-150 ease-out hover:bg-white/[0.04] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 font-mono text-xs font-bold text-text-low/80">
                    P{row.position}
                  </span>
                  <span
                    className="truncate font-condensed text-sm font-700 uppercase tracking-tight text-text-hi transition-colors group-hover/row:text-white"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {row.driverName}
                  </span>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-text-mid">
                  +{delta} {t('pts')}
                </span>
              </div>

              {/* Progress track with soft gradient & luminous head */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05] p-[0.5px]">
                <span
                  className="block h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})`,
                    boxShadow: `0 0 6px color-mix(in srgb, ${color} 30%, transparent)`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Constructors Section */}
      {topConstructors.length > 0 ? (
        <div className="mt-1 flex flex-col gap-2 border-t border-hairline/60 pt-3">
          <div className="flex items-center justify-between">
            <span className="label-caps text-xs text-text-low">{t('constructors')}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">{t('points')}</span>
          </div>

          <div className="flex flex-col gap-1">
            {topConstructors.map((row) => {
              const pts = Number(row.points) || 0;
              const width = Math.max(8, (pts / constructorLead) * 100);
              const color = resolveTeamUiColor(undefined, row.constructorName);

              return (
                <Link
                  key={row.constructorId}
                  href={`/teams/${row.constructorId}`}
                  className="group/team flex flex-col gap-1 rounded-[var(--radius-chip)] px-2.5 py-1 transition-all duration-150 ease-out hover:bg-white/[0.04] active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-mono text-xs uppercase text-text-hi/90 transition-colors group-hover/team:text-white">
                        {row.constructorName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-text-mid">
                      {row.points}
                    </span>
                  </div>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                    <span
                      className="block h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})`,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
