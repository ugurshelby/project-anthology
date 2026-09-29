-- news_stories — one row per real-world story, merged from every outlet that
-- covered it (fed by the sync-news cron). news_cache stays the raw per-article
-- store; pages read this table.
--
-- Retention: 7 days (by published_at) — sync-news deletes older rows.
-- Rewrite state: `fingerprint` = hash of the member article URLs. The AI
-- rewrite only re-runs when the member set changes (never per page view).
create table if not exists public.news_stories (
  id           text primary key,                -- stable: id of the first article that seeded the story
  title        text not null,                   -- EN, original wording (or best source title until rewritten)
  summary      text not null default '',
  title_tr     text,
  summary_tr   text,
  image_url    text,                            -- best reachable member image; NULL = no image (no placeholder)
  published_at timestamptz not null,            -- newest member
  sources      jsonb not null default '[]'::jsonb,  -- [{name,url,title,published_at}]
  fingerprint  text not null,
  rewritten    boolean not null default false,  -- true once title/summary were AI-written
  cached_at    timestamptz not null default now()
);

create index if not exists idx_news_stories_published on public.news_stories (published_at desc);

alter table public.news_stories enable row level security;

drop policy if exists news_stories_public_read on public.news_stories;
create policy news_stories_public_read on public.news_stories
  for select using (true);

drop policy if exists news_stories_service_write on public.news_stories;
create policy news_stories_service_write on public.news_stories
  for all to service_role using (true) with check (true);

grant select on public.news_stories to anon, authenticated;
grant select, insert, update, delete on public.news_stories to service_role;
