import { describe, expect, it } from 'vitest';
import {
  getDriverPointsByConstructor,
  getPerConstructorRoundStats,
  getRaceResultRows,
} from '@/lib/f1/mrdata';
import type { MrData } from '@/lib/data/f1';
import { displayUpper, latinUpper } from '@/lib/i18n/caps';
import { creditText } from '@/lib/media/read';
import { HOME_ITEM, NAV_PAGES_BY_RANK, navLabelLang } from '@/components/layout/nav-items';

/** One-race snapshot with Jolpica 2026 row shapes. */
function race(rows: Array<Record<string, unknown>>, key: 'Results' | 'SprintResults' = 'Results'): MrData {
  return { MRData: { RaceTable: { Races: [{ raceName: 'Test GP', [key]: rows }] } } } as unknown as MrData;
}

const row = (
  position: string,
  driverId: string,
  constructorId: string,
  extra: Record<string, unknown> = {},
) => ({
  position,
  points: '0',
  laps: '62',
  status: 'Finished',
  Driver: { driverId, givenName: driverId, familyName: driverId },
  Constructor: { constructorId, name: constructorId.toUpperCase() },
  ...extra,
});

describe('race classification time column (2026 R17)', () => {
  const rows = getRaceResultRows(
    race([
      row('1', 'max_verstappen', 'red_bull', { Time: { time: '1:42:00.785' } }),
      row('10', 'hadjar', 'red_bull', { Time: { time: '+1:30.862' } }),
      row('11', 'gasly', 'alpine', { laps: '61', status: 'Lapped', Time: { time: '+2.171' } }),
      row('17', 'perez', 'cadillac', { laps: '60', status: 'Lapped', Time: { time: '+20.520' } }),
      row('18', 'albon', 'williams', { laps: '59', status: 'Retired', Time: { time: '' } }),
      row('20', 'stroll', 'aston_martin', { laps: '36', status: 'Retired' }),
    ]),
  );

  it('shows laps down for lapped cars instead of their gap', () => {
    expect(rows.map((r) => r.timeOrStatus)).toEqual([
      '1:42:00.785',
      '+1:30.862',
      '+1 Lap',
      '+2 Laps',
      'Retired',
      'Retired',
    ]);
  });
});

describe('per-team points', () => {
  const sessions = [
    race([
      row('1', 'lawson', 'red_bull', { points: '10' }),
      row('2', 'tsunoda', 'rb', { points: '1' }),
    ]),
    race([row('3', 'lawson', 'rb', { points: '4' })]),
    race([row('1', 'lawson', 'red_bull', { points: '4' })], 'SprintResults'),
  ];

  it('splits a driver’s season points by the team they scored them for', () => {
    expect(getDriverPointsByConstructor(sessions).lawson).toEqual([
      { constructorId: 'red_bull', constructorName: 'RED_BULL', points: 14 },
      { constructorId: 'rb', constructorName: 'RB', points: 4 },
    ]);
  });

  it('counts constructor wins and podiums from race results', () => {
    expect(getPerConstructorRoundStats(sessions.slice(0, 2))).toEqual({
      RED_BULL: { wins: 1, podiums: 1 },
      RB: { wins: 0, podiums: 2 },
    });
  });
});

describe('Turkish uppercase of English words', () => {
  it('keeps English casing for loanwords and Turkish casing for the rest', () => {
    expect(displayUpper('Singapur Grand Prix', 'tr')).toBe('SİNGAPUR GRAND PRIX');
    expect(displayUpper('Yunuslama (Porpoising)', 'tr')).toBe('YUNUSLAMA (PORPOISING)');
    expect(displayUpper('Kuru · Slick', 'tr')).toBe('KURU · SLICK');
    expect(displayUpper('Pist', 'tr')).toBe('PİST');
    expect(displayUpper('Italian Grand Prix', 'en')).toBe('ITALIAN GRAND PRIX');
    expect(latinUpper('Austin')).toBe('AUSTIN');
  });

  it('marks a nav label that is the English word itself', () => {
    const grid = NAV_PAGES_BY_RANK.find((p) => p.key === 'grid')!;
    expect(navLabelLang(grid, 'Grid')).toBe('en');
    expect(navLabelLang(HOME_ITEM, 'Ana Sayfa')).toBeUndefined();
  });
});

describe('media credit text', () => {
  it('shows a site name where Commons recorded a web address as author', () => {
    expect(creditText('https://www.mclaren.com/ / Wikimedia Commons, Public domain')).toBe(
      'mclaren.com / Wikimedia Commons, Public domain',
    );
    expect(creditText('Jen Ross / Wikimedia Commons, CC BY 2.0')).toBe('Jen Ross / Wikimedia Commons, CC BY 2.0');
  });
});
