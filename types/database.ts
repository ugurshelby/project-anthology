/**
 * TypeScript types for the Supabase schema (supabase/migrations/001_initial_schema.sql).
 * Kept in exact sync with the migration. `Row` = select shape, `Insert` =
 * write shape (identity/defaults optional), `Update` = partial write.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Canonical f1_snapshots.type set (frozen by CHECK constraint). */
export type SnapshotType =
  | 'calendar'
  | 'standings_drivers'
  | 'standings_constructors'
  | 'results'
  | 'qualifying'
  | 'sprint'
  | 'circuit';

/** f1_snapshots.source set (frozen by CHECK constraint). */
export type SnapshotSource = 'f1db' | 'jolpica' | 'openf1';

// ── stories ──────────────────────────────────────────────────────────────────
export interface StoryRow {
  id: number;
  slug: string;
  title: string;
  content: Json | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface StoryInsert {
  slug: string;
  title: string;
  content?: Json | null;
  published?: boolean;
  sort_order?: number;
}
export type StoryUpdate = Partial<StoryInsert>;

// ── radio_moments ──────────────────────────────────────────────────────────
export interface RadioMomentRow {
  id: number;
  slug: string;
  driver: string | null;
  team: string | null;
  constructor_id: string | null;
  year: number | null;
  round: number | null;
  gp_name: string | null;
  transcript: string | null;
  audio_url: string | null;
  source: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}
export interface RadioMomentInsert {
  slug: string;
  driver?: string | null;
  team?: string | null;
  constructor_id?: string | null;
  year?: number | null;
  round?: number | null;
  gp_name?: string | null;
  transcript?: string | null;
  audio_url?: string | null;
  source?: string | null;
  published?: boolean;
}
export type RadioMomentUpdate = Partial<RadioMomentInsert>;

// ── circuits ─────────────────────────────────────────────────────────────────
export interface CircuitRow {
  id: string;
  data: Json;
  updated_at: string;
}
export interface CircuitInsert {
  id: string;
  data?: Json;
}
export type CircuitUpdate = Partial<Omit<CircuitInsert, 'id'>>;

// ── f1_snapshots ─────────────────────────────────────────────────────────────
export interface F1SnapshotRow {
  id: number;
  season: number;
  round: number | null;
  type: SnapshotType;
  data: Json;
  source: SnapshotSource;
  fetched_at: string;
}
export interface F1SnapshotInsert {
  season: number;
  round?: number | null;
  type: SnapshotType;
  data: Json;
  source: SnapshotSource;
  fetched_at?: string;
}
export type F1SnapshotUpdate = Partial<F1SnapshotInsert>;

// ── news_cache ───────────────────────────────────────────────────────────────
export interface NewsCacheRow {
  id: number;
  url: string;
  source: string | null;
  title: string | null;
  description: string | null;
  summary: string | null;
  image_url: string | null;
  published_at: string | null;
  tags: string[] | null;
  cached_at: string;
}
export interface NewsCacheInsert {
  url: string;
  source?: string | null;
  title?: string | null;
  description?: string | null;
  summary?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  // tags is text[] in Postgres; typed as unknown to satisfy supabase-js generics
  tags?: unknown;
}
export type NewsCacheUpdate = Partial<NewsCacheInsert>;

// ── Database (supabase-js generic) ───────────────────────────────────────────
// supabase-js v2 requires `Relationships: []` on each table entry to correctly
// resolve Insert/Update types through its generic machinery.
export interface Database {
  public: {
    Tables: {
      stories: {
        Row: StoryRow;
        Insert: StoryInsert;
        Update: StoryUpdate;
        Relationships: never[];
      };
      radio_moments: {
        Row: RadioMomentRow;
        Insert: RadioMomentInsert;
        Update: RadioMomentUpdate;
        Relationships: never[];
      };
      circuits: {
        Row: CircuitRow;
        Insert: CircuitInsert;
        Update: CircuitUpdate;
        Relationships: never[];
      };
      f1_snapshots: {
        Row: F1SnapshotRow;
        Insert: F1SnapshotInsert;
        Update: F1SnapshotUpdate;
        Relationships: never[];
      };
      news_cache: {
        Row: NewsCacheRow;
        Insert: NewsCacheInsert;
        Update: NewsCacheUpdate;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
