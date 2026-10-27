import { useTranslations } from 'next-intl';

/** Marks a table built from OpenF1 before the official (Jolpica) result is published. */
export function ProvisionalBadge() {
  const t = useTranslations('ui.table');
  return (
    <div className="mb-3 flex flex-col gap-1">
      <span className="label-caps inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline bg-white/[0.04] px-2.5 py-1 text-text-mid">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-text-low" />
        {t('provisional')}
      </span>
      <p className="text-[11px] leading-snug text-text-low">{t('provisionalNote')}</p>
    </div>
  );
}
