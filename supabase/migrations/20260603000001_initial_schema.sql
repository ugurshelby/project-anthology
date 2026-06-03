-- Project Anthology — initial schema (Masterplan Karar A)
-- 5 tables: stories, radio_moments, circuits, f1_snapshots, news_cache
-- Design: jsonb for raw external data, canonical type CHECK, source tracking,
--         RLS open everywhere (public read / service_role write).
-- Apply: npx supabase db push

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at trigger helper
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- stories — anthology editorial stories
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.stories (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  title       text not null,
  content     jsonb,
  published   boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists stories_set_updated_at on public.stories;
create trigger stories_set_updated_at
  before update on public.stories
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- radio_moments — team-radio moments (transcript + OpenF1 audio)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.radio_moments (
  id              bigint generated always as identity primary key,
  slug            text not null unique,
  driver          text,
  team            text,
  constructor_id  text,
  year            integer,
  round           integer,
  gp_name         text,
  transcript      text,
  audio_url       text,                         -- OpenF1 team_radio recording
  source          text,                         -- 'openf1' | seed origin
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists radio_moments_set_updated_at on public.radio_moments;
create trigger radio_moments_set_updated_at
  before update on public.radio_moments
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- circuits — editorial + aggregated circuit data (Ergast circuitId as PK)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.circuits (
  id          text primary key,                 -- Ergast circuitId, e.g. 'monaco'
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

drop trigger if exists circuits_set_updated_at on public.circuits;
create trigger circuits_set_updated_at
  before update on public.circuits
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- f1_snapshots — Ergast-shaped MRData snapshots (single-table model)
--   round IS NULL  → season-level (calendar, standings_*)
--   round NOT NULL → round-level (results, qualifying, sprint)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.f1_snapshots (
  id          bigint generated always as identity primary key,
  season      integer not null check (season >= 1950 and season <= 2100),
  round       integer check (round is null or (round >= 1 and round <= 99)),
  type        text not null,
  data        jsonb not null,
  source      text not null,
  fetched_at  timestamptz not null default now(),
  constraint f1_snapshots_unique unique (season, round, type),
  -- Canonical type set — runtime drift (driverStandings / results-1) is frozen out.
  constraint f1_snapshots_type_check check (
    type in (
      'calendar',
      'standings_drivers',
      'standings_constructors',
      'results',
      'qualifying',
      'sprint',
      'circuit'
    )
  ),
  -- Source provenance (multi-source architecture, Karar E).
  constraint f1_snapshots_source_check check (
    source in ('f1db', 'jolpica', 'openf1')
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- news_cache — aggregated F1 news (fed by cron sync-news)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.news_cache (
  id            bigint generated always as identity primary key,
  url           text not null unique,
  source        text,
  title         text,
  description   text,
  summary       text,
  image_url     text,
  published_at  timestamptz,
  tags          text[],
  cached_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes (Masterplan Karar A)
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_f1_snapshots_season_type
  on public.f1_snapshots (season, type);
create index if not exists idx_f1_snapshots_season_round_type
  on public.f1_snapshots (season, round, type);
create index if not exists idx_f1_snapshots_fetched_at
  on public.f1_snapshots (fetched_at);

create index if not exists idx_stories_published_sort
  on public.stories (published, sort_order);

create index if not exists idx_radio_published_year
  on public.radio_moments (published, year desc);

create index if not exists idx_news_cache_published
  on public.news_cache (published_at);
create index if not exists idx_news_cache_cached_at
  on public.news_cache (cached_at);
create index if not exists idx_news_cache_tags
  on public.news_cache using gin (tags);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
--   Public SELECT: stories/radio → published only; circuits/snapshots/news → all.
--   Writes (insert/update/delete): service_role only. anon never writes.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.stories       enable row level security;
alter table public.radio_moments enable row level security;
alter table public.circuits      enable row level security;
alter table public.f1_snapshots  enable row level security;
alter table public.news_cache    enable row level security;

-- stories: public reads published rows
drop policy if exists stories_public_read on public.stories;
create policy stories_public_read on public.stories
  for select to anon, authenticated
  using (published = true);

drop policy if exists stories_service_write on public.stories;
create policy stories_service_write on public.stories
  for all to service_role
  using (true) with check (true);

-- radio_moments: public reads published rows
drop policy if exists radio_public_read on public.radio_moments;
create policy radio_public_read on public.radio_moments
  for select to anon, authenticated
  using (published = true);

drop policy if exists radio_service_write on public.radio_moments;
create policy radio_service_write on public.radio_moments
  for all to service_role
  using (true) with check (true);

-- circuits: public reads all
drop policy if exists circuits_public_read on public.circuits;
create policy circuits_public_read on public.circuits
  for select to anon, authenticated
  using (true);

drop policy if exists circuits_service_write on public.circuits;
create policy circuits_service_write on public.circuits
  for all to service_role
  using (true) with check (true);

-- f1_snapshots: public reads all
drop policy if exists f1_snapshots_public_read on public.f1_snapshots;
create policy f1_snapshots_public_read on public.f1_snapshots
  for select to anon, authenticated
  using (true);

drop policy if exists f1_snapshots_service_write on public.f1_snapshots;
create policy f1_snapshots_service_write on public.f1_snapshots
  for all to service_role
  using (true) with check (true);

-- news_cache: public reads all
drop policy if exists news_cache_public_read on public.news_cache;
create policy news_cache_public_read on public.news_cache
  for select to anon, authenticated
  using (true);

drop policy if exists news_cache_service_write on public.news_cache;
create policy news_cache_service_write on public.news_cache
  for all to service_role
  using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table-level grants
--   RLS policies only filter rows AFTER the role has the table privilege.
--   New tables do not auto-grant to anon/authenticated, so PostgREST reads
--   return 42501 without these. Reads → anon/authenticated; writes → service_role
--   (service_role also bypasses RLS, but the grant must exist).
-- ─────────────────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.stories, public.radio_moments, public.circuits,
  public.f1_snapshots, public.news_cache
  to anon, authenticated;

grant select, insert, update, delete on
  public.stories, public.radio_moments, public.circuits,
  public.f1_snapshots, public.news_cache
  to service_role;

grant usage, select on all sequences in schema public to service_role;
