import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { TeamLineupView } from '@/lib/data/profiles';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import type { MediaResult } from '@/lib/media/read';
import { DRIVER_GRID_POSITIONS } from '@/components/standings/GarageTeamPanel';
import { formatNumber, formatPercent } from '@/lib/i18n/format';

export interface TeamCockpitLineupProps {
  lineup: TeamLineupView[];
  year: number;
  ui: string;
  totalTeamPoints: number;
  driverMediaMap?: Map<string, MediaResult>;
}

/**
 * Dual Pilot Cockpit Modules (Item 10.4):
 * Interactive, complementary bento modules for the active drivers:
 * - Monumental race numbers in Barlow Condensed watermark.
 * - Authentically framed portraits using golden-ratio eye alignment (35-40%).
 * - In-season points and team points share / delta.
 * - Team-colored vertical precision indicator bar.
 * - Fluid, interruptible spring hover interaction to driver profiles.
 */
export function TeamCockpitLineup({
  lineup,
  year,
  ui,
  totalTeamPoints,
  driverMediaMap,
}: TeamCockpitLineupProps) {
  const t = useTranslations('history');
  const locale = useLocale();
  if (lineup.length === 0) return null;

  return (
    <section aria-label={t('team.lineupHeading', { year })} className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ui }} />
          <h2 className="label-caps font-mono text-[11px] tracking-[0.14em] text-text-mid uppercase">
            {t('team.lineupHeading', { year })}
          </h2>
        </div>
        <span className="font-mono text-xs text-text-low">
          {lineup.length} {lineup.length === 1 ? 'Pilot' : 'Pilot'}
        </span>
      </div>

      <div className={`grid gap-4 ${lineup.length === 1 ? 'grid-cols-1 max-w-xl' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {lineup.map((d, i) => {
          const media = driverMediaMap?.get(d.driverId);
          const eyePosition = DRIVER_GRID_POSITIONS[d.driverId] ?? 'center 25%';
          const pointShare =
            totalTeamPoints > 0 && d.points > 0
              ? Math.round((d.points / totalTeamPoints) * 100)
              : null;

          return (
            <Link
              key={d.driverId}
              href={`/drivers/${d.driverId}?season=${year}`}
              className="group relative flex min-h-[7rem] cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-hairline/80 bg-surface p-4 sm:p-5 transition-all duration-300 hover:border-white/25 hover:bg-surface-elevated hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              style={{
                ['--driver-delay' as string]: `${i * 80}ms`,
              }}
            >
              {/* Hairline top-edge specular highlight */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

              {/* Team-colored precision vertical indicator bar */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-transform duration-300 group-hover:scale-y-105"
                style={{ backgroundColor: ui }}
              />

              {/* Background ambient radial flare */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-35"
                style={{ background: `radial-gradient(circle, ${ui}, transparent 70%)` }}
              />

              {/* Left: Driver Portrait and Identity */}
              <div className="relative z-10 flex items-center gap-4 min-w-0 pr-4">
                {/* Driver Portrait Thumbnail */}
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-inner">
                  {media ? (
                    <MediaAssetView
                      type="driver"
                      entityKey={d.driverId}
                      initialResult={media}
                      alt={d.name}
                      name={d.name}
                      objectFit="cover"
                      objectPosition={eyePosition}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 [filter:contrast(1.05)_saturate(0.92)]"
                      showAttribution={false}
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center font-condensed text-2xl font-800 text-text-low"
                      style={{ color: ui }}
                    >
                      {d.number ?? '#'}
                    </span>
                  )}
                  {/* Bottom portrait scrim */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  />
                </div>

                {/* Driver Name & Telemetry */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {d.position != null ? (
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-mid">
                        P{d.position}
                      </span>
                    ) : null}
                    {d.champion ? (
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider"
                        style={{ backgroundColor: `color-mix(in srgb, ${ui} 25%, transparent)`, color: ui }}
                      >
                        ★ {t('rail.champion')}
                      </span>
                    ) : null}
                  </div>

                  <h3
                    lang="en"
                    className="font-condensed mt-1 truncate text-xl sm:text-2xl font-700 uppercase tracking-tight text-text-hi transition-colors duration-200 group-hover:text-white"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {d.name}
                  </h3>

                  {/* Telemetry data strip */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-xs text-text-mid">
                    <span className="data-tabular font-semibold text-text-hi">
                      {formatNumber(d.points, locale)} {t('stats.ptsShort')}
                    </span>
                    {pointShare != null ? (
                      <>
                        <span className="text-text-low">·</span>
                        <span className="text-text-mid text-[11px] font-mono">
                          {t('stats.pointShare', { pct: formatPercent(pointShare, locale, 0) })}
                        </span>
                      </>
                    ) : null}
                    {d.wins > 0 ? (
                      <>
                        <span className="text-text-low">·</span>
                        <span className="font-semibold text-text-hi">
                          {d.wins} {t('stats.wins')}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right: Monumental Number Watermark */}
              {d.number ? (
                <div
                  aria-hidden
                  className="relative z-10 shrink-0 select-none pr-1 pl-2 text-right transition-transform duration-300 group-hover:scale-105"
                >
                  <span
                    className="font-condensed block text-5xl sm:text-6xl font-800 leading-none text-white/[0.12] transition-colors duration-300 group-hover:text-white/[0.22]"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {d.number}
                  </span>
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
