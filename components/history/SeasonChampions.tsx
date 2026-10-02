import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { championsOf } from '@/lib/history/seasons';
import { paletteForConstructorId } from '@/lib/history/palette';

/**
 * Who won the titles that year. Shown only for seasons the archive has a
 * decided champion for; an ongoing or unknown season shows nothing here.
 */
export function SeasonChampions({ year }: { year: number }) {
  const t = useTranslations('history.season');
  const c = championsOf(year);
  if (!c.final || (!c.driver && !c.constructor)) return null;

  const driverUi = c.driver?.teamId ? paletteForConstructorId(c.driver.teamId, year).ui : null;
  const teamUi = c.constructor ? paletteForConstructorId(c.constructor.id, year).ui : null;

  return (
    <section aria-label={t('champions')} className="mb-8 grid gap-3 md:grid-cols-2">
      {c.driver ? (
        <Link
          href={`/drivers/${c.driver.id}?season=${year}`}
          className="group relative flex min-h-[5.5rem] cursor-pointer flex-col justify-center overflow-hidden rounded-[var(--radius-lg)] border border-hairline p-5 transition-colors duration-200 hover:border-white/25"
          style={{ backgroundColor: `color-mix(in srgb, ${driverUi ?? '#8B93A1'} 9%, var(--surface))` }}
        >
          <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: driverUi ?? '#8B93A1' }} />
          <span className="label-caps text-text-mid">{t('driverChampion')}</span>
          <span className="headline-md mt-1 text-text-hi">{c.driver.name}</span>
          {c.driver.teamName ? <span className="data-tabular mt-1 text-xs text-text-mid">{c.driver.teamName}</span> : null}
        </Link>
      ) : null}
      {c.constructor ? (
        <Link
          href={`/teams/${c.constructor.id}?season=${year}`}
          className="group relative flex min-h-[5.5rem] cursor-pointer flex-col justify-center overflow-hidden rounded-[var(--radius-lg)] border border-hairline p-5 transition-colors duration-200 hover:border-white/25"
          style={{ backgroundColor: `color-mix(in srgb, ${teamUi ?? '#8B93A1'} 9%, var(--surface))` }}
        >
          <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: teamUi ?? '#8B93A1' }} />
          <span className="label-caps text-text-mid">{t('constructorChampion')}</span>
          <span className="headline-md mt-1 text-text-hi">{c.constructor.name}</span>
        </Link>
      ) : null}
    </section>
  );
}
