export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  year: number | null;
  era: string | null;
  category: string | null;
  tags: string[] | null;
  cover_image: string | null;
  cover_image_landscape: string | null;
  cover_image_portrait: string | null;
  content: Record<string, unknown> | null;
  published: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface RadioMoment {
  id: string;
  slug: string;
  driver: string;
  team: string;
  constructor_id: string | null;
  quote: string;
  context: string | null;
  significance: string | null;
  year: number | null;
  round: number | null;
  gp_name: string | null;
  tags: string[] | null;
  cover_image: string | null;
  audio_url: string | null;
  published: boolean;
  created_at: string;
}

export interface Circuit {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  flag_emoji: string | null;
  first_f1_year: number | null;
  lap_length_km: number | null;
  lap_record_time: string | null;
  lap_record_driver: string | null;
  lap_record_year: number | null;
  drs_zones: number | null;
  overtaking_difficulty: number | null;
  character_tags: string[] | null;
  editorial: string | null;
  motorsport_legacy: string | null;
  iconic_moment_year: number | null;
  iconic_moment: string | null;
  cover_image: string | null;
  svg_path: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface F1Snapshot {
  id: string;
  season: number;
  round: number | null;
  type: string;
  data: Record<string, unknown>;
  source: string;
  fetched_at: string;
}

export interface NewsCache {
  id: string;
  source: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  summary: string | null;
  tags: string[] | null;
  cached_at: string;
}

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: Story;
        Insert: Omit<Story, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Story>;
      };
      radio_moments: {
        Row: RadioMoment;
        Insert: Omit<RadioMoment, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<RadioMoment>;
      };
      circuits: {
        Row: Circuit;
        Insert: Omit<Circuit, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Circuit>;
      };
      f1_snapshots: {
        Row: F1Snapshot;
        Insert: Omit<F1Snapshot, 'id' | 'fetched_at'> & {
          id?: string;
          fetched_at?: string;
        };
        Update: Partial<F1Snapshot>;
      };
      news_cache: {
        Row: NewsCache;
        Insert: Omit<NewsCache, 'id' | 'cached_at'> & {
          id?: string;
          cached_at?: string;
        };
        Update: Partial<NewsCache>;
      };
    };
  };
}
