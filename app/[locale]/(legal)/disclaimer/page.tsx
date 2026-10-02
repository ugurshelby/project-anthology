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
  const t = await getTranslations({ locale, namespace: 'legal.disclaimer' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates('/disclaimer', locale),
  };
}

export default async function DisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.disclaimer' });
  const tl = await getTranslations({ locale, namespace: 'legal' });
  return (
    <LegalPage
      eyebrow={t('eyebrow')}
      title={t('title')}
      intro={t('intro')}
      updated={t('updated')}
      updatedLabel={tl('updatedLabel')}
      sections={[
        { title: t('s1Title'), body: (<><p>{t('s1p1')}</p><p>{t('s1p2')}</p></>) },
        { title: t('s2Title'), body: (<><p>{t('s2p1')}</p><p>{t('s2p2')}</p></>) },
        { title: t('s3Title'), body: <p>{t.rich('s3p1', { mail: mailTag })}</p> },
      ]}
    />
  );
}
