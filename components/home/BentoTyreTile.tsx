import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';

/** Typical weekend dry allocation (hard / medium / soft of the nominated trio). */
const WEEKEND_ALLOCATION = [
  { id: 'c5', sets: 2 },
  { id: 'c4', sets: 3 },
  { id: 'c3', sets: 1 },
] as const;

const compoundById = Object.fromEntries(TYRE_COMPOUNDS.map((t) => [t.id, t])) as Record<
  string,
  (typeof TYRE_COMPOUNDS)[number]
>;

function compoundLabel(name: string): string {
  return name.split('—')[0]?.trim() ?? name;
}

function compoundRole(name: string): string {
  return name.split('—')[1]?.trim() ?? name;
}

function SetBlocks({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="h-3 w-1.5 lg:h-4 lg:w-2"
          style={{ backgroundColor: color, opacity: 0.85 - i * 0.08 }}
        />
      ))}
    </div>
  );
}

export function BentoTyreTile() {
  const rows = WEEKEND_ALLOCATION.map((slot) => ({
    ...slot,
    compound: compoundById[slot.id],
  })).filter((row) => row.compound != null);

  const totalSets = rows.reduce((sum, row) => sum + row.sets, 0);

  return (
    <div className="bento-panel bento-panel-accent bento-tile-fill p-3 lg:p-5">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-2 lg:mb-4">
        <div>
          <span
            className="block font-condensed text-[9px] uppercase tracking-[0.2em] lg:text-[11px]"
            style={{ color: 'var(--muted)' }}
          >
            Tyre Allocation
          </span>
          <p
            className="mt-1 font-mono text-[8px] uppercase tracking-[0.15em] lg:text-[9px]"
            style={{ color: 'var(--accent)' }}
          >
            Weekend · Dry slicks
          </p>
        </div>
        <span
          className="font-mono text-[9px] uppercase tracking-wider lg:text-[10px]"
          style={{ color: 'var(--muted)' }}
        >
          {totalSets} sets
        </span>
      </div>

      {/* Mobile / tablet: stacked compound rows */}
      <div className="flex flex-1 flex-col gap-2 lg:hidden">
        {rows.map(({ id, sets, compound }) => (
          <div
            key={id}
            className="flex items-center gap-3 border-l-2 py-1 pl-2"
            style={{ borderColor: compound.color }}
          >
            <SafeImage
              src={`/tyres/${id}.svg`}
              alt={compound.name}
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-display text-sm tracking-[0.04em]"
                  style={{ color: 'var(--paper)' }}
                >
                  {compoundLabel(compound.name)}
                </span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                  {sets} {sets === 1 ? 'set' : 'sets'}
                </span>
              </div>
              <SetBlocks count={sets} color={compound.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: three-column tyre garage */}
      <div className="hidden flex-1 grid-cols-3 gap-2 lg:grid">
        {rows.map(({ id, sets, compound }) => (
          <div
            key={id}
            className="flex flex-col items-center justify-between border px-2 py-3"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <SafeImage
              src={`/tyres/${id}.svg`}
              alt={compound.name}
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <div className="mt-2 w-full text-center">
              <p
                className="font-display text-sm leading-none tracking-[0.04em]"
                style={{ color: 'var(--paper)' }}
              >
                {id.toUpperCase()}
              </p>
              <p
                className="mt-1 font-mono text-[9px] uppercase"
                style={{ color: compound.color }}
              >
                {compoundRole(compound.name)}
              </p>
            </div>
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <SetBlocks count={sets} color={compound.color} />
              <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                ×{sets}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/tech-glossary"
        className="mt-3 border-t pt-2 font-condensed text-[9px] uppercase tracking-[0.12em] lg:mt-4 lg:text-[10px]"
        style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
      >
        Compound guide →
      </Link>
    </div>
  );
}
