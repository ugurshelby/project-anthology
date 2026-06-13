import { SectionDivider } from '@/components/ui/SectionDivider';
import { getNewsForEntity } from '@/lib/data/news';

/**
 * "Related news" — 3 cards mentioning the entity, only for the current season
 * (the caller decides). Reuses the news read layer + the news card visual
 * language. Renders nothing when there are no matches.
 */
export async function RelatedNews({ entityName }: { entityName: string }) {
  const items = await getNewsForEntity(entityName, 3);
  if (items.length === 0) return null;

  return (
    <section>
      <SectionDivider title="Related News" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="anthology-card block p-4"
          >
            <p
              className="font-mono text-[9px] uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              {item.dateLabel} · {item.sourceName}
            </p>
            <h3
              className="mt-2 line-clamp-3 font-display text-[1.15rem] leading-tight tracking-[0.04em]"
              style={{ color: 'var(--paper)' }}
            >
              {item.title}
            </h3>
            <span
              className="mt-3 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--accent)' }}
            >
              Read story →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
