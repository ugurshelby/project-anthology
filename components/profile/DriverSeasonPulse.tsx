import { useTranslations } from 'next-intl';

export interface DriverPulseRound {
  round: string;
  raceName: string;
  circuitId?: string;
  /** ISO 3166 alpha-2 of the host country, the round's short label. */
  countryCode?: string | null;
  position: string;
  positionText?: string;
  points?: string;
  fastestLap?: boolean;
  status?: string;
}

export interface DriverSeasonPulseProps {
  rounds: DriverPulseRound[];
  year: number;
  driverName: string;
}

/**
 * Badge tone for one round. Ergast/Jolpica `positionText` is the classified
 * position as text, or a letter when the driver was not classified (R retired,
 * D disqualified, E excluded, W withdrawn, F failed to qualify, N not classified),
 * so DNF never depends on matching status wording. "Points" means the driver
 * scored, which also holds for the top-6/top-8 scoring eras before 2010.
 */
function getBadgeStyle(positionText: string | undefined, position: string, points?: string): {
  box: string;
  text: string;
  isDnf: boolean;
} {
  const pos = Number(/^\d+$/.test(positionText ?? '') ? positionText : position);
  const isDnf = (positionText != null && !/^\d+$/.test(positionText)) || !Number.isFinite(pos);
  const scored = Number(points) > 0;

  if (isDnf) return { box: 'border-white/10 bg-white/[0.03] hover:border-white/20', text: 'text-text-low', isDnf: true };
  if (pos === 1) {
    return {
      box: 'border-amber-500/40 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-amber-500/60',
      text: 'text-amber-300',
      isDnf: false,
    };
  }
  if (pos === 2 || pos === 3) return { box: 'border-yellow-400/30 bg-yellow-400/10 hover:border-yellow-400/50', text: 'text-yellow-200', isDnf: false };
  if (scored) return { box: 'border-emerald-500/25 bg-emerald-500/10 hover:border-emerald-500/40', text: 'text-emerald-300', isDnf: false };
  return { box: 'border-hairline bg-surface hover:border-white/20', text: 'text-text-mid', isDnf: false };
}

/**
 * Active Season Performance Pulse (Faz 12.4):
 * An interactive, horizontal timeline strip of round-by-round finishing positions
 * with telemetry status highlights (Gold P1, Podium, Points, DNF, and purple fastest lap).
 */
export function DriverSeasonPulse({
  rounds,
  year,
}: DriverSeasonPulseProps) {
  const t = useTranslations('history.stats');
  const td = useTranslations('history.driver');

  if (rounds.length === 0) return null;

  return (
    <div className="relative flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label-caps text-text-low font-mono">
          {td('pulseTitle')} · {year}
        </span>
        <div className="flex items-center gap-3 font-mono text-[11px] text-text-mid">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>P1</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-300" />
            <span>{t('legendPodium')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{t('legendPoints')}</span>
          </span>
        </div>
      </div>

      <div className="scrollbar-none -mx-2 flex gap-2 overflow-x-auto px-2 py-1">
        {rounds.map((r, i) => {
          const badge = getBadgeStyle(r.positionText, r.position, r.points);
          const shortGp = r.countryCode ?? r.raceName
            .replace(/\s*Grand Prix\s*/i, '')
            .replace(/\s*GP\s*/i, '')
            .trim()
            .slice(0, 3)
            .toUpperCase();

          return (
            <div
              key={`${r.round}-${i}`}
              className={[
                'group relative flex min-w-[4rem] flex-1 flex-col items-center justify-between rounded-xl border p-2.5 transition-all duration-200 hover:-translate-y-0.5',
                badge.box,
              ].join(' ')}
              title={`${r.raceName} (R${r.round}): ${badge.isDnf ? (r.status ?? t('dnf')) : `P${r.position}`}${Number(r.points) > 0 ? ` · ${r.points} ${t('ptsShort')}` : ''}`}
            >
              {/* Hairline top specular highlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]"
              />

              {/* Fastest lap indicator badge (telemetry purple) */}
              {r.fastestLap ? (
                <span
                  title={t('fastestLaps')}
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-black bg-[#b356fe] shadow-[0_0_8px_#b356fe]"
                />
              ) : null}

              <span className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                {shortGp || `R${r.round}`}
              </span>

              <span
                className={[
                  'font-condensed mt-1 text-2xl font-800 leading-none tracking-tight',
                  badge.text,
                ].join(' ')}
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {badge.isDnf ? t('dnf') : `P${r.position}`}
              </span>

              {r.points && parseFloat(r.points) > 0 ? (
                <span className="mt-1 font-mono text-[11px] text-text-mid">
                  +{r.points}
                </span>
              ) : (
                <span className="mt-1 font-mono text-[11px] text-text-low opacity-60">
                  —
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
