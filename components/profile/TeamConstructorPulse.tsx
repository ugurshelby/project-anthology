import { BentoCard } from '@/components/bento/BentoCard';

export function TeamConstructorPulse({
  season,
  position,
  points,
  wins,
  championships,
}: {
  season: number;
  position: string;
  points: string;
  wins: string;
  championships: number;
}) {
  const winCount = Number(wins) || 0;
  const badges = [
    `${winCount} ${winCount === 1 ? 'Win' : 'Wins'}`,
    `${championships} ${championships === 1 ? 'Title' : 'Titles'}`,
  ];

  return (
    <BentoCard span={12} className="relative overflow-hidden bg-surface/60">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.85 }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 90% 120% at 0% 50%, color-mix(in srgb, var(--team-secondary) 22%, transparent), transparent 62%)',
        }}
      />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="label-caps text-text-mid">{season} Constructor Dossier</span>
          <div className="flex flex-wrap items-end gap-4">
            <span className="hero-number text-[clamp(56px,10vw,104px)] text-accent">P{position}</span>
            <div className="flex flex-col gap-0.5 pb-1">
              <span className="font-mono text-lg text-zinc-200">{points} PTS</span>
              <span className="label-caps text-zinc-500">Championship</span>
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
