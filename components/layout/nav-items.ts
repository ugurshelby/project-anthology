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
 * Desktop header nav — split either side of the centered APEX logo (see
 * SiteHeader): Season · Grid · Circuits | APEX | Machinery · News · Anthology · Glossary.
 * `/grid` replaced the separate /drivers + /teams hub pages (2026-07 redesign).
 */
export const NAV_ITEMS_LEFT: NavItem[] = [
  { href: '/season', label: 'Season', key: 'season' },
  { href: '/grid', label: 'Grid', key: 'grid' },
  { href: '/circuits', label: 'Circuits', key: 'circuits' },
];

export const NAV_ITEMS_RIGHT: NavItem[] = [
  { href: '/machinery', label: 'Machinery', key: 'machinery' },
  { href: '/news', label: 'News', key: 'news' },
  { href: '/anthology', label: 'Anthology', key: 'anthology' },
  { href: '/tech-glossary', label: 'Glossary', key: 'glossary' },
];

/** Flat form — still used wherever a single list is needed (e.g. sitemaps, tests). */
export const NAV_ITEMS: NavItem[] = [...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT];

/** Primary mobile tab-bar (Poster Dense — apex-design-language.md). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', key: 'home', icon: 'home' },
  { href: '/season', label: 'Season', key: 'season', icon: 'season' },
  { href: '/grid', label: 'Grid', key: 'grid', icon: 'drivers' },
  { href: '/anthology', label: 'Anthology', key: 'anthology', icon: 'anthology' },
];

/** Routes surfaced behind the mobile tab-bar's centre "+" full-screen menu. */
export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: '/circuits', label: 'Circuits', key: 'circuits', icon: 'circuits' },
  { href: '/machinery', label: 'Machinery', key: 'machinery', icon: 'machinery' },
  { href: '/news', label: 'News', key: 'news', icon: 'news' },
  { href: '/tech-glossary', label: 'Glossary', key: 'glossary', icon: 'glossary' },
];

export const MOBILE_MORE_HREFS = MOBILE_MORE_ITEMS.map((item) => item.href);
