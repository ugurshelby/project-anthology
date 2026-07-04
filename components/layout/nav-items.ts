/** Shared navigation model — used by both desktop header and mobile tab-bar. */
export interface NavItem {
  href: string;
  label: string;
}

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
  { href: '/', label: 'Home' },
  { href: '/season', label: 'Season' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/anthology', label: 'Anthology' },
];

/** Routes grouped under the mobile "More" tab. */
export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: '/teams', label: 'Teams' },
  { href: '/circuits', label: 'Circuits' },
  { href: '/news', label: 'News' },
  { href: '/tech-glossary', label: 'Glossary' },
];

export const MOBILE_MORE_HREFS = MOBILE_MORE_ITEMS.map((item) => item.href);
