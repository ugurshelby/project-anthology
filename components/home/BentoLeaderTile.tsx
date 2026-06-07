import { SafeImage } from '@/components/ui/SafeImage';
import { driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import type { DriverStandingRow } from '@/lib/f1/mrdata';

interface BentoLeaderTileProps {
  leader: DriverStandingRow | null;
}

export function BentoLeaderTile({ leader }: BentoLeaderTileProps) {
  if (!leader) {
    return (
      <section className="bento-panel bento-panel-accent bento-tile-fill justify-center p-4 lg:p-12">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Standings sync pending — check back after the next cron run.
        </p>
      </section>
    );
  }

  const driverSrc = driverIconSrc(leader.driverCode, leader.driverName);
  const teamSrc = teamIconSrc(leader.constructorName);
  const nameParts = leader.driverName.toUpperCase().split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') || leader.driverName.toUpperCase();

  return (
    <section className="bento-panel bento-panel-accent relative flex h-full min-h-0 items-end overflow-hidden">
      {driverSrc ? (
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={driverSrc}
            alt=""
            fill
            className="object-cover opacity-30 mix-blend-luminosity grayscale"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, var(--background) 0%, rgba(10,10,10,0.4) 50%, transparent 100%)',
            }}
          />
        </div>
      ) : null}

      <div className="relative z-10 flex h-full w-full flex-col justify-between gap-4 p-4 lg:flex-row lg:items-end lg:p-12">
        <div>
          <span
            className="mb-2 flex items-center gap-2 font-condensed text-[10px] uppercase tracking-[0.2em] lg:mb-2 lg:text-[11px]"
            style={{ color: 'var(--accent)' }}
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            Championship Leader
          </span>
          <h1
            className="font-display leading-[0.9] tracking-[0.04em] text-[clamp(2rem,10vw,6.25rem)] lg:text-[100px]"
            style={{ color: 'var(--paper)' }}
          >
            <span className="lg:hidden">{leader.driverName.toUpperCase()}</span>
            <span className="hidden lg:inline">
              {firstName}
              <br />
              {lastName}
            </span>
          </h1>
          <div className="mt-3 flex items-center gap-3 lg:mt-4 lg:gap-4">
            <div className="h-1 w-8 lg:w-12" style={{ backgroundColor: 'var(--accent)' }} />
            {teamSrc ? (
              <SafeImage
                src={teamSrc}
                alt=""
                width={24}
                height={24}
                className="h-5 w-5 object-contain opacity-90 lg:h-6 lg:w-6"
              />
            ) : null}
            <span
              className="font-condensed text-[10px] uppercase tracking-[0.12em] lg:text-xl lg:tracking-[0.2em]"
              style={{ color: 'var(--paper)' }}
            >
              {leader.constructorName}
            </span>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <span
            className="font-mono text-[10px] uppercase tracking-wider lg:text-sm"
            style={{ color: 'var(--accent)' }}
          >
            Points Total
          </span>
          <span
            className="font-display block text-4xl leading-none tracking-[0.04em] lg:text-[120px]"
            style={{ color: 'var(--paper)' }}
          >
            {leader.points}
          </span>
        </div>
      </div>
    </section>
  );
}
