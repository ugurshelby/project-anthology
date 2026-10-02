'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { reopenConsent } from '@/lib/consent';

const YEAR = new Date().getFullYear();

const EXPLORE_LINKS: { href: string; navKey: 'season' | 'grid' | 'circuits' | 'news' | 'anthology' | 'glossary'; fallback: string }[] = [
  { href: '/season', navKey: 'season', fallback: 'Season' },
  { href: '/grid', navKey: 'grid', fallback: 'Grid' },
  { href: '/circuits', navKey: 'circuits', fallback: 'Circuits' },
  { href: '/news', navKey: 'news', fallback: 'News' },
  { href: '/anthology', navKey: 'anthology', fallback: 'Anthology' },
  { href: '/tech-glossary', navKey: 'glossary', fallback: 'Tech Glossary' },
];

const LEGAL_LINKS: { href: string; footerKey: 'legalDisclaimer' | 'legalPrivacy' | 'legalTerms' | 'legalDmca'; fallback: string }[] = [
  { href: '/disclaimer', footerKey: 'legalDisclaimer', fallback: 'Disclaimer' },
  { href: '/privacy', footerKey: 'legalPrivacy', fallback: 'Privacy' },
  { href: '/terms', footerKey: 'legalTerms', fallback: 'Terms' },
  { href: '/dmca', footerKey: 'legalDmca', fallback: 'Copyright / DMCA' },
];

/** Editorial site footer — brand column, explore links, archive note. */
export function SiteFooter() {
  const tFooter = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="mt-20 border-t border-white/[0.1] bg-bg/90 pb-mobile-nav md:pb-0">
      <div className="mx-auto grid w-full max-w-[var(--container-max)] gap-10 px-5 py-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-12 md:px-8 md:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:px-16">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span
              className="font-condensed text-2xl font-700 tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
            >
              APEX
            </span>
            <span className="label-caps text-text-mid">{tFooter('archiveTagline')}</span>
          </div>
          <p className="max-w-md body-md text-text-mid">
            {tFooter('description')}
          </p>
          <p className="max-w-2xl body-sm text-text-low">
            {tFooter('disclaimer')}
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <span className="label-caps text-text-mid">{tFooter('explore')}</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Explore">
            {EXPLORE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label-caps text-text-mid transition-colors hover:text-text-hi"
              >
                {tNav(l.navKey)}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Legal">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label-caps text-text-low transition-colors hover:text-text-hi"
              >
                {tFooter(l.footerKey)}
              </Link>
            ))}
            <button
              type="button"
              onClick={reopenConsent}
              className="label-caps text-text-low transition-colors hover:text-text-hi"
            >
              {tFooter('analyticsSettings')}
            </button>
          </nav>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-2 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-16">
          <p className="label-caps text-text-mid">
            © {YEAR} Apex F1 — {tFooter('archiveTagline')}
          </p>
          <p className="data-tabular text-xs text-text-mid">
            {tFooter('builtFor')}
            <span className="mx-2 text-text-low">·</span>
            {tFooter('dataCredit')}:{' '}
            <a
              href="https://github.com/f1db/f1db"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-text-hi"
            >
              F1DB
            </a>{' '}
            (CC BY 4.0)
          </p>
        </div>
      </div>
    </footer>
  );
}
