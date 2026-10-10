import { describe, expect, it } from 'vitest';
import {
  HOME_ITEM,
  MOBILE_DOCK_PAGE_COUNT,
  MOBILE_MORE_ITEMS,
  MOBILE_NAV_ITEMS,
  NAV_PAGES_BY_RANK,
  desktopNavSlots,
  isNavItemActive,
  type NavItem,
} from '@/components/layout/nav-items';

/** Owner rules: docs/design/apex-component-rules.md §1 (navigation). */

const page = (n: number): NavItem => ({ href: `/p${n}`, label: `P${n}` });

describe('nav rank model', () => {
  it('lists every page once and never Home', () => {
    const hrefs = NAV_PAGES_BY_RANK.map((p) => p.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).not.toContain('/');
  });

  it('gives every page a translation key and an icon (desktop label + mobile tile)', () => {
    for (const p of NAV_PAGES_BY_RANK) {
      expect(p.key, p.href).toBeTruthy();
      expect(p.icon, p.href).toBeTruthy();
    }
  });
});

describe('desktop slots — Home stays centred', () => {
  it('fans pages out from the centre by rank, alternating left then right', () => {
    const { left, right } = desktopNavSlots([page(1), page(2), page(3), page(4), page(5)]);
    // left is rendered left-to-right, so the slot next to the logo is the LAST one
    expect(left.map((s) => s?.href ?? null)).toEqual(['/p5', '/p3', '/p1']);
    expect(right.map((s) => s?.href ?? null)).toEqual(['/p2', '/p4', null]);
  });

  it('always gives both sides the same number of slots', () => {
    for (let n = 1; n <= 12; n++) {
      const pages = Array.from({ length: n }, (_, i) => page(i + 1));
      const { left, right } = desktopNavSlots(pages);
      expect(left.length, `n=${n}`).toBe(right.length);
      expect([...left, ...right].filter(Boolean)).toHaveLength(n);
    }
  });

  it('only ever leaves the outermost right slot empty', () => {
    const { left, right } = desktopNavSlots(NAV_PAGES_BY_RANK);
    expect(left.every(Boolean)).toBe(true);
    expect(right.slice(0, -1).every(Boolean)).toBe(true);
  });

  it('puts the most important page directly left of the logo', () => {
    const { left } = desktopNavSlots(NAV_PAGES_BY_RANK);
    expect(left[left.length - 1]).toBe(NAV_PAGES_BY_RANK[0]);
  });
});

describe('mobile dock — rank order', () => {
  it('starts with Home followed by the top-ranked pages', () => {
    expect(MOBILE_NAV_ITEMS[0]).toBe(HOME_ITEM);
    expect(MOBILE_NAV_ITEMS.slice(1)).toEqual(NAV_PAGES_BY_RANK.slice(0, MOBILE_DOCK_PAGE_COUNT));
  });

  it('puts every other page in the "+" menu, in rank order', () => {
    expect([...MOBILE_NAV_ITEMS.slice(1), ...MOBILE_MORE_ITEMS]).toEqual(NAV_PAGES_BY_RANK);
  });
});

describe('isNavItemActive', () => {
  it('matches Home only on the root, with or without the /tr prefix', () => {
    expect(isNavItemActive('/', '/')).toBe(true);
    expect(isNavItemActive('/tr', '/')).toBe(true);
    expect(isNavItemActive('/season', '/')).toBe(false);
  });

  it('matches a page and its sub-routes but not a lookalike prefix', () => {
    expect(isNavItemActive('/tr/season/2010', '/season')).toBe(true);
    expect(isNavItemActive('/news', '/news')).toBe(true);
    expect(isNavItemActive('/newsletter', '/news')).toBe(false);
  });
});
