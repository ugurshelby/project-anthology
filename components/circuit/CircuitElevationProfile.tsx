'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getTopographyProfile } from '@/data/circuits/topography';

interface CircuitElevationProfileProps {
  circuitId: string;
}

/**
 * Curated, editorial topography/telemetry estimates for a few circuits. Values are not
 * official data (the source line says so). Circuits without a record render nothing:
 * no invented fallback numbers. Lap length, corners and DRS are in the facts strip and map.
 */
export function CircuitElevationProfile({ circuitId }: CircuitElevationProfileProps) {
  const t = useTranslations('ui.circuit.elevation');
  const locale = useLocale();
  const profile = getTopographyProfile(circuitId);
  if (!profile) return null;

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
            <span className="label-caps font-mono text-[11px] tracking-[0.1em] text-text-low">
              {t('eyebrow')}
            </span>
          </div>
          <h3 className="font-condensed text-xl font-700 uppercase tracking-tight text-text-hi md:text-2xl">
            {t('title')}
          </h3>
        </div>
      </div>

      {/* Grid of Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {/* Elevation Delta */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">{t('elevationDelta')}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-condensed text-2xl font-700 text-text-hi md:text-3xl">
              ±{profile.elevationDeltaM}
            </span>
            <span className="font-mono text-xs text-text-mid">{t('metres')}</span>
          </div>
          <span className="mt-1 block truncate text-[11px] text-text-low font-mono">
            {t('range', { low: profile.lowestPointM, high: profile.highestPointM })}
          </span>
        </div>

        {/* Full Throttle */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">{t('fullThrottle')}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-condensed text-2xl font-700 text-text-hi md:text-3xl">
              {t('throttleValue', { value: profile.throttlePercent })}
            </span>
            <span className="font-mono text-xs text-text-mid">{t('perLap')}</span>
          </div>
          {/* Visual Mini Progress */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full bg-text-hi/70 transition-all duration-300"
              style={{ width: `${profile.throttlePercent}%` }}
            />
          </div>
        </div>

        {/* Gear Shifts */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">{t('gearShifts')}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-condensed text-2xl font-700 text-text-hi md:text-3xl">
              ~{profile.gearShifts}
            </span>
            <span className="font-mono text-xs text-text-mid">{t('shiftsPerLap')}</span>
          </div>
          <span className="mt-1 block text-[11px] text-text-low font-mono">{t('gearboxLoad')}</span>
        </div>

        {/* Braking Severity */}
        <div className="rounded-[12px] border border-hairline bg-white/[0.015] p-3.5">
          <span className="label-caps block text-[10px] text-text-low font-mono">{t('braking')}</span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="font-condensed text-2xl font-700 uppercase md:text-3xl"
              style={{ color: severityColor }}
            >
              {t(`severity.${profile.brakingSeverity}`)}
            </span>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityColor }} />
          </div>
          <span className="mt-1 block text-[11px] text-text-low font-mono">
            {t('brakingEnergy', { kj: profile.brakingEnergyKj })}
          </span>
        </div>
      </div>

      {/* Signature Incline Feature Card */}
      <div className="mt-4 flex flex-col justify-between gap-2 rounded-[12px] border border-hairline bg-white/[0.02] p-3.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase text-text-mid">{t('signature')}</span>
          <span className="font-mono text-xs text-text-hi">
            {locale === 'tr' ? profile.keyInclineTr : profile.keyIncline}
          </span>
        </div>
        <span className="font-mono text-[11px] text-text-low">{t('source')}</span>
      </div>
    </div>
  );
}
