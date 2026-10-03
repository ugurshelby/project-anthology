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
  const title = t('drivers');
  return {
    title,
    alternates: localizedAlternates('/drivers', locale),
  };
}

export default async function DriversIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  return GridPage({
    params,
    searchParams: searchParams.then((sp) => ({ ...sp, view: 'driver' as const })),
    initialViewOverride: 'driver',
  });
}
