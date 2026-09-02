import Link from 'next/link';
import Image from 'next/image';
import type { CircuitCard } from '@/lib/data/circuits';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';
import { countryFlag } from '@/lib/data/countryFlags';
import { StatusChip } from '@/components/bento/StatusChip';

function formatRaceDate(date: string): string {
  if (!date || date === '—') return '—';
  const t = Date.parse(`${date}T12:00:00Z`);
  if (!Number.isFinite(t)) return date;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(t);
}

/**
 * Uniform circuit grid card — cover photo with bottom gradient legibility,
 * floating track outline, and compact typography. Hover lifts saturation and
 * scale so photos read alive without flattening the whole tile.
 */
export function CircuitCardView({
  card,
  status,
}: {
  card: CircuitCard;
  status: 'done' | 'upcoming';
}) {
  const cover = circuitCoverSrc(card.circuitId);
  const flag = countryFlag(card.country);

  return (
    <Link
      href={`/circuits/${card.circuitId}`}
      className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/50 backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
    >
      {cover ? (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-[transform,filter] duration-300 saturate-75 brightness-90 group-hover:scale-105 group-hover:saturate-110 group-hover:brightness-105"
          />
        </div>
      ) : null}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.2)_60%,transparent_100%)]"
      />

      {card.svgSrc ? (
        <div className="pointer-events-none absolute right-3 top-3 z-10 h-12 w-12 opacity-35 transition-opacity duration-300 group-hover:opacity-60 md:h-14 md:w-14">
          <Image
            src={card.svgSrc}
            alt=""
            fill
            sizes="56px"
            className="object-contain brightness-0 invert"
          />
        </div>
      ) : null}

      <div className="relative z-10 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <span className="label-caps flex items-center gap-1.5 text-text-mid">
            {flag ? <span aria-hidden>{flag}</span> : null}
            R{card.round}
            <span aria-hidden className="text-text-low">·</span>
            {card.country}
            <span aria-hidden className="text-text-low">·</span>
            {formatRaceDate(card.date)}
          </span>
          <h3
            className="mt-1 font-condensed text-lg font-600 leading-[1.05] tracking-tight text-text-hi uppercase md:text-xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {card.circuitName}
          </h3>
        </div>
        <StatusChip status={status} />
      </div>
    </Link>
  );
}
