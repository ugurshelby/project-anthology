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
  const hasImage = Boolean(item.image && item.image !== '/placeholder.svg' && item.image.trim() !== '');
  const isTr = locale === 'tr';

  const sourceLinks =
    item.sourceLinks && item.sourceLinks.length > 0
      ? item.sourceLinks
      : [{ name: item.sourceName || 'Source', url: item.url, title: item.title }];

  const sourcesCount = item.sources?.length || sourceLinks.length;

  return (
    <main id="main-content" className="flex-1">
      {hasImage ? (
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps text-accent">
                {item.dateLabel} · {item.sourceName}
              </span>
              {sourcesCount > 1 ? (
                <span className="label-caps rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-text-mid">
                  {sourcesCount} {isTr ? 'Kaynak' : 'Sources'}
                </span>
              ) : null}
            </div>
            <h1 className="headline-lg uppercase text-text-hi">{title}</h1>
          </div>
        </section>
      ) : null}

      <PageShell className={hasImage ? '' : '!pt-8 md:!pt-12'}>
        <article className="mx-auto flex max-w-[680px] flex-col gap-8 py-6 md:py-8">
          {!hasImage ? (
            <header className="flex flex-col gap-3 border-b border-hairline pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-caps text-accent">
                  {item.dateLabel} · {item.sourceName}
                </span>
                {sourcesCount > 1 ? (
                  <span className="label-caps rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-text-mid">
                    {sourcesCount} {isTr ? 'Kaynak' : 'Sources'}
                  </span>
                ) : null}
              </div>
              <h1 className="headline-lg uppercase text-text-hi">{title}</h1>
            </header>
          ) : null}

          {summary ? (
            <p className="text-lg leading-relaxed text-text font-normal">{summary}</p>
          ) : null}

          {/* Sources and attribution block */}
          <section className="mt-4 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-hairline bg-surface/40 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <span className="label-caps text-text-mid">
                {isTr ? 'Orijinal Kaynaklar ve Kapsam' : 'Sources & Original Coverage'}
              </span>
              <span className="data-tabular text-xs text-text-low font-mono">
                {sourceLinks.length} {sourceLinks.length === 1 ? (isTr ? 'makale' : 'outlet') : (isTr ? 'farklı makale' : 'outlets')}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-hairline">
              {sourceLinks.map((link, idx) => (
                <a
                  key={`${link.url}-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.name}: ${link.title || title} (${isTr ? 'Yeni sekmede açılır' : 'Opens in new tab'})`}
                  className="group flex min-h-[48px] items-center justify-between gap-3 py-3 text-left transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="label-caps shrink-0 text-accent font-semibold tracking-wider">
                      {link.name}
                    </span>
                    <span className="truncate text-sm text-text-hi group-hover:text-white">
                      {link.title && link.title !== title ? link.title : (isTr ? 'Orijinal makaleyi görüntüle' : 'View original reporting')}
                    </span>
                  </div>
                  <span className="shrink-0 text-text-low transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text-hi">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </section>
        </article>
      </PageShell>
    </main>
  );
}
