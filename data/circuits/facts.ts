/**
 * Circuit characteristics — a curated, static reference per Ergast circuitId.
 *
 * These are stable historical facts (layout character, lap record, corner count,
 * the signature corner, what makes the track distinctive). They don't change race
 * to race, so they live here as a tracked module rather than in the DB — the
 * detail page reads them with zero API dependency and degrades gracefully when a
 * circuit isn't listed.
 */

import { CIRCUIT_FACTS_TR } from './facts.tr';

export interface CircuitFacts {
  /** Latitude of the circuit (decimal degrees) — used for the live weather panel. */
  lat?: number;
  /** Longitude of the circuit (decimal degrees) — used for the live weather panel. */
  lon?: number;
  /** IANA timezone name (e.g. "Europe/Monaco") — circuit-local session/race time display. */
  timeZone?: string;
  /** Circuit length in km. */
  lengthKm?: number;
  /** Number of corners. */
  corners?: number;
  /** DRS zones on the current layout. */
  drsZones?: number;
  /** Year of the first F1 World Championship race here. */
  firstGp?: number;
  /** Outright F1 lap record: "time — driver (year)". */
  lapRecord?: string;
  /** A short tag for the track's character. */
  character?: string;
  /** The signature corner / sector. */
  signatureCorner?: string;
  /** 1–2 sentence editorial note on what defines the circuit. */
  note?: string;
}

export const CIRCUIT_FACTS: Record<string, CircuitFacts> = {
  albert_park: {
    lat: -37.8497, lon: 144.968, timeZone: 'Australia/Melbourne',
    lengthKm: 5.278, corners: 14, drsZones: 4, firstGp: 1996,
    lapRecord: '1:19.813 — Leclerc (2024)',
    character: 'Semi-street · Low Green Grip · High Evolution',
    signatureCorner: 'Turns 9–10 Sweep (245 km/h · 4.2G)',
    note: 'Semi-street asphalt around a public park lake with low initial friction. The removal of the old Clark chicane unlocked a continuous full-throttle sweep into the high-G Turns 9–10 transition, where lateral tyre loads spike before heavy deceleration into Turn 11.',
  },
  bahrain: {
    lat: 26.0325, lon: 50.5106, timeZone: 'Asia/Bahrain',
    lengthKm: 5.412, corners: 15, drsZones: 3, firstGp: 2004,
    lapRecord: '1:31.447 — de la Rosa (2005)',
    character: 'Heavy Longitudinal Braking · Abrasive Granite',
    signatureCorner: 'Turn 1 Hairpin & Turn 10 Off-Camber',
    note: 'Brutal thermal tyre degradation on coarse granite aggregate mixed with desert dust. Four major deceleration zones—decelerating from 330 km/h down to 65 km/h into Turn 1—punish carbon disc temperatures, while the downhill off-camber Turn 10 regularly locks the unloaded front-left wheel.',
  },
  jeddah: {
    lat: 21.6319, lon: 39.1044, timeZone: 'Asia/Riyadh',
    lengthKm: 6.174, corners: 27, drsZones: 3, firstGp: 2021,
    lapRecord: '1:30.734 — Hamilton (2021)',
    character: 'Blind High-Speed Street · Ultra-High Lateral Energy',
    signatureCorner: 'Turns 22–23 Wall-Lined Chute (250 km/h)',
    note: 'Average lap velocity exceeds 250 km/h between unforgiving SAFER barriers. Continuous blind fifth- and sixth-gear sweeps demand maximum underfloor aerodynamic seal and stiff damper travel, leaving zero runoff for any millimetre of steering micro-correction.',
  },
  shanghai: {
    lat: 31.3389, lon: 121.22, timeZone: 'Asia/Shanghai',
    lengthKm: 5.451, corners: 16, drsZones: 2, firstGp: 2004,
    lapRecord: '1:32.238 — Hamilton (2024)',
    character: 'Front-Limited · Decreasing Radius · 1.2km Straight',
    signatureCorner: 'Turns 1–2 Snail Complex & Turn 13 Banking',
    note: 'The 270-degree tightening opening spiral loads the front-left tyre for several continuous seconds, causing severe thermal graining before feeding onto a 1.2-kilometre back straight where cars hit 340 km/h before the 6G deceleration into Turn 14.',
  },
  suzuka: {
    lat: 34.8431, lon: 136.541, timeZone: 'Asia/Tokyo',
    lengthKm: 5.807, corners: 18, drsZones: 2, firstGp: 1987,
    lapRecord: '1:30.983 — Hamilton (2019)',
    character: 'Figure-Eight · Aero Benchmark · Extreme Lateral G',
    signatureCorner: 'Sector 1 Esses & 130R (305 km/h flat out)',
    note: 'The premier global benchmark for high-downforce aerodynamic efficiency. The continuous uphill direction changes through the Esses ruthlessly expose front-axle laziness, while the 305 km/h 130R left-hander generates sustained lateral loads exceeding 4.5G.',
  },
  miami: {
    lat: 25.9581, lon: -80.2389, timeZone: 'America/New_York',
    lengthKm: 5.412, corners: 19, drsZones: 3, firstGp: 2022,
    lapRecord: '1:29.708 — Verstappen (2023)',
    character: 'Low Drag Straights · Technical Tight Underpass',
    signatureCorner: 'Turns 14–15 Kerb Chicanes',
    note: 'A conflicting setup compromise: low wing profiles are mandatory for 340 km/h terminal velocities down the perimeter straights, but the bumpy slow-speed chicane underneath the turnpike highway punishes stiff mechanical springs and demands compliant ride height.',
  },
  imola: {
    lat: 44.3439, lon: 11.7167, timeZone: 'Europe/Rome',
    lengthKm: 4.909, corners: 19, drsZones: 2, firstGp: 1980,
    lapRecord: '1:15.484 — Hamilton (2020)',
    character: 'Old-School Undulation · Kerb-Riding · Anti-Clockwise',
    signatureCorner: 'Acque Minerali & Piratella Drop',
    note: 'An anti-clockwise parkland rollercoaster featuring aggressive serrated kerbs and blind crests. Chassis balance through Acque Minerali requires front compliance over the kerbs without upsetting floor venturi tunnels, with track position outweighing overtaking opportunity.',
  },
  monaco: {
    lat: 43.7347, lon: 7.42056, timeZone: 'Europe/Monaco',
    lengthKm: 3.337, corners: 19, drsZones: 1, firstGp: 1950,
    lapRecord: '1:12.909 — Hamilton (2021)',
    character: 'Maximum Mechanical Grip · Maximum Steering Lock',
    signatureCorner: 'Fairmont Hairpin (45 km/h) & Tunnel Exit (285 km/h)',
    note: 'Maximum wing angles, softened anti-roll bars, and bespoke steering geometry for the 45 km/h Fairmont hairpin. The lap transitions abruptly from the dark, flat-out tunnel into the blind downhill braking zone of the Nouvelle Chicane, where wheel hubs skim steel armco barriers.',
  },
  villeneuve: {
    lat: 45.5, lon: -73.5228, timeZone: 'America/Toronto',
    lengthKm: 4.361, corners: 14, drsZones: 3, firstGp: 1978,
    lapRecord: '1:13.078 — Bottas (2019)',
    character: 'Stop-and-Go · High Brake Duty · Low Downforce',
    signatureCorner: 'Wall of Champions (Turn 13–14 Exit)',
    note: 'Severe longitudinal stress on brake callipers alternating with long straights that allow low cooling airflow recovery. Launching off the high apex kerbs of the final chicane places the outer wheel rims within centimetres of the Wall of Champions at 200 km/h.',
  },
  catalunya: {
    lat: 41.57, lon: 2.26111, timeZone: 'Europe/Madrid',
    lengthKm: 4.657, corners: 14, drsZones: 2, firstGp: 1991,
    lapRecord: '1:16.330 — Verstappen (2023)',
    character: 'Aerodynamic Litmus Test · High Tyre Carcass Shear',
    signatureCorner: 'Turn 3 Long Loaded Right-Hander',
    note: 'The ultimate real-world aerodynamic proving ground. The sustained high-G right-hander at Turn 3 leans violently on the front-left tyre sidewall, immediately separating genuine underfloor downforce from draggy, top-surface aerodynamic patches.',
  },
  red_bull_ring: {
    lat: 47.2197, lon: 14.7647, timeZone: 'Europe/Vienna',
    lengthKm: 4.318, corners: 10, drsZones: 3, firstGp: 1970,
    lapRecord: '1:05.619 — Sainz (2020)',
    character: 'Short Lap Sprint · 65m Climb · Heavy Kerb Shock',
    signatureCorner: 'Turn 3 Uphill Crest & Turn 9–10 Drops',
    note: 'A sub-65-second mountain sprint with three heavy braking zones terminating uphill acceleration runs. Steep curb strikes in the final two corners hammer carbon-fibre suspension pushrods, while 650 metres of elevation reduces air density and forces turbos to spin at higher RPM.',
  },
  silverstone: {
    lat: 52.0786, lon: -1.01694, timeZone: 'Europe/London',
    lengthKm: 5.891, corners: 18, drsZones: 2, firstGp: 1950,
    lapRecord: '1:27.097 — Verstappen (2020)',
    character: 'High-Downforce Temple · Lateral G Peaks · Wind Sensitivity',
    signatureCorner: 'Maggotts–Becketts–Chapel Complex (290 km/h · 5.1G)',
    note: 'Cold winds across the former airfield combine with ultra-abrasive tarmac to produce immense tyre carcass shear loads. The Maggotts-Becketts-Chapel high-speed switchback generates sustained 5G forces, demanding absolute underfloor floor seal and precise front-end bite.',
  },
  hungaroring: {
    lat: 47.5789, lon: 19.2486, timeZone: 'Europe/Budapest',
    lengthKm: 4.381, corners: 14, drsZones: 2, firstGp: 1986,
    lapRecord: '1:16.627 — Hamilton (2020)',
    character: 'Monaco-Spec Aero · Non-Stop Steering Angle · Thermal Trap',
    signatureCorner: 'Turn 4 Blind Downhill Left & Turn 11 Sweeper',
    note: 'Maximum downforce packages paired with suffocating midsummer ambient heat. With virtually no long straight to cool brake discs or tyre treads, non-stop steering inputs elevate surface temperatures, making qualifying clean air and aerodynamic track position paramount.',
  },
  spa: {
    lat: 50.4372, lon: 5.97139, timeZone: 'Europe/Brussels',
    lengthKm: 7.004, corners: 19, drsZones: 2, firstGp: 1950,
    lapRecord: '1:46.286 — Pérez (2024)',
    character: '102m Elevation · Microclimate Volatility · Downforce Compromise',
    signatureCorner: 'Eau Rouge–Raidillon Compression (1.7G Vertical)',
    note: '102 metres of topography across 7.004 kilometres through the Ardennes. The compression at the bottom of Eau Rouge forces 1.7G vertical loads down through chassis skids before cresting blind, locking teams into a painful compromise between Sector 2 downforce and Kemmel straight speed.',
  },
  zandvoort: {
    lat: 52.3888, lon: 4.54092, timeZone: 'Europe/Amsterdam',
    lengthKm: 4.259, corners: 14, drsZones: 2, firstGp: 1952,
    lapRecord: '1:11.097 — Hamilton (2021)',
    character: '19-Degree Banking · Dunes Elevation · Sand Deposition',
    signatureCorner: 'Turn 3 Hugenholtz & Turn 14 Luyendyk Bankings',
    note: '19-degree progressive banking at Turn 3 (Hugenholtz) and Turn 14 compresses car and tyre carcasses into the asphalt, enabling novel side-by-side racing lines while North Sea gusting winds deposit a fine layer of abrasive dune sand across the apex.',
  },
  monza: {
    lat: 45.6156, lon: 9.28111, timeZone: 'Europe/Rome',
    lengthKm: 5.793, corners: 11, drsZones: 2, firstGp: 1950,
    lapRecord: '1:21.046 — Barrichello (2004)',
    character: 'Minimum Drag Trim · 75% Full Throttle · 350+ km/h',
    signatureCorner: 'Prima Variante Deceleration (350 → 70 km/h) & Curva Grande',
    note: 'Shaved rear wing flaps and stripped aerodynamic profiles create maximum straight-line speeds exceeding 350 km/h. Over 75% of the lap spent at full throttle tests internal combustion reliability, while aggressive kerb-riding over the chicanes threatens ground-effect venturi floors.',
  },
  baku: {
    lat: 40.3725, lon: 49.8533, timeZone: 'Asia/Baku',
    lengthKm: 6.003, corners: 20, drsZones: 2, firstGp: 2016,
    lapRecord: '1:43.009 — Leclerc (2019)',
    character: 'Aerodynamic Dichotomy · 2.2km Full Throttle · Medieval Bottle-Neck',
    signatureCorner: 'Turn 8 Castle Section (7.6m width) & Turn 1 Braking',
    note: 'The widest aerodynamic contradiction in modern racing. Teams must strip wing levels for the 350 km/s blast along the Caspian boulevard while trying to keep sufficient mechanical grip to thread a 2-metre-wide car through the medieval 7.6-metre bottleneck of Turn 8.',
  },
  marina_bay: {
    lat: 1.2914, lon: 103.864, timeZone: 'Asia/Singapore',
    lengthKm: 4.94, corners: 19, drsZones: 3, firstGp: 2008,
    lapRecord: '1:34.486 — Hamilton (2023)',
    character: 'Tropical Night Humidity · 60+ Shifts/Lap · High Thermal Stress',
    signatureCorner: 'Turns 1–3 Switchback & Singapore Sling Redesign',
    note: 'Cockpit temperatures exceeding 50°C and 80% tropical humidity. Over 60 gear shifts per lap on uneven civic street tarmac drain driver stamina, while repeated second-gear acceleration exits spike rear tyre carcass temperatures beyond the working window.',
  },
  americas: {
    lat: 30.1328, lon: -97.6411, timeZone: 'America/Chicago',
    lengthKm: 5.513, corners: 20, drsZones: 2, firstGp: 2012,
    lapRecord: '1:36.169 — Leclerc (2019)',
    character: '41m Elevation Crest · Rapid Direction Switchbacks · Bumpy Base',
    signatureCorner: 'Turn 1 Blind Uphill Hairpin & Sector 1 Esses',
    note: 'A 41-metre climb up to a blind, off-camber hairpin at Turn 1 tests braking feel on entry. Sector 1 switchbacks borrow the flow of Becketts, creating sustained 4.5G lateral oscillations over unsettled ground that punish stiff floor setups.',
  },
  rodriguez: {
    lat: 19.4042, lon: -99.0907, timeZone: 'America/Mexico_City',
    lengthKm: 4.304, corners: 17, drsZones: 3, firstGp: 1963,
    lapRecord: '1:17.774 — Bottas (2021)',
    character: '2,285m Altitude · 25% Thinner Air · Max Wing, Monza Speeds',
    signatureCorner: 'Foro Sol Stadium Arena & Turn 1 Braking',
    note: 'At 2,285 metres above sea level, ambient air density drops by 25%. Cars run maximum Monaco-size wings yet register Monza-level top speeds exceeding 350 km/h due to minimal air resistance, while power units, turbochargers, and brake calipers struggle for cooling mass.',
  },
  interlagos: {
    lat: -23.7036, lon: -46.6997, timeZone: 'America/Sao_Paulo',
    lengthKm: 4.309, corners: 15, drsZones: 2, firstGp: 1973,
    lapRecord: '1:10.540 — Bottas (2018)',
    character: 'Anti-Clockwise Natural Bowl · Rapid Elevation · Weather Crossroads',
    signatureCorner: 'Senna S Downhill Camber (Turns 1–2) & Junção',
    note: 'A compact natural amphitheatre perched at 780 metres altitude. The off-camber downhill drop through the Senna S severely tests front-axle bite and driver balance, while the long full-throttle climb out of Junção onto the main straight leaves engines starved of thick oxygen.',
  },
  vegas: {
    lat: 36.1147, lon: -115.173, timeZone: 'America/Los_Angeles',
    lengthKm: 6.201, corners: 17, drsZones: 2, firstGp: 2023,
    lapRecord: '1:35.490 — Piastri (2024)',
    character: 'Sub-15°C Night Cold · 1.9km Strip Straight · Low Micro-Roughness',
    signatureCorner: 'Turn 14 Heavy Braking after 350 km/h Strip Blast',
    note: 'Midnight track temperatures tumbling below 15°C combined with low-abrasion public street asphalt create a severe tyre warm-up conundrum. The 1.9-kilometre Strip straight sheds tyre surface temperature, risking severe front locking and tyre graining into Turn 14.',
  },
  losail: {
    lat: 25.49, lon: 51.4542, timeZone: 'Asia/Qatar',
    lengthKm: 5.419, corners: 16, drsZones: 1, firstGp: 2021,
    lapRecord: '1:22.384 — Verstappen (2024)',
    character: 'Relentless High-Speed Sweepers · Pyramid Kerb Fatigue · Lateral Load',
    signatureCorner: 'Turns 12–14 Triple-Apex High-G Sweep',
    note: 'Continuous medium- and high-speed loaded sweeps with virtually no braking relief subject drivers to sustained lateral loads above 4G. Aggressive 50mm pyramid kerbs impart heavy structural vibrations through tyre carcasses, creating extreme sidewall fatigue.',
  },
  yas_marina: {
    lat: 24.4672, lon: 54.6031, timeZone: 'Asia/Dubai',
    lengthKm: 5.281, corners: 16, drsZones: 2, firstGp: 2009,
    lapRecord: '1:26.103 — Verstappen (2021)',
    character: 'Day-to-Night Thermal Shift · Traction Demands · Modified Flow',
    signatureCorner: 'Turn 5 Hairpin & Turn 9 Banked Sweeper',
    note: 'A day-into-night twilight race where track surface temperatures fall by up to 10°C over the race distance, shifting chassis balance toward oversteer. The redesigned flowing sweeps into Sector 2 feed technical low-speed hotel corners that prioritize mechanical rear traction.',
  },
  madring: {
    lat: 40.4675, lon: -3.5953, timeZone: 'Europe/Madrid',
    lengthKm: 5.474, corners: 22, drsZones: 2, firstGp: 2026,
    character: 'Hybrid Urban Circuit · Steeply Banked Turn · Low-G Technical Links',
    signatureCorner: 'Banked Turn 4 & Valdebebas Complex',
    note: 'A hybrid circuit weaving between IFEMA exhibition grounds and surrounding highway links. A steep banked Turn 4 and heavy deceleration zones throughout the Valdebebas technical loop challenge adaptive suspension damping and longitudinal mechanical traction under high aero loads.',
  },
  sepang: {
    lat: 2.7608, lon: 101.738, timeZone: 'Asia/Kuala_Lumpur',
    lengthKm: 5.543, corners: 15, drsZones: 2, firstGp: 1999,
    lapRecord: '1:34.080 — Vettel (2017)',
    character: 'Ultra-Wide Track · Twin 1km Straights · Equatorial Humidity',
    signatureCorner: 'Turns 5–6 High-G Sweeps & Turn 14 Hairpin',
    note: 'Vast track widths and twin 1-kilometre straights linked by a tight hairpin. Tropical ambient humidity pushes cooling radiators to thermal boundaries, while the fast, flowing changes of direction in Turns 5–6 impose severe lateral stress on the front-left compound.',
  },
};

export function getCircuitFacts(circuitId: string | undefined | null, locale?: string): CircuitFacts | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  const facts = CIRCUIT_FACTS[id] ?? null;
  if (!facts || locale !== 'tr') return facts;
  return { ...facts, ...(CIRCUIT_FACTS_TR[id] ?? {}) };
}
