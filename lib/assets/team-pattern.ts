/**
 * Team DNA — constructor-specific CSS background texture, mirroring
 * mobile's components/ui/TeamPattern.tsx (React Native SVG version) so both
 * platforms share the same per-team visual identity beyond flat color.
 */
type PatternKind = 'diagonal' | 'grid' | 'chevron' | 'dots' | 'hatch' | 'arrows';

const TEAM_PATTERN: Record<string, PatternKind> = {
  ferrari: 'diagonal',
  mercedes: 'grid',
  red_bull: 'chevron',
  mclaren: 'arrows',
  aston_martin: 'hatch',
  alpine: 'dots',
  williams: 'grid',
  rb: 'chevron',
  kick_sauber: 'dots',
  audi: 'dots',
  haas: 'hatch',
  cadillac: 'diagonal',
};

function patternCss(kind: PatternKind, color: string): string {
  switch (kind) {
    case 'diagonal':
      return `repeating-linear-gradient(35deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 14px)`;
    case 'grid':
      return `repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 14px), repeating-linear-gradient(90deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 14px)`;
    case 'chevron':
      return `repeating-linear-gradient(135deg, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 12px), repeating-linear-gradient(45deg, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 12px)`;
    case 'dots':
      return `radial-gradient(${color} 1.2px, transparent 1.2px)`;
    case 'hatch':
      return `repeating-linear-gradient(45deg, ${color} 0px, ${color} 7px, transparent 7px, transparent 14px)`;
    case 'arrows':
      return `repeating-linear-gradient(45deg, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 12px), repeating-linear-gradient(-45deg, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 12px)`;
  }
}

/** Returns a CSS `background-image` + `background-size` pair for a team's signature micro-texture at a given opacity. */
export function teamPatternStyle(constructorId: string | undefined | null, color: string, opacity = 0.08): { backgroundImage: string; backgroundSize: string } {
  const kind = TEAM_PATTERN[constructorId ?? ''] ?? 'grid';
  const tintedColor = `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
  const size = kind === 'dots' ? '14px 14px' : '28px 28px';
  return { backgroundImage: patternCss(kind, tintedColor), backgroundSize: size };
}
