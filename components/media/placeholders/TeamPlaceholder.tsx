'use client';

import { useTranslations } from 'next-intl';
import { PlaceholderArt } from './PlaceholderArt';

interface TeamPlaceholderProps {
  seed: string;
  name?: string;
  /** Kept for callers; the artwork carries its own accent. */
  teamColor?: string;
  priority?: boolean;
  className?: string;
  /** Small slots (hero badge, chips): the shield alone, no caption. */
  compact?: boolean;
}

/**
 * Team mark (owner decisions 2026-10-27, 8.11, and 2026-10-31): every team shows the same shield artwork in place
 * of a logo, never an official mark; the caption names the team outside compact slots.
 */
export function TeamPlaceholder({ seed, name, priority = false, className = 'h-full w-full', compact = false }: TeamPlaceholderProps) {
  const t = useTranslations('ui.common');
  const cleanName = (name || seed.replace(/[-_]/g, ' ')).toUpperCase();
  return (
    <PlaceholderArt
      kind="team"
      ariaLabel={t('teamMark', { name: cleanName })}
      caption={compact ? undefined : cleanName}
      fit={compact ? 'contain' : 'cover'}
      priority={priority}
      className={className}
    />
  );
}
