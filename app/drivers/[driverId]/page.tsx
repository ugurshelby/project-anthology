import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDriverProfile, getDriverSeasons, getDriverCareer } from '@/lib/data/entities';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { driverIconSrc, carSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { getDriverLore } from '@/data/drivers';
import { getNewsForEntity } from '@/lib/data/news';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { DriverProfileHero } from '@/components/profile/DriverProfileHero';
import { DriverSeasonPulse } from '@/components/profile/DriverSeasonPulse';
import { DriverCombinedDossier } from '@/components/profile/DriverCombinedDossier';
import { DriverMachineryCard } from '@/components/profile/DriverMachineryCard';
import { LoreSection } from '@/components/profile/LoreSection';
import { RelatedNewsList } from '@/components/news/RelatedNewsList';
import { PageThemeSync } from '@/components/layout/PageThemeSync';

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ season?: string }>;
};

/**
 * Only CURRENT_SEASON has profile data today (`profileSeasons()` in
 * lib/data/entities.ts). Requesting anything else is a no-op, so surface that
 * to the caller instead of silently swapping in the current season.
 */
function parseSeason(raw: string | undefined): { season: number; requestedUnsupported: boolean } {
  if (raw === undefined) return { season: CURRENT_SEASON, requestedUnsupported: false };
  const parsed = Number(raw);
  const requestedUnsupported = !Number.isFinite(parsed) || parsed !== CURRENT_SEASON;
  return { season: CURRENT_SEASON, requestedUnsupported };
}

function editorialTaglineFromLore(lore: NonNullable<ReturnType<typeof getDriverLore>>): string | null {
  const first = lore.lore.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!first) return null;
  return first.length > 110 ? `${first.slice(0, 107)}…` : first;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { driverId } = await params;
  const { season } = parseSeason((await searchParams).season);
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
  const { season, requestedUnsupported } = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getDriverProfile(driverId, season),
    getDriverSeasons(driverId),
    getDriverCareer(driverId),
  ]);

  if (!profile) notFound();

  const relatedNews = await getNewsForEntity(profile.driverName, 4);
  void seasons;

  const theme = teamThemeVars(profile.constructorId, season);
  const lore = getDriverLore(profile.driverId);
  const portrait = driverIconSrc(profile.driverCode, profile.driverId, season);
  const car = carSrc(profile.constructorId, profile.constructorName);
  const teamLogo = teamIconSrc(profile.constructorName);

  const technicalDossier = [
    { label: 'Number', value: lore?.number != null ? String(lore.number) : '—' },
    { label: 'Team', value: profile.constructorName },
    { label: 'GP Starts', value: career.seasons ? String(career.seasons) : '—' },
    { label: 'Career Wins', value: String(career.wins) },
    { label: 'Career Podiums', value: String(career.podiums) },
    { label: 'Best Finish', value: career.bestPosition != null ? `P${career.bestPosition}` : '—' },
  ];

  const careerDossier = [
    { label: 'Seasons', value: String(career.seasons) },
    { label: 'Championships', value: String(career.championships) },
    { label: 'Wins', value: String(career.wins) },
    { label: 'Podiums', value: String(career.podiums) },
  ];

  return (
    <main id="main-content" style={theme as React.CSSProperties} className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 pt-2 pb-8 md:px-8 md:pt-4 lg:px-16 lg:pb-12">
      <PageThemeSync vars={theme} />
      {requestedUnsupported ? (
        <p className="label-caps mb-4 rounded-[var(--radius-md)] border border-accent/30 bg-accent/10 px-4 py-2 text-accent">
          Only the {season} season is available right now — showing current data instead.
        </p>
      ) : null}

      <DriverProfileHero
        kicker={`${profile.constructorName} · ${season}`}
        title={profile.driverName}
        meta={`P${profile.position} · ${profile.points} PTS`}
        bigNumber={lore?.number != null ? String(lore.number) : null}
        imageSrc={portrait}
        imageAlt={profile.driverName}
        editorialTagline={lore ? editorialTaglineFromLore(lore) : null}
      />

      <div className="mt-4 md:mt-6">
        <BentoGrid>
          <DriverSeasonPulse
            season={season}
            position={profile.position}
            points={profile.points}
            wins={profile.wins}
            podiums={profile.podiums}
            championships={career.championships}
            careerPoints={career.points}
          />

          <DriverCombinedDossier technical={technicalDossier} career={careerDossier} />

          {lore ? (
            <BentoCard span={car ? 8 : 12}>
              <LoreSection
                heading="The Story"
                bio={lore.bio}
                milestones={lore.milestones}
                lore={lore.lore}
                facts={[
                  { label: 'Nationality', value: lore.nationality },
                  { label: 'Born', value: String(lore.born) },
                ]}
              />
            </BentoCard>
          ) : null}

          {car ? (
            <DriverMachineryCard
              span={lore ? 4 : 12}
              season={season}
              constructorName={profile.constructorName}
              teamLogo={teamLogo}
              carSrc={car}
            />
          ) : null}

          {relatedNews.length > 0 ? (
            <BentoCard span={lore && car ? 12 : 6}>
              <RelatedNewsList items={relatedNews} heading="Related News" />
            </BentoCard>
          ) : null}
        </BentoGrid>
      </div>
    </main>
  );
}
