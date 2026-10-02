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
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates('/privacy', locale),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return (
    <LegalPage
      eyebrow={t('eyebrow')}
      title={t('title')}
      intro={t('intro')}
      updated={t('updated')}
      updatedLabel={t('updatedLabel')}
      sections={[
        {
          title: t('s1Title'),
          body: (
            <>
              <p>{t('s1p1')}</p>
              <p>{t('s1p2')}</p>
            </>
          ),
        },
        {
          title: t('s2Title'),
          body: (
            <>
              <p>{t('s2p1')}</p>
              <p>{t('s2p2')}</p>
            </>
          ),
        },
        {
          title: t('s3Title'),
          body: (
            <>
              <p>{t('s3p1')}</p>
              <p>{t('s3p2')}</p>
            </>
          ),
        },
        {
          title: t('s4Title'),
          body: (
            <>
              <p>{t('s4p1')}</p>
              <p>
                {t.rich('s4p2', { mail: mailTag })}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
