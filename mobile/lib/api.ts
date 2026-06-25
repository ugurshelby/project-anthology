import { SeasonData, NewsItem, Driver, Constructor, Story } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://project-anthology-five.vercel.app';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
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
  return supabaseFetch<Driver[]>('drivers', '?select=*&order=familyName.asc');
}

export async function fetchTeams(): Promise<Constructor[]> {
  return supabaseFetch<Constructor[]>('constructors', '?select=*&order=name.asc');
}

export async function fetchStories(): Promise<Story[]> {
  return supabaseFetch<Story[]>('stories', '?select=slug,title,kicker,cover_image_url,excerpt,published_at&order=published_at.desc');
}

export async function fetchStory(slug: string): Promise<Story> {
  const rows = await supabaseFetch<Story[]>('stories', `?slug=eq.${slug}&select=*&limit=1`);
  if (!rows[0]) throw new Error(`Story not found: ${slug}`);
  return rows[0];
}

export async function registerPushToken(token: string, preferences: Record<string, boolean>): Promise<void> {
  await fetch(`${BASE_URL}/api/push/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, preferences }),
  });
}
