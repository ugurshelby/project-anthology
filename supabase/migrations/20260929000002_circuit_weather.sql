-- circuit_weather — forward-looking weather only (Open-Meteo forecast).
--
-- Deliberately NOT a general-purpose weather archive: only ever holds a row
-- for the upcoming/current race weekend's circuit. The sync-f1 cron upserts
-- the next race's forecast on every run and deletes rows for races that have
-- already finished — so there is never a "yesterday's weather" row sitting
-- in the table. History has no value here; only forward/live forecast does.
create table if not exists public.circuit_weather (
  id          bigint generated always as identity primary key,
  circuit_id  text not null,
  season      integer not null check (season >= 1950 and season <= 2100),
  round       integer not null check (round >= 1 and round <= 99),
  data        jsonb not null,
  fetched_at  timestamptz not null default now(),
  constraint circuit_weather_unique unique (season, round)
);

create index if not exists idx_circuit_weather_season_round
  on public.circuit_weather (season, round);

alter table public.circuit_weather enable row level security;

drop policy if exists circuit_weather_public_read on public.circuit_weather;
create policy circuit_weather_public_read on public.circuit_weather
  for select using (true);

drop policy if exists circuit_weather_service_write on public.circuit_weather;
create policy circuit_weather_service_write on public.circuit_weather
  for all to service_role using (true) with check (true);

grant select on public.circuit_weather to anon, authenticated;
grant select, insert, update, delete on public.circuit_weather to service_role;
