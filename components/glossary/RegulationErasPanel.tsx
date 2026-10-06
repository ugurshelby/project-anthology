'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

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

export function RegulationErasPanel() {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const [selectedYear, setSelectedYear] = useState<number>(2022);

  const era = REGULATION_ERAS.find((e) => e.year === selectedYear) ?? REGULATION_ERAS[4];

  return (
    <section className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[#090d13] p-5 sm:p-7">
      {/* Background flare */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-accent/[0.04] blur-3xl"
      />

      {/* Header */}
      <div className="relative z-10 mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="label-caps font-mono text-[11px] tracking-widest text-accent">
              {isTr ? 'REGÜLASYON ANALİZİ · 1994–2026' : 'REGULATION ANALYSIS · 1994–2026'}
            </span>
          </div>
          <h2
            className="font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi sm:text-3xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {isTr ? 'Kural Değişiklikleri Sporu Nasıl Değiştirdi?' : 'How Regulations Shaped F1 Eras'}
          </h2>
          <p className="mt-1 text-xs text-text-mid sm:text-sm">
            {isTr
              ? 'FIA kural kitapçığı sporu kısıtlamak istedikçe mühendisler fiziğin sınırlarını yeniden çizdi.'
              : 'Every time the FIA attempted to slow cars down, engineers exploited physics to outsmart the rules.'}
          </p>
        </div>

        <span className="font-mono text-xs text-text-low">
          {REGULATION_ERAS.length} {isTr ? 'Tarihi Çağ' : 'Iconic Eras'}
        </span>
      </div>

      {/* Year Pill Selector Tabs */}
      <div className="relative z-10 mb-6 flex flex-wrap gap-2 border-b border-hairline pb-4">
        {REGULATION_ERAS.map((item) => {
          const active = item.year === selectedYear;
          return (
            <button
              key={item.year}
              type="button"
              onClick={() => setSelectedYear(item.year)}
              className={[
                'rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all',
                active
                  ? 'border border-accent/40 bg-accent text-white shadow-lg shadow-accent/20'
                  : 'border border-white/5 bg-white/[0.02] text-text-mid hover:border-white/15 hover:text-text-hi',
              ].join(' ')}
            >
              {item.year}
            </button>
          );
        })}
      </div>

      {/* Active Era Content Card */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Mandate & Reaction */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-accent border border-accent/20">
              {era.code}
            </span>
            <span className="font-mono text-xs text-text-low">
              {'//'} {isTr ? era.focusTr : era.focusEn}
            </span>
          </div>

          <h3
            className="font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi sm:text-3xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {isTr ? era.titleTr : era.titleEn}
          </h3>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <span className="label-caps mb-1 block text-[10px] text-text-low">
              {isTr ? 'FIA KURAL DEĞİŞİKLİĞİ & ZORUNLULUK' : 'FIA MANDATE & REGULATION SHIFT'}
            </span>
            <p className="text-sm leading-relaxed text-text-hi">
              {isTr ? era.mandateTr : era.mandateEn}
            </p>
          </div>

          <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4">
            <span className="label-caps mb-1 block text-[10px] text-accent">
              {isTr ? 'MÜHENDİSLİK TEPKİSİ VE BULUŞ' : 'ENGINEERING COUNTERMEASURE'}
            </span>
            <p className="text-sm leading-relaxed text-text-mid">
              {isTr ? era.reactionTr : era.reactionEn}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {era.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-text-low"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Telemetry & Impact Metrics */}
        <div className="flex flex-col justify-between space-y-4 rounded-xl border border-white/10 bg-[#0d121a] p-4 sm:p-5 lg:col-span-5">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="label-caps font-mono text-[10px] text-text-low">
                {isTr ? 'DİNAMİK ETKİ ÖLÇÜMLERİ' : 'DYNAMICS IMPACT MATRIX'}
              </span>
              <span className="font-mono text-xs font-bold text-accent">
                {era.year} ERA
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-text-mid">{isTr ? 'Aerodinamik Değişim' : 'Aero Delta'}</span>
                <span className="font-bold text-accent">{era.impactMetrics.downforceDelta}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-text-mid">{isTr ? 'Tur Zamanı / Hız Etkisi' : 'Lap Time / Speed Impact'}</span>
                <span className="font-bold text-emerald-400">{era.impactMetrics.speedDelta}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-text-mid">{isTr ? 'Motor Güç Çıkışı' : 'Power Output'}</span>
                <span className="font-bold text-text-hi">{era.impactMetrics.enginePower}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-text-mid">{isTr ? 'Kritik Risk / Dinamik' : 'Critical Failure Mode'}</span>
                <span className="font-semibold text-amber-400 text-right max-w-[200px]">
                  {isTr ? era.impactMetrics.keyRiskTr : era.impactMetrics.keyRisk}
                </span>
              </div>
            </div>
          </div>

          {/* Iconic Car Stamp */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="label-caps block text-[9px] text-text-low">
              {isTr ? 'ÇAĞI TANIMLAYAN İKONİK ARAÇ' : 'ERA BENCHMARK CAR'}
            </span>
            <span
              className="font-condensed text-lg font-700 uppercase tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {era.iconicCar}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
