'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';
import type { GlossaryTerm } from '@/data/glossary/terms';

/**
 * Glossary term card (B6) — collapsed to the term name, expands the definition
 * in place on click (300ms cubic-bezier). Keeps the `id={slug}` anchor that
 * <GlossaryLink> jumps to, and auto-opens when the page is loaded with a matching
 * #hash so a linked term lands already expanded. Reduced-motion users get an
 * instant open/close (no height transition).
 */
export function GlossaryCard({ term }: { term: GlossaryTerm }) {
  const [open, setOpen] = useState(false);
  // Shared hook (useSyncExternalStore): SSR-safe and tracks live preference changes.
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Auto-expand if this card is the hash target (arriving from a glossary link).
    // Deferred to the next frame so it doesn't fire synchronously within the effect.
    if (window.location.hash !== `#${term.slug}`) return;
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, [term.slug]);

  return (
    <div id={term.slug} className="anthology-card scroll-mt-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${term.slug}-def`}
        className="flex w-full cursor-pointer items-start justify-between gap-4 p-5 text-left"
      >
        <span className="min-w-0">
          <span
            className="block font-display text-[1.4rem] leading-none tracking-[0.04em]"
            style={{ color: 'var(--paper)' }}
          >
            {term.term}
          </span>
          {term.aliases?.length ? (
            <span
              className="mt-1 block font-mono text-[9px] uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              {term.aliases.join(' · ')}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className="mt-1 shrink-0 font-display text-xl leading-none"
          style={{
            color: open ? 'var(--paper)' : 'var(--muted)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: reduceMotion
              ? 'none'
              : 'transform 300ms cubic-bezier(0.77,0,0.18,1)',
          }}
        >
          +
        </span>
      </button>

      <div
        id={`${term.slug}-def`}
        className="overflow-hidden"
        style={{
          // Generous cap that fits the longest definition; the text itself is
          // short so the eased height transition still reads cleanly.
          maxHeight: open ? 360 : 0,
          transition: reduceMotion ? 'none' : 'max-height 300ms cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        <p
          className="px-5 pb-5 text-[13px] font-light leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          {term.definition}
        </p>
      </div>
    </div>
  );
}
