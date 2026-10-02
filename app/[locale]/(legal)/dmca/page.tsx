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
  const t = await getTranslations({ locale, namespace: 'legal.dmca' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates('/dmca', locale),
  };
}

export default async function DmcaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.dmca' });
  const tl = await getTranslations({ locale, namespace: 'legal' });
  return (
    <LegalPage
      eyebrow={t('eyebrow')}
      title={t('title')}
      intro={t('intro')}
      updated={t('updated')}
      updatedLabel={tl('updatedLabel')}
      sections={[
        {
          title: t('s1Title'),
          body: (
            <ol className="list-decimal space-y-2 pl-5">
              <li>{t('s1i1')}</li>
              <li>{t('s1i2')}</li>
              <li>{t('s1i3')}</li>
              <li>{t('s1i4')}</li>
            </ol>
          ),
        },
        { title: t('s2Title'), body: <p>{t.rich('s2p1', { mail: mailTag })}</p> },
        { title: t('s3Title'), body: <p>{t('s3p1')}</p> },
      ]}
    />
  );
}
