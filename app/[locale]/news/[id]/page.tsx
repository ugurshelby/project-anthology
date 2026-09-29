import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApexImage } from '@/components/media/ApexImage';
import { getNewsById } from '@/lib/data/news';
import { localizedNewsTitle, localizedNewsSummary } from '@/lib/news/i18n';
import { PageShell } from '@/components/layout/BentoGrid';
import { SITE_NAME, localizedAlternates } from '@/lib/seo';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const item = await getNewsById(id);
  if (!item) return { title: 'Story not found' };

  const title = localizedNewsTitle(item, locale);
  const description = localizedNewsSummary(item, locale) || title;
  return {
    title,
    description,
    alternates: localizedAlternates(`/news/${id}`, locale),
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: `/news/${id}`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const item = await getNewsById(id);
  if (!item) notFound();

  const title = localizedNewsTitle(item, locale);
  const summary = localizedNewsSummary(item, locale);

  return (
    <main id="main-content" className="flex-1">
      <section className="relative flex min-h-[45vh] flex-col justify-end overflow-hidden md:min-h-[50vh]">
        <ApexImage
          src={item.image}
          alt=""
          kind="media"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover object-center"
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/10" />
        <div className="relative z-10 flex flex-col gap-2 px-5 pb-8 pt-16 md:px-8 md:pb-10 lg:px-16 lg:pb-12">
          <span className="label-caps text-accent">
            {item.dateLabel} · {item.sourceName}
          </span>
          <h1 className="headline-lg uppercase text-text-hi">{title}</h1>
        </div>
      </section>

      <PageShell>
        <article className="mx-auto flex max-w-[680px] flex-col gap-6 py-8">
          {summary ? (
            <p className="text-lg leading-relaxed text-text">{summary}</p>
          ) : null}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps inline-flex w-fit items-center gap-2 rounded-[var(--radius)] border border-hairline px-4 py-2.5 text-text-hi transition-colors hover:bg-surface-raised"
          >
            {locale === 'tr' ? 'Orijinal Kaynağı Oku ↗' : 'Read Full Story ↗'}
          </a>
        </article>
      </PageShell>
    </main>
  );
}
