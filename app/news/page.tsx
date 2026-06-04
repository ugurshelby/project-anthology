import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getLatestNews } from '@/lib/data/news';

export default async function NewsPage() {
  const news = await getLatestNews(24);

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-[family-name:var(--font-condensed)] text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          Headlines
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-display)] text-[2.5rem] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          NEWS
        </h1>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title="Latest" />
        {news.length === 0 ? (
          <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
            News cache empty — sync-news cron will populate headlines.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="anthology-card overflow-hidden">
                <div className="relative aspect-video bg-card">
                  <SafeImage
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)',
                    }}
                  />
                  <h2
                    className="absolute bottom-3 left-3 right-3 font-[family-name:var(--font-display)] text-[1.3rem] leading-tight tracking-[0.04em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    {item.title}
                  </h2>
                </div>
                <div className="p-4">
                  <p
                    className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.05em] text-muted"
                    style={{ color: 'var(--muted)' }}
                  >
                    {item.dateLabel} · {item.sourceName}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs font-light text-muted" style={{ color: 'var(--muted)' }}>
                    {item.summary}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-[family-name:var(--font-condensed)] text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: 'var(--accent)' }}
                  >
                    Read story →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
