import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot } from '@/lib/data/f1';
import {
  getDriverStandings,
  getConstructorStandings,
  getRacesFromCalendar,
  getLastRaceResult,
  getQualifyingPole,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, isRaceDone, getLastFinishedRace } from '@/lib/f1Calendar';
import { resolveTeamUiColor } from '@/config/team-colors';
import { circuitIconSrc, driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';

// ISR: cron updates f1_snapshots daily; 15-min revalidate keeps the page fresh
// after a sync without forcing fully-dynamic rendering on every request.
export const revalidate = 900;

const TITLE = 'Season';
const DESCRIPTION = `Live ${CURRENT_SEASON} Formula 1 season: driver and constructor standings, full race calendar, and the latest race recap — powered by snapshot data.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 ${CURRENT_SEASON}`,
    description: DESCRIPTION,
    url: '/season',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 ${CURRENT_SEASON}`, description: DESCRIPTION },
  alternates: { canonical: '/season' },
};

export default async function SeasonPage() {
  // Season-level snapshots first (calendar is needed to find the last finished round).
  const [calendarData, driverData, constructorData] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_constructors'),
  ]);

  const races = getRacesFromCalendar(calendarData);
  const standings = getDriverStandings(driverData);
  const constructors = getConstructorStandings(constructorData);

  // Last finished round → results + qualifying for the recap.
  const lastRace = getLastFinishedRace(races);
  const lastRound = lastRace?.round != null ? Number(lastRace.round) : null;
  const [resultsData, qualiData] = lastRound
    ? await Promise.all([
        fetchRoundSnapshot(CURRENT_SEASON, lastRound, 'results'),
        fetchRoundSnapshot(CURRENT_SEASON, lastRound, 'qualifying'),
      ])
    : [null, null];

  const recap = getLastRaceResult(resultsData);
  const pole = getQualifyingPole(qualiData);

  const leader = standings[0] ?? null;
  const poleDriverSrc = pole ? driverIconSrc(pole.driverCode, pole.driverName) : null;
  const recapCircuitSrc = lastRace ? circuitIconSrc(lastRace.Circuit?.circuitId) : null;
  const leaderDriverSrc = leader ? driverIconSrc(leader.driverCode, leader.driverName) : null;
  const leaderTeamSrc = leader ? teamIconSrc(leader.constructorName) : null;
  const maxConstructorPts = constructors.reduce(
    (m, c) => Math.max(m, Number(c.points) || 0),
    0,
  );

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          {CURRENT_SEASON} World Championship
        </p>
        <h1
          className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          SEASON
        </h1>
        {leader ? (
          <p className="mt-4 flex flex-wrap items-center justify-center gap-3 font-condensed text-sm uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
            Championship leader
            {leaderDriverSrc ? (
              <SafeImage
                src={leaderDriverSrc}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            ) : null}
            <span className="font-display text-2xl tracking-[0.04em]" style={{ color: 'var(--paper)' }}>
              {leader.driverName}
            </span>
            {leaderTeamSrc ? (
              <SafeImage
                src={leaderTeamSrc}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain opacity-90"
              />
            ) : null}
            <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
              {leader.points} PTS
            </span>
          </p>
        ) : null}
      </AtmosphericHero>

      <div className="content-wrap space-y-section-gap">
        {/* ── Driver Standings ─────────────────────────────────────────── */}
        <section>
          <SectionDivider title="Driver Standings" />
          {standings.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No standings in database yet.
            </p>
          ) : (
            <>
            {/* Mobile (<md): vertical cards — no horizontal scroll. */}
            <ul className="space-y-2 md:hidden">
              {standings.map((row, i) => {
                const teamColor = resolveTeamUiColor(null, row.constructorName);
                const isLeader = i === 0;
                const driverSrc = driverIconSrc(row.driverCode, row.driverName);
                const teamSrc = teamIconSrc(row.constructorName);
                return (
                  <li
                    key={row.position + row.driverName}
                    className="flex items-center gap-3 border border-border px-3 py-3"
                    style={{
                      borderLeft: `3px solid ${teamColor}`,
                      backgroundColor: isLeader ? 'rgba(255,24,1,0.06)' : undefined,
                    }}
                  >
                    <span
                      className="w-6 shrink-0 font-mono text-sm"
                      style={{ color: isLeader ? 'var(--accent)' : 'var(--paper)' }}
                    >
                      {row.position}
                    </span>
                    {driverSrc ? (
                      <SafeImage
                        src={driverSrc}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 object-contain"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm" style={{ color: 'var(--paper)' }}>
                        {row.driverName}
                      </p>
                      <p
                        className="inline-flex items-center gap-1.5 truncate font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: 'var(--muted)' }}
                      >
                        {teamSrc ? (
                          <SafeImage
                            src={teamSrc}
                            alt=""
                            width={14}
                            height={14}
                            className="h-3.5 w-3.5 shrink-0 object-contain opacity-90"
                          />
                        ) : null}
                        {row.constructorName}
                      </p>
                    </div>
                    <span
                      className="shrink-0 font-mono text-sm"
                      style={{ color: 'var(--paper)' }}
                    >
                      {row.points}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Desktop (md+): full table. */}
            <div className="hidden overflow-x-auto border border-border md:block">
              <table className="w-full min-w-[480px] text-left font-mono text-xs tracking-wider">
                <thead className="bg-surface" style={{ color: 'var(--muted)' }}>
                  <tr>
                    <th className="px-4 py-3">Pos</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {standings.map((row, i) => {
                    const teamColor = resolveTeamUiColor(null, row.constructorName);
                    const isLeader = i === 0;
                    const driverSrc = driverIconSrc(row.driverCode, row.driverName);
                    const teamSrc = teamIconSrc(row.constructorName);
                    return (
                      <tr
                        key={row.position + row.driverName}
                        style={isLeader ? { backgroundColor: 'rgba(255,24,1,0.06)' } : undefined}
                      >
                        <td
                          className="px-4 py-3"
                          style={{
                            color: isLeader ? 'var(--accent)' : 'var(--paper)',
                            borderLeft: `3px solid ${teamColor}`,
                          }}
                        >
                          {row.position}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            {driverSrc ? (
                              <SafeImage
                                src={driverSrc}
                                alt=""
                                width={28}
                                height={28}
                                className="h-7 w-7 object-contain"
                              />
                            ) : null}
                            <span style={{ color: 'var(--paper)' }}>{row.driverName}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                            {teamSrc ? (
                              <SafeImage
                                src={teamSrc}
                                alt=""
                                width={22}
                                height={22}
                                className="h-[22px] w-[22px] object-contain opacity-90"
                              />
                            ) : null}
                            {row.constructorName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: 'var(--paper)' }}>
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>

        {/* ── Constructor Standings (pure-CSS bar chart) ───────────────── */}
        {constructors.length > 0 ? (
          <section>
            <SectionDivider title="Constructor Standings" />
            <ul className="space-y-3">
              {constructors.map((c) => {
                const color = resolveTeamUiColor(null, c.constructorName);
                const pct = maxConstructorPts > 0 ? (Number(c.points) / maxConstructorPts) * 100 : 0;
                const teamSrc = teamIconSrc(c.constructorName);
                return (
                  <li key={c.position + c.constructorName} className="flex items-center gap-4">
                    <span className="w-6 shrink-0 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {c.position}
                    </span>
                    {teamSrc ? (
                      <SafeImage
                        src={teamSrc}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 object-contain"
                      />
                    ) : (
                      <span className="h-8 w-8 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span
                          className="truncate font-condensed text-sm uppercase tracking-widest"
                          style={{ color: 'var(--paper)' }}
                        >
                          {c.constructorName}
                        </span>
                        <span className="shrink-0 font-mono text-xs" style={{ color: 'var(--paper)' }}>
                          {c.points}
                        </span>
                      </div>
                      <div className="h-2.5 w-full" style={{ backgroundColor: 'var(--surface)' }}>
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* ── Last Race Recap ──────────────────────────────────────────── */}
        {recap ? (
          <section>
            <SectionDivider title="Last Race Recap" />
            <div className="anthology-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,24,1,0.7)' }}>
                    Round {recap.round}
                  </p>
                  <p className="mt-1 font-display text-[1.6rem] tracking-[0.04em]" style={{ color: 'var(--paper)' }}>
                    {recap.raceName}
                  </p>
                </div>
                {recapCircuitSrc ? (
                  <SafeImage
                    src={recapCircuitSrc}
                    alt=""
                    width={120}
                    height={80}
                    className="h-16 w-28 object-contain opacity-80"
                  />
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {recap.podium.map((p) => {
                  const color = resolveTeamUiColor(null, p.constructorName);
                  const driverSrc = driverIconSrc(p.driverCode, p.driverName);
                  const teamSrc = teamIconSrc(p.constructorName);
                  return (
                    <div
                      key={p.position}
                      className="flex items-center gap-3 border border-border px-4 py-3"
                      style={{ borderLeft: `3px solid ${color}` }}
                    >
                      <span className="font-display text-2xl" style={{ color: 'var(--accent)' }}>
                        P{p.position}
                      </span>
                      {driverSrc ? (
                        <SafeImage
                          src={driverSrc}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 shrink-0 object-contain"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm" style={{ color: 'var(--paper)' }}>
                          {p.driverName}
                        </p>
                        <p className="inline-flex items-center gap-1.5 truncate font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
                          {teamSrc ? (
                            <SafeImage
                              src={teamSrc}
                              alt=""
                              width={14}
                              height={14}
                              className="h-3.5 w-3.5 shrink-0 object-contain opacity-90"
                            />
                          ) : null}
                          {p.constructorName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
                {pole ? (
                  <span className="inline-flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                    POLE
                    {poleDriverSrc ? (
                      <SafeImage
                        src={poleDriverSrc}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    ) : null}
                    <span style={{ color: 'var(--paper)' }}>
                      {pole.driverName}
                      {pole.time ? ` · ${pole.time}` : ''}
                    </span>
                  </span>
                ) : null}
                {recap.fastestLapDriver ? (
                  <span style={{ color: 'var(--muted)' }}>
                    FASTEST LAP{' '}
                    <span style={{ color: 'var(--paper)' }}>
                      {recap.fastestLapDriver}
                      {recap.fastestLapTime ? ` · ${recap.fastestLapTime}` : ''}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Race Calendar (horizontally scrollable cards) ────────────── */}
        <section>
          <SectionDivider title="Race Calendar" />
          {races.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Calendar not available.
            </p>
          ) : (
            <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2">
              {races.map((race) => {
                const done = isRaceDone(race);
                const circuitSrc = circuitIconSrc(race.Circuit?.circuitId);
                return (
                  <div
                    key={String(race.round ?? race.raceName)}
                    className="anthology-card flex w-[220px] shrink-0 snap-start flex-col justify-between gap-4 p-4"
                  >
                    {circuitSrc ? (
                      <SafeImage
                        src={circuitSrc}
                        alt=""
                        width={180}
                        height={72}
                        className="h-14 w-full object-contain opacity-75"
                      />
                    ) : (
                      <div className="h-14 w-full" style={{ backgroundColor: 'var(--surface)' }} aria-hidden />
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.15em]"
                        style={{ color: 'rgba(255,24,1,0.7)' }}
                      >
                        Round {race.round ?? '—'}
                      </span>
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.15em]"
                        style={{ color: done ? 'var(--muted)' : 'var(--accent)' }}
                      >
                        {done ? 'Done' : 'Upcoming'}
                      </span>
                    </div>
                    <p
                      className="font-display text-[1.3rem] leading-tight tracking-[0.04em]"
                      style={{ color: 'var(--paper)' }}
                    >
                      {race.raceName ?? 'Grand Prix'}
                    </p>
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {race.date ?? '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
