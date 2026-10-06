'use client';

interface CircuitElevationProfileProps {
  circuitId: string;
  lengthKm?: number;
  corners?: number;
  drsZones?: number;
}

// Curated topography & telemetry profile per circuit
const TOPOGRAPHY_PROFILE: Record<
  string,
  {
    elevationDeltaM: number;
    highestPointM: number;
    lowestPointM: number;
    keyIncline: string;
    keyInclineTr: string;
    gearShifts: number;
    throttlePercent: number;
    brakingSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
    brakingEnergyKj: number;
  }
> = {
  spa: {
    elevationDeltaM: 102,
    highestPointM: 470,
    lowestPointM: 368,
    keyIncline: 'Eau Rouge / Raidillon (+17% gradient compression)',
    keyInclineTr: 'Eau Rouge / Raidillon (+%17 eğim sıkışması)',
    gearShifts: 44,
    throttlePercent: 70,
    brakingSeverity: 'MEDIUM',
    brakingEnergyKj: 1680,
  },
  red_bull_ring: {
    elevationDeltaM: 65,
    highestPointM: 737,
    lowestPointM: 672,
    keyIncline: 'Turn 2 to Turn 3 uphill braking zone',
    keyInclineTr: '2. Virajdan 3. Viraja dik yokuş yukarı frenleme',
    gearShifts: 38,
    throttlePercent: 77,
    brakingSeverity: 'HIGH',
    brakingEnergyKj: 1950,
  },
  monaco: {
    elevationDeltaM: 42,
    highestPointM: 46,
    lowestPointM: 4,
    keyIncline: 'Sainte Dévote to Beau Rivage (+8% crest to Casino)',
    keyInclineTr: 'Sainte Dévote - Beau Rivage tırmanışı (+%8 Casino zirvesi)',
    gearShifts: 54,
    throttlePercent: 34,
    brakingSeverity: 'MEDIUM',
    brakingEnergyKj: 1120,
  },
  interlagos: {
    elevationDeltaM: 43,
    highestPointM: 805,
    lowestPointM: 762,
    keyIncline: 'Junção uphill compression to pit straight',
    keyInclineTr: 'Junção yokuş çıkışı ve ana düzlük tırmanışı',
    gearShifts: 42,
    throttlePercent: 71,
    brakingSeverity: 'MEDIUM',
    brakingEnergyKj: 1540,
  },
  americas: {
    elevationDeltaM: 41,
    highestPointM: 156,
    lowestPointM: 115,
    keyIncline: 'Turn 1 blind apex climb (11-storey elevation rise)',
    keyInclineTr: '1. Viraj kör apeks tırmanışı (11 katlı bina yüksekliği)',
    gearShifts: 58,
    throttlePercent: 62,
    brakingSeverity: 'HIGH',
    brakingEnergyKj: 1840,
  },
  suzuka: {
    elevationDeltaM: 40,
    highestPointM: 67,
    lowestPointM: 27,
    keyIncline: 'Dunlop Curve crest to Degner dip',
    keyInclineTr: 'Dunlop virajı zirvesinden Degner çukuruna iniş',
    gearShifts: 48,
    throttlePercent: 68,
    brakingSeverity: 'LOW',
    brakingEnergyKj: 1320,
  },
  silverstone: {
    elevationDeltaM: 11,
    highestPointM: 158,
    lowestPointM: 147,
    keyIncline: 'Rolling airfield contours through Becketts complex',
    keyInclineTr: 'Hava üssü dalgalanmaları ve Becketts kombinesi',
    gearShifts: 40,
    throttlePercent: 72,
    brakingSeverity: 'LOW',
    brakingEnergyKj: 1180,
  },
  monza: {
    elevationDeltaM: 13,
    highestPointM: 184,
    lowestPointM: 171,
    keyIncline: 'Slight descent into Ascari chicane',
    keyInclineTr: 'Ascari şikanına doğru hafif iniş',
    gearShifts: 36,
    throttlePercent: 78,
    brakingSeverity: 'HIGH',
    brakingEnergyKj: 2150,
  },
  zandvoort: {
    elevationDeltaM: 15,
    highestPointM: 18,
    lowestPointM: 3,
    keyIncline: 'Arie Luyendykbocht (19° extreme dune banking)',
    keyInclineTr: 'Arie Luyendykbocht (19° ekstrem kumul eğimi)',
    gearShifts: 46,
    throttlePercent: 65,
    brakingSeverity: 'MEDIUM',
    brakingEnergyKj: 1460,
  },
  baku: {
    elevationDeltaM: 26,
    highestPointM: 2,
    lowestPointM: -24,
    keyIncline: 'Caspian sea depression to Old City Fortress climb',
    keyInclineTr: 'Hazar Denizi çukurundan Eski Şehir Kalesi tırmanışı',
    gearShifts: 62,
    throttlePercent: 66,
    brakingSeverity: 'HIGH',
    brakingEnergyKj: 2280,
  },
};

export function CircuitElevationProfile({
  circuitId,
  lengthKm = 5.2,
  corners = 16,
  drsZones = 2,
}: CircuitElevationProfileProps) {
  const norm = circuitId.toLowerCase().replace(/-/g, '_');
  const profile = TOPOGRAPHY_PROFILE[norm] || {
    elevationDeltaM: 22,
    highestPointM: 120,
    lowestPointM: 98,
    keyIncline: 'Undulating sector transitions',
    keyInclineTr: 'Dalgalı sektör geçişleri',
    gearShifts: 46,
    throttlePercent: 65,
    brakingSeverity: 'MEDIUM',
    brakingEnergyKj: 1500,
  };

  const severityColor =
    profile.brakingSeverity === 'HIGH'
      ? '#ff3b30'
      : profile.brakingSeverity === 'MEDIUM'
        ? '#fecb00'
        : '#00d26a';

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-hairline bg-surface p-5 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="label-caps text-accent text-[11px] tracking-widest font-mono">
              TELEMETRY & TOPOGRAPHY · TELEMETRİ & İRTİFA
            </span>
          </div>
          <h3 className="font-condensed text-xl font-700 uppercase tracking-tight text-text-hi md:text-2xl">
            Pist Topoğrafyası ve Mühendislik İndeksi
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-xs text-text-mid">
            {lengthKm} km · {corners} Viraj
          </span>
          <span className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-xs text-text-mid">
            {drsZones} DRS Bölgesi
          </span>
        </div>
      </div>

      {/* Grid of Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {/* Elevation Delta */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">İRTİFA FARKI</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-condensed text-2xl font-700 text-text-hi md:text-3xl">
              ±{profile.elevationDeltaM}
            </span>
            <span className="font-mono text-xs text-text-mid">metre</span>
          </div>
          <span className="mt-1 block truncate text-[11px] text-text-low font-mono">
            {profile.lowestPointM}m → {profile.highestPointM}m
          </span>
        </div>

        {/* Full Throttle */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">TAM GAZ ORANI</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-condensed text-2xl font-700 text-text-hi md:text-3xl">
              %{profile.throttlePercent}
            </span>
            <span className="font-mono text-xs text-text-mid">tur boyu</span>
          </div>
          {/* Visual Mini Progress */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${profile.throttlePercent}%` }}
            />
          </div>
        </div>

        {/* Gear Shifts */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">VİTES DEĞİŞİMİ</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-condensed text-2xl font-700 text-text-hi md:text-3xl">
              ~{profile.gearShifts}
            </span>
            <span className="font-mono text-xs text-text-mid">vites / tur</span>
          </div>
          <span className="mt-1 block text-[11px] text-text-low font-mono">
            Şanzıman yükü indeksi
          </span>
        </div>

        {/* Braking Severity */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">FREN SERTLİĞİ</span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="font-condensed text-2xl font-700 md:text-3xl"
              style={{ color: severityColor }}
            >
              {profile.brakingSeverity}
            </span>
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: severityColor }}
            />
          </div>
          <span className="mt-1 block text-[11px] text-text-low font-mono">
            {profile.brakingEnergyKj} kJ fren enerjisi
          </span>
        </div>
      </div>

      {/* Signature Incline Feature Card */}
      <div className="mt-4 flex flex-col justify-between gap-2 rounded-[12px] border border-hairline bg-white/[0.02] p-3.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase text-accent">İmza Eğimi:</span>
          <span className="font-mono text-xs text-text-hi">{profile.keyInclineTr}</span>
        </div>
        <span className="font-mono text-[11px] text-text-low">
          Topografik telemetri kaynak: FIA Circuit Homologation
        </span>
      </div>
    </div>
  );
}
