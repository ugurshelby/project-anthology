-- Turkish machine-translation columns for news_cache. Populated by sync-news
-- (lib/news/translate.ts, MyMemory — free, no API key), only for articles
-- that don't already have a stored translation, so re-runs never re-translate
-- unchanged articles. Null means "not translated yet / translation failed" —
-- callers fall back to the English title/description.
alter table public.news_cache
  add column if not exists title_tr text,
  add column if not exists description_tr text;
