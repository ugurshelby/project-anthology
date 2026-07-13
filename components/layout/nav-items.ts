/** Shared navigation model — used by both desktop header and mobile tab-bar. */
export interface NavItem {
  href: string;
  label: string;
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
  | 'news'
  | 'glossary';

/**
 * Desktop header nav — split either side of the centered APEX logo (see
 * SiteHeader): Season · Grid · Circuits | APEX | News · Anthology · Glossary.
 * `/grid` replaced the separate /drivers + /teams hub pages (2026-07 redesign).
 */
export const NAV_ITEMS_LEFT: NavItem[] = [
  { href: '/season', label: 'Season' },
  { href: '/grid', label: 'Grid' },
  { href: '/circuits', label: 'Circuits' },
];

export const NAV_ITEMS_RIGHT: NavItem[] = [
  { href: '/news', label: 'News' },
  { href: '/anthology', label: 'Anthology' },
  { href: '/tech-glossary', label: 'Glossary' },
];

/** Flat form — still used wherever a single list is needed (e.g. sitemaps, tests). */
export const NAV_ITEMS: NavItem[] = [...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT];

/** Primary mobile tab-bar (Poster Dense — apex-design-language.md). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/season', label: 'Season', icon: 'season' },
  { href: '/grid', label: 'Grid', icon: 'drivers' },
  { href: '/anthology', label: 'Anthology', icon: 'anthology' },
];

/** Routes surfaced behind the mobile tab-bar's centre "+" full-screen menu. */
export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: '/circuits', label: 'Circuits', icon: 'circuits' },
  { href: '/news', label: 'News', icon: 'news' },
  { href: '/tech-glossary', label: 'Glossary', icon: 'glossary' },
];

export const MOBILE_MORE_HREFS = MOBILE_MORE_ITEMS.map((item) => item.href);
