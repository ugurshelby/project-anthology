import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import GridPage from '@/app/[locale]/grid/page';
import { localizedAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

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

export default async function TeamsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  return GridPage({
    params,
    searchParams: searchParams.then((sp) => ({ ...sp, view: 'constructor' as const })),
    initialViewOverride: 'constructor',
  });
}
