import { SafeImage } from '@/components/ui/SafeImage';
import type { NewsItem } from '@/lib/data/types';

interface NewsFeaturedHeroProps {
  item: NewsItem;
}

/**
 * Cinematic full-viewport featured-story hero: a full-bleed news photo under a
 * dark gradient + atmospheric overlays (film grain + bottom red glow), with the
 * headline pinned to the lower-middle, centered. Mirrors the Stitch "Featured
 * News Hero" design while using our design-system tokens.
 */
export function NewsFeaturedHero({ item }: NewsFeaturedHeroProps) {
  const metaLabel = [item.sourceName, item.dateLabel].filter(Boolean).join(' · ');

  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden bg-background">
      {/* Full-bleed background photo */}
      <SafeImage
        src={item.image}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Readability gradient: transparent → fades into the page background */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 45%, #0a0a0a 100%)',
        }}
      />

      {/* Film grain overlay */}
      <svg
        className="absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="none"
        style={{ opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none' }}
      >
        <filter id="featured-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#featured-grain-filter)" />
      </svg>

      {/* Bottom red glow ties the photo to the brand */}
      <div
        className="absolute bottom-0 left-1/2 h-[20vh] w-4/5 -translate-x-1/2"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(255,24,1,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content pinned lower-middle, centered */}
      <div className="absolute bottom-0 left-0 z-10 flex w-full flex-col items-center px-6 pb-20 text-center md:px-12 md:pb-24">
        {metaLabel ? (
          <p
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
              aria-hidden
            />
            {metaLabel}
          </p>
        ) : null}

        <h1
          className="mt-4 max-w-5xl font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-none tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          {item.title}
        </h1>

        {item.summary ? (
          <p
            className="mt-4 line-clamp-2 max-w-2xl text-sm font-light"
            style={{ color: 'var(--muted)' }}
          >
            {item.summary}
          </p>
        ) : null}

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 inline-flex items-center gap-2 font-condensed text-[11px] uppercase tracking-[0.15em] transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          Read story
          <span className="transition-transform group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </a>
      </div>
    </section>
  );
}
