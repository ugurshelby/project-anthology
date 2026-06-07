/**
 * Circuit characteristics — a curated, static reference per Ergast circuitId.
 *
 * These are stable historical facts (layout character, lap record, corner count,
 * the signature corner, what makes the track distinctive). They don't change race
 * to race, so they live here as a tracked module rather than in the DB — the
 * detail page reads them with zero API dependency and degrades gracefully when a
 * circuit isn't listed.
 */

export interface CircuitFacts {
  /** Latitude of the circuit (decimal degrees) — used for the live weather panel. */
  lat?: number;
  /** Longitude of the circuit (decimal degrees) — used for the live weather panel. */
  lon?: number;
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
    lat: -37.8497, lon: 144.968,
    lengthKm: 5.278, corners: 14, drsZones: 4, firstGp: 1996,
    lapRecord: '1:19.813 — Leclerc (2024)',
    character: 'Semi-street, fast flowing',
    signatureCorner: 'Turns 9–10 sweep',
    note: 'A parkland street hybrid that resurfaced and lost its chicane in 2022, turning it into one of the fastest laps on the calendar.',
  },
  bahrain: {
    lat: 26.0325, lon: 50.5106,
    lengthKm: 5.412, corners: 15, drsZones: 3, firstGp: 2004,
    lapRecord: '1:31.447 — de la Rosa (2005)',
    character: 'Heavy braking, traction',
    signatureCorner: 'Turn 1 hairpin',
    note: 'A desert circuit defined by hard stops into slow corners; brake cooling and rear traction off the hairpins decide the race.',
  },
  jeddah: {
    lat: 21.6319, lon: 39.1044,
    lengthKm: 6.174, corners: 27, drsZones: 3, firstGp: 2021,
    lapRecord: '1:30.734 — Hamilton (2021)',
    character: 'High-speed street',
    signatureCorner: 'Turns 22–23 walls',
    note: 'The fastest street circuit in F1 — flat-out blind kinks between concrete walls leave almost no margin.',
  },
  shanghai: {
    lat: 31.3389, lon: 121.22,
    lengthKm: 5.451, corners: 16, drsZones: 2, firstGp: 2004,
    lapRecord: '1:32.238 — Hamilton (2024)',
    character: 'Long corners, long straight',
    signatureCorner: 'Turns 1–2 spiral',
    note: 'The snail-shell opening complex tightens continuously, feeding one of the longest straights on the calendar.',
  },
  suzuka: {
    lat: 34.8431, lon: 136.541,
    lengthKm: 5.807, corners: 18, drsZones: 2, firstGp: 1987,
    lapRecord: '1:30.983 — Hamilton (2019)',
    character: 'Flowing, high commitment',
    signatureCorner: '130R / the Esses',
    note: 'A figure-of-eight classic; the Esses and 130R reward rhythm and aero balance more than raw power.',
  },
  miami: {
    lat: 25.9581, lon: -80.2389,
    lengthKm: 5.412, corners: 19, drsZones: 3, firstGp: 2022,
    lapRecord: '1:29.708 — Verstappen (2023)',
    character: 'Mixed street, three sectors',
    signatureCorner: 'Turns 13–16 chicane',
    note: 'Fast opening and closing sectors bracket a slow, technical middle that punishes a stiff car.',
  },
  imola: {
    lat: 44.3439, lon: 11.7167,
    lengthKm: 4.909, corners: 19, drsZones: 2, firstGp: 1980,
    lapRecord: '1:15.484 — Hamilton (2020)',
    character: 'Old-school, kerb-heavy',
    signatureCorner: 'Acque Minerali',
    note: 'A narrow, anti-clockwise throwback where overtaking is hard and qualifying position is gold.',
  },
  monaco: {
    lat: 43.7347, lon: 7.42056,
    lengthKm: 3.337, corners: 19, drsZones: 1, firstGp: 1950,
    lapRecord: '1:12.909 — Hamilton (2021)',
    character: 'Slowest, tightest street',
    signatureCorner: 'Casino / Fairmont hairpin',
    note: 'The ultimate qualifying lap — barriers inches away, the tightest corner in F1, and almost no room to pass.',
  },
  villeneuve: {
    lat: 45.5, lon: -73.5228,
    lengthKm: 4.361, corners: 14, drsZones: 3, firstGp: 1978,
    lapRecord: '1:13.078 — Bottas (2019)',
    character: 'Stop-go, low grip',
    signatureCorner: 'Wall of Champions',
    note: 'Long straights and heavy braking zones on a low-grip surface; the final chicane wall has caught out world champions.',
  },
  catalunya: {
    lat: 41.57, lon: 2.26111,
    lengthKm: 4.657, corners: 14, drsZones: 2, firstGp: 1991,
    lapRecord: '1:16.330 — Verstappen (2023)',
    character: 'Aero benchmark',
    signatureCorner: 'Turn 3 long right',
    note: 'Every team knows it inside out — a balanced lap of fast and slow corners that exposes any aerodynamic weakness.',
  },
  red_bull_ring: {
    lat: 47.2197, lon: 14.7647,
    lengthKm: 4.318, corners: 10, drsZones: 3, firstGp: 1970,
    lapRecord: '1:05.619 — Sainz (2020)',
    character: 'Short, power-hungry',
    signatureCorner: 'Turn 3 uphill',
    note: 'The shortest lap of the year by time — three big climbs and heavy braking make it brutal on power units and brakes.',
  },
  silverstone: {
    lat: 52.0786, lon: -1.01694,
    lengthKm: 5.891, corners: 18, drsZones: 2, firstGp: 1950,
    lapRecord: '1:27.097 — Verstappen (2020)',
    character: 'Fast, high-energy',
    signatureCorner: 'Maggotts–Becketts',
    note: 'The original world championship venue; the Maggotts–Becketts–Chapel complex is one of the great tests of high-speed change of direction.',
  },
  hungaroring: {
    lat: 47.5789, lon: 19.2486,
    lengthKm: 4.381, corners: 14, drsZones: 2, firstGp: 1986,
    lapRecord: '1:16.627 — Hamilton (2020)',
    character: 'Twisty, “Monaco without walls”',
    signatureCorner: 'Turn 4 downhill left',
    note: 'A tight, rhythmic lap with almost no straights — downforce and track position outweigh outright speed.',
  },
  spa: {
    lat: 50.4372, lon: 5.97139,
    lengthKm: 7.004, corners: 19, drsZones: 2, firstGp: 1950,
    lapRecord: '1:46.286 — Pérez (2024)',
    character: 'Longest, fast & weather-prone',
    signatureCorner: 'Eau Rouge / Raidillon',
    note: 'The longest lap on the calendar through the Ardennes forest; Eau Rouge-Raidillon flat-out is a rite of passage, and local weather can split the track in two.',
  },
  zandvoort: {
    lat: 52.3888, lon: 4.54092,
    lengthKm: 4.259, corners: 14, drsZones: 2, firstGp: 1952,
    lapRecord: '1:11.097 — Hamilton (2021)',
    character: 'Banked, old-school dunes',
    signatureCorner: 'Banked Turn 3 / Turn 14',
    note: 'Steeply banked corners let cars carry huge speed and run side by side — a throwback feel on a narrow seaside ribbon.',
  },
  monza: {
    lat: 45.6156, lon: 9.28111,
    lengthKm: 5.793, corners: 11, drsZones: 2, firstGp: 1950,
    lapRecord: '1:21.046 — Barrichello (2004)',
    character: 'Temple of Speed',
    signatureCorner: 'Parabolica',
    note: 'The lowest-downforce track of the year — long straights and chicanes mean top speed and slipstream battles into Parabolica.',
  },
  baku: {
    lat: 40.3725, lon: 49.8533,
    lengthKm: 6.003, corners: 20, drsZones: 2, firstGp: 2016,
    lapRecord: '1:43.009 — Leclerc (2019)',
    character: 'Street, longest straight',
    signatureCorner: 'Castle section',
    note: 'A 2.2 km straight bolted onto a medieval-narrow castle section — the widest speed range of any street track.',
  },
  marina_bay: {
    lat: 1.2914, lon: 103.864,
    lengthKm: 4.94, corners: 19, drsZones: 3, firstGp: 2008,
    lapRecord: '1:34.486 — Hamilton (2023)',
    character: 'Hot, bumpy night street',
    signatureCorner: 'Turn 1–3 complex',
    note: 'A physically brutal night race — humidity, bumps and walls over a long lap make it one of the toughest of the year.',
  },
  americas: {
    lat: 30.1328, lon: -97.6411,
    lengthKm: 5.513, corners: 20, drsZones: 2, firstGp: 2012,
    lapRecord: '1:36.169 — Leclerc (2019)',
    character: 'Mixed, Hermann Tilke flagship',
    signatureCorner: 'Esses (Turns 3–6)',
    note: 'A modern design that borrows great corners from older tracks; the uphill Turn 1 and the Silverstone-style Esses are the highlights.',
  },
  rodriguez: {
    lat: 19.4042, lon: -99.0907,
    lengthKm: 4.304, corners: 17, drsZones: 3, firstGp: 1963,
    lapRecord: '1:17.774 — Bottas (2021)',
    character: 'High altitude, low air',
    signatureCorner: 'Stadium / Foro Sol',
    note: 'At 2,200 m the thin air slashes downforce and cooling; the stadium section funnels the lap through a packed baseball arena.',
  },
  interlagos: {
    lat: -23.7036, lon: -46.6997,
    lengthKm: 4.309, corners: 15, drsZones: 2, firstGp: 1973,
    lapRecord: '1:10.540 — Bottas (2018)',
    character: 'Short, anti-clockwise, undulating',
    signatureCorner: 'Senna S',
    note: 'A compact, anti-clockwise rollercoaster that often produces drama — short lap, big elevation and unpredictable weather.',
  },
  vegas: {
    lat: 36.1147, lon: -115.173,
    lengthKm: 6.201, corners: 17, drsZones: 2, firstGp: 2023,
    lapRecord: '1:35.490 — Piastri (2024)',
    character: 'Cold, fast Strip street',
    signatureCorner: 'Strip straight',
    note: 'A long, low-grip night street circuit down the Las Vegas Strip; cold track temperatures make tyre warm-up the central challenge.',
  },
  losail: {
    lat: 25.49, lon: 51.4542,
    lengthKm: 5.419, corners: 16, drsZones: 1, firstGp: 2021,
    lapRecord: '1:22.384 — Verstappen (2024)',
    character: 'Flowing, medium-fast',
    signatureCorner: 'Turns 12–14 sweeps',
    note: 'A former MotoGP circuit of fast, constant-radius sweeps that load the front tyres heavily over a long, smooth lap.',
  },
  yas_marina: {
    lat: 24.4672, lon: 54.6031,
    lengthKm: 5.281, corners: 16, drsZones: 2, firstGp: 2009,
    lapRecord: '1:26.103 — Verstappen (2021)',
    character: 'Day-to-night, traction',
    signatureCorner: 'Turns 5–6–7 chicane',
    note: 'The traditional finale — a twilight race where the track cools through the event and traction out of slow corners is king.',
  },
  madring: {
    lat: 40.4675, lon: -3.5953,
    lengthKm: 5.474, corners: 22, drsZones: 2, firstGp: 2026,
    character: 'New for 2026, hybrid street',
    signatureCorner: 'Banked Turn 4',
    note: 'Madrid’s new hybrid circuit, joining the calendar in 2026 with a banked corner and a mix of street and permanent sections.',
  },
};

export function getCircuitFacts(circuitId: string | undefined | null): CircuitFacts | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  return CIRCUIT_FACTS[id] ?? null;
}
