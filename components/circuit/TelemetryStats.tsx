import { useLocale, useTranslations } from 'next-intl';
import { formatNumber, formatPercent } from '@/lib/i18n/format';
import type { CircuitTelemetry } from '@/lib/telemetry/types';

/**
 * Figures of the measured pole lap (master-plan 13.4), each as stored in the telemetry file,
 * and the source line the OpenF1 licence asks for.
 */
export function TelemetryStats({ telemetry }: { telemetry: CircuitTelemetry }) {
  const t = useTranslations('ui.circuit.telemetry');
  const locale = useLocale();
  const { metrics, speedTraps, safetyCar, source } = telemetry;
  const kmh = (v: number) => `${formatNumber(v, locale)} ${t('speedAxis')}`;
  const traps = [
    ['I1', speedTraps.i1Kmh],
    ['I2', speedTraps.i2Kmh],
    ['ST', speedTraps.stKmh],
  ].filter((r): r is [string, number] => r[1] !== null);

  const rows: Array<{ label: string; value: string }> = [
    { label: t('topSpeed'), value: kmh(metrics.topSpeedKmh) },
    { label: t('minSpeed'), value: kmh(metrics.minSpeedKmh) },
    { label: t('fullThrottle'), value: formatPercent(metrics.fullThrottlePct, locale) },
    { label: t('braking'), value: formatPercent(metrics.brakingPct, locale) },
    { label: t('gearShifts'), value: t('gearShiftsValue', { n: metrics.gearShiftSteps }) },
  ];
  if (traps.length > 0) {
    rows.push({ label: t('speedTraps'), value: traps.map(([k, v]) => `${k} ${formatNumber(v, locale)}`).join(' · ') });
  }
  if (safetyCar && safetyCar.races > 0) {
    rows.push({
      label: t('safetyCar'),
      value: t('safetyCarValue', {
        k: safetyCar.withSafetyCar,
        n: safetyCar.races,
        years: safetyCar.years.join(', '),
      }),
    });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <span className="label-caps text-text-mid">{t('statsTitle')}</span>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-text-low">{r.label}</dt>
            <dd className="font-condensed text-xl font-700 text-text-hi tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-auto font-mono text-[11px] leading-relaxed text-text-low">
        {t('source', {
          year: source.year,
          driver: source.driverCode,
          lapTime: source.lapTime,
        })}
      </p>
    </div>
  );
}
