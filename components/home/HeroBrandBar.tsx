import { useLocale, useTranslations } from 'next-intl';
import { ApexMark } from '@/components/brand/ApexMark';
import { intlTag } from '@/lib/i18n/format';
import { displayUpper } from '@/lib/i18n/caps';

export interface ArchiveTotals {
  firstSeason: number;
  seasons: number;
  races: number;
  drivers: number;
  constructors: number;
}

/**
 * Top band of the home hero (owner rule, apex-component-rules.md §5): says what
 * Apex is where a visitor lands — logomark, name, one line on what the site is,
 * and on wide screens the size of the archive (F1DB numbers, not hardcoded).
 * Phones have no top header, so this is also where they meet the brand.
 */
export function HeroBrandBar({ totals }: { totals: ArchiveTotals }) {
  const t = useTranslations('ui.home.brand');
  const locale = useLocale();
  const nf = new Intl.NumberFormat(intlTag(locale));
  const stats = [
    { value: totals.seasons, label: t('seasons') },
    { value: totals.races, label: t('races') },
    { value: totals.drivers, label: t('drivers') },
    { value: totals.constructors, label: t('teams') },
  ];

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex items-center gap-3">
        <ApexMark className="h-10 w-10 shrink-0 text-text-hi drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:h-12 md:w-12" />
        <div className="flex flex-col">
          <span
            className="font-condensed text-[2rem] font-bold leading-none tracking-[0.02em] text-text-hi md:text-[2.4rem]"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            APEX
          </span>
          <span className="mt-1 max-w-[17rem] text-[12px] font-medium leading-snug text-text-mid md:max-w-none md:text-[13px]">
            {t('tagline', { from: totals.firstSeason })}
          </span>
        </div>
      </div>

      <dl className="hidden items-stretch rounded-2xl border border-white/10 bg-black/35 px-1 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md lg:flex">
        {stats.map((s, i) => (
          <div key={s.label} className={['flex flex-col-reverse items-center px-4', i > 0 ? 'border-l border-white/10' : ''].join(' ')}>
            <dt className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-low">{displayUpper(s.label, locale)}</dt>
            <dd
              className="font-condensed text-2xl font-bold leading-none tabular-nums text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {nf.format(s.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
