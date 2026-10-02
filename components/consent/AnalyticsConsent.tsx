'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  SERVER_SNAPSHOT,
  dismissReopened,
  getConsentSnapshot,
  isAnalyticsAllowed,
  setConsent,
  subscribeConsent,
} from '@/lib/consent';

const BUTTON =
  'label-caps min-h-11 flex-1 rounded-[var(--radius-chip)] border border-white/25 bg-surface-raised px-4 py-2 text-text-hi transition-colors hover:bg-white/10';

/**
 * Mounts Vercel Analytics and Speed Insights only after an explicit accept, and
 * shows the consent notice until the visitor chooses. Both buttons are equal.
 */
export function AnalyticsConsent() {
  const t = useTranslations('consent');
  const { hydrated, consent, reopened } = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    () => SERVER_SNAPSHOT,
  );

  const showNotice = hydrated && (consent === 'unknown' || reopened);

  useEffect(() => {
    if (!reopened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissReopened();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reopened]);

  return (
    <>
      {hydrated && isAnalyticsAllowed(consent) ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
      {showNotice ? (
        <section
          aria-labelledby="consent-title"
          className="fixed inset-x-3 bottom-[max(6.5rem,calc(88px+env(safe-area-inset-bottom,0px)))] z-40 rounded-[var(--radius-card)] border border-white/15 bg-surface p-4 shadow-lg md:inset-x-auto md:bottom-6 md:left-6 md:max-w-sm"
        >
          <h2 id="consent-title" className="label-caps text-text-hi">
            {t('title')}
          </h2>
          <p className="body-sm mt-2 text-text-mid">
            {t('body')}{' '}
            <Link href="/privacy" className="text-text-hi underline decoration-accent underline-offset-4">
              {t('privacyLink')}
            </Link>
          </p>
          <div className="mt-3 flex gap-3">
            <button type="button" className={BUTTON} onClick={() => setConsent('granted')}>
              {t('accept')}
            </button>
            <button type="button" className={BUTTON} onClick={() => setConsent('denied')}>
              {t('decline')}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
