import type { OnThisDayEntry } from '@/lib/data/f1';

/**
 * Historical F1 races that finished on today's calendar day (UTC).
 * Data from `getOnThisDay()` — f1_snapshots results across all seasons.
 */
export function OnThisDayCard({ entries }: { entries: OnThisDayEntry[] }) {
  if (entries.length === 0) return null;

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-caps text-text-mid">On This Day</span>
        <span className="label-caps text-text-low">{dateLabel}</span>
      </div>
      <ul className="flex flex-col">
        {entries.slice(0, 5).map((entry) => (
          <li
            key={`${entry.season}-${entry.raceName}`}
            className="flex flex-col gap-0.5 border-b border-hairline py-2.5 last:border-b-0"
          >
            <span className="label-caps text-accent">{entry.season}</span>
            <span
              className="font-condensed text-sm font-600 uppercase leading-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {entry.raceName}
            </span>
            <span className="data-tabular text-xs text-text-mid">
              {entry.winnerName} · {entry.winnerConstructor}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
