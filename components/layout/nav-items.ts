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

export const NAV_ITEMS: NavItem[] = [
  { href: '/season', label: 'Season' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/teams', label: 'Teams' },
  { href: '/circuits', label: 'Circuits' },
  { href: '/news', label: 'News' },
  { href: '/anthology', label: 'Anthology' },
];

/** Primary mobile tab-bar (Poster Dense — apex-design-language.md). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/season', label: 'Season', icon: 'season' },
  { href: '/drivers', label: 'Drivers', icon: 'drivers' },
  { href: '/anthology', label: 'Anthology', icon: 'anthology' },
];

/** Routes surfaced behind the mobile tab-bar's centre "+" full-screen menu. */
export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: '/teams', label: 'Teams', icon: 'teams' },
  { href: '/circuits', label: 'Circuits', icon: 'circuits' },
  { href: '/news', label: 'News', icon: 'news' },
  { href: '/tech-glossary', label: 'Glossary', icon: 'glossary' },
];

export const MOBILE_MORE_HREFS = MOBILE_MORE_ITEMS.map((item) => item.href);
