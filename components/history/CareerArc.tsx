import { useTranslations } from 'next-intl';

export interface ArcPoint {
  year: number;
  /** Final championship position that season; null when the archive has none. */
  position: number | null;
  /** Team colour that season. */
  ui: string;
  champion: boolean;
  label?: string;
}

const W = 720;
const H = 240;
const PAD = { l: 40, r: 20, t: 22, b: 34 };

/**
 * Championship position by season as a line: P1 at the top, one dot per
 * season in that season's team colour, champion years ringed. Seasons without
 * a recorded position are left out of the line, never drawn as zero.
 */
export function CareerArc({ points, selectedYear, caption }: { points: ArcPoint[]; selectedYear: number; caption: string }) {
  const t = useTranslations('history.arc');
  const data = points.filter((p): p is ArcPoint & { position: number } => p.position != null && p.position > 0);
  if (data.length < 2) return null;

  const years = data.map((p) => p.year);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const worst = Math.max(...data.map((p) => p.position));
  const bottom = Math.min(Math.max(10, worst), 24);

  const x = (year: number) => PAD.l + (maxY === minY ? 0.5 : (year - minY) / (maxY - minY)) * (W - PAD.l - PAD.r);
  const y = (pos: number) => PAD.t + ((Math.min(pos, bottom) - 1) / (bottom - 1)) * (H - PAD.t - PAD.b);

  const line = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.year).toFixed(1)},${y(p.position).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data[data.length - 1].year).toFixed(1)},${(H - PAD.b).toFixed(1)} L${x(data[0].year).toFixed(1)},${(H - PAD.b).toFixed(1)} Z`;
  const gridRows = [1, 5, 10, 15, 20].filter((g) => g <= bottom);
  const selected = data.find((p) => p.year === selectedYear);
  const tickEvery = Math.max(1, Math.ceil((maxY - minY) / 7 / 5) * 5);
  const xTicks: number[] = [];
  for (let yr = Math.ceil(minY / tickEvery) * tickEvery; yr <= maxY; yr += tickEvery) xTicks.push(yr);
  if (!xTicks.includes(minY) && xTicks[0] - minY > tickEvery / 2) xTicks.unshift(minY);

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="arc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--team-secondary, var(--accent))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--team-secondary, var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridRows.map((g) => (
          <g key={g}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.08)" strokeDasharray={g === 1 ? undefined : '3 5'} />
            <text x={PAD.l - 8} y={y(g) + 4} textAnchor="end" className="fill-[var(--text-low)] font-mono text-[11px]">
              P{g}
            </text>
          </g>
        ))}

        {xTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={H - 10} textAnchor="middle" className="fill-[var(--text-low)] font-mono text-[11px]">
            {yr}
          </text>
        ))}

        {selected ? (
          <line x1={x(selected.year)} x2={x(selected.year)} y1={PAD.t - 6} y2={H - PAD.b} stroke={selected.ui} strokeOpacity="0.55" strokeDasharray="2 4" />
        ) : null}

        <path d={area} fill="url(#arc-fill)" />
        <path d={line} fill="none" stroke="var(--team-secondary, var(--accent))" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((p) => {
          const isSel = p.year === selectedYear;
          return (
            <g key={p.year}>
              {p.champion ? <circle cx={x(p.year)} cy={y(p.position)} r="9" fill="none" stroke={p.ui} strokeOpacity="0.8" strokeWidth="1.5" /> : null}
              <circle cx={x(p.year)} cy={y(p.position)} r={isSel ? 5.5 : p.champion ? 4.5 : 3.5} fill={p.ui} stroke="#0a0a0a" strokeWidth="1.5">
                <title>{`${p.year} · P${p.position}${p.label ? ` · ${p.label}` : ''}${p.champion ? ` · ${t('champion')}` : ''}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        <ol>
          {data.map((p) => (
            <li key={p.year}>
              {p.year}: P{p.position}
              {p.champion ? `, ${t('champion')}` : ''}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
