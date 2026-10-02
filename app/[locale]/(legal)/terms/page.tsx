import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/components/legal/LegalPage';
import { mailTag } from '@/lib/legal-mail';
import { localizedAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates('/terms', locale),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.terms' });
  const tl = await getTranslations({ locale, namespace: 'legal' });
  return (
    <LegalPage
      eyebrow={t('eyebrow')}
      title={t('title')}
      intro={t('intro')}
      updated={t('updated')}
      updatedLabel={tl('updatedLabel')}
      sections={[
        { title: t('s1Title'), body: <p>{t('s1p1')}</p> },
        { title: t('s2Title'), body: <p>{t('s2p1')}</p> },
        { title: t('s3Title'), body: <p>{t.rich('s3p1', { mail: mailTag })}</p> },
        { title: t('s4Title'), body: <p>{t('s4p1')}</p> },
      ]}
    />
  );
}
