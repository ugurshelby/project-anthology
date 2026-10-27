import { useTranslations } from 'next-intl';

export interface DriverTeammateDuelProps {
  driverName: string;
  driverCode: string;
  driverNumber?: string | null;
  driverPoints: number;
  driverPosition?: number | null;
  teammateName: string;
  teammateCode: string;
  teammateNumber?: string | null;
  teammatePoints: number;
  teammatePosition?: number | null;
  qualiScore: [number, number]; // [driver, teammate]
  raceScore: [number, number]; // [driver, teammate]
  teamName: string;
}

/**
 * Compact Teammate Head-to-Head Module (Faz 12.4):
 * Symmetrical, center-divided comparison bento between teammates across
 * qualifying trim, race finishes, and season points with Apple telemetry aesthetics.
 */
export function DriverTeammateDuel({
  driverName,
  driverCode,
  driverNumber,
  driverPoints,
  driverPosition,
  teammateName,
  teammateCode,
  teammateNumber,
  teammatePoints,
  teammatePosition,
  qualiScore,
  raceScore,
  teamName,
}: DriverTeammateDuelProps) {
  const td = useTranslations('history.driver');

  const totalPoints = driverPoints + teammatePoints;
  const driverPtsPct =
    totalPoints > 0 ? Math.round((driverPoints / totalPoints) * 100) : 50;

  const totalQuali = qualiScore[0] + qualiScore[1];
  const driverQualiPct =
    totalQuali > 0 ? Math.round((qualiScore[0] / totalQuali) * 100) : 50;

  const totalRace = raceScore[0] + raceScore[1];
  const driverRacePct =
    totalRace > 0 ? Math.round((raceScore[0] / totalRace) * 100) : 50;

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Driver Monograms & Numbers */}
      <div className="flex items-center justify-between border-b border-hairline/60 pb-3">
        <div className="flex items-center gap-2">
          {driverNumber ? (
            <span className="font-condensed text-lg font-800 text-[var(--team-secondary,var(--accent))]">
              #{driverNumber}
            </span>
          ) : null}
          <div className="flex flex-col">
            <span
              lang="en"
              className="font-condensed text-base font-700 uppercase tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {driverName}
            </span>
            <span className="font-mono text-[11px] uppercase text-text-low">
              {driverCode.toUpperCase()}
              {driverPosition != null ? ` · P${driverPosition}` : ''}
            </span>
          </div>
        </div>

        <span className="rounded-full border border-hairline bg-surface-raised px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-text-mid">
          {td('duelTitle')}
        </span>

        <div className="flex items-center gap-2 text-right">
          <div className="flex flex-col items-end">
            <span
              lang="en"
              className="font-condensed text-base font-700 uppercase tracking-tight text-text-mid"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {teammateName}
            </span>
            <span className="font-mono text-[11px] uppercase text-text-low">
              {teammateCode.toUpperCase()}
              {teammatePosition != null ? ` · P${teammatePosition}` : ''}
            </span>
          </div>
          {teammateNumber ? (
            <span className="font-condensed text-lg font-800 text-text-low">
              #{teammateNumber}
            </span>
          ) : null}
        </div>
      </div>

      {/* Metric 1: Qualifying H2H */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-700 text-text-hi">{qualiScore[0]}</span>
          <span className="label-caps text-[11px] tracking-wider text-text-low">
            {td('duelQuali')}
          </span>
          <span className="text-text-mid">{qualiScore[1]}</span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <span
            style={{
              width: `${driverQualiPct}%`,
              backgroundColor: 'var(--team-secondary, var(--accent))',
            }}
          />
          <span
            className="bg-white/20"
            style={{ width: `${100 - driverQualiPct}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Race Finish H2H */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-700 text-text-hi">{raceScore[0]}</span>
          <span className="label-caps text-[11px] tracking-wider text-text-low">
            {td('duelRace')}
          </span>
          <span className="text-text-mid">{raceScore[1]}</span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <span
            style={{
              width: `${driverRacePct}%`,
              backgroundColor: 'var(--team-secondary, var(--accent))',
            }}
          />
          <span
            className="bg-white/20"
            style={{ width: `${100 - driverRacePct}%` }}
          />
        </div>
      </div>

      {/* Metric 3: Points Share */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-700 text-text-hi">
            {Number.isInteger(driverPoints) ? driverPoints : driverPoints.toFixed(1)}
          </span>
          <span className="label-caps text-[11px] tracking-wider text-text-low">
            {td('duelPtsShare', { pct: driverPtsPct })}
          </span>
          <span className="text-text-mid">
            {Number.isInteger(teammatePoints) ? teammatePoints : teammatePoints.toFixed(1)}
          </span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <span
            style={{
              width: `${driverPtsPct}%`,
              backgroundColor: 'var(--team-secondary, var(--accent))',
            }}
          />
          <span
            className="bg-white/20"
            style={{ width: `${100 - driverPtsPct}%` }}
          />
        </div>
      </div>

      <div className="pt-1 text-center font-mono text-[11px] text-text-low">
        <span>{td('duelFooter', { team: teamName })}</span>
      </div>
    </div>
  );
}
