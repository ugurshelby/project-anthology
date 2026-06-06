import { SafeImage } from '@/components/ui/SafeImage';
import type { NewsItem } from '@/lib/data/types';

interface NewsFeaturedHeroProps {
  item: NewsItem;
}

export function NewsFeaturedHero({ item }: NewsFeaturedHeroProps) {
  return (
    <section className="relative isolate flex min-h-[60vh] min-h-[60svh] flex-col justify-end overflow-hidden bg-background">
      <SafeImage
        src={item.image}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div className="relative z-10 content-wrap flex flex-col items-center justify-end pb-20 pt-24 text-center md:pb-24">
        <p
          className="font-mono text-[9px] uppercase tracking-wider"
          style={{ color: 'var(--accent)' }}
        >
          {item.sourceName}
        </p>
        <h1
          className="mt-3 max-w-4xl font-display text-[clamp(2rem,6vw,4.5rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          {item.title}
        </h1>
        <p
          className="mt-3 max-w-2xl line-clamp-3 text-sm font-light"
          style={{ color: 'var(--muted)' }}
        >
          {item.summary}
        </p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
          style={{ color: 'var(--accent)' }}
        >
          Read story →
        </a>
      </div>
    </section>
  );
}
