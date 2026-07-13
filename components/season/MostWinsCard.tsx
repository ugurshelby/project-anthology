import Image from 'next/image';
import { resolveTeamUiColor } from '@/config/team-colors';
import { teamIconSrc } from '@/lib/assets/f1-icons';

/** "Most Wins · Constructor" bento tile — team-tinted glow + logo, not a bare number. */
export function MostWinsCard({ wins, constructorName }: { wins: string; constructorName?: string }) {
  const teamColor = resolveTeamUiColor(undefined, constructorName);
  const logo = constructorName ? teamIconSrc(constructorName) : null;

  return (
    <div
      className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-[var(--radius)] p-1"
      style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${teamColor} 20%, transparent), transparent 70%)` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 120% at 15% 15%, color-mix(in srgb, ${teamColor} 26%, transparent), transparent 60%)` }}
      />
      <div className="relative z-10 flex items-center justify-between p-3">
        <span className="label-caps text-text-mid">Most Wins · Constructor</span>
        {logo ? (
          <span className="relative h-9 w-9 shrink-0">
            <Image src={logo} alt="" fill sizes="36px" className="object-contain" />
          </span>
        ) : null}
      </div>
      <div className="relative z-10 flex flex-col gap-1 p-3">
        <span className="hero-number text-[clamp(56px,8vw,96px)]" style={{ color: teamColor }}>
          {wins}
        </span>
        {constructorName ? (
          <span className="font-condensed text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {constructorName}
          </span>
        ) : null}
      </div>
    </div>
  );
}
