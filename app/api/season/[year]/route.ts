import { NextResponse } from 'next/server';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ year: string }> },
): Promise<NextResponse> {
  const { year: yearStr } = await params;
  const year = Number(yearStr);

  if (!Number.isFinite(year) || year < F1_SEASON_MIN || year > CURRENT_SEASON) {
    return NextResponse.json({ error: 'Invalid season year' }, { status: 400 });
  }

  try {
    const data = await getSeasonData(year);
    const cacheControl =
      year < CURRENT_SEASON
        ? 'public, s-maxage=86400, stale-while-revalidate=604800'
        : 'public, s-maxage=60, stale-while-revalidate=300';

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': cacheControl },
    });
  } catch (error) {
    console.error('[api/season] failed:', error);
    return NextResponse.json({ error: 'Failed to fetch season data' }, { status: 500 });
  }
}
