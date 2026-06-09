'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { CalendarScroller } from '@/components/season/CalendarScroller';
import { TiltCard } from '@/components/ui/TiltCard';
import {
  EntityDrawer,
  type DriverEntityDetail,
  type EntityDetail,
  type TeamEntityDetail,
} from '@/components/ui/EntityDrawer';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import type { SeasonData } from '@/lib/data/f1';
import { circuitIconSrc, driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { CURRENT_SEASON, isRaceDone } from '@/lib/f1Calendar';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { ConstructorStandingRow, DriverStandingRow } from '@/lib/f1/mrdata';

interface SeasonExplorerProps {
  initialData: SeasonData;
  seasons: number[];
}

function buildDriverEntity(row: DriverStandingRow, data: SeasonData): DriverEntityDetail {
  const stats = data.driverStats?.[row.driverName] ?? { wins: 0, podiums: 0 };
  return {
    kind: 'driver',
    seasonYear: data.year,
    driverName: row.driverName,
    driverCode: row.driverCode,
    constructorName: row.constructorName,
    position: row.position,
    points: row.points,
    driverIconSrc: driverIconSrc(row.driverCode, row.driverName, data.year),
    wins: stats.wins,
    podiums: stats.podiums,
  };
}

function buildTeamEntity(c: ConstructorStandingRow, data: SeasonData): TeamEntityDetail {
  const teamColor = resolveTeamUiColor(null, c.constructorName);
  const drivers = data.standings
    .filter((row) => row.constructorName === c.constructorName)
    .map((row) => ({
      driverName: row.driverName,
      driverCode: row.driverCode,
      position: row.position,
      points: row.points,
      driverIconSrc: driverIconSrc(row.driverCode, row.driverName, data.year),
    }));
  return {
    kind: 'team',
    seasonYear: data.year,
    constructorName: c.constructorName,
    position: c.position,
    points: c.points,
    wins: c.wins,
    teamIconSrc: teamIconSrc(c.constructorName, data.year),
    teamColor,
    drivers,
  };
}

function entityActivateKey(e: KeyboardEvent) {
  return e.key === 'Enter' || e.key === ' ';
}

export function SeasonExplorer({ initialData, seasons }: SeasonExplorerProps) {
  const router = useRouter();
  const [data, setData] = useState<SeasonData>(initialData);
  const [year, setYear] = useState(initialData.year);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityDetail | null>(null);

  const openEntity = useCallback((entity: EntityDetail) => {
    setSelectedEntity(entity);
  }, []);

  const closeEntity = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  const selectSeason = useCallback(
    async (nextYear: number) => {
      if (nextYear === year || loading) return;
      setFetchError(null);
      setLoading(true);
      try {
        const res = await fetch(`/api/season/${nextYear}`);
        if (!res.ok) {
          setFetchError('Could not load season data.');
          return;
        }
        const payload = (await res.json()) as SeasonData;
        setData(payload);
        setYear(nextYear);
        router.replace(`/season?year=${nextYear}`, { scroll: false });
      } catch {
        setFetchError('Could not load season data.');
      } finally {
        setLoading(false);
      }
    },
    [router, year, loading],
  );

  const {
    standings,
    constructors,
    races,
    recap,
    pole,
    driverRecords,
    constructorRecords,
    nearestRaceKey,
  } = data;

  const poleDriverSrc = pole ? driverIconSrc(pole.driverCode, pole.driverName, year) : null;

  const lastRace = useMemo(() => {
    const done = races.filter((r) => isRaceDone(r));
    return done.sort((a, b) => Number(b.round ?? 0) - Number(a.round ?? 0))[0] ?? null;
  }, [races]);

  const recapCircuitSrc = lastRace ? circuitIconSrc(lastRace.Circuit?.circuitId) : null;

  const maxConstructorPts = constructors.reduce(
    (m, c) => Math.max(m, Number(c.points) || 0),
    0,
  );

  const hasRecords = driverRecords.length > 0 || constructorRecords.length > 0;

  return (
    <div className="content-wrap space-y-section-gap">
      <EntityDrawer entity={selectedEntity} onClose={closeEntity} />
      {/* Season archive pills */}
      <section>
        <div className="flex flex-wrap gap-2">
          {seasons.map((s) => {
            const active = s === year;
            return (
              <button
                key={s}
                type="button"
                onClick={() => selectSeason(s)}
                disabled={loading}
                className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                style={{
                  color: active ? 'var(--paper)' : 'var(--muted)',
                  backgroundColor: active ? 'rgba(255,24,1,0.12)' : 'transparent',
                  borderColor: active ? 'var(--accent)' : undefined,
                }}
              >
                {s}
                {s === CURRENT_SEASON ? (
                  <span className="ml-1.5" style={{ color: 'var(--accent)' }}>
                    ●
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {loading ? (
          <p className="mt-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>
            Loading {year} season…
          </p>
        ) : null}
        {fetchError ? (
          <p className="mt-3 font-mono text-xs" style={{ color: 'var(--accent)' }}>
            {fetchError}
          </p>
        ) : null}
      </section>

      {/* Driver Standings */}
      <section>
        <SectionDivider title="Driver Standings" />
        {standings.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No standings in database yet.
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {standings.map((row, i) => {
                const teamColor = resolveTeamUiColor(null, row.constructorName);
                const isLeader = i === 0;
                const driverSrc = driverIconSrc(row.driverCode, row.driverName, year);
                const teamSrc = teamIconSrc(row.constructorName, year);
                return (
                  <li
                    key={row.position + row.driverName}
                    role="button"
                    tabIndex={0}
                    className="flex cursor-pointer items-center gap-3 border border-border px-3 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                    style={{
                      borderLeft: `3px solid ${teamColor}`,
                      backgroundColor: isLeader ? 'rgba(255,24,1,0.06)' : undefined,
                    }}
                    onClick={(e) => {
                      e.currentTarget.focus();
                      openEntity(buildDriverEntity(row, data));
                    }}
                    onKeyDown={(e) => {
                      if (entityActivateKey(e)) {
                        e.preventDefault();
                        openEntity(buildDriverEntity(row, data));
                      }
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
                    const driverSrc = driverIconSrc(row.driverCode, row.driverName, year);
                    const teamSrc = teamIconSrc(row.constructorName, year);
                    return (
                      <tr
                        key={row.position + row.driverName}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                        style={isLeader ? { backgroundColor: 'rgba(255,24,1,0.06)' } : undefined}
                        onClick={(e) => {
                          e.currentTarget.focus();
                          openEntity(buildDriverEntity(row, data));
                        }}
                        onKeyDown={(e) => {
                          if (entityActivateKey(e)) {
                            e.preventDefault();
                            openEntity(buildDriverEntity(row, data));
                          }
                        }}
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
                          <span
                            className="inline-flex items-center gap-2"
                            style={{ color: 'var(--muted)' }}
                          >
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

      {/* Constructor Standings */}
      {constructors.length > 0 ? (
        <section>
          <SectionDivider title="Constructor Standings" />
          <ul className="space-y-3">
            {constructors.map((c) => {
              const color = resolveTeamUiColor(null, c.constructorName);
              const pct = maxConstructorPts > 0 ? (Number(c.points) / maxConstructorPts) * 100 : 0;
              const teamSrc = teamIconSrc(c.constructorName, year);
              return (
                <li
                  key={c.position + c.constructorName}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-center gap-4 transition-opacity hover:opacity-90"
                  onClick={(e) => {
                    e.currentTarget.focus();
                    openEntity(buildTeamEntity(c, data));
                  }}
                  onKeyDown={(e) => {
                    if (entityActivateKey(e)) {
                      e.preventDefault();
                      openEntity(buildTeamEntity(c, data));
                    }
                  }}
                >
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
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Last Race Recap */}
      {recap ? (
        <section>
          <SectionDivider title="Last Race Recap" />
          <div className="anthology-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: 'rgba(255,24,1,0.7)' }}
                >
                  Round {recap.round}
                </p>
                <p
                  className="mt-1 font-display text-[1.6rem] tracking-[0.04em]"
                  style={{ color: 'var(--paper)' }}
                >
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
                const driverSrc = driverIconSrc(p.driverCode, p.driverName, year);
                const teamSrc = teamIconSrc(p.constructorName, year);
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
                      <p
                        className="inline-flex items-center gap-1.5 truncate font-mono text-[10px] uppercase tracking-[0.15em]"
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

      {/* Season Records */}
      {hasRecords ? (
        <section>
          <SectionDivider title="Season Records" />
          <div className="grid gap-6 md:grid-cols-2">
            {driverRecords.length > 0 ? (
              <div>
                <h3
                  className="mb-3 font-condensed text-xs uppercase tracking-[0.2em]"
                  style={{ color: 'var(--muted)' }}
                >
                  Driver Records
                </h3>
                <ul className="space-y-3">
                  {driverRecords.map((record) => {
                    const teamColor = resolveTeamUiColor(null, record.teamName ?? '');
                    return (
                      <li
                        key={record.label}
                        className="anthology-card border-l-[3px] px-4 py-3"
                        style={{ borderLeftColor: teamColor }}
                      >
                        <p
                          className="font-mono text-[10px] uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(255,24,1,0.7)' }}
                        >
                          {record.label}
                        </p>
                        <p
                          className="mt-1 font-display text-xl tracking-[0.04em]"
                          style={{ color: 'var(--paper)' }}
                        >
                          {record.holderName}
                        </p>
                        <p className="mt-0.5 font-mono text-sm" style={{ color: 'var(--accent)' }}>
                          {record.value}
                          {record.teamName ? (
                            <span className="ml-2 text-xs" style={{ color: 'var(--muted)' }}>
                              {record.teamName}
                            </span>
                          ) : null}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {constructorRecords.length > 0 ? (
              <div>
                <h3
                  className="mb-3 font-condensed text-xs uppercase tracking-[0.2em]"
                  style={{ color: 'var(--muted)' }}
                >
                  Constructor Records
                </h3>
                <ul className="space-y-3">
                  {constructorRecords.map((record) => {
                    const teamColor = resolveTeamUiColor(null, record.holderName);
                    return (
                      <li
                        key={record.label}
                        className="anthology-card border-l-[3px] px-4 py-3"
                        style={{ borderLeftColor: teamColor }}
                      >
                        <p
                          className="font-mono text-[10px] uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(255,24,1,0.7)' }}
                        >
                          {record.label}
                        </p>
                        <p
                          className="mt-1 font-display text-xl tracking-[0.04em]"
                          style={{ color: 'var(--paper)' }}
                        >
                          {record.holderName}
                        </p>
                        <p className="mt-0.5 font-mono text-sm" style={{ color: 'var(--accent)' }}>
                          {record.value}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Race Calendar */}
      <section>
        <SectionDivider title="Race Calendar" />
        {races.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Calendar not available.
          </p>
        ) : (
          <CalendarScroller
            scrollKey={`${year}-${nearestRaceKey ?? ''}`}
            className="race-calendar-scroll -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2"
          >
            {races.map((race) => {
              const done = isRaceDone(race);
              const circuitId = race.Circuit?.circuitId?.trim();
              const circuitSrc = circuitIconSrc(race.Circuit?.circuitId);
              const cardInner = (
                <>
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
                </>
              );

              const cardClass =
                'anthology-card flex w-full flex-col justify-between gap-4 p-4 transition-opacity hover:opacity-80';
              const key = String(race.round ?? race.raceName);
              const isNearest = key === nearestRaceKey;

              return (
                <TiltCard
                  key={key}
                  href={circuitId ? `/circuits/${circuitId}` : undefined}
                  data-nearest={isNearest ? 'true' : undefined}
                  className={cardClass}
                >
                  {cardInner}
                </TiltCard>
              );
            })}
          </CalendarScroller>
        )}
      </section>
    </div>
  );
}
