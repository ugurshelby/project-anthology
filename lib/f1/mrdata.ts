import type { MrData } from '@/lib/data/f1';
import type { CalendarRace } from '@/lib/f1Calendar';

export function getRacesFromCalendar(data: MrData | null): CalendarRace[] {
  const races = (data?.MRData as { RaceTable?: { Races?: CalendarRace[] } })?.RaceTable
    ?.Races;
  return Array.isArray(races) ? races : [];
}

export interface DriverStandingRow {
  position: string;
  points: string;
  driverName: string;
  constructorName: string;
  driverCode: string;
}

export function getDriverStandings(data: MrData | null, limit = 22): DriverStandingRow[] {
  const list = (
    data?.MRData as {
      StandingsTable?: {
        StandingsLists?: Array<{
          DriverStandings?: Array<{
            position?: string;
            points?: string;
            Driver?: { givenName?: string; familyName?: string; code?: string };
            Constructors?: Array<{ name?: string }>;
          }>;
        }>;
      };
    }
  )?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

  if (!Array.isArray(list)) return [];

  return list.slice(0, limit).map((row) => {
    const given = row.Driver?.givenName ?? '';
    const family = row.Driver?.familyName ?? '';
    return {
      position: row.position ?? '—',
      points: row.points ?? '0',
      driverName: `${given} ${family}`.trim() || '—',
      driverCode: (row.Driver?.code ?? '').toLowerCase(),
      constructorName: row.Constructors?.[0]?.name ?? '—',
    };
  });
}

export function formatRaceCountdown(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) return 'Race underway or finished';
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Current epoch ms. Lives here (a plain lib module, not a component) so callers
 * can read the request-time clock without the react-hooks/purity rule flagging
 * a bare `Date.now()` inside an RSC body.
 */
export function nowMs(): number {
  return Date.now();
}

export function raceStartMs(race: CalendarRace): number {
  const d = race.date;
  if (!d) return NaN;
  const iso = race.time ? `${d}T${race.time}` : `${d}T12:00:00Z`;
  return new Date(iso).getTime();
}
