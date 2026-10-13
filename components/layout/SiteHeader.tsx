import { HeaderNav } from './HeaderNav';

/**
 * Sticky header — desktop/tablet only (md+). Mobile navigation lives entirely
 * in MobileNav's bottom tab-bar; this header is hidden below md on every page
 * so it never doubles up with the tab-bar.
 *
 * Layout (APEX centred, pages fanned out by rank, language at the right edge)
 * is owned by HeaderNav — rules in docs/design/apex-component-rules.md §1.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden bg-bg/70 backdrop-blur-2xl backdrop-saturate-150 md:block">
      <HeaderNav />
      {/* hairline that fades out at the edges, with a faint accent at the centre under APEX */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12)_20%,rgba(255,255,255,0.12)_80%,transparent)]" />
      <span aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 h-px w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] opacity-50" />
    </header>
  );
}
