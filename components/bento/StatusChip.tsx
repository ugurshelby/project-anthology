type Status = 'done' | 'next' | 'upcoming';

const STATUS_LABEL: Record<Status, string> = {
  done: 'DONE',
  next: 'NEXT',
  upcoming: 'UPCOMING',
};

/**
 * Status chip (design.md §6) — icon + text, never color alone. NEXT carries the
 * single accent cue; DONE/UPCOMING stay neutral. Inline SVG icons (no emoji).
 */
export function StatusChip({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    done: 'border-white/10 bg-white/[0.06] text-text-mid',
    next: 'border-accent/50 bg-accent/10 text-accent',
    upcoming: 'border-zinc-500/30 bg-zinc-500/10 text-text-mid',
  };

  return (
    <span
      className={[
        'data-tabular inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-chip)] border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase',
        styles[status],
      ].join(' ')}
    >
      <StatusIcon status={status} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'done') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (status === 'next') {
    return <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />;
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/** Result chip (P1, DNF, +5s…) — mono, neutral stroke. */
export function ResultChip({ value }: { value: string }) {
  return (
    <span className="data-tabular inline-flex items-center rounded-[var(--radius-chip)] border border-hairline px-2 py-0.5 text-text">
      {value}
    </span>
  );
}
