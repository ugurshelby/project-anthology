import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { CircuitLapLine } from '@/components/ui/CircuitLapLine';
import { RaceCountdown } from '@/components/ui/RaceCountdown';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getCircuitDetail, getCircuitIdsForSitemap, getCircuitWeather } from '@/lib/data/circuits';
import { getCircuitFacts } from '@/data/circuits/facts';
import { fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { findRaceByCircuitId, getRaceWinner, getRacesFromCalendar } from '@/lib/f1/mrdata';
import { CURRENT_SEASON, isRaceDone, raceStartMs } from '@/lib/f1Calendar';
import { resolveTeamUiColor } from '@/config/team-colors';
import { fetchRoundSnapshot } from '@/lib/data/f1';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = await getCircuitIdsForSitemap();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const circuit = await getCircuitDetail(id);
  if (!circuit) {
    return { title: 'Circuit not found' };
  }
  const description = `${circuit.circuitName} — ${circuit.country}. Round ${circuit.round} of the Formula 1 calendar.`;
  return {
    title: circuit.circuitName,
    description,
    alternates: { canonical: `/circuits/${id}` },
    openGraph: {
      title: `${circuit.circuitName} — F1 Circuit`,
      description,
      url: `/circuits/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${circuit.circuitName} — F1 Circuit`,
      description,
    },
  };
}

export default async function CircuitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const circuit = await getCircuitDetail(id);
  if (!circuit) notFound();

  const facts = getCircuitFacts(id);

  const calendarData = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');
  const races = getRacesFromCalendar(calendarData);
  const circuitRace = findRaceByCircuitId(races, id);
  const upcomingRace =
    circuitRace && !isRaceDone(circuitRace) ? circuitRace : null;
  const upcomingRaceStartMs =
    upcomingRace != null ? raceStartMs(upcomingRace) : null;

  // Last race winner's team colour for the lap dot
  let lapDotColor = 'var(--accent)';
  if (circuitRace && isRaceDone(circuitRace) && circuitRace.round) {
    const roundNum = Number(circuitRace.round);
    if (Number.isFinite(roundNum) && roundNum > 0) {
      const resultsData = await fetchRoundSnapshot(CURRENT_SEASON, roundNum, 'results');
      const winner = getRaceWinner(resultsData);
      if (winner?.constructorName) {
        lapDotColor = resolveTeamUiColor(null, winner.constructorName);
      }
    }
  }

  // Live local weather (Open-Meteo, server-side). Null → panel hidden.
  const weather = await getCircuitWeather(facts?.lat, facts?.lon);

  // Prefer seeded editorial data, fall back to the curated facts module.
  const lengthKm = circuit.editorial.lapLengthKm ?? facts?.lengthKm?.toString() ?? null;
  const drsZones = circuit.editorial.drsZones ?? facts?.drsZones?.toString() ?? null;

  const stats = [
    lengthKm ? { label: 'Length', value: `${lengthKm} km` } : null,
    circuit.laps ? { label: 'Race Laps', value: circuit.laps } : null,
    facts?.corners ? { label: 'Corners', value: String(facts.corners) } : null,
    drsZones ? { label: 'DRS Zones', value: String(drsZones) } : null,
    facts?.firstGp ? { label: 'First GP', value: String(facts.firstGp) } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  const characteristics = facts
    ? [
        facts.character ? { label: 'Character', value: facts.character } : null,
        facts.signatureCorner ? { label: 'Signature Corner', value: facts.signatureCorner } : null,
        facts.lapRecord ? { label: 'Lap Record', value: facts.lapRecord } : null,
      ].filter((s): s is { label: string; value: string } => s !== null)
    : [];

  return (
    <div className="content-wrap py-section-gap">
      <BackButton fallbackHref="/circuits" label="All Circuits" />

      <header className="mt-6">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.15em]"
          style={{ color: 'var(--muted)' }}
        >
          Round {circuit.round} · {circuit.date}
        </p>
        <h1
          className="mt-2 font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.9] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          {circuit.circuitName}
        </h1>
        <p
          className="mt-2 font-condensed text-sm uppercase tracking-[0.14em]"
          style={{ color: 'var(--muted)' }}
        >
          {circuit.locality !== '—' ? `${circuit.locality}, ` : ''}
          {circuit.country}
        </p>
      </header>

      <div className="anthology-card mt-8 flex items-center justify-center p-8">
        {circuit.svgSrc ? (
          <CircuitLapLine svgSrc={circuit.svgSrc} alt={circuit.circuitName} dotColor={lapDotColor} />
        ) : (
          <div className="h-64 w-full max-w-2xl" style={{ backgroundColor: 'var(--surface)' }} aria-hidden />
        )}
      </div>

      {stats.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--muted)' }}
              >
                {stat.label}
              </p>
              <p
                className="mt-1 font-display text-xl tracking-[0.04em]"
                style={{ color: 'var(--paper)' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {weather ? (
        <div className="anthology-card mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
          <div>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.15em]"
              style={{ color: 'var(--muted)' }}
            >
              Trackside Now · {weather.isDay ? 'Day' : 'Night'}
            </p>
            <p
              className="mt-1 font-display text-2xl tracking-[0.04em]"
              style={{ color: 'var(--paper)' }}
            >
              {weather.temperatureC}°C · {weather.summary}
            </p>
          </div>
          {weather.apparentC !== null ? (
            <div>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--muted)' }}
              >
                Feels Like
              </p>
              <p
                className="mt-1 font-display text-xl tracking-[0.04em]"
                style={{ color: 'var(--paper)' }}
              >
                {weather.apparentC}°C
              </p>
            </div>
          ) : null}
          {weather.windKmh !== null ? (
            <div>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--muted)' }}
              >
                Wind
              </p>
              <p
                className="mt-1 font-display text-xl tracking-[0.04em]"
                style={{ color: 'var(--paper)' }}
              >
                {weather.windKmh} km/h
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {facts?.note ? (
        <p
          className="mt-8 max-w-2xl text-[15px] font-light leading-relaxed"
          style={{ color: 'var(--paper)' }}
        >
          {facts.note}
        </p>
      ) : null}

      {characteristics.length > 0 ? (
        <section className="mt-section-gap">
          <SectionDivider title="Characteristics" />
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {characteristics.map((c) => (
              <div key={c.label} className="anthology-card p-5">
                <dt
                  className="font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{ color: 'var(--muted)' }}
                >
                  {c.label}
                </dt>
                <dd
                  className="mt-2 font-display text-[1.4rem] leading-tight tracking-[0.03em]"
                  style={{ color: 'var(--paper)' }}
                >
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {upcomingRace != null && upcomingRaceStartMs != null ? (
        <section className="mt-section-gap" aria-label="Countdown to race">
          <RaceCountdown
            targetDate={new Date(upcomingRaceStartMs)}
            raceName={upcomingRace.raceName ?? circuit.raceName}
            variant="circuit"
          />
        </section>
      ) : null}

      <section className="mt-section-gap">
        <SectionDivider title="Past Winners" />
        {circuit.winners.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No historical results in database yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {circuit.winners.map((entry) => (
              <li
                key={entry.season}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <div>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.15em]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {entry.season}
                  </span>
                  <p
                    className="mt-1 font-display text-lg tracking-[0.04em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    {entry.driverName}
                  </p>
                  <p className="text-xs font-light" style={{ color: 'var(--muted)' }}>
                    {entry.raceName} · {entry.constructorName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
