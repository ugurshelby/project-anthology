import { beforeEach, describe, expect, it, vi } from 'vitest';

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
);
const fetchCalendar = vi.hoisted(() => vi.fn());
const fetchRound = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ notFound: notFoundMock }));
// i18n/routing builds its navigation helpers at import time; the page never calls them here.
vi.mock('next-intl/navigation', () => ({
  createNavigation: () => ({ Link: 'a', redirect: vi.fn(), usePathname: vi.fn(), useRouter: vi.fn(), getPathname: vi.fn() }),
}));
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async () => {
    const t = (key: string) => key;
    return t;
  }),
}));
vi.mock('@/lib/data/f1', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/data/f1')>()),
  fetchSeasonSnapshotTyped: fetchCalendar,
  fetchRoundSnapshot: fetchRound,
}));

import RoundPage, { generateMetadata } from '@/app/[locale]/season/[year]/round/[n]/page';
import { F1_SEASON_MIN } from '@/lib/f1Calendar';

const calendar = (rounds: number[]) => ({
  MRData: {
    RaceTable: {
      Races: rounds.map((round) => ({
        round: String(round),
        raceName: `Round ${round} Grand Prix`,
        date: '2025-03-16',
        Circuit: { circuitId: `circuit_${round}`, circuitName: 'Circuit', Location: { country: 'X' } },
      })),
    },
  },
});

const params = (n: string, year = String(F1_SEASON_MIN)) =>
  Promise.resolve({ year, n, locale: 'en' });

describe('round page not found', () => {
  beforeEach(() => {
    notFoundMock.mockClear();
    fetchCalendar.mockReset();
    fetchRound.mockReset();
    fetchRound.mockResolvedValue(null);
  });

  it('calls notFound when the round is not in the calendar snapshot', async () => {
    fetchCalendar.mockResolvedValue(calendar([1, 2, 3]));
    await expect(RoundPage({ params: params('30') })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(fetchRound).not.toHaveBeenCalled();
  });

  it('calls notFound for a round number outside the supported range', async () => {
    await expect(RoundPage({ params: params('0') })).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(RoundPage({ params: params('36') })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(2);
  });

  it('returns the not-found title from generateMetadata for a missing round', async () => {
    fetchCalendar.mockResolvedValue(calendar([1, 2, 3]));
    const meta = await generateMetadata({ params: params('30') });
    expect(meta).toEqual({ title: 'round' });
  });

  it('does not call notFound for a round in the calendar', async () => {
    fetchCalendar.mockResolvedValue(calendar([1, 2, 3]));
    await RoundPage({ params: params('2') }).catch(() => undefined);
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(fetchRound).toHaveBeenCalled();
  });
});
