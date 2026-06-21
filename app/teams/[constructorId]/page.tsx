import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeamProfile, getTeamSeasons, getTeamCareer } from '@/lib/data/entities';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ constructorId: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(_raw: string | undefined): number {
  return CURRENT_SEASON;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { constructorId } = await params;
  const season = parseSeason((await searchParams).season);
  const profile = await getTeamProfile(constructorId, season);
  if (!profile) return { title: 'Constructor not found' };

  const title = `${profile.constructorName} — ${season}`;
  const description = `${profile.constructorName} in the ${season} F1 season: championship position, points, and driver lineup.`;
  const canonical = `/teams/${constructorId}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} — ${SITE_NAME}`, description, url: canonical, type: 'profile' },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
  };
}

export default async function TeamProfilePage({ params, searchParams }: PageProps) {
  const { constructorId } = await params;
  const season = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getTeamProfile(constructorId, season),
    getTeamSeasons(constructorId),
    getTeamCareer(constructorId),
  ]);

  if (!profile) notFound();
  void { profile, seasons, career };

  return <main id="main-content">{profile.constructorName}</main>;
}
