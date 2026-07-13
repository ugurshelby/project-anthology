import Link from 'next/link';
import Image from 'next/image';
import type { CircuitCard } from '@/lib/data/circuits';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';
import { countryFlag } from '@/lib/data/countryFlags';
import { StatusChip } from '@/components/bento/StatusChip';

/**
 * Circuit bento cell. Real track photography (not the line-art map) as a
 * dimmed background, country flag, name + round status. `span` is data-driven
 * (see lib/data/circuits.ts circuitGridSpan) so cards read as an editorial
 * bento layout rather than a uniform tile repeat.
 */
export function CircuitCardView({ card, featured = false, span }: { card: CircuitCard; featured?: boolean; span: string }) {
  const cover = circuitCoverSrc(card.circuitId);
  const flag = countryFlag(card.country);

  return (
    <Link
      id={featured ? 'next-circuit-card' : undefined}
      href={`/circuits/${card.circuitId}`}
      className={[
        span,
        'group relative flex flex-col justify-between gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 transition-[transform,opacity] duration-150 will-change-transform hover:-translate-y-0.5 hover:opacity-95',
        featured ? 'min-h-64' : 'min-h-48',
      ].join(' ')}
    >
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="pointer-events-none object-cover opacity-30 transition-opacity duration-150 group-hover:opacity-40"
        />
      ) : null}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="label-caps flex items-center gap-1.5 text-text-low">
            {flag ? <span aria-hidden>{flag}</span> : null}
            R{card.round} · {card.country}
          </span>
          <h3 className={[featured ? 'headline-lg' : 'headline-md', 'uppercase text-text-hi'].join(' ')}>
            {card.circuitName}
          </h3>
        </div>
        <StatusChip status={card.done ? 'done' : featured ? 'next' : 'upcoming'} />
      </div>
    </Link>
  );
}
