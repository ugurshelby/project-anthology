import type { OnThisDayEntry } from '@/lib/data/f1';

interface BentoOnThisDayTileProps {
  entries: OnThisDayEntry[];
}

export function BentoOnThisDayTile({ entries }: BentoOnThisDayTileProps) {
  if (entries.length === 0) return null;

  return (
    <section className="col-span-2 lg:col-span-4">
      <div className="bento-panel flex h-full flex-col gap-4 p-6">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.2em] lg:text-[10px]"
          style={{ color: 'var(--muted)' }}
        >
          On This Day
        </p>
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={`${entry.season}-${entry.raceName}`}>
              <p
                className="font-display text-lg leading-tight tracking-[0.04em] lg:text-xl"
                style={{ color: 'var(--paper)' }}
              >
                <span style={{ color: 'var(--muted)' }}>{entry.season}</span>
                {' · '}
                {entry.raceName}
              </p>
              <p
                className="mt-0.5 font-condensed text-xs uppercase tracking-[0.12em]"
                style={{ color: 'var(--muted)' }}
              >
                Won by{' '}
                <span style={{ color: 'var(--paper)' }}>{entry.winnerName}</span>
                {entry.winnerConstructor ? ` · ${entry.winnerConstructor}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
