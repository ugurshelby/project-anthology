import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeamProfile, getTeamSeasons, getTeamCareer } from '@/lib/data/entities';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { carSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { getDriverLore } from '@/data/drivers';
import { getTeamLore } from '@/data/teams';
import { getNewsForEntity } from '@/lib/data/news';
import { powerUnitLabel } from '@/lib/f1/power-units';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TeamGarageHero } from '@/components/profile/TeamGarageHero';
import { TeamConstructorPulse } from '@/components/profile/TeamConstructorPulse';
import { TeamLineupDuel } from '@/components/profile/TeamLineupDuel';
import { TeamTechnicalCard } from '@/components/profile/TeamTechnicalCard';
import { LoreSection } from '@/components/profile/LoreSection';
import { RelatedNewsList } from '@/components/news/RelatedNewsList';
import { PageThemeSync } from '@/components/layout/PageThemeSync';

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ constructorId: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(raw: string | undefined): { season: number; requestedUnsupported: boolean } {
  if (raw === undefined) return { season: CURRENT_SEASON, requestedUnsupported: false };
  const parsed = Number(raw);
  const requestedUnsupported = !Number.isFinite(parsed) || parsed !== CURRENT_SEASON;
  return { season: CURRENT_SEASON, requestedUnsupported };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { constructorId } = await params;
  const { season } = parseSeason((await searchParams).season);
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
  const { season, requestedUnsupported } = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getTeamProfile(constructorId, season),
    getTeamSeasons(constructorId),
    getTeamCareer(constructorId),
  ]);

  if (!profile) notFound();

  const relatedNews = await getNewsForEntity(profile.constructorName, 4);
  void seasons;

  const theme = teamThemeVars(profile.constructorId, season);
  const car = carSrc(profile.constructorId, profile.constructorName);
  const logo = teamIconSrc(profile.constructorName);
  const lore = getTeamLore(profile.constructorId);
  const [d1, d2] = profile.drivers;
  const flankNumbers: [string | null, string | null] = [
    d1 ? (getDriverLore(d1.driverId)?.number != null ? String(getDriverLore(d1.driverId)!.number) : null) : null,
    d2 ? (getDriverLore(d2.driverId)?.number != null ? String(getDriverLore(d2.driverId)!.number) : null) : null,
  ];

  return (
    <main
      id="main-content"
      style={theme as React.CSSProperties}
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 pt-2 pb-8 md:px-8 md:pt-4 lg:px-16 lg:pb-12"
    >
      <PageThemeSync vars={theme} />
      {requestedUnsupported ? (
        <p className="label-caps mb-4 rounded-[var(--radius-md)] border border-accent/30 bg-accent/10 px-4 py-2 text-accent">
          Only the {season} season is available right now — showing current data instead.
        </p>
      ) : null}

      <TeamGarageHero
        kicker={`Constructor // ${season}`}
        title={profile.constructorName}
        meta={`P${profile.position} · ${profile.points} PTS`}
        imageSrc={car}
        imageAlt={profile.constructorName}
        logoSrc={logo}
        flankNumbers={flankNumbers}
      />

      <div className="mt-4 md:mt-6">
        <BentoGrid>
          <TeamConstructorPulse
            season={season}
            position={profile.position}
            points={profile.points}
            wins={profile.wins}
            championships={career.championships}
          />

          <TeamLineupDuel
            drivers={profile.drivers}
            season={season}
            constructorName={profile.constructorName}
          />

          <TeamTechnicalCard
            powerUnit={powerUnitLabel(profile.constructorId)}
            entries={[
              { label: 'Championships', value: String(career.championships) },
              { label: 'Seasons', value: String(career.seasons) },
              { label: 'Career Wins', value: String(career.wins) },
              { label: 'Best Finish', value: career.bestPosition != null ? `P${career.bestPosition}` : '—' },
            ]}
          />

          {lore ? (
            <BentoCard span={relatedNews.length > 0 ? 8 : 12} className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }}
              />
              <LoreSection
                heading="The Team"
                bio={lore.bio}
                milestones={lore.milestones}
                lore={lore.lore}
                facts={[
                  { label: 'Base', value: lore.hq.label },
                  { label: 'Founded', value: String(lore.founded) },
                ]}
              />
            </BentoCard>
          ) : null}

          {relatedNews.length > 0 ? (
            <BentoCard span={lore ? 4 : 12} className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }}
              />
              <RelatedNewsList items={relatedNews} heading="Related News" />
            </BentoCard>
          ) : null}
        </BentoGrid>
      </div>
    </main>
  );
}
