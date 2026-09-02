import Image from 'next/image';
import Link from 'next/link';
import { Countdown } from '@/components/home/Countdown';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';
import { countryFlag } from '@/lib/data/countryFlags';
import { getCircuitFacts } from '@/data/circuits/facts';
import { CURRENT_SEASON, raceStartMs, type CalendarRace } from '@/lib/f1Calendar';
import type { CircuitCard } from '@/lib/data/circuits';

function formatRaceDate(date: string): string {
  if (!date || date === '—') return '—';
  const t = Date.parse(`${date}T12:00:00Z`);
  if (!Number.isFinite(t)) return date;
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(t);
}

/**
 * Full-width "Next Grand Prix" split hero — typography + countdown left,
 * atmospheric cover + floating track map right. Pulls the upcoming race out of
 * the card grid so the list below can stay a uniform 3-column scan.
 */
export function NextCircuitHero({
  card,
  race,
  totalRounds,
}: {
  card: CircuitCard;
  race: CalendarRace;
  totalRounds: number;
}) {
  const cover = circuitCoverSrc(card.circuitId);
  const flag = countryFlag(card.country);
  const facts = getCircuitFacts(card.circuitId);
  const targetMs = raceStartMs(race);
  const raceName = race.raceName ?? 'Grand Prix';
  const round = card.round;

  const stats = [
    facts?.lengthKm != null ? { label: 'Length', value: `${facts.lengthKm} km` } : null,
    facts?.corners != null ? { label: 'Corners', value: String(facts.corners) } : null,
    facts?.drsZones != null ? { label: 'DRS', value: `${facts.drsZones} zones` } : null,
    facts?.lapRecord ? { label: 'Lap record', value: facts.lapRecord } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  return (
    <section className="relative -mx-5 mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/40 backdrop-blur-sm md:-mx-8 lg:-mx-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,46%)]">
        <div className="flex flex-col gap-5 p-6 md:gap-6 md:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-caps text-text-mid">
              Round {round} / {totalRounds}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="label-caps text-accent">Upcoming</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="data-tabular flex items-center gap-1.5 text-text-mid">
              {flag ? <span aria-hidden>{flag}</span> : null}
              {card.country}
              <span aria-hidden className="text-text-low">·</span>
              {formatRaceDate(card.date)}
            </p>
            <p className="label-caps text-accent">{raceName}</p>
            <h2 className="headline-lg uppercase text-text-hi">{card.circuitName}</h2>
          </div>

          {targetMs ? (
            <div className="flex flex-col gap-2">
              <span className="label-caps text-text-low">Race start</span>
              <Countdown targetMs={targetMs} />
            </div>
          ) : null}

          {stats.length > 0 ? (
            <dl className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <dt className="label-caps text-text-low">{s.label}</dt>
                  <dd className="data-tabular text-sm text-text-hi">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={`/circuits/${card.circuitId}`}
              className="label-caps inline-flex items-center rounded-[var(--radius)] border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-text-hi transition-colors hover:border-accent/40 hover:bg-accent/10"
            >
              Circuit Guide
            </Link>
            {round !== '—' ? (
              <Link
                href={`/season/${CURRENT_SEASON}/round/${round}`}
                className="label-caps inline-flex items-center rounded-[var(--radius)] border border-hairline px-4 py-2 text-text-mid transition-colors hover:border-white/20 hover:text-text-hi"
              >
                Weekend Schedule
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[220px] border-t border-white/[0.06] lg:min-h-[360px] lg:border-t-0 lg:border-l">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover saturate-90 brightness-95"
              priority
            />
          ) : null}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 lg:bg-gradient-to-l lg:from-black/80 lg:via-black/30 lg:to-transparent"
          />

          {card.svgSrc ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 md:p-8">
              <div className="relative h-full w-full max-h-52 max-w-md drop-shadow-[0_0_24px_rgba(255,255,255,0.15)] md:max-h-64">
                <Image
                  src={card.svgSrc}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 80vw, 400px"
                  className="object-contain opacity-90 brightness-0 invert"
                />
              </div>
            </div>
          ) : null}

          {facts?.signatureCorner ? (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2">
              <span className="label-caps rounded-[var(--radius-pill)] border border-white/10 bg-black/40 px-2.5 py-1 text-text-mid backdrop-blur-sm">
                {facts.signatureCorner}
              </span>
              {facts.character ? (
                <span className="label-caps rounded-[var(--radius-pill)] border border-white/10 bg-black/40 px-2.5 py-1 text-text-low backdrop-blur-sm">
                  {facts.character}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
