import { SeasonData, NewsItem, Driver, Constructor, Story } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://project-anthology-five.vercel.app';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ezocovgpybrluvgaqnft.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function supabaseFetch<T>(table: string, query: string = ''): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${table}`);
  return res.json() as Promise<T>;
}

export async function fetchSeason(year: number): Promise<SeasonData> {
  return apiFetch<SeasonData>(`/api/season/${year}`);
}

export async function fetchNews(): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>('/api/news');
}

export async function fetchDrivers(): Promise<Driver[]> {
  const year = new Date().getFullYear();
  const season = await fetchSeason(year);
  return [...season.driverStandings].sort((a, b) =>
    a.familyName.localeCompare(b.familyName)
  );
}

export async function fetchTeams(): Promise<Constructor[]> {
  const year = new Date().getFullYear();
  const season = await fetchSeason(year);
  return [...season.constructorStandings].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function fetchStories(): Promise<Story[]> {
  const rows = await supabaseFetch<Array<Record<string, unknown>>>('stories', '?select=slug,title,kicker,cover_image_url,excerpt,published_at&order=published_at.desc');
  return rows.map((r) => ({
    slug: r['slug'] as string,
    title: r['title'] as string,
    kicker: r['kicker'] as string | undefined,
    coverImageUrl: r['cover_image_url'] as string | undefined,
    excerpt: r['excerpt'] as string | undefined,
    publishedAt: r['published_at'] as string,
  }));
}

export async function fetchStory(slug: string): Promise<Story> {
  const rows = await supabaseFetch<Array<Record<string, unknown>>>('stories', `?slug=eq.${slug}&select=*&limit=1`);
  if (!rows[0]) throw new Error(`Story not found: ${slug}`);
  const r = rows[0];
  return {
    slug: r['slug'] as string,
    title: r['title'] as string,
    kicker: r['kicker'] as string | undefined,
    coverImageUrl: r['cover_image_url'] as string | undefined,
    excerpt: r['excerpt'] as string | undefined,
    content: r['content'] as string | undefined,
    publishedAt: r['published_at'] as string,
  };
}

export async function registerPushToken(token: string, preferences: Record<string, boolean>): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/push/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, preferences }),
  });
  if (!res.ok) throw new Error(`Push registration error ${res.status}`);
}
