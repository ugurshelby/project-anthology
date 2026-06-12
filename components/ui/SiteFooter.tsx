import { SITE_NAME } from '@/lib/seo';

/**
 * Site footer — legal hygiene (Faz 0): an unaffiliated-with-F1 disclaimer and
 * the F1DB CC-BY-4.0 attribution required by its license. Server component,
 * DESIGN_SYSTEM tokens, accent-only, no radius/shadow.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-brand">{SITE_NAME}</p>

        <div className="site-footer-legal">
          <p>Not affiliated with Formula 1®. F1, FORMULA 1 and related marks are trademarks of Formula One Licensing BV.</p>
          <p>
            Historical data:{' '}
            <a
              href="https://github.com/f1db/f1db"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-link"
            >
              F1DB
            </a>{' '}
            (
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-link"
            >
              CC-BY-4.0
            </a>
            ).
          </p>
        </div>

        <p className="site-footer-copy">© {year} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
