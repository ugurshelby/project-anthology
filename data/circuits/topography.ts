/**
 * Curated, editorial topography/telemetry estimates for a few circuits (shown on
 * /circuits/<id> by CircuitElevationProfile). Not official data; the UI says so.
 * Owner editorial review: master-plan 7.2.
 */

export interface TopographyProfile {
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

const TOPOGRAPHY_PROFILE: Record<string, TopographyProfile> = {
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

/** Curated profile for a circuit id (Ergast style, `-` or `_`); null when none is recorded. */
export function getTopographyProfile(circuitId: string): TopographyProfile | null {
  return TOPOGRAPHY_PROFILE[circuitId.toLowerCase().replace(/-/g, '_')] ?? null;
}

/** True when the circuit has a curated profile; the page renders the panel only then. */
export function hasElevationProfile(circuitId: string): boolean {
  return getTopographyProfile(circuitId) !== null;
}
