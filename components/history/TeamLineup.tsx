import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { TeamLineupView } from '@/lib/data/profiles';

/** The drivers a team ran in a season, as large number tiles linking to each driver's season. */
export function TeamLineup({ lineup, year, ui }: { lineup: TeamLineupView[]; year: number; ui: string }) {
  const t = useTranslations('history');
  if (lineup.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lineup.map((d, i) => (
        <li key={d.driverId} className="reveal-up" style={{ ['--i' as string]: i }}>
          <Link
            href={`/drivers/${d.driverId}?season=${year}`}
            className="group relative flex min-h-[5.5rem] cursor-pointer items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-hairline p-4 transition-[border-color,background-color] duration-200 hover:border-white/25"
            style={{ backgroundColor: `color-mix(in srgb, ${ui} 8%, var(--surface))` }}
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: ui }} />
            {d.number ? (
              <span className="hero-number w-14 shrink-0 text-center text-[clamp(34px,4vw,48px)]" style={{ color: ui }}>
                {d.number}
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="headline-md block truncate text-[clamp(18px,2vw,24px)] text-text-hi">{d.name}</span>
              <span className="data-tabular mt-1 block text-xs text-text-mid">
                {d.position != null ? `P${d.position}` : null}
                {d.position != null && (d.points > 0 || d.position != null) ? <span className="mx-1.5 text-text-low">·</span> : null}
                {d.position != null || d.points > 0 ? `${Number.isInteger(d.points) ? d.points : d.points.toFixed(1)} ${t('stats.ptsShort')}` : null}
                {d.wins > 0 ? (
                  <>
                    <span className="mx-1.5 text-text-low">·</span>
                    {d.wins} {t('stats.wins')}
                  </>
                ) : null}
                {d.champion ? (
                  <>
                    <span className="mx-1.5 text-text-low">·</span>
                    <span style={{ color: ui }}>{t('rail.champion')}</span>
                  </>
                ) : null}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
