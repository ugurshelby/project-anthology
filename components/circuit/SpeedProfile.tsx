import { useLocale, useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/i18n/format';
import type { CircuitTelemetry } from '@/lib/telemetry/types';

const W = 1000;
const SPEED_H = 200;
const GEAR_Y = 212;
const BAND_H = 14;
const THROTTLE_Y = GEAR_Y + BAND_H + 6;
const BRAKE_Y = THROTTLE_Y + BAND_H + 6;
const H = BRAKE_Y + BAND_H;

/**
 * Speed over distance for the measured pole lap (master-plan 13.4), with the gear band and the
 * throttle and brake strips underneath and the two sector boundaries. Values are drawn as stored;
 * only the axis labels are formatted.
 */
export function SpeedProfile({ telemetry }: { telemetry: CircuitTelemetry }) {
  const t = useTranslations('ui.circuit.telemetry');
  const locale = useLocale();
  const { samples, metrics, sectors } = telemetry;
  const len = metrics.lapLengthM;
  const top = Math.ceil(metrics.topSpeedKmh / 50) * 50;
  const xOf = (dM: number) => (dM / len) * W;
  const yOf = (kmh: number) => SPEED_H - (kmh / top) * SPEED_H;

  const speedLine = samples.map(([, dM, kmh]) => `${xOf(dM).toFixed(1)},${yOf(kmh).toFixed(1)}`).join(' ');
  const strips = samples.slice(0, -1).map((s, i) => {
    const x = xOf(s[1]);
    const w = Math.max(0.5, xOf(samples[i + 1][1]) - x);
    return { x, w, gear: s[3], throttle: s[4], brake: s[5] };
  });

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="label-caps text-text-mid">{t('speedTitle')}</span>
        <span className="font-mono text-[11px] text-text-low">
          {formatNumber(top, locale)} {t('speedAxis')}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('speedAria', {
          top: formatNumber(metrics.topSpeedKmh, locale),
          min: formatNumber(metrics.minSpeedKmh, locale),
        })}
        className="h-56 w-full md:h-64"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={SPEED_H * f} y2={SPEED_H * f} stroke="rgba(255,255,255,0.06)" vectorEffect="non-scaling-stroke" />
        ))}
        {sectors.boundariesM.map((b) => (
          <line key={b} x1={xOf(b)} x2={xOf(b)} y1={0} y2={H} stroke="rgba(255,255,255,0.28)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        ))}
        <polyline points={speedLine} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {strips.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={GEAR_Y} width={s.w} height={BAND_H} fill="#ffffff" opacity={0.08 + (s.gear / 8) * 0.6} />
            <rect x={s.x} y={THROTTLE_Y} width={s.w} height={BAND_H} fill="#22c55e" opacity={(s.throttle / 100) * 0.85} />
            {s.brake ? <rect x={s.x} y={BRAKE_Y} width={s.w} height={BAND_H} fill="#ef4444" opacity={0.9} /> : null}
          </g>
        ))}
      </svg>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-text-low" aria-hidden>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-white/60" />{t('gear')}</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-[#22c55e]" />{t('throttle')}</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-[#ef4444]" />{t('brake')}</li>
      </ul>
      <div className="flex justify-between font-mono text-[11px] text-text-low">
        <span>0 m</span>
        <span>{t('distance')}</span>
        <span>{formatNumber(len, locale)} m</span>
      </div>
    </figure>
  );
}
