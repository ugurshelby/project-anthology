-- STORIES
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  year integer,
  era text,
  category text,
  tags text[],
  cover_image text,
  cover_image_landscape text,
  cover_image_portrait text,
  content jsonb,
  published boolean DEFAULT false,
  sort_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RADIO MOMENTS
CREATE TABLE public.radio_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  driver text NOT NULL,
  team text NOT NULL,
  constructor_id text,
  quote text NOT NULL,
  context text,
  significance text,
  year integer,
  round integer,
  gp_name text,
  tags text[],
  cover_image text,
  audio_url text,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- CIRCUITS
CREATE TABLE public.circuits (
  id text PRIMARY KEY,
  name text NOT NULL,
  country text,
  city text,
  flag_emoji text,
  first_f1_year integer,
  lap_length_km numeric,
  lap_record_time text,
  lap_record_driver text,
  lap_record_year integer,
  drs_zones integer,
  overtaking_difficulty integer CHECK (overtaking_difficulty BETWEEN 1 AND 5),
  character_tags text[],
  editorial text,
  motorsport_legacy text,
  iconic_moment_year integer,
  iconic_moment text,
  cover_image text,
  svg_path text,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- F1 SNAPSHOTS
CREATE TABLE public.f1_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season integer NOT NULL,
  round integer,
  type text NOT NULL,
  data jsonb NOT NULL,
  source text DEFAULT 'jolpica',
  fetched_at timestamptz DEFAULT now(),
  UNIQUE(season, round, type)
);
CREATE INDEX idx_f1_snapshots_season ON public.f1_snapshots(season);
CREATE INDEX idx_f1_snapshots_type ON public.f1_snapshots(type);

-- NEWS CACHE
CREATE TABLE public.news_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  title text NOT NULL,
  description text,
  url text UNIQUE NOT NULL,
  image_url text,
  published_at timestamptz,
  summary text,
  tags text[],
  cached_at timestamptz DEFAULT now()
);
CREATE INDEX idx_news_cache_published ON public.news_cache(published_at DESC);

-- UPDATED_AT triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER circuits_updated_at
  BEFORE UPDATE ON public.circuits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f1_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read stories"
  ON public.stories FOR SELECT
  USING (published = true);

CREATE POLICY "Public read radio"
  ON public.radio_moments FOR SELECT
  USING (published = true);

CREATE POLICY "Public read circuits"
  ON public.circuits FOR SELECT
  USING (true);

CREATE POLICY "Public read snapshots"
  ON public.f1_snapshots FOR SELECT
  USING (true);

CREATE POLICY "Public read news"
  ON public.news_cache FOR SELECT
  USING (true);

-- Service role full access (server-side only)
CREATE POLICY "Service role full access stories"
  ON public.stories FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access radio"
  ON public.radio_moments FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access circuits"
  ON public.circuits FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access snapshots"
  ON public.f1_snapshots FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access news"
  ON public.news_cache FOR ALL
  USING (auth.role() = 'service_role');
