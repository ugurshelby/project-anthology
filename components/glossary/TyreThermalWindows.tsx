'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

interface CompoundThermal {
  code: string;
  nameEn: string;
  nameTr: string;
  color: string;
  windowMinC: number;
  windowMaxC: number;
  peakC: number;
  circuitFitEn: string;
  circuitFitTr: string;
  warmupRate: 'Instant' | 'Fast' | 'Moderate' | 'Slow';
  warmupRateTr: 'Anlık' | 'Hızlı' | 'Dengeli' | 'Yavaş';
  degradationResistance: 'Extreme' | 'High' | 'Medium' | 'Low';
  degradationResistanceTr: 'Ekstrem' | 'Yüksek' | 'Orta' | 'Düşük';
}

const COMPOUNDS_THERMAL: CompoundThermal[] = [
  {
    code: 'C1',
    nameEn: 'C1 Hard Compound',
    nameTr: 'C1 En Sert Hamur',
    color: '#ffffff',
    windowMinC: 110,
    windowMaxC: 140,
    peakC: 125,
    circuitFitEn: 'High-energy circuits with brutal lateral loads (Silverstone, Suzuka, Barcelona T3).',
    circuitFitTr: 'Aşırı yanal yük ve yüksek enerjili virajlara sahip pistler (Silverstone, Suzuka, Barselona 3. Viraj).',
    warmupRate: 'Slow',
    warmupRateTr: 'Yavaş',
    degradationResistance: 'Extreme',
    degradationResistanceTr: 'Ekstrem',
  },
  {
    code: 'C2',
    nameEn: 'C2 Hard / Medium',
    nameTr: 'C2 Sert / Orta Hamur',
    color: '#ffffff',
    windowMinC: 105,
    windowMaxC: 135,
    peakC: 120,
    circuitFitEn: 'Abrasive asphalt with high track surface temperatures (Bahrain, Spa, Qatar).',
    circuitFitTr: 'Yüksek pist sıcaklığı ve aşındırıcı asfalta sahip pistler (Bahreyn, Spa, Katar).',
    warmupRate: 'Moderate',
    warmupRateTr: 'Dengeli',
    degradationResistance: 'High',
    degradationResistanceTr: 'Yüksek',
  },
  {
    code: 'C3',
    nameEn: 'C3 Versatile Medium',
    nameTr: 'C3 Evrensel Orta Hamur',
    color: '#ffd600',
    windowMinC: 100,
    windowMaxC: 130,
    peakC: 115,
    circuitFitEn: 'The universal benchmark. Present at nearly 90% of all Grand Prix weekends.',
    circuitFitTr: 'Evrensel referans hamur. Grand Prix takviminin neredeyse %90\'ında yarış hafta sonunda bulunur.',
    warmupRate: 'Fast',
    warmupRateTr: 'Hızlı',
    degradationResistance: 'Medium',
    degradationResistanceTr: 'Orta',
  },
  {
    code: 'C4',
    nameEn: 'C4 Soft Compound',
    nameTr: 'C4 Yumuşak Hamur',
    color: '#ff1801',
    windowMinC: 90,
    windowMaxC: 120,
    peakC: 105,
    circuitFitEn: 'Low-grip, traction-dominated layouts and street circuits (Monaco, Montreal, Baku).',
    circuitFitTr: 'Düşük tutuşlu, çekiş ağırlıklı ve cadde pistleri (Monako, Montreal, Bakü).',
    warmupRate: 'Fast',
    warmupRateTr: 'Hızlı',
    degradationResistance: 'Low',
    degradationResistanceTr: 'Düşük',
  },
  {
    code: 'C5',
    nameEn: 'C5 Ultra Soft',
    nameTr: 'C5 Ultra Yumuşak Hamur',
    color: '#ff1801',
    windowMinC: 85,
    windowMaxC: 115,
    peakC: 100,
    circuitFitEn: 'Maximum qualifying mechanical grip for low-abrasion street venues (Monaco, Singapore, Vegas).',
    circuitFitTr: 'Düşük aşınmalı cadde pistlerinde sıralama turlarında mutlak mekanik tutuş için (Monako, Singapur, Las Vegas).',
    warmupRate: 'Instant',
    warmupRateTr: 'Anlık',
    degradationResistance: 'Low',
    degradationResistanceTr: 'Düşük',
  },
];

export function TyreThermalWindows() {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const [selectedCode, setSelectedCode] = useState<string>('C3');

  const activeCompound = COMPOUNDS_THERMAL.find((c) => c.code === selectedCode) ?? COMPOUNDS_THERMAL[2];

  // Scale: 70°C to 150°C (range: 80 degrees)
  const toPercent = (temp: number) => {
    const min = 70;
    const max = 150;
    return Math.max(0, Math.min(100, ((temp - min) / (max - min)) * 100));
  };

  const leftPct = toPercent(activeCompound.windowMinC);
  const widthPct = toPercent(activeCompound.windowMaxC) - leftPct;
  const peakPct = toPercent(activeCompound.peakC);

  return (
    <section className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[#090d13] p-5 sm:p-7">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/[0.04] blur-3xl"
      />

      {/* Header */}
      <div className="relative z-10 mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="label-caps font-mono text-[11px] tracking-widest text-amber-400">
              {isTr ? 'TERMAL FİZİK · ÇALIŞMA PENCERELERİ' : 'THERMAL PHYSICS · WORKING WINDOWS'}
            </span>
          </div>
          <h2
            className="font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi sm:text-3xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {isTr ? 'Lastik Sıcaklık Pencereleri ve Aşınma Dinamiği' : 'Tyre Temperature Windows & Wear Physics'}
          </h2>
          <p className="mt-1 text-xs text-text-mid sm:text-sm">
            {isTr
              ? 'Lastik yalnızca aşınmaz; optimum sıcaklık penceresinin dışında kaldığında kimyasal yapısını kaybeder.'
              : 'Formula 1 tyres do not simply wear out — when operated outside their thermal window, chemistry collapses.'}
          </p>
        </div>

        <span className="font-mono text-xs text-text-low">
          PIRELLI F1 // 18-INCH
        </span>
      </div>

      {/* Compound Selector Pills */}
      <div className="relative z-10 mb-6 flex flex-wrap gap-2 border-b border-hairline pb-4">
        {COMPOUNDS_THERMAL.map((c) => {
          const active = c.code === selectedCode;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setSelectedCode(c.code)}
              className={[
                'flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all',
                active
                  ? 'border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-lg'
                  : 'border border-white/5 bg-white/[0.02] text-text-mid hover:border-white/15 hover:text-text-hi',
              ].join(' ')}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span>{c.code}</span>
            </button>
          );
        })}
      </div>

      {/* Thermal Bar Visualizer */}
      <div className="relative z-10 mb-8 rounded-xl border border-white/10 bg-[#0d121a] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-condensed text-xl font-700 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
              {isTr ? activeCompound.nameTr : activeCompound.nameEn}
            </span>
            <p className="text-xs text-text-mid">
              {isTr ? activeCompound.circuitFitTr : activeCompound.circuitFitEn}
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded bg-white/[0.04] px-2.5 py-1 border border-white/5 text-amber-300">
              {isTr ? 'OPTİMUM ARALIK:' : 'OPERATIONAL WINDOW:'} {activeCompound.windowMinC}°C – {activeCompound.windowMaxC}°C
            </span>
          </div>
        </div>

        {/* The Graphic Temperature Scale */}
        <div className="relative my-6 pt-4 pb-2">
          {/* Scale Labels */}
          <div className="flex justify-between font-mono text-[10px] text-text-low mb-1.5">
            <span>70°C (COLD)</span>
            <span>90°C</span>
            <span>110°C</span>
            <span>130°C</span>
            <span>150°C (OVERHEATING)</span>
          </div>

          {/* Background Thermometer Track */}
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-white/[0.04] border border-white/10">
            {/* Cold Zone */}
            <div className="absolute inset-y-0 left-0 w-[18.75%] bg-blue-500/15" />
            {/* Overheat Zone */}
            <div className="absolute inset-y-0 right-0 w-[18.75%] bg-red-600/20" />

            {/* Active Optimal Working Window Range */}
            <div
              className="absolute inset-y-0 rounded-full transition-all duration-500 border border-amber-400/50"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.6))',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
              }}
            />

            {/* Peak Target Marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white transition-all duration-500 shadow-md"
              style={{ left: `${peakPct}%` }}
              title={`Peak Grip: ${activeCompound.peakC}°C`}
            />
          </div>

          {/* Legend pointer */}
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-text-mid">
            <span className="text-blue-400">
              ← {isTr ? 'Soğuk Granüllenme (Graining) Riski' : 'Cold Graining Zone'}
            </span>
            <span className="text-amber-300 font-bold">
              ★ {isTr ? `Zirve Tutuş (Peak): ${activeCompound.peakC}°C` : `Peak Grip: ${activeCompound.peakC}°C`}
            </span>
            <span className="text-red-400">
              {isTr ? 'Aşırı Isınma ve Kabarcıklanma (Blistering) →' : 'Thermal Blistering Zone →'}
            </span>
          </div>
        </div>

        {/* Compound Behaviour Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs pt-3 border-t border-white/5">
          <div className="rounded bg-white/[0.02] p-2.5">
            <span className="block text-[10px] text-text-low">{isTr ? 'ISINMA HIZI' : 'WARM-UP RATE'}</span>
            <span className="font-bold text-text-hi">{isTr ? activeCompound.warmupRateTr : activeCompound.warmupRate}</span>
          </div>
          <div className="rounded bg-white/[0.02] p-2.5">
            <span className="block text-[10px] text-text-low">{isTr ? 'AŞINMA DİRENCİ' : 'DEGRADATION RES.'}</span>
            <span className="font-bold text-emerald-400">{isTr ? activeCompound.degradationResistanceTr : activeCompound.degradationResistance}</span>
          </div>
          <div className="rounded bg-white/[0.02] p-2.5">
            <span className="block text-[10px] text-text-low">{isTr ? 'MİNİMUM EŞİK' : 'MIN TEMP'}</span>
            <span className="font-bold text-text-hi">{activeCompound.windowMinC}°C</span>
          </div>
          <div className="rounded bg-white/[0.02] p-2.5">
            <span className="block text-[10px] text-text-low">{isTr ? 'MAKSİMUM EŞİK' : 'MAX TEMP'}</span>
            <span className="font-bold text-accent">{activeCompound.windowMaxC}°C</span>
          </div>
        </div>
      </div>

      {/* Physics Breakdown: Blistering vs Graining vs Degradation */}
      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Blistering Card */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <h4
              className="font-condensed text-xl font-700 uppercase tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {isTr ? 'Kabarcıklanma (Blistering) Nedir?' : 'Thermal Blistering Physics'}
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-text-mid sm:text-sm">
            {isTr
              ? 'Lastik aşırı zorlandığında veya taban sıcaklığı 140°C üzerine çıktığında karkas içindeki hava ve gazlar genleşir. İç çekirdekteki kauçuk eriyip gaz kabarcıkları yüzeyi parçalayarak krater benzeri delikler açar. Bu mekanik bir aşınma değil, termal patlamadır.'
              : 'When internal tyre carcass temperatures exceed critical limits (>140°C), gases inside the composite vulcanized rubber expand violently. Trapped bubbles escape towards the outer tread, tearing away rubber chunks and creating crater-like fissures. Grip plummets instantaneously.'}
          </p>
        </div>

        {/* Graining Card */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <h4
              className="font-condensed text-xl font-700 uppercase tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {isTr ? 'Granüllenme (Graining) Nedir?' : 'Cold Graining Physics'}
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-text-mid sm:text-sm">
            {isTr
              ? 'Lastik optimum sıcaklığına ulaşamadan (soğukken) yüksek yanal yüke maruz kaldığında araç asfaltta kayar. Yüzeydeki mikroskobik kauçuk parçaları kopar, ancak pist ısısı yetersiz olduğu için erimek yerine küçük topaklar halinde lastik sırtına yeniden yapışır; tutuşu mermer tabakası gibi sıfırlar.'
              : 'Occurs when a cold tyre is subjected to extreme lateral sliding before reaching its minimum operating window. Surface rubber shears off under shear stress, but cannot melt smoothly into the asphalt — forming miniature rubber granules that stick onto the tread, reducing grip like ball bearings.'}
          </p>
        </div>
      </div>
    </section>
  );
}
