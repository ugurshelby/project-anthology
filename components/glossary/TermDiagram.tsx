import type { JSX, ReactNode } from 'react';
import type { TermDiagramId } from '@/data/glossary/terms';

const svgClass = 'h-14 w-14 text-white/25 md:h-16 md:w-16';

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={svgClass}>
      {children}
    </svg>
  );
}

function DiffuserIcon() {
  return (
    <Svg>
      <path d="M8 44 L28 20 H36 L56 44" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 44 C24 32 40 32 50 44" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 44 C28 36 36 36 44 44" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="1" />
    </Svg>
  );
}

function DrsIcon() {
  return (
    <Svg>
      <path d="M10 38 H54" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 38 L22 18 H42 L48 38" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 16 L40 10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 22 H38" stroke="currentColor" strokeWidth="1" />
    </Svg>
  );
}

function GroundEffectIcon() {
  return (
    <Svg>
      <path d="M8 28 C20 18 44 18 56 28" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 40 C22 28 42 28 54 40" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="48" x2="56" y2="48" stroke="currentColor" strokeWidth="1" />
      <path d="M16 40 V48 M32 38 V48 M48 40 V48" stroke="currentColor" strokeWidth="1" />
    </Svg>
  );
}

function DownforceIcon() {
  return (
    <Svg>
      <path d="M32 10 V42" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 42 L22 30 M32 42 L42 30" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="32" cy="50" rx="18" ry="6" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

function SlipstreamIcon() {
  return (
    <Svg>
      <rect x="8" y="26" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 31 C38 18 50 18 58 31 C50 44 38 44 28 31" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

function ErsIcon() {
  return (
    <Svg>
      <rect x="14" y="18" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M30 18 V12 H38" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 32 L32 24 L32 30 L38 32 L32 40 L32 34 Z" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

function TurboIcon() {
  return (
    <Svg>
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 18 L36 32 L32 46 L28 32 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M46 26 H56 V38 H46" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

function ActiveSuspensionIcon() {
  return (
    <Svg>
      <line x1="16" y1="48" x2="48" y2="48" stroke="currentColor" strokeWidth="1.5" />
      <rect x="28" y="14" width="8" height="20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 34 V48" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 28 H40" stroke="currentColor" strokeWidth="1" />
    </Svg>
  );
}

function GrainingIcon() {
  return (
    <Svg>
      <ellipse cx="32" cy="34" rx="20" ry="16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 28 C22 24 26 32 30 26 C34 22 38 30 44 26" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="22" cy="38" r="1.5" fill="currentColor" />
      <circle cx="30" cy="42" r="1.5" fill="currentColor" />
      <circle cx="40" cy="38" r="1.5" fill="currentColor" />
    </Svg>
  );
}

function ParcFermeIcon() {
  return (
    <Svg>
      <rect x="12" y="16" width="40" height="32" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 16 L32 8 L52 16" stroke="currentColor" strokeWidth="1.5" />
      <rect x="28" y="30" width="8" height="18" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

function UndercutIcon() {
  return (
    <Svg>
      <path d="M10 40 C22 40 22 24 34 24 C46 24 46 40 56 40" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 48 H56" stroke="currentColor" strokeWidth="1" />
      <circle cx="22" cy="40" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="46" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

const DIAGRAMS: Record<TermDiagramId, () => JSX.Element> = {
  diffuser: DiffuserIcon,
  downforce: DownforceIcon,
  drs: DrsIcon,
  ers: ErsIcon,
  'ground-effect': GroundEffectIcon,
  slipstream: SlipstreamIcon,
  turbo: TurboIcon,
  'active-suspension': ActiveSuspensionIcon,
  graining: GrainingIcon,
  'parc-ferme': ParcFermeIcon,
  undercut: UndercutIcon,
};

export function TermDiagram({ id }: { id: TermDiagramId }) {
  const Icon = DIAGRAMS[id];
  return <Icon />;
}
