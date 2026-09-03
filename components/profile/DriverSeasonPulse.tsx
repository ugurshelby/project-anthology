import { BentoCard } from '@/components/bento/BentoCard';

/**
 * Consolidated season snapshot — standing, points, and micro win/podium badges
 * in one editorial card instead of three fragmented stat tiles.
 */
export function DriverSeasonPulse({
  season,
  position,
  points,
  wins,
  podiums,
  championships,
  careerPoints,
}: {
  season: number;
  position: string;
  points: string;
  wins: number;
  podiums: number;
  championships: number;
  careerPoints: number;
}) {
  const badges = [
    `${wins} ${Number(wins) === 1 ? 'Win' : 'Wins'}`,
    `${podiums} ${Number(podiums) === 1 ? 'Podium' : 'Podiums'}`,
    championships > 0 ? `${championships} ${championships === 1 ? 'Title' : 'Titles'}` : null,
  ].filter((b): b is string => b !== null);

  return (
    <BentoCard span={12} className="relative overflow-hidden border border-white/[0.08] bg-surface/60">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 120% at 0% 50%, color-mix(in srgb, var(--team-secondary) 20%, transparent), transparent 65%)',
        }}
      />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="label-caps text-text-mid">{season} Season Pulse</span>
          <div className="flex flex-wrap items-end gap-4">
            <span className="hero-number text-[clamp(52px,9vw,96px)] text-accent">P{position}</span>
            <div className="flex flex-col gap-0.5 pb-1">
              <span className="data-tabular text-lg text-text-hi">{points} PTS</span>
              <span className="data-tabular text-sm text-text-low">{careerPoints} career pts</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="label-caps rounded-[var(--radius-pill)] border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-text-mid"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
