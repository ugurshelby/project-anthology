'use client';

import type { ReactNode } from 'react';
import { RaceCountdown } from '@/components/ui/RaceCountdown';

interface BentoCountdownProps {
  targetMs: number;
  raceName: string;
  initialNowMs: number;
  variant?: 'compact' | 'full';
  fallback?: ReactNode;
}

export function BentoCountdown({
  targetMs,
  raceName,
  initialNowMs,
  variant = 'full',
  fallback,
}: BentoCountdownProps) {
  return (
    <RaceCountdown
      targetDate={new Date(targetMs)}
      raceName={raceName}
      variant={variant === 'compact' ? 'circuit' : 'home'}
      embedded
      initialNowMs={initialNowMs}
      fallback={fallback}
    />
  );
}
