import type { RadioMomentRow } from '@/types/database';

export function RadioMomentCard({ moment }: { moment: RadioMomentRow }) {
  return (
    <li className="anthology-card p-4">
      <p
        className="font-mono text-[9px] uppercase tracking-wider"
        style={{ color: 'var(--muted)' }}
      >
        {moment.year ?? '—'} · R{moment.round ?? '—'} · {moment.gp_name ?? 'GP'}
      </p>
      <p
        className="mt-1 font-display text-[1.3rem] tracking-[0.04em]"
        style={{ color: 'var(--paper)' }}
      >
        {moment.driver ?? 'Unknown'} — {moment.team ?? 'Team'}
      </p>
      {moment.transcript ? (
        <p className="mt-2 line-clamp-2 text-xs font-light text-muted" style={{ color: 'var(--muted)' }}>
          {moment.transcript}
        </p>
      ) : null}
      <div className="mt-4 flex items-center gap-3 border border-border bg-surface px-3 py-2">
        {moment.audio_url ? (
          <audio controls preload="none" className="h-8 flex-1 max-w-full">
            <source src={moment.audio_url} />
          </audio>
        ) : (
          <span className="font-mono text-[10px] text-muted" style={{ color: 'var(--muted)' }}>
            Audio URL pending sync
          </span>
        )}
      </div>
    </li>
  );
}
