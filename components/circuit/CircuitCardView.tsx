import Link from 'next/link';
import Image from 'next/image';
import type { CircuitCard } from '@/lib/data/circuits';
import { StatusChip } from '@/components/bento/StatusChip';

/**
 * Circuit bento cell. Track artwork (svg/png) + name + round status.
 * `featured` makes it a larger hero cell (the next unraced circuit).
 */
export function CircuitCardView({ card, featured = false }: { card: CircuitCard; featured?: boolean }) {
  const span = featured ? 'col-span-4 md:col-span-8 lg:col-span-8' : 'col-span-4 md:col-span-4 lg:col-span-4';
  return (
    <Link
      href={`/circuits/${card.circuitId}`}
      className={[
        span,
        'group relative flex flex-col justify-between gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-surface-raised',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="label-caps text-text-low">R{card.round} · {card.country}</span>
          <h3 className={[featured ? 'headline-lg' : 'headline-md', 'uppercase text-text-hi'].join(' ')}>
            {card.circuitName}
          </h3>
        </div>
        <StatusChip status={card.done ? 'done' : featured ? 'next' : 'upcoming'} />
      </div>
      {card.svgSrc ? (
        <div className={['relative w-full', featured ? 'h-48' : 'h-28'].join(' ')}>
          <Image src={card.svgSrc} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain opacity-80" />
        </div>
      ) : null}
    </Link>
  );
}
