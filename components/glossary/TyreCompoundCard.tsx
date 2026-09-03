import Image from 'next/image';
import type { TyreCompound } from '@/data/glossary/tyres';

function TelemetryBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clamped = Math.max(0, Math.min(10, value));
  return (
    <div className="flex items-center gap-2">
      <span className="data-tabular w-[4.5rem] shrink-0 text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="flex flex-1 gap-px" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-[1px]"
            style={{
              backgroundColor: i < clamped ? color : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
      <span className="sr-only">
        {label} {clamped} of 10
      </span>
    </div>
  );
}

/**
 * Tyre compound dossier card — telemetry gauges + low-opacity Pirelli silhouette.
 * Compact on mobile (2-col); full blurb on md+.
 */
export function TyreCompoundCard({
  tyre,
  compact,
  onOpen,
}: {
  tyre: TyreCompound;
  compact?: boolean;
  onOpen?: (tyre: TyreCompound) => void;
}) {
  const body = (
    <>
      <Image
        src={`/tyres/${tyre.id}.svg`}
        alt=""
        width={160}
        height={160}
        className="pointer-events-none absolute -right-6 -bottom-8 h-36 w-36 opacity-[0.08] md:h-44 md:w-44"
      />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Image src={`/tyres/${tyre.id}.svg`} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
          <span
            className="font-condensed text-base font-700 uppercase leading-tight text-text-hi md:text-lg"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {tyre.name}
          </span>
        </div>
        <span className="label-caps text-text-low">{tyre.kicker}</span>
        {compact ? null : <p className="body-md line-clamp-2 text-text-mid">{tyre.blurb}</p>}
        <div className="flex flex-col gap-1.5">
          <TelemetryBar label="Grip" value={tyre.grip} color={tyre.color} />
          <TelemetryBar label="Durability" value={tyre.durability} color={tyre.color} />
          <TelemetryBar label="Warm-up" value={tyre.warmup} color={tyre.color} />
        </div>
      </div>
    </>
  );

  const className =
    'relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-3 text-left md:p-5';

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(tyre)} className={`${className} w-full`}>
        {body}
      </button>
    );
  }

  return <article className={className}>{body}</article>;
}
