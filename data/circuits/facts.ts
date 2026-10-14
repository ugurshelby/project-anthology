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
    character: 'Semi-street · Low grip early · Fast track evolution',
    signatureCorner: 'Turns 9–10 sweep',
    note: 'Public roads around Albert Park Lake, slippery until rubber goes down over the weekend. The 2022 redesign removed a slow chicane and turned the back of the lap into one long flat-out run, so the fast Turns 9–10 sweep now arrives at much higher speed.',
  },
  bahrain: {
    lat: 26.0325, lon: 50.5106, timeZone: 'Asia/Bahrain',
    lengthKm: 5.412, corners: 15, drsZones: 3, firstGp: 2004,
    lapRecord: '1:31.447 — de la Rosa (2005)',
    character: 'Heavy braking · Abrasive surface · Rear traction',
    signatureCorner: 'Turn 1 hairpin & Turn 10',
    note: 'An abrasive surface and wind-blown desert sand wear the rear tyres quickly. Four big stops, Turn 1 the hardest, drive brake temperatures up, and the downhill left at Turn 10 is the classic place to lock the unloaded front-left.',
  },
  jeddah: {
    lat: 21.6319, lon: 39.1044, timeZone: 'Asia/Riyadh',
    lengthKm: 6.174, corners: 27, drsZones: 3, firstGp: 2021,
    lapRecord: '1:30.734 — Hamilton (2021)',
    character: 'Fast street circuit · Blind corners · Walls everywhere',
    signatureCorner: 'Turns 22–23',
    note: 'The fastest street circuit in Formula 1: a chain of blind fifth- and sixth-gear kinks between concrete walls with almost no run-off. The car must be stable at speed, because a small correction quickly becomes a wall.',
  },
  shanghai: {
    lat: 31.3389, lon: 121.22, timeZone: 'Asia/Shanghai',
    lengthKm: 5.451, corners: 16, drsZones: 2, firstGp: 2004,
    lapRecord: '1:32.238 — Hamilton (2024)',
    character: 'Front-limited · Tightening corners · 1.2 km back straight',
    signatureCorner: 'Turns 1–2 spiral',
    note: 'The opening spiral keeps tightening, loading the front-left tyre for several seconds and inviting graining. The back straight, about 1.2 km long, ends in the hardest stop of the lap at the Turn 14 hairpin.',
  },
  suzuka: {
    lat: 34.8431, lon: 136.541, timeZone: 'Asia/Tokyo',
    lengthKm: 5.807, corners: 18, drsZones: 2, firstGp: 1987,
    lapRecord: '1:30.983 — Hamilton (2019)',
    character: 'Figure of eight · Aero benchmark · Fast changes of direction',
    signatureCorner: 'Esses & 130R',
    note: 'The benchmark for a high-downforce car. The uphill Esses expose any lazy front end through a string of direction changes, and the fast left-hander at 130R asks for commitment and a stable platform at very high speed.',
  },
  miami: {
    lat: 25.9581, lon: -80.2389, timeZone: 'America/New_York',
    lengthKm: 5.412, corners: 19, drsZones: 3, firstGp: 2022,
    lapRecord: '1:29.708 — Verstappen (2023)',
    character: 'Low drag · Long straights · Slow, bumpy chicane',
    signatureCorner: 'Turns 14–15 chicane',
    note: 'A setup compromise: low wing for the long straights, yet the tight Turns 14–15 chicane is slow and bumpy and punishes a stiff car. Teams trade top speed against ride compliance.',
  },
  imola: {
    lat: 44.3439, lon: 11.7167, timeZone: 'Europe/Rome',
    lengthKm: 4.909, corners: 19, drsZones: 2, firstGp: 1980,
    lapRecord: '1:15.484 — Hamilton (2020)',
    character: 'Old school · Kerb riding · Anti-clockwise',
    signatureCorner: 'Acque Minerali & Piratella',
    note: 'An anti-clockwise run through parkland with aggressive kerbs and blind crests. Acque Minerali needs a car that rides the kerbs without upsetting the floor, and with little room to pass, track position counts for more than race pace.',
  },
  monaco: {
    lat: 43.7347, lon: 7.42056, timeZone: 'Europe/Monaco',
    lengthKm: 3.337, corners: 19, drsZones: 1, firstGp: 1950,
    lapRecord: '1:12.909 — Hamilton (2021)',
    character: 'Maximum downforce · Maximum steering lock · Barriers inches away',
    signatureCorner: 'Fairmont hairpin & tunnel',
    note: 'Maximum wing, a soft set-up and special steering geometry for the Fairmont hairpin, the slowest corner in Formula 1. The lap runs from the flat-out tunnel straight into the braking zone for the Nouvelle Chicane, with the barriers inches away all the way round.',
  },
  villeneuve: {
    lat: 45.5, lon: -73.5228, timeZone: 'America/Toronto',
    lengthKm: 4.361, corners: 14, drsZones: 3, firstGp: 1978,
    lapRecord: '1:13.078 — Bottas (2019)',
    character: 'Stop-go · Hard on brakes · Low downforce',
    signatureCorner: 'Wall of Champions (final chicane)',
    note: 'Long straights into hard stops make it one of the toughest tracks of the year on brakes. Drivers take a lot of kerb at the final chicane, and the exit leaves the right-side wheels inches from the Wall of Champions.',
  },
  catalunya: {
    lat: 41.57, lon: 2.26111, timeZone: 'Europe/Madrid',
    lengthKm: 4.657, corners: 14, drsZones: 2, firstGp: 1991,
    lapRecord: '1:16.330 — Verstappen (2023)',
    character: 'Aero benchmark · High tyre load',
    signatureCorner: 'Turn 3 long right-hander',
    note: 'The test track every team knows by heart. The long, loaded right-hander at Turn 3 leans on the front-left tyre and shows at once whether a car’s downforce is real.',
  },
  red_bull_ring: {
    lat: 47.2197, lon: 14.7647, timeZone: 'Europe/Vienna',
    lengthKm: 4.318, corners: 10, drsZones: 3, firstGp: 1970,
    lapRecord: '1:05.619 — Sainz (2020)',
    character: 'Short lap · Steep climbs · Kerb strikes',
    signatureCorner: 'Turn 3 uphill & Turns 9–10',
    note: 'One of the shortest laps of the year, around 65 seconds. Three heavy braking zones end uphill runs, the kerbs in the last two corners punish the suspension, and at nearly 700 metres above sea level the thinner air costs downforce and cooling.',
  },
  silverstone: {
    lat: 52.0786, lon: -1.01694, timeZone: 'Europe/London',
    lengthKm: 5.891, corners: 18, drsZones: 2, firstGp: 1950,
    lapRecord: '1:27.097 — Verstappen (2020)',
    character: 'High speed · High lateral load · Wind-sensitive',
    signatureCorner: 'Maggotts–Becketts–Chapel',
    note: 'A former airfield, open to the wind, on an abrasive surface. The Maggotts–Becketts–Chapel sequence is one of the great tests of high-speed change of direction and needs a stable floor and a sharp front end.',
  },
  hungaroring: {
    lat: 47.5789, lon: 19.2486, timeZone: 'Europe/Budapest',
    lengthKm: 4.381, corners: 14, drsZones: 2, firstGp: 1986,
    lapRecord: '1:16.627 — Hamilton (2020)',
    character: 'Monaco-style downforce · Constant steering · Summer heat',
    signatureCorner: 'Turn 4 blind left & Turn 11',
    note: 'Maximum downforce in midsummer heat. With almost no straight to cool the brakes or tyres and the wheel always turned, temperatures climb; qualifying position and clean air decide most races.',
  },
  spa: {
    lat: 50.4372, lon: 5.97139, timeZone: 'Europe/Brussels',
    lengthKm: 7.004, corners: 19, drsZones: 2, firstGp: 1950,
    lapRecord: '1:46.286 — Pérez (2024)',
    character: 'Big elevation change · Changeable weather · Downforce compromise',
    signatureCorner: 'Eau Rouge–Raidillon',
    note: 'The longest lap on the calendar, 7.004 km through the Ardennes with about 100 metres of elevation change. The compression at the bottom of Eau Rouge drives the car into the track before a blind crest, and teams must trade downforce for the twisty middle sector against speed on the Kemmel straight.',
  },
  zandvoort: {
    lat: 52.3888, lon: 4.54092, timeZone: 'Europe/Amsterdam',
    lengthKm: 4.259, corners: 14, drsZones: 2, firstGp: 1952,
    lapRecord: '1:11.097 — Hamilton (2021)',
    character: 'Banked corners · Dunes · Sand on the track',
    signatureCorner: 'Turn 3 (Hugenholtz) & Turn 14 (Luyendyk)',
    note: 'Banked corners at Turn 3 (19 degrees) and the final Turn 14 (18 degrees) let drivers try more than one line on a narrow, old-school track in the dunes, while sea wind blows sand across the surface.',
  },
  monza: {
    lat: 45.6156, lon: 9.28111, timeZone: 'Europe/Rome',
    lengthKm: 5.793, corners: 11, drsZones: 2, firstGp: 1950,
    lapRecord: '1:21.046 — Barrichello (2004)',
    character: 'Minimum drag · Mostly full throttle · Top speed',
    signatureCorner: 'Prima Variante & Curva Grande',
    note: 'Teams bring their thinnest wings for straight-line speeds of around 350 km/h, with roughly three quarters of the lap at full throttle. Hard braking into the chicanes and heavy kerb use test the floor and the brakes.',
  },
  baku: {
    lat: 40.3725, lon: 49.8533, timeZone: 'Asia/Baku',
    lengthKm: 6.003, corners: 20, drsZones: 2, firstGp: 2016,
    lapRecord: '1:43.009 — Leclerc (2019)',
    character: 'Low drag vs. tight corners · 2.2 km flat out · Castle section',
    signatureCorner: 'Turn 8 castle section',
    note: 'The widest speed range of any street track. Teams trim the wings for a flat-out run of about 2.2 km along the seafront but still need grip to thread the car through the old-town castle section at Turn 8, about 7.6 metres wide.',
  },
  marina_bay: {
    lat: 1.2914, lon: 103.864, timeZone: 'Asia/Singapore',
    lengthKm: 4.94, corners: 19, drsZones: 3, firstGp: 2008,
    lapRecord: '1:34.486 — Hamilton (2023)',
    character: 'Night race · Heat and humidity · Bumpy streets',
    signatureCorner: 'Turns 1–3',
    note: 'A physically brutal night race: heat and humidity over a long, bumpy street lap with constant gear changes. The many slow exits load the rear tyres and push them out of their working window.',
  },
  americas: {
    lat: 30.1328, lon: -97.6411, timeZone: 'America/Chicago',
    lengthKm: 5.513, corners: 20, drsZones: 2, firstGp: 2012,
    lapRecord: '1:36.169 — Leclerc (2019)',
    character: 'Steep climb to Turn 1 · Fast esses · Bumpy surface',
    signatureCorner: 'Turn 1 & Sector 1 esses',
    note: 'A climb of about 41 metres leads to a blind, wide Turn 1, a hard place to judge braking. The first-sector esses are modelled on Silverstone’s Maggotts–Becketts, and the bumpy surface punishes a car run too low.',
  },
  rodriguez: {
    lat: 19.4042, lon: -99.0907, timeZone: 'America/Mexico_City',
    lengthKm: 4.304, corners: 17, drsZones: 3, firstGp: 1963,
    lapRecord: '1:17.774 — Bottas (2021)',
    character: '2,285 m altitude · Thin air · High top speed',
    signatureCorner: 'Stadium section & Turn 1',
    note: 'At 2,285 metres above sea level the air is about a fifth thinner. Teams run maximum wing yet still reach some of the highest top speeds of the year, while engines, turbos and brakes struggle to cool.',
  },
  interlagos: {
    lat: -23.7036, lon: -46.6997, timeZone: 'America/Sao_Paulo',
    lengthKm: 4.309, corners: 15, drsZones: 2, firstGp: 1973,
    lapRecord: '1:10.540 — Bottas (2018)',
    character: 'Anti-clockwise · Natural bowl · Changeable weather',
    signatureCorner: 'Senna S & Junção',
    note: 'An anti-clockwise lap in a natural bowl about 780 metres above sea level. The downhill Senna S tests front grip and balance, and the long climb from Junção to the line rewards a good exit.',
  },
  vegas: {
    lat: 36.1147, lon: -115.173, timeZone: 'America/Los_Angeles',
    lengthKm: 6.201, corners: 17, drsZones: 2, firstGp: 2023,
    lapRecord: '1:35.490 — Piastri (2024)',
    character: 'Cold night · 1.9 km Strip straight · Smooth surface',
    signatureCorner: 'Turn 14 at the end of the Strip',
    note: 'A cold night race on smooth street asphalt makes warming the tyres the main problem. The run along the 1.9 km Strip cools them further, and the stop at Turn 14 is where front locking and graining start.',
  },
  losail: {
    lat: 25.49, lon: 51.4542, timeZone: 'Asia/Qatar',
    lengthKm: 5.419, corners: 16, drsZones: 1, firstGp: 2021,
    lapRecord: '1:22.384 — Verstappen (2024)',
    character: 'Fast sweepers · High lateral load · Kerbs',
    signatureCorner: 'Turns 12–14',
    note: 'One medium- and high-speed sweep after another with little braking in between, so drivers carry lateral load almost all lap. Kerb strikes have damaged tyres here, and Pirelli has imposed stint-length limits at the race.',
  },
  yas_marina: {
    lat: 24.4672, lon: 54.6031, timeZone: 'Asia/Dubai',
    lengthKm: 5.281, corners: 16, drsZones: 2, firstGp: 2009,
    lapRecord: '1:26.103 — Verstappen (2021)',
    character: 'Day into night · Traction · Redesigned in 2021',
    signatureCorner: 'Turn 5 hairpin & Turn 9',
    note: 'A twilight race: the track cools as the sun sets and the balance shifts over the race. The 2021 changes made the middle of the lap faster, but the slow hotel section at the end still rewards traction.',
  },
  madring: {
    lat: 40.4675, lon: -3.5953, timeZone: 'Europe/Madrid',
    lengthKm: 5.474, corners: 22, drsZones: 2, firstGp: 2026,
    character: 'Street and purpose-built · Banked corner · Technical',
    signatureCorner: 'Banked corner & slow technical section',
    note: 'A new track around the IFEMA exhibition centre in Madrid, mixing public roads with purpose-built sections. Its banked corner and a run of slow, technical turns ask for stability under load and good traction.',
  },
  sepang: {
    lat: 2.7608, lon: 101.738, timeZone: 'Asia/Kuala_Lumpur',
    lengthKm: 5.543, corners: 15, drsZones: 2, firstGp: 1999,
    lapRecord: '1:34.080 — Vettel (2017)',
    character: 'Very wide track · Two long straights · Heat and humidity',
    signatureCorner: 'Turns 5–6',
    note: 'A very wide track with two long straights joined by a slow hairpin. Heat and humidity push cooling to its limit, and the fast changes of direction at Turns 5–6 put heavy load on the front-left tyre.',
  },
};

export function getCircuitFacts(circuitId: string | undefined | null, locale?: string): CircuitFacts | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  const facts = CIRCUIT_FACTS[id] ?? null;
  if (!facts || locale !== 'tr') return facts;
  return { ...facts, ...(CIRCUIT_FACTS_TR[id] ?? {}) };
}
