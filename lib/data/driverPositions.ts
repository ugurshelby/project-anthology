/**
 * Driver grid / portrait framing positions (apex-component-rules.md §4.1).
 * Pinpoints vertical eye-level to golden ratio (35–40% from top of card),
 * avoiding cut forehead/cap while maintaining dynamic presence.
 */
export const DRIVER_GRID_POSITIONS: Record<string, string> = {
  // Mercedes
  antonelli: 'center 25%',
  'andrea-kimi-antonelli': 'center 25%',
  'kimi-antonelli': 'center 25%',
  russell: 'center 30%',
  'george-russell': 'center 30%',

  // Ferrari
  hamilton: 'center 20%',
  'lewis-hamilton': 'center 20%',
  leclerc: '50% 25%',
  'charles-leclerc': '50% 25%',

  // McLaren
  norris: 'center 30%',
  'lando-norris': 'center 30%',
  piastri: 'center 20%',
  'oscar-piastri': 'center 20%',

  // Red Bull
  verstappen: 'center 30%',
  'max-verstappen': 'center 30%',
  lawson: 'center 25%',
  'liam-lawson': 'center 25%',
  perez: 'center 25%',
  'sergio-perez': 'center 25%',

  // Racing Bulls (VCARB)
  tsunoda: 'center 30%',
  'yuki-tsunoda': 'center 30%',
  hadjar: 'center 30%',
  'isack-hadjar': 'center 30%',
  ricciardo: 'center 30%',
  'daniel-ricciardo': 'center 30%',

  // Alpine
  gasly: 'center 25%',
  'pierre-gasly': 'center 25%',
  doohan: '40% 30%',
  'jack-doohan': '40% 30%',
  colapinto: '40% 30%',
  'franco-colapinto': '40% 30%',

  // Haas
  ocon: 'center 15%',
  'esteban-ocon': 'center 15%',
  bearman: 'center 30%',
  'oliver-bearman': 'center 30%',
  magnussen: 'center 25%',
  'kevin-magnussen': 'center 25%',

  // Audi (Sauber)
  hulkenberg: 'center 25%',
  'nico-hulkenberg': 'center 25%',
  bortoleto: '50% 25%',
  'gabriel-bortoleto': '50% 25%',
  bottas: 'center 25%',
  'valtteri-bottas': 'center 25%',
  zhou: 'center 25%',
  'guanyu-zhou': 'center 25%',

  // Williams
  sainz: 'center 20%',
  'carlos-sainz': 'center 20%',
  albon: 'center 25%',
  'alexander-albon': 'center 25%',
  'alex-albon': 'center 25%',

  // Aston Martin
  alonso: 'center 25%',
  'fernando-alonso': 'center 25%',
  stroll: 'center 25%',
  'lance-stroll': 'center 25%',
};

/**
 * Driver image horizontal mirror set:
 * Stroll's headshot is flipped horizontally so his gaze is directed inwards toward content.
 */
export const DRIVER_IMAGE_FLIP = new Set(['stroll', 'lance-stroll', 'lance_stroll']);

export function getDriverObjectPosition(driverId: string): string {
  const norm = driverId.toLowerCase().trim().replace(/_/g, '-');
  return DRIVER_GRID_POSITIONS[norm] ?? '50% 25%';
}

export function shouldFlipDriver(driverId: string): boolean {
  const norm = driverId.toLowerCase().trim().replace(/_/g, '-');
  return DRIVER_IMAGE_FLIP.has(norm);
}
