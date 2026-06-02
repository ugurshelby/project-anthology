'use client';

import { useMemo, useState } from 'react';
import { useReducedMotion } from '@/app/(site)/_components/reduced-motion';

interface DriverRow {
  position: number;
  code: string;
  name: string;
  constructor: string;
  points: number;
  wins: number;
}

interface ConstructorRow {
  position: number;
  name: string;
  points: number;
}

interface RaceDetailRow {
  winner?: string;
  fastestLap?: string;
  podium: string[];
}

interface RaceRow {
  round: number;
  raceName: string;
  circuitName: string;
  date: string;
  completed: boolean;
  detail?: RaceDetailRow;
}

export interface SeasonPreparedData {
  year: number;
  drivers: DriverRow[];
  constructors: ConstructorRow[];
  races: RaceRow[];
}

interface SeasonTrackerClientProps {
  seasons: SeasonPreparedData[];
  initialSeason: number;
}

export function SeasonTrackerClient({
  seasons,
  initialSeason,
}: SeasonTrackerClientProps) {
  const reduced = useReducedMotion();
  const [activeYear, setActiveYear] = useState(initialSeason);
  const [expandedRace, setExpandedRace] = useState<string | null>(null);

  const current = useMemo(
    () => seasons.find((season) => season.year === activeYear) ?? seasons[0],
    [activeYear, seasons],
  );

  if (!current) {
    return <p style={{ color: 'var(--text-muted)' }}>No season data available.</p>;
  }

  return (
    <section className="section">
      <div
        style={{
          position: 'sticky',
          top: '52px',
          zIndex: 20,
          background: 'rgba(10,10,10,0.94)',
          borderBottom: '1px solid var(--border)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 8,
            padding: '12px 0',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'thin',
          }}
        >
          {seasons.map((season) => {
            const active = season.year === activeYear;
            return (
              <button
                key={season.year}
                type="button"
                onClick={() => {
                  setActiveYear(season.year);
                  setExpandedRace(null);
                }}
                style={{
                  scrollSnapAlign: 'start',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: active ? 'rgba(255,24,1,0.14)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-condensed)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: reduced ? 'none' : 'all 180ms ease',
                }}
              >
                {season.year}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
        <section className="card" style={{ borderLeftWidth: 4 }}>
          <div className="card-body">
            <p className="section-divider">Driver Standings</p>
            <div style={{ marginTop: 12 }}>
              {current.drivers.map((driver) => (
                <div
                  key={`${current.year}-${driver.position}-${driver.code}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {driver.position}
                  </span>
                  <div>
                    <p style={{ margin: 0 }}>{driver.name}</p>
                    <p
                      style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12 }}
                    >
                      {driver.constructor}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{driver.points}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card" style={{ borderLeftWidth: 4 }}>
          <div className="card-body">
            <p className="section-divider">Constructor Bars</p>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {current.constructors.map((constructor, index) => {
                const top = Math.max(current.constructors[0]?.points ?? 1, 1);
                const width = Math.max(12, Math.round((constructor.points / top) * 100));
                return (
                  <div key={`${constructor.name}-${index}`} style={{ display: 'grid', gap: 6 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                      }}
                    >
                      <span>{constructor.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{constructor.points}</span>
                    </div>
                    <div style={{ height: 10, border: '1px solid var(--border)' }}>
                      <div
                        style={{
                          width: `${width}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          transition: reduced ? 'none' : 'width 260ms ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <p className="section-divider">Race Rail</p>
        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(240px, 280px)',
            overflowX: 'auto',
            gap: 12,
            scrollSnapType: 'x mandatory',
            paddingBottom: 6,
          }}
        >
          {current.races.map((race) => {
            const key = `${current.year}-${race.round}`;
            const isOpen = expandedRace === key;
            return (
              <article
                key={key}
                className="card"
                style={{
                  scrollSnapAlign: 'start',
                  borderLeftColor: race.completed ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedRace((value) => (value === key ? null : key))}
                  style={{ all: 'unset', cursor: 'pointer', width: '100%', display: 'block' }}
                >
                  <div className="card-body">
                    <p className="card-kicker">
                      Round {race.round} / {race.completed ? 'Completed' : 'Next'}
                    </p>
                    <h3 className="card-title">{race.raceName}</h3>
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      {race.circuitName}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      {race.date}
                    </p>
                    <div className="expand-panel" style={{ maxHeight: isOpen ? 220 : 0 }}>
                      {race.detail ? (
                        <>
                          <p>Winner: {race.detail.winner ?? 'TBA'}</p>
                          <p>Fastest Lap: {race.detail.fastestLap ?? 'TBA'}</p>
                          <p>Podium: {race.detail.podium.join(' / ') || 'TBA'}</p>
                        </>
                      ) : (
                        <p>Race detail will appear after result data is available.</p>
                      )}
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
