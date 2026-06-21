import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import { teamIconSrc } from '@/lib/assets/f1-icons';
import { SafeImage } from '@/components/ui/SafeImage';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import type { OnThisDayEntry } from '@/lib/data/f1';

interface BentoOnThisDayPanelProps {
  entries: OnThisDayEntry[];
}

/**
 * On This Day — full-width editorial band that sits between the 6-card bento
 * and the news grid, fenced by a neon divider on each side. Richer than the
 * old narrow tile: a left rail naming today's date, then the historical race
 * winners on this calendar day rendered as a horizontal row of team-coloured
 * cards (a small "archive timeline"). Cards stack on mobile.
 */
export function BentoOnThisDayPanel({ entries }: BentoOnThisDayPanelProps) {
  if (entries.length === 0) return null;

  const today = new Date();
  const dayLabel = today
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    .toUpperCase();

  // Newest first so the eye lands on the most recent edition of this day.
  const sorted = [...entries].sort((a, b) => b.season - a.season).slice(0, 6);

  return (
    <section aria-labelledby="on-this-day-heading">
      <div className="bento-panel p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
          {/* Left rail — heading + today's date */}
          <div className="shrink-0 lg:w-56">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.25em] lg:text-[10px]"
              style={{ color: 'var(--muted)' }}
            >
              From the Archive
            </p>
            <h2
              id="on-this-day-heading"
              className="mt-2 font-display text-3xl leading-[0.9] tracking-[0.04em] lg:text-4xl"
              style={{ color: 'var(--paper)' }}
            >
              On This Day
            </h2>
            <p
              className="mt-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em]"
              style={{ color: 'var(--paper)' }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                aria-hidden
              />
              {dayLabel}
            </p>
            <p
              className="mt-3 max-w-[14rem] text-[13px] font-light leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              Grands Prix decided on this date through the seasons.
            </p>
          </div>

          {/* Right — horizontal timeline of winners (scrolls on narrow widths) */}
          <div className="min-w-0 flex-1">
            <ul className="custom-scrollbar grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((entry) => {
                const color = resolveTeamUiColor(null, entry.winnerConstructor);
                const teamSrc = entry.winnerConstructor
                  ? teamIconSrc(entry.winnerConstructor, CURRENT_SEASON)
                  : null;
                return (
                  <li
                    key={`${entry.season}-${entry.raceName}`}
                    className="flex items-start gap-3 border border-border p-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <span
                      className="shrink-0 font-display text-2xl leading-none tracking-[0.04em] lg:text-3xl"
                      style={{ color }}
                    >
                      {entry.season}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-display text-base leading-tight tracking-[0.04em]"
                        style={{ color: 'var(--paper)' }}
                      >
                        {entry.raceName}
                      </p>
                      <p
                        className="mt-1 inline-flex items-center gap-1.5 truncate font-condensed text-[11px] uppercase tracking-[0.1em]"
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
                        <span className="truncate" style={{ color: 'var(--paper)' }}>
                          {entry.winnerName}
                        </span>
                      </p>
                      {entry.winnerConstructor ? (
                        <p
                          className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: 'var(--muted)' }}
                        >
                          {entry.winnerConstructor}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/anthology"
              className="mt-4 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--muted)' }}
            >
              Explore the anthology →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
