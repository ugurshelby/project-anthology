import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import GridPage from '@/app/[locale]/grid/page';
import { localizedAlternates } from '@/lib/seo';

/** Cached per URL, rebuilt at most every 10 minutes (caching design, DECISIONS 2026-10-28). */
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ui.common' });
  const title = t('teams');
  return {
    title,
    alternates: localizedAlternates('/teams', locale),
  };
}

export default async function TeamsIndexPage({ params }: { params: Promise<{ locale: string; year?: string }> }) {
  return GridPage({ params });
}
