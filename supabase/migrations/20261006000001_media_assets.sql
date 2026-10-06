-- media_assets — resolved, license-checked image per entity (driver / team / car / circuit).
--
-- The site NEVER calls Wikimedia (or any image source) at request time. A
-- scheduled sync (app/api/cron/sync-media) resolves one image per entity,
-- verifies its license, re-encodes it to WebP variants, uploads them to the
-- public `media` Storage bucket and records the result here. Pages read this
-- table (public read, resolved rows only). No row = the UI draws a placeholder.
--
-- entity_key conventions (Jolpica/Ergast ids, same slugs as the profile URLs):
--   driver  -> driverId            e.g. 'max_verstappen'
--   team    -> constructorId       e.g. 'red_bull'
--   circuit -> circuitId           e.g. 'suzuka'
--   car     -> '<constructorId>:<season>'   e.g. 'mclaren:2025'
--              'iconic:<slug>'              e.g. 'iconic:ferrari-f2004'

create table if not exists public.media_assets (
  id               bigint generated always as identity primary key,
  entity_type      text not null check (entity_type in ('driver', 'team', 'car', 'circuit')),
  entity_key       text not null check (entity_key ~ '^[a-z0-9_.:-]{1,80}$'),
  season           integer check (season is null or (season >= 1950 and season <= 2100)),
  display_name     text,
  wikipedia_url    text,
  extra            jsonb not null default '{}'::jsonb,
  -- Other ids the site uses for the same entity. Live-season pages use Jolpica ids
  -- ('hamilton', 'red_bull'); archive pages use F1DB ids ('lewis-hamilton', 'red-bull').
  -- The read layer matches a requested key against entity_key OR aliases.
  aliases          text[] not null default '{}',

  -- pending  = discovered, never resolved
  -- resolved = image stored and usable
  -- missing  = searched, nothing passed the license/quality gates (placeholder)
  status           text not null default 'pending' check (status in ('pending', 'resolved', 'missing')),
  -- auto = chosen by the pipeline; approved = owner confirmed; rejected = owner
  -- hid it (read layer ignores it, the file goes to rejected_files, re-resolved).
  review           text not null default 'auto' check (review in ('auto', 'approved', 'rejected')),
  rejected_files   text[] not null default '{}',

  -- provenance (kept for every resolved row — attribution + takedown trail)
  source           text,            -- 'wikidata-p18' | 'wikidata-p154' | 'commons-search' | 'curated'
  source_page_url  text,            -- Commons file page
  source_file      text,            -- 'File:Example.jpg'
  author           text,
  license          text,            -- 'CC BY-SA 4.0', 'Public domain', ...
  license_url      text,
  attribution      text,            -- ready-to-render credit line
  is_trademark     boolean not null default false,  -- team logos: copyright-free is not trademark-free
  confidence       numeric(4, 3),

  -- served asset (content-addressed, immutable)
  width            integer,
  height           integer,
  variants         jsonb not null default '[]'::jsonb,   -- [{ "w": 640, "h": 800, "path": "driver/x/ab12cd34/640.webp", "bytes": 31000 }]
  blur_data_url    text,
  dominant_color   text,
  content_sha256   text,

  -- scheduling / diagnostics (never exposed to anon)
  attempts         integer not null default 0,
  last_error       text,
  resolved_at      timestamptz,
  checked_at       timestamptz,
  next_check_at    timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint media_assets_unique unique (entity_type, entity_key)
);

create index if not exists idx_media_assets_due
  on public.media_assets (next_check_at);

create index if not exists idx_media_assets_type_status
  on public.media_assets (entity_type, status);

create index if not exists idx_media_assets_aliases
  on public.media_assets using gin (aliases);

-- Tiny key/value store for the sync (which seasons were already discovered).
create table if not exists public.media_sync_state (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.media_assets enable row level security;
alter table public.media_sync_state enable row level security;

-- Public read: resolved and not owner-rejected rows only.
drop policy if exists media_assets_public_read on public.media_assets;
create policy media_assets_public_read on public.media_assets
  for select to anon, authenticated
  using (status = 'resolved' and review <> 'rejected');

drop policy if exists media_assets_service_write on public.media_assets;
create policy media_assets_service_write on public.media_assets
  for all to service_role using (true) with check (true);

drop policy if exists media_sync_state_service_only on public.media_sync_state;
create policy media_sync_state_service_only on public.media_sync_state
  for all to service_role using (true) with check (true);

-- Column-level grants: anon/authenticated can read only what the UI needs.
-- last_error, attempts, scheduling columns, content hash and rejected_files stay private.
revoke all on public.media_assets from anon, authenticated;
grant select (
  entity_type, entity_key, season, display_name, aliases, status, review,
  source_page_url, source_file, author, license, license_url, attribution, is_trademark,
  width, height, variants, blur_data_url, dominant_color, resolved_at
) on public.media_assets to anon, authenticated;
grant select, insert, update, delete on public.media_assets to service_role;

revoke all on public.media_sync_state from anon, authenticated;
grant select, insert, update, delete on public.media_sync_state to service_role;

-- Public Storage bucket for the re-encoded WebP files (reads are public; writes
-- only through the service role, which bypasses storage RLS).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
