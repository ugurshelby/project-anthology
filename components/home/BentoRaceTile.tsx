import Link from 'next/link';
import { BentoCountdown } from '@/components/home/BentoCountdown';
import { LightsOut } from '@/components/ui/LightsOut';
import { SafeImage } from '@/components/ui/SafeImage';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import type { BentoRacePanel } from '@/components/home/types';

function circuitHref(race: BentoRacePanel['race']): string {
  const id = race.Circuit?.circuitId?.trim();
  return id ? `/circuits/${id}` : '/circuits';
}

interface BentoRaceTileProps {
  panel: BentoRacePanel;
  variant?: 'compact' | 'sidebar';
  renderNowMs: number;
}

export function BentoRaceTile({ panel, variant = 'compact', renderNowMs }: BentoRaceTileProps) {
  const { race, role, countdownTargetMs, detail, countdown } = panel;
  const circuitSrc = circuitIconSrc(race.Circuit?.circuitId);
  const raceLabel = race.raceName ?? 'Grand Prix';
  const round = race.round != null ? `R${race.round}` : '';
  const locality = race.Circuit?.Location?.locality;
  const country = race.Circuit?.Location?.country;
  const location = [locality, country].filter(Boolean).join(', ');

  if (variant === 'sidebar') {
    return (
      <Link
        href={circuitHref(race)}
        className="bento-panel bento-panel-accent bento-tile-fill gap-6 p-6 lg:p-8"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
            <span
              className="font-condensed text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--muted)' }}
            >
              {role}
            </span>
          </div>
          <h2
            className="font-display text-3xl leading-tight tracking-[0.04em] lg:text-4xl"
            style={{ color: 'var(--paper)' }}
          >
            {raceLabel}
          </h2>
          {location ? (
            <p className="mt-1 font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {location.toUpperCase()}
            </p>
          ) : null}
        </div>

        {circuitSrc ? (
          <div
            className="flex min-h-0 flex-1 w-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <SafeImage
              src={circuitSrc}
              alt={race.Circuit?.circuitName ?? raceLabel}
              width={280}
              height={120}
              className="h-24 w-3/4 max-h-[40%] object-contain opacity-70 transition-opacity hover:opacity-100 lg:h-32 lg:max-h-none"
            />
          </div>
        ) : null}

        {countdownTargetMs != null ? (
          <>
            <LightsOut raceStartMs={countdownTargetMs} initialNowMs={renderNowMs} />
            <BentoCountdown
              targetMs={countdownTargetMs}
              raceName={raceLabel}
              initialNowMs={renderNowMs}
              fallback={
                countdown || detail ? (
                  <p className="font-mono text-sm tracking-wider" style={{ color: 'var(--muted)' }}>
                    {countdown ?? detail}
                  </p>
                ) : null
              }
            />
          </>
        ) : countdown ? (
          <p className="font-mono text-sm tracking-wider" style={{ color: 'var(--muted)' }}>
            {countdown}
          </p>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={circuitHref(race)}
      className="bento-panel bento-panel-accent relative flex min-h-[140px] flex-col justify-between p-3 lg:p-6"
    >
      <div>
        <p
          className="mb-1 font-condensed text-[9px] uppercase tracking-[0.2em] lg:text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          {role}
          {round ? ` · ${round}` : ''}
        </p>
        <h3
          className="font-display text-xl leading-tight tracking-[0.04em] lg:text-2xl"
          style={{ color: 'var(--paper)' }}
        >
          {raceLabel}
        </h3>
      </div>

      <div className="mt-2">
        {countdownTargetMs != null ? (
          <>
            <p className="mb-0.5 font-mono text-[9px] uppercase" style={{ color: 'var(--muted)' }}>
              Countdown
            </p>
            <BentoCountdown
              targetMs={countdownTargetMs}
              raceName={raceLabel}
              initialNowMs={renderNowMs}
              variant="compact"
              fallback={
                detail || countdown ? (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                    {detail ?? countdown}
                  </p>
                ) : null
              }
            />
          </>
        ) : (
          <p className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
            {detail ?? countdown ?? ''}
          </p>
        )}
      </div>

      {circuitSrc ? (
        <SafeImage
          src={circuitSrc}
          alt=""
          width={80}
          height={40}
          className="absolute -bottom-2 -right-2 h-12 w-12 object-contain opacity-10 lg:hidden"
        />
      ) : null}
    </Link>
  );
}
