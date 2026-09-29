-- Add 'pitstops' to the f1_snapshots canonical type set.
-- Pit-stop data (Jolpica /pitstops.json) is MRData-shaped like results/qualifying/
-- sprint, so it fits the existing single-table model — no new table needed.
-- round-level only (round NOT NULL), fetched alongside race results.

alter table public.f1_snapshots
  drop constraint f1_snapshots_type_check;

alter table public.f1_snapshots
  add constraint f1_snapshots_type_check check (
    type in (
      'calendar',
      'standings_drivers',
      'standings_constructors',
      'results',
      'qualifying',
      'sprint',
      'circuit',
      'pitstops'
    )
  );
