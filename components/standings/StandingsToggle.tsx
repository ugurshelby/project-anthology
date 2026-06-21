'use client';

import { useState, type ReactNode } from 'react';

/**
 * Drivers/Teams toggle (design.md §7). Both panels arrive pre-rendered from the
 * server; this client island only switches which is shown. Active tab underline
 * uses the accent (team color on profile pages via --accent override).
 */
export function StandingsToggle({
  driversPanel,
  teamsPanel,
}: {
  driversPanel: ReactNode;
  teamsPanel: ReactNode;
}) {
  const [tab, setTab] = useState<'drivers' | 'teams'>('drivers');

  return (
    <>
      <div className="flex items-center gap-6 border-b border-hairline" role="tablist">
        <Tab active={tab === 'drivers'} onClick={() => setTab('drivers')}>
          Drivers
        </Tab>
        <Tab active={tab === 'teams'} onClick={() => setTab('teams')}>
          Teams
        </Tab>
      </div>
      <div>{tab === 'drivers' ? driversPanel : teamsPanel}</div>
    </>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'label-caps relative cursor-pointer pb-3 pt-1 transition-colors',
        active ? 'text-text-hi' : 'text-text-mid hover:text-text',
      ].join(' ')}
    >
      {children}
      {active ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" aria-hidden /> : null}
    </button>
  );
}
