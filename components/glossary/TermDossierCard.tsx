'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { GlossaryTerm } from '@/data/glossary/terms';
import { CATEGORY_SLUG_MAP } from '@/components/glossary/TermDiagram';
import { displayUpper } from '@/lib/i18n/caps';

/**
 * Glossary concept card (owner rules, apex-component-rules.md §6): the term's own
 * diagram is the hero of the card, large enough to learn from, and opens full
 * size in a dialog. The diagrams are dark-ground line drawings, so they are
 * screen-blended onto the card and the black ground disappears.
 */
export function TermDossierCard({ term }: { term: GlossaryTerm }) {
  const t = useTranslations('ui.glossary');
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const src = term.diagram
    ? `/glossary-icons/diagrams/${term.diagram}.webp`
    : `/glossary-icons/categories/${CATEGORY_SLUG_MAP[term.category] ?? 'aerodynamics'}.webp`;
  const close = () => dialogRef.current?.close();

  return (
    <article
      id={term.slug}
      className="group relative flex scroll-mt-32 flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-colors duration-300 hover:border-white/[0.16]"
    >
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t('enlarge', { name: term.term })}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60"
      >
        <span aria-hidden className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 30vw"
          unoptimized
          className="object-contain p-2 mix-blend-screen [filter:contrast(1.3)] transition-transform duration-700 ease-out [mask-image:radial-gradient(closest-side,#000_72%,transparent)] group-hover:scale-[1.06]"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-text-hi opacity-90 backdrop-blur-md transition-opacity group-hover:opacity-100">
          <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M8.5 15a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM13.5 13.5 18 18M8.5 6v5M6 8.5h5" />
          </svg>
          {t('enlargeShort')}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-mid">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {displayUpper(term.badge, locale)}
        </span>
        <h3 className="text-xl font-semibold leading-tight text-text-hi">{term.term}</h3>
        <p className="text-[15px] leading-relaxed text-text-mid">{term.definition}</p>
        {term.keyImpact ? (
          <p className="mt-auto rounded-2xl border-l-2 border-accent bg-accent/[0.06] px-4 py-3 text-sm leading-snug text-text">
            <span className="mr-1.5 font-semibold text-accent">{t('impact')}:</span>
            {term.keyImpact}
          </p>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={term.term}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="apex-dialog m-auto w-[min(94vw,46rem)] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d0f] p-0 text-text-hi shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-md"
      >
        <div className="relative aspect-square max-h-[62vh] w-full bg-black sm:aspect-[4/3]">
          <span aria-hidden className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
          <Image src={src} alt={t('cadSchematic', { name: term.term })} fill sizes="46rem" unoptimized className="object-contain p-6 mix-blend-screen [filter:contrast(1.3)] [mask-image:radial-gradient(closest-side,#000_75%,transparent)]" />
          <button
            type="button"
            onClick={close}
            aria-label={t('closeDiagram')}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-text-hi backdrop-blur-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2 p-5 sm:p-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-low">{displayUpper(term.badge, locale)}</span>
          <h4 className="text-2xl font-semibold text-text-hi">{term.term}</h4>
          <p className="text-[15px] leading-relaxed text-text-mid">{term.definition}</p>
        </div>
      </dialog>
    </article>
  );
}
