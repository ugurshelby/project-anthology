import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { DriverStintView } from '@/lib/data/profiles';

/**
 * A driver's career as a bar of team stints, width proportional to the years.
 * Each stint links to its first season on this driver's page.
 */
export function DriverJourney({
  stints,
  driverId,
  selectedYear,
}: {
  stints: DriverStintView[];
  driverId: string;
  selectedYear: number;
}) {
  const t = useTranslations('history.driver');
  if (stints.length === 0) return null;

  return (
    <div>
      <p className="body-sm max-w-xl text-text-mid">{t('journeyLead')}</p>
      <div className="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="flex min-w-full gap-1" aria-label={t('journeyHeading')}>
          {stints.map((s, i) => {
            const span = s.to - s.from + 1;
            const current = selectedYear >= s.from && selectedYear <= s.to;
            return (
              <li key={`${s.id}-${s.from}-${i}`} className="min-w-[5.5rem]" style={{ flexGrow: Math.max(span, 1), flexBasis: `${Math.max(span, 1) * 3.5}rem` }}>
                <Link
                  href={`/drivers/${driverId}?season=${s.from}`}
                  scroll={false}
                  aria-current={current ? 'true' : undefined}
                  className={[
                    'group relative flex h-full min-h-[5.5rem] cursor-pointer flex-col justify-between overflow-hidden rounded-[var(--radius)] border p-3 transition-[border-color,background-color] duration-200',
                    current ? 'border-[color:var(--stint)]' : 'border-hairline hover:border-white/25',
                  ].join(' ')}
                  style={
                    {
                      '--stint': s.ui,
                      backgroundColor: `color-mix(in srgb, ${s.ui} ${current ? 20 : 9}%, var(--surface))`,
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: s.ui }} />
                  <span className="headline-md mt-1 block truncate text-[clamp(18px,2vw,24px)] text-text-hi">{s.name}</span>
                  <span className="data-tabular mt-3 block text-xs text-text-mid">
                    {s.from === s.to ? s.from : t('yearsLabel', { from: s.from, to: s.to })}
                    <span className="mx-1.5 text-text-low">·</span>
                    {t('stintSeasons', { count: s.years.length })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
