import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeamProfile, getTeamSeasons, getTeamCareer } from '@/lib/data/entities';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { carSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { getDriverLore } from '@/data/drivers';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { StatBlock } from '@/components/bento/StatBlock';
import { StatTrio } from '@/components/bento/StatTrio';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { DriverLineup } from '@/components/profile/DriverLineup';
import { HeadToHead } from '@/components/profile/HeadToHead';
import { PageThemeSync } from '@/components/layout/PageThemeSync';

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
  void seasons;

  const theme = teamThemeVars(profile.constructorId, season);
  const car = carSrc(profile.constructorId, profile.constructorName);
  const logo = teamIconSrc(profile.constructorName);
  const [d1, d2] = profile.drivers;
  const flankNumbers: [string | null, string | null] = [
    d1 ? (getDriverLore(d1.driverId)?.number != null ? String(getDriverLore(d1.driverId)!.number) : null) : null,
    d2 ? (getDriverLore(d2.driverId)?.number != null ? String(getDriverLore(d2.driverId)!.number) : null) : null,
  ];

  return (
    <main id="main-content" style={theme as React.CSSProperties} className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 py-8 md:px-8 lg:px-16 lg:py-12">
      <PageThemeSync vars={theme} />
      <ProfileHero
        kicker={`Constructor · ${season}`}
        title={profile.constructorName}
        meta={`P${profile.position} · ${profile.points} PTS · ${profile.wins} wins`}
        imageSrc={car}
        imageAlt={profile.constructorName}
        imageKind="car"
        flankNumbers={flankNumbers}
        logoSrc={logo}
      />

      <div className="mt-6">
        <BentoGrid>
          <BentoCard span={4}>
            <StatBlock value={`P${profile.position}`} label="Constructor Standing" sublabel={`${profile.points} PTS`} size="md" accent />
          </BentoCard>

          <BentoCard span={8}>
            <StatTrio
              items={[
                { value: profile.wins, label: 'Wins' },
                { value: String(career.championships), label: 'Titles' },
                { value: String(career.seasons), label: 'Seasons' },
              ]}
            />
          </BentoCard>

          <BentoCard span={8}>
            <span className="label-caps mb-3 block text-text-mid">Driver Line-up</span>
            <DriverLineup drivers={profile.drivers} season={season} constructorName={profile.constructorName} />
          </BentoCard>

          {d1 && d2 ? (
            <BentoCard span={4}>
              <span className="label-caps mb-4 block text-text-mid">Head to Head</span>
              <HeadToHead
                leftName={d1.driverCode.toUpperCase() || d1.driverName.split(' ').pop()!.toUpperCase()}
                rightName={d2.driverCode.toUpperCase() || d2.driverName.split(' ').pop()!.toUpperCase()}
                metrics={[
                  { label: 'Points', left: Number(d1.points) || 0, right: Number(d2.points) || 0 },
                  { label: 'Position', left: Number(d2.position) || 0, right: Number(d1.position) || 0 },
                ]}
              />
            </BentoCard>
          ) : null}

          <BentoCard span={12}>
            <span className="label-caps mb-3 block text-text-mid">Technical Dossier</span>
            <TechnicalDossier
              entries={[
                { label: 'Championships', value: String(career.championships) },
                { label: 'Seasons', value: String(career.seasons) },
                { label: 'Career Wins', value: String(career.wins) },
                { label: 'Best Finish', value: career.bestPosition != null ? `P${career.bestPosition}` : '—' },
              ]}
            />
          </BentoCard>
        </BentoGrid>
      </div>
    </main>
  );
}
