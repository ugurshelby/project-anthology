-- Prevent duplicate season-level snapshots (round IS NULL)
-- Replaces the existing UNIQUE(season, round, type) which treats NULL as distinct
CREATE UNIQUE INDEX IF NOT EXISTS idx_f1_snapshots_season_type_no_round
  ON public.f1_snapshots (season, type)
  WHERE round IS NULL;
