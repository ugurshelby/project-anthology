'use client';

import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

/**
 * Editorial segmented pill language switcher (EN / TR).
 * Preserves the current path and query string across locale changes.
 * Used in desktop SiteHeader and mobile More sheet.
 */
export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const params = useParams();
  const locale = params?.locale === 'tr' ? 'tr' : 'en';
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextLocale: 'en' | 'tr') => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div
      role="region"
      aria-label="Change language"
      className={[
        'inline-flex items-center gap-1 rounded-full border border-hairline bg-surface/80 p-0.5 backdrop-blur-md',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => handleSelect('en')}
        disabled={isPending}
        aria-pressed={locale === 'en'}
        className={[
          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          locale === 'en'
            ? 'bg-accent text-bg shadow-sm'
            : 'text-text-mid hover:text-text-hi',
        ].join(' ')}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleSelect('tr')}
        disabled={isPending}
        aria-pressed={locale === 'tr'}
        className={[
          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          locale === 'tr'
            ? 'bg-accent text-bg shadow-sm'
            : 'text-text-mid hover:text-text-hi',
        ].join(' ')}
      >
        TR
      </button>
    </div>
  );
}
