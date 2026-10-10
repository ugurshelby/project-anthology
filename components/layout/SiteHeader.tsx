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
    <header className="sticky top-0 z-30 hidden border-b border-white/[0.1] bg-bg/85 backdrop-blur-xl md:block">
      <HeaderNav />
    </header>
  );
}
