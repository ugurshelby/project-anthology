import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDriverProfile, getDriverSeasons, getDriverCareer } from '@/lib/data/entities';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(_raw: string | undefined): number {
  return CURRENT_SEASON;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { driverId } = await params;
  const season = parseSeason((await searchParams).season);
  const profile = await getDriverProfile(driverId, season);
  if (!profile) return { title: 'Driver not found' };

  const title = `${profile.driverName} — ${season}`;
  const description = `${profile.driverName} in the ${season} F1 season with ${profile.constructorName}: championship position, points, wins, and podiums.`;
  const canonical = `/drivers/${driverId}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} — ${SITE_NAME}`, description, url: canonical, type: 'profile' },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
  };
}

export default async function DriverProfilePage({ params, searchParams }: PageProps) {
  const { driverId } = await params;
  const season = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getDriverProfile(driverId, season),
    getDriverSeasons(driverId),
    getDriverCareer(driverId),
  ]);

  if (!profile) notFound();
  void { profile, seasons, career };

  return <main id="main-content">{profile.driverName}</main>;
}
