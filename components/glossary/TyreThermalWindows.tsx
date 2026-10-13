'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useLocale } from 'next-intl';
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { APEX_MOTION, APEX_SPRING, APEX_SPRING_SNAPPY } from '@/lib/motion';
import { START_DEG, SWEEP, T_MAX, T_MIN, pointAt, tOf, tempAtOffset, uOf, zoneOf } from '@/lib/glossary/thermalDial';

/**
 * Tyre temperature windows (owner rules: docs/design/apex-component-rules.md §3).
 *
 * The heart is a 270° thermal dial: cold zone, the compound's working window
 * and the overheating zone, with a breathing peak-grip marker. The reader can
 * drag the thumb round the dial (or use the arrow keys); the readout and the
 * Graining / Blistering cards react to where the temperature sits. Changing
 * compound springs the window, the marker and the thumb to their new places.
 * The temperatures are editorial (plan 7.2), not Pirelli data.
 */

interface CompoundThermal {
  code: string;
  nameEn: string;
  nameTr: string;
  /** Compound identity colour (Pirelli marking: white hard, yellow medium, red soft). */
  color: string;
  windowMinC: number;
  windowMaxC: number;
  peakC: number;
  circuitFitEn: string;
  circuitFitTr: string;
  /** 1 (slow) … 4 (instant). */
  warmup: 1 | 2 | 3 | 4;
  /** 1 (low) … 4 (extreme). */
  durability: 1 | 2 | 3 | 4;
}

const COMPOUNDS: CompoundThermal[] = [
  {
    code: 'C1',
    nameEn: 'C1 Hard Compound',
    nameTr: 'C1 En Sert Hamur',
    color: '#f2f4f7',
    windowMinC: 110,
    windowMaxC: 140,
    peakC: 125,
    circuitFitEn: 'High-energy circuits with brutal lateral loads (Silverstone, Suzuka, Barcelona T3).',
    circuitFitTr: 'Aşırı yanal yük ve yüksek enerjili virajlara sahip pistler (Silverstone, Suzuka, Barselona 3. Viraj).',
    warmup: 1,
    durability: 4,
  },
  {
    code: 'C2',
    nameEn: 'C2 Hard / Medium',
    nameTr: 'C2 Sert / Orta Hamur',
    color: '#f2f4f7',
    windowMinC: 105,
    windowMaxC: 135,
    peakC: 120,
    circuitFitEn: 'Abrasive asphalt with high track surface temperatures (Bahrain, Spa, Qatar).',
    circuitFitTr: 'Yüksek pist sıcaklığı ve aşındırıcı asfalta sahip pistler (Bahreyn, Spa, Katar).',
    warmup: 2,
    durability: 3,
  },
  {
    code: 'C3',
    nameEn: 'C3 Versatile Medium',
    nameTr: 'C3 Evrensel Orta Hamur',
    color: '#ffd60a',
    windowMinC: 100,
    windowMaxC: 130,
    peakC: 115,
    circuitFitEn: 'The universal benchmark. Present at nearly 90% of all Grand Prix weekends.',
    circuitFitTr: 'Evrensel referans hamur. Grand Prix takviminin neredeyse %90\'ında yarış hafta sonunda bulunur.',
    warmup: 3,
    durability: 2,
  },
  {
    code: 'C4',
    nameEn: 'C4 Soft Compound',
    nameTr: 'C4 Yumuşak Hamur',
    color: '#ff453a',
    windowMinC: 90,
    windowMaxC: 120,
    peakC: 105,
    circuitFitEn: 'Low-grip, traction-dominated layouts and street circuits (Monaco, Montreal, Baku).',
    circuitFitTr: 'Düşük tutuşlu, çekiş ağırlıklı ve cadde pistleri (Monako, Montreal, Bakü).',
    warmup: 3,
    durability: 1,
  },
  {
    code: 'C5',
    nameEn: 'C5 Ultra Soft',
    nameTr: 'C5 Ultra Yumuşak Hamur',
    color: '#ff453a',
    windowMinC: 85,
    windowMaxC: 115,
    peakC: 100,
    circuitFitEn: 'Maximum qualifying mechanical grip for low-abrasion street venues (Monaco, Singapore, Vegas).',
    circuitFitTr: 'Düşük aşınmalı cadde pistlerinde sıralama turlarında mutlak mekanik tutuş için (Monako, Singapur, Las Vegas).',
    warmup: 4,
    durability: 1,
  },
];

/* ------------------------------------------------------------------ */
/* dial geometry                                                       */
/* ------------------------------------------------------------------ */

const SIZE = 240;
const C = SIZE / 2;
const R = 86;
const COLD = '#64d2ff';
const HOT = '#ff453a';
const pointOnDial = (u: number, r = R) => pointAt(u, r, C);

/* ------------------------------------------------------------------ */
/* copy                                                                */
/* ------------------------------------------------------------------ */

const COPY = {
  en: {
    eyebrow: 'Thermal physics',
    title: 'Tyre Temperature Windows & Wear Physics',
    intro: 'Formula 1 tyres do not simply wear out — outside their working window the rubber’s chemistry stops working.',
    selector: 'Compound',
    dial: 'Tyre temperature',
    dialHint: 'Drag round the dial or use the arrow keys',
    zone: {
      cold: 'Too cold · graining risk',
      optimal: 'In the working window',
      peak: 'Peak grip',
      hot: 'Overheating · blistering risk',
    },
    detail: {
      cold: (d: number) => `${d}°C below the window`,
      optimal: (d: number) => `${d}°C from peak grip`,
      peak: () => 'The tyre is at its best grip',
      hot: (d: number) => `${d}°C above the window`,
    },
    scaleCold: 'Cold',
    scaleHot: 'Overheat',
    kpiWarmup: 'Warm-up',
    kpiDurability: 'Wear resistance',
    kpiWindow: 'Working window',
    kpiPeak: 'Peak grip',
    warmupLevels: ['Slow', 'Moderate', 'Fast', 'Instant'],
    durabilityLevels: ['Low', 'Medium', 'High', 'Extreme'],
    youAreHere: 'You are here',
    graining: {
      title: 'Cold Graining',
      summary: 'A cold tyre slides; torn rubber sticks back onto the tread.',
      body: 'Occurs when a cold tyre is subjected to extreme lateral sliding before reaching its minimum operating window. Surface rubber shears off under shear stress, but cannot melt smoothly into the asphalt — forming miniature rubber granules that stick onto the tread, reducing grip like ball bearings.',
    },
    blistering: {
      title: 'Thermal Blistering',
      summary: 'Overheated rubber forms gas bubbles inside the tread.',
      body: 'When internal tyre carcass temperatures exceed critical limits (>140°C), gases inside the composite vulcanized rubber expand violently. Trapped bubbles escape towards the outer tread, tearing away rubber chunks and creating crater-like fissures. Grip plummets instantaneously.',
    },
  },
  tr: {
    eyebrow: 'Termal fizik',
    title: 'Lastik Sıcaklık Pencereleri ve Aşınma Dinamiği',
    intro: 'Lastik yalnızca aşınmaz; çalışma penceresinin dışında kaldığında hamurun kimyası çalışmaz hâle gelir.',
    selector: 'Hamur',
    dial: 'Lastik sıcaklığı',
    dialHint: 'Kadran üzerinde kaydırın ya da ok tuşlarını kullanın',
    zone: {
      cold: 'Soğuk · Granüllenme riski',
      optimal: 'Çalışma penceresinde',
      peak: 'Zirve tutuş',
      hot: 'Aşırı ısınma · Kabarcıklanma riski',
    },
    detail: {
      cold: (d: number) => `Pencerenin ${d}°C altında`,
      optimal: (d: number) => `Zirve tutuşa ${d}°C`,
      peak: () => 'Lastik en iyi tutuşunda',
      hot: (d: number) => `Pencerenin ${d}°C üstünde`,
    },
    scaleCold: 'Soğuk',
    scaleHot: 'Aşırı ısı',
    kpiWarmup: 'Isınma hızı',
    kpiDurability: 'Aşınma direnci',
    kpiWindow: 'Çalışma penceresi',
    kpiPeak: 'Zirve tutuş',
    warmupLevels: ['Yavaş', 'Dengeli', 'Hızlı', 'Anlık'],
    durabilityLevels: ['Düşük', 'Orta', 'Yüksek', 'Ekstrem'],
    youAreHere: 'Şu an buradasınız',
    graining: {
      title: 'Granüllenme (Graining)',
      summary: 'Soğuk lastik kayar; kopan kauçuk sırta geri yapışır.',
      body: 'Lastik optimum sıcaklığına ulaşamadan (soğukken) yüksek yanal yüke maruz kaldığında araç asfaltta kayar. Yüzeydeki mikroskobik kauçuk parçaları kopar, ancak pist ısısı yetersiz olduğu için erimek yerine küçük topaklar halinde lastik sırtına yeniden yapışır; tutuşu mermer tabakası gibi sıfırlar.',
    },
    blistering: {
      title: 'Kabarcıklanma (Blistering)',
      summary: 'Aşırı ısınan hamurun içinde gaz kabarcıkları oluşur.',
      body: 'Lastik aşırı zorlandığında veya taban sıcaklığı 140°C üzerine çıktığında karkas içindeki hava ve gazlar genleşir. İç çekirdekteki kauçuk eriyip gaz kabarcıkları yüzeyi parçalayarak krater benzeri delikler açar. Bu mekanik bir aşınma değil, termal patlamadır.',
    },
  },
} as const;

const GLASS =
  'border border-white/[0.07] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl';

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function TyreThermalWindows() {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const copy = isTr ? COPY.tr : COPY.en;
  const reduced = useReducedMotion();
  const uid = useId();

  const [code, setCode] = useState('C3');
  const compound = COMPOUNDS.find((c) => c.code === code) ?? COMPOUNDS[2];
  const [temp, setTemp] = useState(compound.peakC);
  const [shown, setShown] = useState(compound.peakC);
  const [open, setOpen] = useState<'graining' | 'blistering' | null>(null);

  // Springs for everything that moves on the dial (interruptible: a new target mid-flight just bends the motion).
  const minS = useSpring(uOf(compound.windowMinC), APEX_SPRING);
  const maxS = useSpring(uOf(compound.windowMaxC), APEX_SPRING);
  const peakS = useSpring(uOf(compound.peakC), APEX_SPRING);
  const tempS = useSpring(uOf(compound.peakC), APEX_SPRING_SNAPPY);

  useEffect(() => {
    const to = (s: typeof minS, v: number) => (reduced ? s.jump(v) : s.set(v));
    to(minS, uOf(compound.windowMinC));
    to(maxS, uOf(compound.windowMaxC));
    to(peakS, uOf(compound.peakC));
  }, [compound, reduced, minS, maxS, peakS]);

  useMotionValueEvent(tempS, 'change', (u) => setShown(Math.round(tOf(u))));

  const goTo = (t: number, direct = false) => {
    const clamped = Math.round(Math.min(T_MAX, Math.max(T_MIN, t)));
    setTemp(clamped);
    if (direct || reduced) tempS.jump(uOf(clamped));
    else tempS.set(uOf(clamped));
    if (direct || reduced) setShown(clamped);
  };

  const selectCompound = (next: CompoundThermal) => {
    setCode(next.code);
    goTo(next.peakC);
  };

  const cold = useTransform(minS, (a) => `${a} 360`);
  const winDash = useTransform([minS, maxS], ([a, b]: number[]) => `${Math.max(0, b - a)} 360`);
  const winOffset = useTransform(minS, (a) => -a);
  const hotDash = useTransform(maxS, (b) => `${SWEEP - b} 360`);
  const hotOffset = useTransform(maxS, (b) => -b);
  const peakX = useTransform(peakS, (u) => pointOnDial(u).x);
  const peakY = useTransform(peakS, (u) => pointOnDial(u).y);
  const thumbX = useTransform(tempS, (u) => pointOnDial(u).x);
  const thumbY = useTransform(tempS, (u) => pointOnDial(u).y);

  const zone = zoneOf(shown, compound);
  const zoneColor = zone === 'cold' ? COLD : zone === 'hot' ? HOT : compound.color;
  const distance =
    zone === 'cold'
      ? compound.windowMinC - shown
      : zone === 'hot'
        ? shown - compound.windowMaxC
        : Math.abs(compound.peakC - shown);

  /* pointer scrubbing on the dial */
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const tempFromPointer = (e: PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((e.clientX - rect.left) / rect.width) * SIZE - C;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE - C;
    return tempAtOffset(x, y);
  };
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = tempFromPointer(e);
    if (t != null) goTo(t);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const t = tempFromPointer(e);
    if (t != null) goTo(t, true);
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const onSliderKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (step != null) goTo(temp + step);
    else if (e.key === 'Home') goTo(T_MIN);
    else if (e.key === 'End') goTo(T_MAX);
    else return;
    e.preventDefault();
  };

  /* segmented control keyboard (radiogroup, roving focus) */
  const segRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idx = COMPOUNDS.findIndex((c) => c.code === code);
  const onSegKey = (e: KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (idx + delta + COMPOUNDS.length) % COMPOUNDS.length;
    selectCompound(COMPOUNDS[next]);
    segRefs.current[next]?.focus();
  };

  const ticks = [70, 90, 110, 130, 150];
  const riskZone = zone === 'cold' ? 'graining' : zone === 'hot' ? 'blistering' : null;

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section
          className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-7"
          aria-labelledby={`${uid}-title`}
        >
          {/* Ambient light in the compound's (or the risk zone's) colour */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[36rem] max-w-[140%] -translate-x-1/2 rounded-full opacity-[0.16] blur-[90px] transition-[background-color] duration-700"
            style={{ backgroundColor: zoneColor }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-24 -z-10 h-72 w-72 rounded-full opacity-[0.08] blur-[80px] transition-[background-color] duration-700"
            style={{ backgroundColor: compound.color }}
          />

          {/* Header */}
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-mid">
                <span className="h-1.5 w-1.5 rounded-full transition-colors duration-500" style={{ backgroundColor: zoneColor }} />
                {copy.eyebrow}
              </span>
              <h2
                id={`${uid}-title`}
                className="mt-3 font-condensed text-[1.75rem] font-700 uppercase leading-[0.95] tracking-tight text-text-hi sm:text-[2.25rem]"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {copy.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-mid sm:text-[15px]">{copy.intro}</p>
            </div>
            <span className="shrink-0 self-start whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-xs text-text-low sm:self-auto">
              Pirelli · 18″
            </span>
          </header>

          {/* Segmented pill control */}
          <div
            role="radiogroup"
            aria-label={copy.selector}
            onKeyDown={onSegKey}
            className="relative mt-6 grid grid-cols-5 rounded-full border border-white/[0.07] bg-white/[0.05] p-1 sm:max-w-xl"
          >
            <m.span
              aria-hidden
              className="absolute bottom-1 left-1 top-1 rounded-full border border-white/[0.14] bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
              style={{ width: 'calc((100% - 0.5rem) / 5)', boxShadow: `0 6px 24px -8px ${compound.color}99, inset 0 1px 0 rgba(255,255,255,0.18)` }}
              initial={false}
              animate={{ x: `${idx * 100}%` }}
              transition={APEX_MOTION.snappy}
            />
            {COMPOUNDS.map((c, i) => {
              const active = c.code === code;
              return (
                <m.button
                  key={c.code}
                  ref={(el) => {
                    segRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={isTr ? c.nameTr : c.nameEn}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectCompound(c)}
                  whileTap={{ scale: 0.94 }}
                  className={[
                    'relative z-10 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60',
                    active ? 'text-text-hi' : 'text-text-mid hover:text-text-hi',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-black/30"
                    style={{ backgroundColor: c.color, boxShadow: active ? `0 0 12px ${c.color}` : undefined }}
                  />
                  {c.code}
                </m.button>
              );
            })}
          </div>

          {/* Hero: dial + compound facts */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-5">
            <div className={`relative flex flex-col items-center rounded-[22px] px-3 pb-5 pt-4 sm:px-6 ${GLASS}`}>
              <div
                role="slider"
                tabIndex={0}
                aria-label={copy.dial}
                aria-valuemin={T_MIN}
                aria-valuemax={T_MAX}
                aria-valuenow={temp}
                aria-valuetext={`${temp}°C, ${copy.zone[zoneOf(temp, compound)]}`}
                onKeyDown={onSliderKey}
                className="relative w-full max-w-[19rem] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
              >
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  className="block w-full cursor-grab touch-none select-none active:cursor-grabbing"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  aria-hidden
                >
                  <defs>
                    <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="7" />
                    </filter>
                  </defs>
                  <g transform={`rotate(${START_DEG} ${C} ${C})`} fill="none" strokeWidth={14}>
                    {/* track */}
                    <circle cx={C} cy={C} r={R} pathLength={360} stroke="rgba(255,255,255,0.07)" strokeDasharray={`${SWEEP} 360`} strokeLinecap="round" />
                    {/* cold and overheat zones */}
                    <m.circle cx={C} cy={C} r={R} pathLength={360} stroke={COLD} strokeOpacity={0.32} style={{ strokeDasharray: cold }} />
                    <m.circle
                      cx={C}
                      cy={C}
                      r={R}
                      pathLength={360}
                      stroke={HOT}
                      strokeOpacity={0.32}
                      style={{ strokeDasharray: hotDash, strokeDashoffset: hotOffset }}
                    />
                    {/* working window: soft breathing halo + the window itself */}
                    <m.circle
                      cx={C}
                      cy={C}
                      r={R}
                      pathLength={360}
                      stroke={compound.color}
                      strokeWidth={20}
                      strokeLinecap="round"
                      filter={`url(#${uid}-glow)`}
                      className="apex-breathe"
                      style={{ strokeDasharray: winDash, strokeDashoffset: winOffset }}
                    />
                    <m.circle
                      cx={C}
                      cy={C}
                      r={R}
                      pathLength={360}
                      stroke={compound.color}
                      strokeLinecap="round"
                      style={{ strokeDasharray: winDash, strokeDashoffset: winOffset }}
                    />
                  </g>
                  {/* scale */}
                  {ticks.map((t) => {
                    const p = pointOnDial(uOf(t), R + 21);
                    return (
                      <text key={t} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--text-low)" className="tabular-nums">
                        {t}°
                      </text>
                    );
                  })}
                  {/* peak grip marker */}
                  <m.circle cx={peakX} cy={peakY} r={9} fill={compound.color} opacity={0.5} filter={`url(#${uid}-glow)`} className="apex-breathe" />
                  <m.circle cx={peakX} cy={peakY} r={3.5} fill="#fff" />
                  {/* thumb */}
                  <m.circle cx={thumbX} cy={thumbY} r={12} fill="#0b0b0c" stroke={zoneColor} strokeWidth={3} style={{ transition: 'stroke 400ms' }} />
                  <m.circle cx={thumbX} cy={thumbY} r={4} fill={zoneColor} style={{ transition: 'fill 400ms' }} />
                </svg>

                {/* readout in the middle of the dial */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2 text-center">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-low">{copy.dial}</span>
                  <span className="mt-1 font-condensed text-[3.25rem] font-700 leading-none tabular-nums text-text-hi sm:text-[3.75rem]" style={{ fontFamily: 'var(--font-condensed)' }}>
                    {shown}
                    <span className="ml-0.5 align-top text-xl text-text-mid">°C</span>
                  </span>
                  <span aria-live="polite" className="mt-2 max-w-[11rem] text-[13px] font-semibold leading-tight transition-colors duration-300" style={{ color: zoneColor }}>
                    {copy.zone[zone]}
                  </span>
                  <span className="mt-0.5 max-w-[8.5rem] text-[11px] leading-snug text-text-mid">
                    {zone === 'peak' ? copy.detail.peak() : copy.detail[zone](distance)}
                  </span>
                </div>
              </div>

              <div className="mt-1 flex w-full max-w-[19rem] justify-between px-2 text-[11px] font-medium">
                <span style={{ color: COLD }}>{copy.scaleCold}</span>
                <span style={{ color: HOT }}>{copy.scaleHot}</span>
              </div>
              <p className="mt-3 text-center text-xs text-text-low">{copy.dialHint}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`rounded-[22px] p-5 ${GLASS}`}>
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={compound.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={APEX_MOTION.snappy}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: compound.color, boxShadow: `0 0 14px ${compound.color}` }} />
                      <h3 className="text-lg font-semibold text-text-hi">{isTr ? compound.nameTr : compound.nameEn}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-mid">{isTr ? compound.circuitFitTr : compound.circuitFitEn}</p>
                  </m.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <LevelCard label={copy.kpiWarmup} level={compound.warmup} levels={copy.warmupLevels} color={compound.color} />
                <LevelCard label={copy.kpiDurability} level={compound.durability} levels={copy.durabilityLevels} color={compound.color} />
                <div className={`rounded-[20px] p-4 ${GLASS}`}>
                  <span className="text-xs font-medium text-text-mid">{copy.kpiWindow}</span>
                  <p className="mt-1.5 text-xl font-semibold tabular-nums text-text-hi">
                    {compound.windowMinC}–{compound.windowMaxC}
                    <span className="ml-0.5 text-sm text-text-mid">°C</span>
                  </p>
                  <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <m.span
                      className="absolute inset-y-0 rounded-full"
                      style={{ backgroundColor: compound.color }}
                      initial={false}
                      animate={{
                        left: `${((compound.windowMinC - T_MIN) / (T_MAX - T_MIN)) * 100}%`,
                        width: `${((compound.windowMaxC - compound.windowMinC) / (T_MAX - T_MIN)) * 100}%`,
                      }}
                      transition={APEX_MOTION.spring}
                    />
                  </div>
                </div>
                <div className={`rounded-[20px] p-4 ${GLASS}`}>
                  <span className="text-xs font-medium text-text-mid">{copy.kpiPeak}</span>
                  <p className="mt-1.5 text-xl font-semibold tabular-nums text-text-hi">
                    {compound.peakC}
                    <span className="ml-0.5 text-sm text-text-mid">°C</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => goTo(compound.peakC)}
                    className="mt-2 inline-flex min-h-8 items-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-text-hi transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    {isTr ? 'Zirveye al' : 'Go to peak'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Risk cards: expandable, and lit up when the dial sits in their zone */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:mt-5">
            {(['graining', 'blistering'] as const).map((key) => {
              const card = copy[key];
              const color = key === 'graining' ? COLD : HOT;
              const isOpen = open === key;
              const here = riskZone === key;
              const bodyId = `${uid}-${key}`;
              return (
                <div
                  key={key}
                  className={`rounded-[20px] transition-[box-shadow,border-color] duration-500 ${GLASS}`}
                  style={here ? { borderColor: `${color}66`, boxShadow: `0 0 0 1px ${color}33, 0 12px 40px -16px ${color}88` } : undefined}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={() => setOpen(isOpen ? null : key)}
                    className="flex w-full items-start gap-3 rounded-[20px] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60 sm:p-5"
                  >
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-text-hi">{card.title}</span>
                        {here ? (
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${color}22`, color }}>
                            {copy.youAreHere}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm text-text-mid">{card.summary}</span>
                    </span>
                    <m.svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className="mt-1 h-5 w-5 shrink-0 text-text-mid"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={APEX_MOTION.snappy}
                    >
                      <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </m.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <m.div
                        id={bodyId}
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={APEX_MOTION.spring}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-5 pl-[2.375rem] text-sm leading-relaxed text-text-mid sm:px-5 sm:pl-[2.625rem]">{card.body}</p>
                      </m.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}

/** KPI card with a four-step micro gauge (warm-up rate, wear resistance). */
function LevelCard({
  label,
  level,
  levels,
  color,
}: {
  label: string;
  level: 1 | 2 | 3 | 4;
  levels: readonly string[];
  color: string;
}) {
  return (
    <div className={`rounded-[20px] p-4 ${GLASS}`}>
      <span className="text-xs font-medium text-text-mid">{label}</span>
      <p className="mt-1.5 text-xl font-semibold text-text-hi">{levels[level - 1]}</p>
      <div className="mt-3 flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="h-1.5 flex-1 rounded-full transition-colors duration-500"
            style={{ backgroundColor: n <= level ? color : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
    </div>
  );
}

