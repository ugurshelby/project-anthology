export type NavItemKey =
  | 'home'
  | 'season'
  | 'grid'
  | 'circuits'
  | 'machinery'
  | 'news'
  | 'anthology'
  | 'glossary';

/** Shared navigation model — used by both desktop header and mobile tab-bar. */
export interface NavItem {
  href: string;
  label: string;
  key?: NavItemKey;
  /** Icon key resolved to an inline SVG in NavIcons.tsx (mobile tab-bar + more menu only). */
  icon?: NavIconKey;
}

export type NavIconKey =
  | 'home'
  | 'season'
  | 'drivers'
  | 'anthology'
  | 'teams'
  | 'circuits'
  | 'machinery'
  | 'news'
  | 'glossary';

/**
 * Owner rule (docs/design/apex-component-rules.md §1): every page except Home,
 * ordered by meaning and importance — index 0 is the most important. This is
 * the ONLY place the order is decided; the desktop and mobile layouts below
 * are derived from it. A new page is added here at its importance rank, never
 * appended to one side of the header by hand.
 */
export const NAV_PAGES_BY_RANK: NavItem[] = [
  { href: '/season', label: 'Season', key: 'season', icon: 'season' },
  { href: '/grid', label: 'Grid', key: 'grid', icon: 'drivers' },
  { href: '/news', label: 'News', key: 'news', icon: 'news' },
  { href: '/circuits', label: 'Circuits', key: 'circuits', icon: 'circuits' },
  { href: '/anthology', label: 'Anthology', key: 'anthology', icon: 'anthology' },
  { href: '/machinery', label: 'Machinery', key: 'machinery', icon: 'machinery' },
  { href: '/tech-glossary', label: 'Glossary', key: 'glossary', icon: 'glossary' },
];

export const HOME_ITEM: NavItem = { href: '/', label: 'Home', key: 'home', icon: 'home' };

/**
 * Desktop header: Home (APEX) sits in the centre; pages fan out from the centre
 * by rank, alternating left and right (rank 1 left of the logo, rank 2 right of
 * it, rank 3 next on the left, ...). Both sides always get the same number of
 * equal-width slots; when the page count is odd the outermost right slot stays
 * empty (`null`) so the logo never drifts off-centre.
 *
 * Arrays are ordered left-to-right as rendered: `left` ends next to the logo,
 * `right` starts next to it.
 */
export function desktopNavSlots(pages: NavItem[] = NAV_PAGES_BY_RANK): {
  left: (NavItem | null)[];
  right: (NavItem | null)[];
} {
  const perSide = Math.ceil(pages.length / 2);
  const leftFromCentre: (NavItem | null)[] = [];
  const rightFromCentre: (NavItem | null)[] = [];
  pages.forEach((page, i) => (i % 2 === 0 ? leftFromCentre : rightFromCentre).push(page));
  while (leftFromCentre.length < perSide) leftFromCentre.push(null);
  while (rightFromCentre.length < perSide) rightFromCentre.push(null);
  return { left: [...leftFromCentre].reverse(), right: rightFromCentre };
}

/** Flat form — still used wherever a single list is needed (e.g. sitemaps, tests). */
export const NAV_ITEMS: NavItem[] = NAV_PAGES_BY_RANK;

/** Pages that fit in the mobile dock next to Home (the "+" button takes the last slot). */
export const MOBILE_DOCK_PAGE_COUNT = 3;

/** Primary mobile tab-bar: Home first, then the highest-ranked pages. */
export const MOBILE_NAV_ITEMS: NavItem[] = [HOME_ITEM, ...NAV_PAGES_BY_RANK.slice(0, MOBILE_DOCK_PAGE_COUNT)];

/** Everything else, in rank order, behind the tab-bar's "+" full-screen menu. */
export const MOBILE_MORE_ITEMS: NavItem[] = NAV_PAGES_BY_RANK.slice(MOBILE_DOCK_PAGE_COUNT);

export const MOBILE_MORE_HREFS = MOBILE_MORE_ITEMS.map((item) => item.href);

/** Active-route test shared by every nav surface (strips the /tr prefix). */
export function isNavItemActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/^\/tr(\/|$)/, '$1') || '/';
  if (href === '/') return path === '/';
  return path === href || path.startsWith(href + '/');
}
