import { cache } from 'react';
import { TELEMETRY_LOADERS } from '@/data/circuits/telemetry';
import { isCircuitTelemetry, type CircuitTelemetry } from '@/lib/telemetry/types';

/**
 * The measured reference lap of a circuit (master-plan 13.2), or `null` when the
 * circuit has no telemetry file or the file fails validation. Server components
 * only: each circuit page imports just its own JSON through the loader map.
 */
export const getCircuitTelemetry = cache(async function getCircuitTelemetry(
  circuitId: string,
): Promise<CircuitTelemetry | null> {
  if (!Object.hasOwn(TELEMETRY_LOADERS, circuitId)) return null;
  const data = await TELEMETRY_LOADERS[circuitId]();
  if (!isCircuitTelemetry(data)) {
    console.warn(`[circuitTelemetry] invalid file ${circuitId}`);
    return null;
  }
  return data;
});
