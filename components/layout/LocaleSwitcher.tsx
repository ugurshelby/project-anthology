'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useEffect, useTransition } from 'react';

/**
 * Switching locale swaps the root layout (`<html lang>`), so Next loads the
 * page fresh and starts at the top (2026-10 audit: glossary 1640 → 0). The
 * scroll position is kept in sessionStorage for that one load and restored.
 */
const SCROLL_KEY = 'apex-locale-scroll';

function restoreScroll(pathname: string) {
  let saved: { path?: string; y?: number } | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? 'null');
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {
    return;
  }
  if (!saved || saved.path !== pathname || typeof saved.y !== 'number') return;
  const y = saved.y;
  // Streamed sections can still be arriving; retry briefly until the page is tall enough.
  let tries = 0;
  const step = () => {
    if (document.documentElement.scrollHeight - window.innerHeight >= y || tries++ > 20) {
      window.scrollTo(0, y);
      return;
    }
    window.setTimeout(step, 100);
  };
  step();
}

/**
 * Editorial segmented pill language switcher (EN / TR).
 * Preserves the current path and query string across locale changes.
 * Used in desktop SiteHeader and mobile More sheet.
 */
export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('system');
  const params = useParams();
  const locale = params?.locale === 'tr' ? 'tr' : 'en';
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => restoreScroll(pathname), [pathname]);

  const handleSelect = (nextLocale: 'en' | 'tr') => {
    if (nextLocale === locale) return;
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ path: pathname, y: window.scrollY }));
    } catch {
      // Storage blocked: the page opens at the top, as before.
    }
    startTransition(() => {
      // Same page, same query (?season=…), same scroll position: only the language changes.
      router.replace(`${pathname}${window.location.search}`, { locale: nextLocale, scroll: false });
    });
  };

  return (
    <div
      role="region"
      aria-label={t('changeLanguage')}
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
