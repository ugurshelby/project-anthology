import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { TyreCompound } from '@/data/glossary/tyres';
import { TyreCadDiagram } from '@/components/glossary/TermDiagram';

function TelemetryGauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const t = useTranslations('ui.glossary');
  const percentage = Math.max(8, Math.min(100, (value / 10) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[11px] uppercase tracking-wider text-text-low">
          {label}
        </span>
        <span className="font-semibold text-text-hi tabular-nums text-[11px]">
          {value} <span className="font-normal text-text-low">/ 10</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] p-[0.5px]">
        <span
          className="block h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})`,
            boxShadow: `0 0 6px color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        />
      </div>
      <span className="sr-only">
        {t('gauge', { label, value })}
      </span>
    </div>
  );
}

/**
 * Apple Design Tyre Compound Dossier Card.
 * Precision telemetry gauges, compound-specific ambient glow, and responsive hierarchy.
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
  const t = useTranslations('ui.glossary');
  const treadType: 'slick' | 'intermediate' | 'wet' =
    tyre.id === 'intermediate'
      ? 'intermediate'
      : tyre.id === 'wet'
      ? 'wet'
      : 'slick';

  const body = (
    <>
      {/* Top specular edge highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* Ambient compound glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: tyre.color }}
      />

      {/* Watermark CAD tread blueprint in background */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 select-none opacity-[0.08] transition-opacity duration-300 group-hover:opacity-15">
        <TyreCadDiagram
          type={treadType}
          className="h-32 w-32"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Header: Tyre Icon & Compound Name */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-sm">
              <Image
                src={`/tyres/${tyre.id}.svg`}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="h-6 w-6 object-contain"
              />
            </div>
            <h3
              className="font-condensed text-base font-700 uppercase leading-none tracking-tight text-text-hi sm:text-lg"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {tyre.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{ color: tyre.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: tyre.color }}
              />
              {tyre.kicker}
            </span>

            {/* CAD Tread Blueprint Badge */}
            <div
              className="hidden h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border border-white/10 bg-white/[0.03] p-0.5 shadow-inner sm:flex"
              title={t('cadTyre', { name: treadType })}
            >
              <TyreCadDiagram type={treadType} className="h-full w-full" />
            </div>
          </div>
        </div>


        {/* Compound Blurb */}
        {!compact ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-text-mid/90 sm:text-sm">
            {tyre.blurb}
          </p>
        ) : null}

        {/* Telemetry Performance Gauges */}
        <div className="flex flex-col gap-2 pt-1">
          <TelemetryGauge label={t('grip')} value={tyre.grip} color={tyre.color} />
          <TelemetryGauge label={t('durability')} value={tyre.durability} color={tyre.color} />
          <TelemetryGauge label={t('warmup')} value={tyre.warmup} color={tyre.color} />
        </div>
      </div>
    </>
  );

  const containerClasses = [
    'group relative overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.02]',
    'p-4 sm:p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md',
    'transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/[0.04]',
    onOpen ? 'cursor-pointer active:scale-[0.98]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(tyre)} className={`${containerClasses} w-full`}>
        {body}
      </button>
    );
  }

  return <article className={containerClasses}>{body}</article>;
}
