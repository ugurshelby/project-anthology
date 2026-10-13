'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale } from 'next-intl';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { APEX_MOTION } from '@/lib/motion';

interface RegulationEra {
  year: number;
  code: string;
  titleEn: string;
  titleTr: string;
  focusEn: string;
  focusTr: string;
  mandateEn: string;
  mandateTr: string;
  reactionEn: string;
  reactionTr: string;
  impactMetrics: {
    downforceDelta: string;
    speedDelta: string;
    enginePower: string;
    keyRisk: string;
    keyRiskTr: string;
  };
  iconicCar: string;
  iconicCarId?: string;
  tags: string[];
}

const REGULATION_ERAS: RegulationEra[] = [
  {
    year: 1994,
    code: 'REG_1994_SAFETY',
    titleEn: '1994: The Electronic Purge & Wooden Plank',
    titleTr: '1994: Elektronik Temizlik ve Taban Tahtası',
    focusEn: 'Banning driver aids after the electronic peak; introducing the stepped floor.',
    focusTr: 'Elektronik zirvenin ardından sürüş desteklerinin yasaklanması ve basamaklı taban.',
    mandateEn: 'Active suspension, traction control, and ABS were banned overnight. Following the tragic 1994 Imola weekend, the FIA mandated a 10mm jabroc (wooden) plank beneath the chassis with a strict 1mm wear tolerance to force higher ride heights.',
    mandateTr: 'Aktif süspansiyon, çekiş kontrolü ve ABS bir gecede yasaklandı. Trajik 1994 Imola hafta sonunun ardından FIA, taban altına 10 mm kalınlığında ve en fazla 1 mm aşınma toleransı olan ahşap (jabroc) taban tahtasını zorunlu kılarak araçları yükselmeye zorladı.',
    reactionEn: 'Teams pivoted from algorithmic hydraulic ride-height control to high-rake chassis geometry and stepped aerofoils.',
    reactionTr: 'Takımlar algoritmik hidrolik süspansiyon yönetiminden yüksek eğimli (high-rake) şasi geometrisine ve basamaklı aerodinamiğe yöneldi.',
    impactMetrics: {
      downforceDelta: '-40% Initial Aero Drop',
      speedDelta: '+1.5s Lap Time Reset',
      enginePower: '750–820 bhp (3.5L V8/V10/V12)',
      keyRisk: 'Snap oversteer & bottoming out',
      keyRiskTr: 'Ani arkadan kayma ve taban vurması',
    },
    iconicCar: 'Williams FW16 / Benetton B194',
    tags: ['Safety Revolution', 'Plank Test', 'Passive Suspension'],
  },
  {
    year: 1998,
    code: 'REG_1998_NARROW',
    titleEn: '1998: Grooved Tyres & Narrow Track',
    titleTr: '1998: Yivli Lastikler ve Dar İz Genişliği',
    focusEn: 'Constraining mechanical cornering speeds via grooved rubber and 1800mm chassis.',
    focusTr: 'Yivli lastikler ve 1800 mm dar şasi ile mekanik viraj hızlarını dizginleme.',
    mandateEn: 'Overall car width reduced from 2,000mm to 1,800mm. Slick tyres were replaced with grooved rubber (3 grooves front, 4 grooves rear; expanding to 4 all-round in 1999) to deliberately slash contact patch and lateral grip.',
    mandateTr: 'Araç genişliği 2.000 mm\'den 1.800 mm\'ye daraltıldı. Düz slick lastikler yerini temas yüzeyini ve yanal tutuşu kısıtlamak amacıyla yivli lastiklere (önde 3, arkada 4 kanal) bıraktı.',
    reactionEn: 'Adrian Newey packaged the McLaren MP4/13 with low center-of-gravity ballast and torsion bars to extract extreme mechanical stability from the narrower footprint.',
    reactionTr: 'Adrian Newey, daralan tabandan maksimum stabilite çıkarmak için McLaren MP4/13\'ü alçak ağırlık merkezli balast ve burulma çubuklarıyla paketledi.',
    impactMetrics: {
      downforceDelta: '-15% Lateral Grip Slashed',
      speedDelta: '+2.0s Cornering Speed Loss',
      enginePower: '780–800 bhp (3.0L V10)',
      keyRisk: 'High-speed rollover risk reduction',
      keyRiskTr: 'Yüksek hızlı takla riskinin düşürülmesi',
    },
    iconicCar: 'McLaren MP4/13',
    tags: ['Grooved Tyres', 'Narrow Track', 'Newey Architecture'],
  },
  {
    year: 2009,
    code: 'REG_2009_AERO_RESET',
    titleEn: '2009: OWG Aero Reset & Double Diffuser',
    titleTr: '2009: OWG Aero Temizliği ve Çift Difüzör',
    focusEn: 'Eliminating winglets & bargeboards to promote overtaking; the Brawn GP loophole.',
    focusTr: 'Geçişleri artırmak için kanatçıkların temizlenmesi ve Brawn GP kural boşluğu.',
    mandateEn: 'The Overtaking Working Group (OWG) stripped all bodywork winglets, chimneys, and flip-ups. Rear wings were narrowed and heightened, front wings widened to track limits. Slick tyres returned after an 11-year absence.',
    mandateTr: 'Geçiş Çalışma Grubu (OWG); tüm gövde kulakçıklarını, bacaları ve yan kanatçıkları yasakladı. Arka kanat daraltılıp yükseltildi, ön kanat genişletildi. 11 yıllık aranın ardından slick lastikler geri döndü.',
    reactionEn: 'Brawn GP, Toyota, and Williams discovered a loophole in the rear crash structure regulations, birthing the "Double Diffuser" that channeled high-velocity floor air into an upper deck.',
    reactionTr: 'Brawn GP, Toyota ve Williams arka kaza yapısı kuralındaki boşluğu keşfederek taban altı havasını ikinci bir kata aktaran efsanevi "Çift Difüzör" (Double Diffuser) konseptini doğurdu.',
    impactMetrics: {
      downforceDelta: '+35% Gained via Double Diffuser',
      speedDelta: '-0.8s Wake Disturbance Reduced',
      enginePower: '750 bhp (2.4L V8 @ 18,000 RPM)',
      keyRisk: 'Diffuser legality protests',
      keyRiskTr: 'Difüzör yasallığı protestoları',
    },
    iconicCar: 'Brawn BGP 001',
    iconicCarId: 'brawn-bgp-001',
    tags: ['Double Diffuser', 'OWG Guidelines', 'Slick Tyres Return'],
  },
  {
    year: 2014,
    code: 'REG_2014_HYBRID',
    titleEn: '2014: The 1.6L V6 Turbo Hybrid Dawn',
    titleTr: '2014: 1.6L V6 Turbo Hibrit Şafağı',
    focusEn: 'Thermal efficiency revolution; integration of MGU-K and MGU-H power units.',
    focusTr: 'Termal verimlilik devrimi; MGU-K ve MGU-H hibrit güç ünitelerinin entegrasyonu.',
    mandateEn: 'Naturally aspirated V8s replaced by 1.6-litre turbocharged V6 engines equipped with kinetic (MGU-K) and exhaust heat (MGU-H) energy recovery systems. Fuel flow was capped strictly at 100 kg/hour.',
    mandateTr: 'Atmosferik V8 motorlar yerine kinetik (MGU-K) ve egzoz ısısı (MGU-H) geri kazanımına sahip 1.6 litre turboşarjlı V6 hibrit motorlara geçildi. Yakıt akışı saatte 100 kg ile sınırlandırıldı.',
    reactionEn: 'Mercedes High Performance Powertrains engineered the "Split Turbo" (compressor at front, turbine at back linked by a shaft through the vee), destroying the competition for seven consecutive seasons.',
    reactionTr: 'Mercedes, kompresörü öne ve türbini arkaya yerleştirip aralarından geçen bir mille bağlayan "Split Turbo" mimarisiyle yedi sezon sürecek mutlak bir dominasyon kurdu.',
    impactMetrics: {
      downforceDelta: 'Thermal Efficiency > 50%',
      speedDelta: '+35% Fuel Consumption Reduction',
      enginePower: '850+ bhp -> 1,000+ bhp (Turbo Hybrid)',
      keyRisk: 'Cooling packaging & battery thermal runaway',
      keyRiskTr: 'Soğutma paketlemesi ve batarya ısınması',
    },
    iconicCar: 'Mercedes-AMG F1 W05 Hybrid',
    tags: ['Turbo Hybrid', 'Split Turbo', 'Thermal Efficiency'],
  },
  {
    year: 2022,
    code: 'REG_2022_GROUND_EFFECT',
    titleEn: '2022: Venturi Tunnels & Porpoising',
    titleTr: '2022: Venturi Tünelleri ve Yunuslama (Porpoising)',
    focusEn: 'Bringing back underfloor ground effect downforce to slash dirty aerodynamic wake.',
    focusTr: 'Kirli hava izini yok etmek için taban altı zemin etkisinin (Venturi) geri getirilmesi.',
    mandateEn: 'Complex over-body bargeboards and winglets banned. Full-length underbody Venturi tunnels mandated to generate the majority of downforce directly from the floor, running on 18-inch low-profile Pirelli tyres.',
    mandateTr: 'Karmaşık gövde üstü yan kanatçıklar yasaklandı. Basma gücünün büyük bölümünü doğrudan tabandan üretmek için Venturi tünelleri zorunlu kılındı ve 18 inç düşük profilli Pirelli lastiklerine geçildi.',
    reactionEn: 'Extreme aerodynamic oscillation ("porpoising") devastated teams as underfloor airflow choked when the floor touched asphalt. Red Bull Racing\'s anti-dive suspension mastered ride height control.',
    reactionTr: 'Taban asfalta yaklaştığında havanın aniden kopması sonucu oluşan şiddetli aerodinamik dalgalanma ("yunuslama / porpoising") takımları sarstı. Red Bull anti-dive süspansiyonla tabanı sabit tutmayı başardı.',
    impactMetrics: {
      downforceDelta: '+50% Underfloor Ground Effect Share',
      speedDelta: '-70% Trailing Dirty Air Wake',
      enginePower: '1,000+ bhp (E10 Biofuel)',
      keyRisk: 'Violent porpoising & driver spinal compression',
      keyRiskTr: 'Şiddetli yunuslama ve pilot omurga baskısı',
    },
    iconicCar: 'Red Bull RB18 / RB19',
    iconicCarId: 'redbull-rb19',
    tags: ['Ground Effect', 'Venturi Tunnels', 'Porpoising Solution'],
  },
  {
    year: 2026,
    code: 'REG_2026_ACTIVE_AERO',
    titleEn: '2026: Active Aero (X/Z-Mode) & 50/50 Electric',
    titleTr: '2026: Aktif Aero (X/Z-Modu) ve %50 Elektrik Gücü',
    focusEn: 'Active wing modes (Z-cornering, X-straightline), MGU-H elimination & 100% sustainable fuels.',
    focusTr: 'Virajda Z-Modu, düzlükte X-Modu aktif kanatlar; MGU-H iptali ve %100 sürdürülebilir yakıt.',
    mandateEn: 'Cars feature movable front and rear wings with dual operational states (Z-Mode for maximum cornering downforce, X-Mode for low-drag straights). MGU-H removed; electric output tripling to 350kW (475 hp) for a 50/50 split with the combustion engine.',
    mandateTr: 'Araçlar ön ve arka kanatta iki durumlu aktif aerodinamiğe (virajda maksimum basma için Z-Modu, düzlükte düşük sürtünme için X-Modu) sahip olacak. MGU-H kaldırıldı, elektrik motor gücü 350 kW\'a (475 hp) çıkarılarak içten yanmalı motorla 50/50 eşitlendi.',
    reactionEn: 'Radical engine-mapping shifts requiring aerodynamic shedding on straights to compensate for reduced electrical harvesting capacity at top velocity.',
    reactionTr: 'Düzlükte enerji geri kazanımını dengelemek için kanatları tamamen yatırıp sürtünmeyi sıfırlayan radikal aktif aerodinamik haritalama.',
    impactMetrics: {
      downforceDelta: '-30% Downforce / -55% Drag in X-Mode',
      speedDelta: '350 kW (475 hp) Pure Electric Boost',
      enginePower: '1,000+ bhp (100% Advanced Sustainable Fuel)',
      keyRisk: 'Energy deployment depletion at straight end',
      keyRiskTr: 'Düzlük sonunda elektrik enerjisinin tükenmesi',
    },
    iconicCar: 'Next-Gen 2026 Concept',
    tags: ['Active Aero', 'X-Mode', '100% Sustainable Fuel', '350kW MGU-K'],
  },
];

/**
 * How rule changes shaped F1 (owner rules, apex-component-rules.md §6: "çok metin
 * olduğu için buna uygun düşün"). A timeline track picks the era; the era reads
 * as a short story — what the rule said, then how engineers answered — set at a
 * comfortable line length, with the measurable impact in cards beside it and
 * previous / next to keep reading. The texts are editorial (plan 7.2).
 */
export function RegulationErasPanel() {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const uid = useId();
  const [index, setIndex] = useState(() => Math.max(0, REGULATION_ERAS.findIndex((e) => e.year === 2022)));
  const [direction, setDirection] = useState(1);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const era = REGULATION_ERAS[index];
  const last = REGULATION_ERAS.length - 1;

  const go = (next: number, focus = false) => {
    const n = Math.min(last, Math.max(0, next));
    if (n === index) return;
    setDirection(n > index ? 1 : -1);
    setIndex(n);
    if (focus) tabRefs.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last };
    if (!(e.key in map)) return;
    e.preventDefault();
    go(map[e.key], true);
  };

  const copy = isTr
    ? {
        eyebrow: 'Kural dönemleri · 1994–2026',
        title: 'Kural Değişiklikleri Sporu Nasıl Değiştirdi?',
        intro: 'FIA kural kitapçığı sporu kısıtlamak istedikçe mühendisler fiziğin sınırlarını yeniden çizdi.',
        rule: 'Kural ne dedi?',
        answer: 'Mühendisler nasıl cevap verdi?',
        impact: 'Etkisi',
        aero: 'Aerodinamik',
        speed: 'Hız / güç etkisi',
        power: 'Motor gücü',
        risk: 'Kritik risk',
        car: 'Dönemi tanımlayan araç',
        openCar: 'Aracı aç',
        prev: 'Önceki dönem',
        next: 'Sonraki dönem',
      }
    : {
        eyebrow: 'Regulation eras · 1994–2026',
        title: 'How Regulations Shaped F1 Eras',
        intro: 'Every time the FIA attempted to slow cars down, engineers exploited physics to outsmart the rules.',
        rule: 'What the rule said',
        answer: 'How engineers answered',
        impact: 'Impact',
        aero: 'Aerodynamics',
        speed: 'Speed / power effect',
        power: 'Engine power',
        risk: 'Critical risk',
        car: 'Era-defining car',
        openCar: 'Open the car',
        prev: 'Previous era',
        next: 'Next era',
      };

  const metrics = [
    { label: copy.aero, value: era.impactMetrics.downforceDelta, warn: false },
    { label: copy.speed, value: era.impactMetrics.speedDelta, warn: false },
    { label: copy.power, value: era.impactMetrics.enginePower, warn: false },
    { label: copy.risk, value: isTr ? era.impactMetrics.keyRiskTr : era.impactMetrics.keyRisk, warn: true },
  ];
  const progress = last > 0 ? (index / last) * 100 : 0;
  const stepBtn =
    'inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-text-mid transition-colors hover:text-text-hi disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section
          aria-labelledby={`${uid}-title`}
          className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] sm:p-7"
        >
          <div aria-hidden className="pointer-events-none absolute -top-40 right-0 -z-10 h-80 w-[32rem] rounded-full bg-accent opacity-[0.1] blur-[100px]" />

          <header className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-mid">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
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
          </header>

          {/* timeline */}
          <div className="relative mt-7 px-2 sm:px-4">
            <span aria-hidden className="absolute left-6 right-6 top-[0.95rem] h-[2px] rounded-full bg-white/[0.08] sm:left-8 sm:right-8" />
            <span aria-hidden className="absolute left-6 right-6 top-[0.95rem] h-[2px] sm:left-8 sm:right-8">
              <m.span
                className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(255,24,1,0.3),var(--accent))] shadow-[0_0_12px_var(--accent)]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={APEX_MOTION.spring}
              />
            </span>
            <div role="tablist" aria-label={copy.eyebrow} onKeyDown={onKey} className="relative flex justify-between">
              {REGULATION_ERAS.map((item, i) => {
                const active = i === index;
                const passed = i <= index;
                return (
                  <button
                    key={item.year}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${item.year}`}
                    aria-selected={active}
                    aria-controls={`${uid}-panel`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => go(i)}
                    className="group flex min-w-11 flex-col items-center gap-2 rounded-xl px-1 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <span className="flex h-[22px] items-center">
                      <m.span
                        aria-hidden
                        className={['block rounded-full border-2', passed ? 'border-accent bg-accent' : 'border-white/25 bg-bg group-hover:border-white/50'].join(' ')}
                        initial={false}
                        animate={{
                          width: active ? 22 : 14,
                          height: active ? 22 : 14,
                          boxShadow: active ? '0 0 0 6px rgba(255,24,1,0.18), 0 0 18px rgba(255,24,1,0.6)' : '0 0 0 0 rgba(0,0,0,0)',
                        }}
                        transition={APEX_MOTION.snappy}
                      />
                    </span>
                    <span className={['text-sm font-semibold tabular-nums transition-colors', active ? 'text-text-hi' : 'text-text-low group-hover:text-text-mid'].join(' ')}>
                      {item.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* the era */}
          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${era.year}`} className="mt-6">
            <AnimatePresence mode="wait" initial={false}>
              <m.article
                key={era.year}
                initial={{ opacity: 0, x: 28 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 * direction }}
                transition={APEX_MOTION.snappy}
                className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-6"
              >
                <div className="min-w-0">
                  <span
                    aria-hidden
                    className="block font-condensed text-[4.5rem] font-bold italic leading-[0.8] text-transparent sm:text-[6rem]"
                    style={{ fontFamily: 'var(--font-condensed)', WebkitTextStroke: '1.5px var(--accent)' }}
                  >
                    {era.year}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold leading-snug text-text-hi sm:text-2xl">{isTr ? era.titleTr : era.titleEn}</h3>
                  <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-text-mid">{isTr ? era.focusTr : era.focusEn}</p>

                  {/* the story in two steps */}
                  <ol className="relative mt-6 flex flex-col gap-5 border-l border-white/10 pl-6">
                    <li className="relative">
                      <span aria-hidden className="absolute -left-[2.2rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-bg text-[11px] font-bold text-text-hi">
                        1
                      </span>
                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-text-low">{copy.rule}</h4>
                      <p className="mt-1.5 max-w-[66ch] text-[15px] leading-7 text-text">{isTr ? era.mandateTr : era.mandateEn}</p>
                    </li>
                    <li className="relative">
                      <span aria-hidden className="absolute -left-[2.2rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white shadow-[0_0_14px_rgba(255,24,1,0.55)]">
                        2
                      </span>
                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">{copy.answer}</h4>
                      <p className="mt-1.5 max-w-[66ch] text-[15px] leading-7 text-text">{isTr ? era.reactionTr : era.reactionEn}</p>
                    </li>
                  </ol>

                  <div lang="en" className="mt-5 flex flex-wrap gap-1.5">
                    {era.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-text-mid">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <aside className="flex flex-col gap-3">
                  <h4 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-text-low">{copy.impact}</h4>
                  <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                    {metrics.map((mt, i) => (
                      <m.div
                        key={mt.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...APEX_MOTION.snappy, delay: 0.05 * i }}
                        className={[
                          'flex flex-col-reverse rounded-2xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                          mt.warn ? 'border-amber-400/25 bg-amber-400/[0.06]' : 'border-white/[0.07] bg-white/[0.03]',
                        ].join(' ')}
                      >
                        <dt className={['mt-1 text-xs font-medium', mt.warn ? 'text-amber-300/90' : 'text-text-low'].join(' ')}>{mt.label}</dt>
                        <dd className="text-[15px] font-semibold leading-snug text-text-hi">{mt.value}</dd>
                      </m.div>
                    ))}
                  </dl>
                  <div className="mt-1 rounded-2xl border border-white/[0.07] bg-black/25 p-4">
                    <span className="text-xs font-medium text-text-low">{copy.car}</span>
                    <p lang="en" className="mt-1 font-condensed text-xl font-700 uppercase leading-tight tracking-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                      {era.iconicCar}
                    </p>
                    {era.iconicCarId ? (
                      <Link
                        href={`/machinery/${era.iconicCarId}`}
                        className="mt-2 inline-flex min-h-8 items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-text-hi transition-colors hover:bg-white/10"
                      >
                        {copy.openCar} →
                      </Link>
                    ) : null}
                  </div>
                </aside>
              </m.article>
            </AnimatePresence>
          </div>

          {/* keep reading */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={stepBtn} aria-label={copy.prev}>
              ← {index > 0 ? REGULATION_ERAS[index - 1].year : copy.prev}
            </button>
            <span className="text-xs tabular-nums text-text-low">
              {index + 1} / {REGULATION_ERAS.length}
            </span>
            <button type="button" onClick={() => go(index + 1)} disabled={index === last} className={stepBtn} aria-label={copy.next}>
              {index < last ? REGULATION_ERAS[index + 1].year : copy.next} →
            </button>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
