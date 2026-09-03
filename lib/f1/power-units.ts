/**
 * 2026 customer / works power-unit labels for grid garage cards.
 * Editorial shorthand, not a homologation table.
 */
const POWER_UNITS: Record<string, string> = {
  mercedes: 'Mercedes-AMG HPP',
  ferrari: 'Ferrari 066/12',
  red_bull: 'Red Bull Ford',
  mclaren: 'Mercedes-AMG HPP',
  aston_martin: 'Honda RBPTH002',
  alpine: 'Renault E-Tech',
  williams: 'Mercedes-AMG HPP',
  rb: 'Red Bull Ford',
  racing_bulls: 'Red Bull Ford',
  haas: 'Ferrari 066/12',
  audi: 'Audi PU',
  kick_sauber: 'Audi PU',
  sauber: 'Audi PU',
  cadillac: 'Ferrari 066/12',
};

export function powerUnitLabel(constructorId: string): string | null {
  const key = constructorId.toLowerCase().replace(/[-\s]+/g, '_');
  return POWER_UNITS[key] ?? POWER_UNITS[key.replace('racing_bulls', 'rb')] ?? null;
}
