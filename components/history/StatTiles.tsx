import type { ReactNode } from 'react';

export interface StatItem {
  label: string;
  value: number | string | null | undefined;
  /** Small second line under the value (e.g. the title years). */
  sub?: ReactNode;
}

function format(value: number | string): string {
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(1);
  return value;
}

/**
 * Grid of big numbers. Items without a value are left out entirely, so a
 * season the archive has less data for simply shows fewer tiles.
 */
export function StatTiles({ items, className = '' }: { items: StatItem[]; className?: string }) {
  const shown = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== '' && !(typeof i.value === 'number' && Number.isNaN(i.value)));
  if (shown.length === 0) return null;
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 ${className}`.trim()}>
      {shown.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="label-caps text-text-mid">{item.label}</dt>
          <dd className="mt-1">
            <span className="hero-number block text-[clamp(32px,4.2vw,52px)] text-text-hi">{format(item.value as number | string)}</span>
            {item.sub ? <span className="body-sm mt-1 block text-text-mid">{item.sub}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
