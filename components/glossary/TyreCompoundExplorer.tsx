'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import type { TyreCompound } from '@/data/glossary/tyres';
import { CategoryDiagram, TyreCadDiagram } from '@/components/glossary/TermDiagram';
import { displayUpper } from '@/lib/i18n/caps';
import { APEX_MOTION } from '@/lib/motion';

/**
 * Pirelli range as one "tyre rack" (owner rules, apex-component-rules.md §6):
 * seven compact tyres you tap, one detail panel that tells that tyre's story.
 * Replaces the old card grid + sheet + the mobile snap row that also showed on
 * desktop (an unlayered `.snap-row { display:flex }` beat `md:hidden`).
 */

const isSlick = (t: TyreCompound) => t.id.startsWith('c');
const codeOf = (t: TyreCompound) => (isSlick(t) ? t.id.toUpperCase() : t.id === 'intermediate' ? 'INT' : 'WET');

function shortOf(t: TyreCompound, isTr: boolean): string {
  if (isSlick(t)) return t.name.split('— ')[1] ?? t.name;
  if (t.id === 'intermediate') return isTr ? 'Ara' : 'Inter';
  return isTr ? 'Yağmur' : 'Full wet';
}

const treadOf = (t: TyreCompound): 'slick' | 'intermediate' | 'wet' =>
  t.id === 'intermediate' ? 'intermediate' : t.id === 'wet' ? 'wet' : 'slick';

/** A tyre drawn in code: sidewall band in the compound colour, rim and spokes. */
function TyreGlyph({ color, className = '' }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <circle cx="60" cy="60" r="57" fill="#121214" />
      <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {/* tread blocks on the outer edge */}
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x="58.5" y="4" width="3" height="5" rx="1" fill="rgba(255,255,255,0.07)" transform={`rotate(${i * 10} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="44" fill="none" stroke={color} strokeWidth="5" />
      <circle cx="60" cy="60" r="44" fill="none" stroke={color} strokeWidth="11" opacity="0.12" />
      <circle cx="60" cy="60" r="33" fill="#2a2a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d="M60 60 L60 30" stroke="rgba(255,255,255,0.22)" strokeWidth="4" strokeLinecap="round" transform={`rotate(${i * 72} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="7" fill="#1a1a1d" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    </svg>
  );
}

export function TyreCompoundExplorer({ tyres }: { tyres: TyreCompound[] }) {
  const t = useTranslations('ui.glossary');
  const locale = useLocale();
  const isTr = locale === 'tr';
  const uid = useId();
  const [selectedId, setSelectedId] = useState(() => tyres.find((x) => x.id === 'c3')?.id ?? tyres[0]?.id);
  const [direction, setDirection] = useState(1);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // The search can hide the selected tyre: the first visible one stands in (index -1 → 0).
  const index = Math.max(0, tyres.findIndex((x) => x.id === selectedId));
  const tyre = tyres[index];
  if (!tyre) return null;

  const select = (next: number) => {
    const n = (next + tyres.length) % tyres.length;
    setDirection(n >= index ? 1 : -1);
    setSelectedId(tyres[n].id);
    tabRefs.current[tyres[n].id]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: tyres.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key]);
  };

  const dry = tyres.filter(isSlick);
  const wet = tyres.filter((x) => !isSlick(x));
  const gauges = [
    { label: t('grip'), value: tyre.grip },
    { label: t('durability'), value: tyre.durability },
    { label: t('warmup'), value: tyre.warmup },
  ];

  const tab = (x: TyreCompound) => {
    const active = x.id === tyre.id;
    return (
      <button
        key={x.id}
        ref={(el) => {
          tabRefs.current[x.id] = el;
        }}
        type="button"
        role="tab"
        id={`${uid}-tab-${x.id}`}
        aria-selected={active}
        aria-controls={`${uid}-panel`}
        tabIndex={active ? 0 : -1}
        onClick={() => {
          setDirection(tyres.indexOf(x) >= index ? 1 : -1);
          setSelectedId(x.id);
        }}
        className="group relative flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1 pb-2.5 pt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <span
          aria-hidden
          className={['absolute inset-0 rounded-2xl border transition-all duration-300', active ? 'border-white/15 bg-white/[0.07]' : 'border-transparent group-hover:bg-white/[0.03]'].join(' ')}
          style={active ? { boxShadow: `0 10px 30px -14px ${x.color}, inset 0 1px 0 rgba(255,255,255,0.08)` } : undefined}
        />
        <m.span
          className="relative block"
          animate={active ? { y: -5, rotate: 40, scale: 1.06 } : { y: 0, rotate: 0, scale: 1 }}
          transition={APEX_MOTION.spring}
        >
          <TyreGlyph color={x.color} className="h-12 w-12 sm:h-14 sm:w-14" />
        </m.span>
        <span className={['relative text-sm font-bold tabular-nums', active ? 'text-text-hi' : 'text-text-mid'].join(' ')}>{codeOf(x)}</span>
        <span className="relative max-w-full truncate px-1 text-[11px] text-text-low">{shortOf(x, isTr)}</span>
      </button>
    );
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section id="tyres" className="scroll-mt-36 flex flex-col gap-4" aria-labelledby={`${uid}-title`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03] p-0.5">
                <CategoryDiagram category="Tyres" className="h-full w-full" />
              </div>
              <h2 id={`${uid}-title`} className="headline-md uppercase tracking-tight text-text-hi">
                {t('tyreCompounds', { count: tyres.length })}
              </h2>
            </div>
            <span className="text-xs text-text-low">{t('pirelliRange')}</span>
          </div>

          <div className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-80 w-[30rem] rounded-full opacity-[0.14] blur-[90px] transition-[background-color] duration-700"
              style={{ backgroundColor: tyre.color }}
            />

            {/* the rack */}
            <div role="tablist" aria-label={t('tyreCompounds', { count: tyres.length })} onKeyDown={onKey} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              {dry.length ? (
                <div className="flex-[5] rounded-[22px] border border-white/[0.06] bg-black/20 p-1.5">
                  <span className="block px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-low">{displayUpper(dry[0].kicker, locale)}</span>
                  <div className="grid grid-cols-5 gap-1">{dry.map(tab)}</div>
                </div>
              ) : null}
              {wet.length ? (
                <div className="flex-[2] rounded-[22px] border border-white/[0.06] bg-black/20 p-1.5">
                  <span className="block px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-low">{displayUpper(wet[0].kicker, locale)}</span>
                  <div className={`grid gap-1 ${wet.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{wet.map(tab)}</div>
                </div>
              ) : null}
            </div>

            {/* the story of the selected tyre */}
            <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${tyre.id}`} className="mt-4">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <m.div
                  key={tyre.id}
                  custom={direction}
                  initial={{ opacity: 0, x: 24 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 * direction }}
                  transition={APEX_MOTION.snappy}
                  className="grid grid-cols-1 gap-5 rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-8"
                >
                  <div className="flex flex-row items-center gap-5 md:flex-col md:items-center">
                    <div className="relative">
                      <span aria-hidden className="absolute inset-4 rounded-full opacity-40 blur-2xl" style={{ backgroundColor: tyre.color }} />
                      <m.div
                        initial={{ rotate: -140 * direction, x: -30 * direction, opacity: 0 }}
                        animate={{ rotate: 0, x: 0, opacity: 1 }}
                        transition={{ ...APEX_MOTION.spring, opacity: { duration: 0.2 } }}
                      >
                        <TyreGlyph color={tyre.color} className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-48 md:w-48" />
                      </m.div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/40 mix-blend-normal md:h-20 md:w-20">
                        <TyreCadDiagram type={treadOf(tyre)} className="h-full w-full [&_img]:mix-blend-screen" />
                      </div>
                      <span className="text-[11px] text-text-low">{t('cadBlueprint')}</span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ backgroundColor: `${tyre.color}1f`, color: tyre.color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tyre.color }} />
                      {displayUpper(tyre.kicker, locale)}
                    </span>
                    <h3
                      className="mt-3 font-condensed text-3xl font-700 uppercase leading-none tracking-tight text-text-hi sm:text-4xl"
                      style={{ fontFamily: 'var(--font-condensed)' }}
                    >
                      {tyre.name}
                    </h3>
                    <p className="mt-3 text-base font-medium leading-relaxed text-text-hi">{tyre.blurb}</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-mid sm:text-[15px]">{tyre.description}</p>

                    <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {gauges.map((g, i) => (
                        <div key={g.label} className="flex flex-col-reverse rounded-2xl border border-white/[0.06] bg-black/20 p-3.5">
                          <dt className="mt-2 text-xs font-medium text-text-mid">{g.label}</dt>
                          <dd>
                            <span className="text-xl font-semibold tabular-nums text-text-hi">
                              {g.value}
                              <span className="text-sm text-text-low"> / 10</span>
                            </span>
                            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                              <m.span
                                className="block h-full rounded-full"
                                style={{ backgroundColor: tyre.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${g.value * 10}%` }}
                                transition={{ ...APEX_MOTION.spring, delay: 0.08 * i }}
                              />
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
