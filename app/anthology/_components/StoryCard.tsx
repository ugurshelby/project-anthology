'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Story } from '@/lib/data/stories';

/**
 * Anthology story card — DESIGN_SYSTEM card spec:
 * full-bleed 16/9 image, gradient overlay, IBM Plex Mono category label,
 * Bebas Neue title over image bottom-left, in-place expand on click
 * (300ms cubic-bezier), border-left 3px→6px on hover, no radius/shadow.
 */
export function StoryCard({ story }: { story: Story }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="anthology-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="block w-full cursor-pointer text-left"
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <SafeImage
            src={story.heroImage}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
          />
          {/* gradient overlay: transparent 30% → rgba(0,0,0,0.85) 100% */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p
              className="font-mono text-[9px] uppercase tracking-wider"
              style={{ color: 'rgba(255,24,1,0.7)' }}
            >
              {story.category} · {story.year}
            </p>
            <h3
              className="mt-1 font-display text-[1.3rem] leading-[0.95] tracking-[0.04em]"
              style={{ color: 'var(--paper)' }}
            >
              {story.title}
            </h3>
          </div>
        </div>
      </button>

      {/* in-place expand */}
      <div
        className="overflow-hidden transition-[max-height] duration-300"
        style={{
          maxHeight: open ? 240 : 0,
          transitionTimingFunction: 'cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        <div className="px-4 pb-4 pt-3">
          <p
            className="line-clamp-4 text-[12px] font-light leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {story.subtitle}
          </p>
          <Link
            href={`/anthology/${story.slug}`}
            className="mt-3 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--accent)' }}
          >
            Read Story →
          </Link>
        </div>
      </div>
    </article>
  );
}
