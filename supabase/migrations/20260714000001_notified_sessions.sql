-- notified_sessions — dedupe guard for /api/cron/notify-sessions.
-- One row per (season, round, session_type) that has already been pushed;
-- the cron checks this before sending so a session is never notified twice
-- across repeated 5-10min cron invocations.
create table if not exists public.notified_sessions (
  id            bigint generated always as identity primary key,
  season        integer not null check (season >= 1950 and season <= 2100),
  round         integer not null check (round >= 1 and round <= 99),
  session_type  text not null check (session_type in ('qualifying', 'sprint', 'race')),
  notified_at   timestamptz not null default now(),
  constraint notified_sessions_unique unique (season, round, session_type)
);

alter table public.notified_sessions enable row level security;

-- Service-role key only (same pattern as push_subscriptions) — no anon/authenticated access.
revoke all on public.notified_sessions from anon, authenticated;
