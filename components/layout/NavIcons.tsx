import type { NavIconKey } from './nav-items';

interface IconProps {
  className?: string;
}

/** Consistent 1.75px stroke, 24x24 viewBox, no fills — matches SiteHeader's SearchIcon. */
const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V21h3.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function SeasonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <path d="M4 12c0-4.4 3.6-8 8-8 4.9 0 8 3.6 8 8" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 4v2.5M20 12h-2.5M4 12h2.5" />
      <path d="M17 17.5 13.5 14" />
    </svg>
  );
}

function DriversIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <circle cx="12" cy="7.5" r="3.25" />
      <path d="M5 20.5c.8-3.6 3.6-5.8 7-5.8s6.2 2.2 7 5.8" />
    </svg>
  );
}

function AnthologyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <path d="M4 5.2c1.5-.9 3.4-1.2 5-.9 1 .2 2 .6 3 1.2 1-.6 2-1 3-1.2 1.6-.3 3.5 0 5 .9v13.4c-1.5-.9-3.4-1.2-5-.9-1 .2-2 .6-3 1.2-1-.6-2-1-3-1.2-1.6-.3-3.5 0-5 .9Z" />
      <path d="M12 5.5v13.4" />
    </svg>
  );
}

function TeamsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <circle cx="8.5" cy="8" r="2.75" />
      <circle cx="16" cy="9.5" r="2.25" />
      <path d="M3.5 20c.5-3.3 2.6-5.2 5-5.2s4.5 1.9 5 5.2" />
      <path d="M14.5 15.2c1.9.3 3.4 1.9 3.8 4.3" />
    </svg>
  );
}

function CircuitsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <path d="M5 8.5c0-2.5 2-4 4.5-4H15c2 0 3.5 1.5 3.5 3.3 0 2-1.6 3.2-3.5 3.2H9c-1.9 0-3.5 1.3-3.5 3.2S6.9 17.5 9 17.5h9" />
    </svg>
  );
}

function NewsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <path d="M7.5 9h5M7.5 12.5h9M7.5 16h9" />
    </svg>
  );
}

function GlossaryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...STROKE}>
      <path d="M6 4.5h10a2 2 0 0 1 2 2V19a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V6.5a2 2 0 0 1 2-2Z" />
      <path d="M8.5 9h6M8.5 12.5h4" />
    </svg>
  );
}

const ICONS: Record<NavIconKey, (props: IconProps) => React.JSX.Element> = {
  home: HomeIcon,
  season: SeasonIcon,
  drivers: DriversIcon,
  anthology: AnthologyIcon,
  teams: TeamsIcon,
  circuits: CircuitsIcon,
  news: NewsIcon,
  glossary: GlossaryIcon,
};

export function NavIcon({ icon, className = 'h-5 w-5' }: { icon: NavIconKey; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} />;
}
