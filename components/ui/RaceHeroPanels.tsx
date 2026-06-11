import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import type { CalendarRace } from '@/lib/f1Calendar';

export interface RaceHeroPanel {
  race: CalendarRace;
  /** Small kicker above the race name (e.g. "Previous", "Next Race"). */
  role: string;
  /** Center panel renders larger and carries the live countdown. */
  emphasis?: boolean;
  /** Pre-formatted countdown string (center panel only). */
  countdown?: string;
  /** Optional one-line detail under the name (winner for previous, round for after). */
  detail?: string;
}

interface RaceHeroPanelsProps {
  previous: RaceHeroPanel | null;
  next: RaceHeroPanel | null;
  afterNext: RaceHeroPanel | null;
}

/** Resolve a circuit detail href; always links (falls back to the index). */
function circuitHref(race: CalendarRace): string {
  const id = race.Circuit?.circuitId?.trim();
  return id ? `/circuits/${id}` : '/circuits';
}

function Panel({ panel }: { panel: RaceHeroPanel }) {
  const { race, role, emphasis, countdown, detail } = panel;
  const circuitSrc = circuitIconSrc(race.Circuit?.circuitId);
  const country = race.Circuit?.Location?.country;

  return (
    <Link
      href={circuitHref(race)}
      className={`anthology-card group flex flex-col gap-3 p-5 transition-colors hover:border-accent/60 ${
        emphasis ? 'md:p-7' : ''
      }`}
    >
      <span
        className="font-mono text-[9px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--accent)' }}
      >
        {role}
      </span>

      {circuitSrc ? (
        <SafeImage
          src={circuitSrc}
          alt={race.Circuit?.circuitName ?? race.raceName ?? ''}
          width={emphasis ? 280 : 180}
          height={emphasis ? 120 : 80}
          className={`w-full object-contain opacity-80 transition-opacity group-hover:opacity-100 ${
            emphasis ? 'h-20 md:h-28' : 'h-14'
          }`}
        />
      ) : (
        <div
          className={`w-full ${emphasis ? 'h-20 md:h-28' : 'h-14'}`}
          style={{ backgroundColor: 'var(--surface)' }}
          aria-hidden
        />
      )}

      <p
        className={`font-display leading-tight tracking-[0.04em] ${
          emphasis ? 'text-[1.8rem] md:text-[2.4rem]' : 'text-[1.3rem]'
        }`}
        style={{ color: 'var(--paper)' }}
      >
        {race.raceName ?? 'Grand Prix'}
      </p>

      {emphasis && countdown ? (
        <p
          className="font-mono text-sm tracking-wider"
          style={{ color: 'var(--accent)' }}
        >
          {countdown}
        </p>
      ) : null}

      <p
        className="font-condensed text-[10px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--muted)' }}
      >
        {detail ?? country ?? ''}
      </p>
    </Link>
  );
}

/**
 * The homepage hero's race hierarchy: Previous · Next (large, with countdown) ·
 * Race after next. Each panel links to the circuit detail page. Renders only the
 * panels that exist, so it degrades gracefully at season start/end.
 */
export function RaceHeroPanels({ previous, next, afterNext }: RaceHeroPanelsProps) {
  if (!previous && !next && !afterNext) return null;

  return (
    <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
      {previous ? <Panel panel={previous} /> : <span className="hidden md:block" aria-hidden />}
      {next ? <Panel panel={next} /> : <span className="hidden md:block" aria-hidden />}
      {afterNext ? <Panel panel={afterNext} /> : <span className="hidden md:block" aria-hidden />}
    </div>
  );
}
