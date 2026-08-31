'use client';

import { useState } from 'react';
import type { GlossaryTerm } from '@/data/glossary/terms';

/**
 * Mobile: collapsed accordion cards (one term open at a time per category).
 * Desktop (md+): falls back to the plain definition-list layout via CSS,
 * so this component renders both and toggles visibility with Tailwind.
 */
export function GlossaryAccordion({ terms }: { terms: GlossaryTerm[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <>
      {/* Mobile — accordion cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {terms.map((t) => {
          const isOpen = openSlug === t.slug;
          return (
            <div
              key={t.term}
              id={`${t.slug}-mobile`}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface md:hidden"
            >
              <button
                type="button"
                onClick={() => setOpenSlug(isOpen ? null : t.slug)}
                aria-expanded={isOpen}
                aria-controls={`${t.slug}-panel`}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <span
                  className="font-condensed text-lg font-600 uppercase text-text-hi"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {t.term}
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-text-mid transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              <div
                id={`${t.slug}-panel`}
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="body-md px-4 pb-4 text-text-mid">{t.definition}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop — plain definition list */}
      <dl className="hidden md:flex md:flex-col">
        {terms.map((t) => (
          <div key={t.term} id={t.slug} className="border-b border-hairline py-4 last:border-b-0">
            <dt
              className="font-condensed text-xl font-600 uppercase text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {t.term}
            </dt>
            <dd className="body-md mt-1 max-w-[68ch] text-text-mid">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
