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
    <section className="relative isolate min-h-dvh w-full overflow-hidden bg-background">
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

      {/* Bottom red glow ties the photo to the brand. A vertical linear ramp,
          not radial-gradient(ellipse at bottom, …) — that radial form + the
          `transparent` keyword mis-rasterise into a solid red rectangle on
          mobile Chromium/WebKit (the news-hero "red block"). */}
      <div
        className="absolute bottom-0 left-0 h-[24vh] w-full"
        aria-hidden
        style={{
          background:
            'linear-gradient(to top, rgba(255,24,1,0.3) 0%, rgba(255,24,1,0.08) 35%, rgba(255,24,1,0) 70%)',
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
          className="mt-4 line-clamp-3 max-w-5xl font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-none tracking-[0.04em]"
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
          className="mt-6 inline-flex items-center gap-2 font-condensed text-[11px] uppercase tracking-[0.15em]"
          style={{ color: 'var(--paper)' }}
        >
          Read story →
        </a>
      </div>
    </section>
  );
}
