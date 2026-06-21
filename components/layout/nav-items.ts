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

/** Mobile bottom-nav subset (design.md §3.1 — Stitch pattern). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/season', label: 'Season' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/anthology', label: 'Anthology' },
];
