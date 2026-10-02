import { redirect } from '@/i18n/routing';

/** /drivers and /teams merged into a single "Grid" page (2026-07 redesign). */
export default async function DriversGridPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: '/grid', locale });
}
