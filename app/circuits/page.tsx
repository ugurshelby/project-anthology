import type { Metadata } from 'next';
import Link from 'next/link';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import {
  circuitGridSpan,
  getCurrentSeasonCircuitCards,
  isFeaturedCircuitCard,
  nextCircuitIndex,
} from '@/lib/data/circuits';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

// ISR: circuit cards derive from the f1_snapshots calendar, which the cron
// refreshes daily; 15-min revalidate keeps it fresh without full dynamic rendering.
export const revalidate = 900;

const TITLE = 'Circuits';
const DESCRIPTION =
  'Track maps of the Formula 1 calendar — every circuit rendered as a clean vector layout.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 Track Maps`,
    description: DESCRIPTION,
    url: '/circuits',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 Track Maps`, description: DESCRIPTION },
  alternates: { canonical: '/circuits' },
};

export default async function CircuitsPage() {
  const cards = await getCurrentSeasonCircuitCards();

  return (
    <>
      <AtmosphericHero compact>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          Track Maps
        </p>
        <h1
          className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          CIRCUITS
        </h1>
        <p className="mt-2 text-sm text-muted" style={{ color: 'var(--muted)' }}>
          {cards.length} circuits · {CURRENT_SEASON} season
        </p>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title="All Circuits" />
        {cards.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Calendar not available. Run F1 sync or seed.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[minmax(140px,auto)]">
            {(() => {
              const featuredIndex = nextCircuitIndex(cards);
              return cards.map((card, index) => {
              const featured = isFeaturedCircuitCard(index, featuredIndex);
              return (
                <Link
                  key={card.circuitId}
                  href={`/circuits/${card.circuitId}`}
                  className={`anthology-card group flex flex-col justify-between gap-3 p-4 ${circuitGridSpan(index, featuredIndex)}`}
                >
                  {card.svgSrc ? (
                    <SafeImage
                      src={card.svgSrc}
                      alt={card.circuitName}
                      width={featured ? 320 : 160}
                      height={featured ? 200 : 120}
                      className={`w-full object-contain opacity-90 transition-opacity group-hover:opacity-100 ${featured ? 'h-40 md:h-52' : 'h-24'}`}
                    />
                  ) : (
                    <div
                      className={`w-full ${featured ? 'h-40 md:h-52' : 'h-24'}`}
                      style={{ backgroundColor: 'var(--surface)' }}
                      aria-hidden
                    />
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: 'var(--paper)' }}
                      >
                        {featured && !card.done ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.15em]"
                            style={{ border: '1px solid var(--border-hover)', color: 'var(--border-hover)' }}
                          >
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: 'var(--border-hover)' }}
                              aria-hidden
                            />
                            NEXT
                          </span>
                        ) : null}
                        Round {card.round}
                      </span>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: 'var(--paper)' }}
                      >
                        {card.date}
                      </span>
                    </div>
                    <p
                      className={`mt-2 font-display leading-tight tracking-[0.04em] ${featured ? 'text-[1.8rem] md:text-[2.2rem]' : 'text-[1.2rem]'}`}
                      style={{ color: 'var(--paper)' }}
                    >
                      {card.circuitName}
                    </p>
                    <p
                      className="mt-1 font-condensed text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: 'var(--muted)' }}
                    >
                      {card.country}
                    </p>
                  </div>
                </Link>
              );
            });
            })()}
          </div>
        )}
      </div>
    </>
  );
}
