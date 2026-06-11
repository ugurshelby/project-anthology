import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { SafeImage } from '@/components/ui/SafeImage';
import { GlossaryLink } from '@/components/GlossaryLink';
import { getStoryBySlug, getStorySlugs, type Story } from '@/lib/data/stories';
import type { StoryBlock } from '@/data/stories/types';
import { articleJsonLd } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getStorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) {
    return { title: 'Story not found' };
  }
  const description = story.subtitle || `An F1 anthology story: ${story.title}.`;
  return {
    title: story.title,
    description,
    alternates: { canonical: `/anthology/${slug}` },
    openGraph: {
      title: `${story.title} (${story.year})`,
      description,
      type: 'article',
      url: `/anthology/${slug}`,
      // OG image is provided by the colocated opengraph-image.tsx (dynamic card).
    },
    twitter: {
      card: 'summary_large_image',
      title: `${story.title} (${story.year})`,
      description,
    },
  };
}

function imageDims(layout: StoryBlock['layout']): { w: number; h: number } {
  switch (layout) {
    case 'portrait':
      return { w: 1280, h: 1707 };
    case 'full':
    case 'landscape':
    default:
      return { w: 1280, h: 720 };
  }
}

function Block({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case 'heading':
      return <h2>{block.text}</h2>;
    case 'quote':
      return (
        <blockquote>
          <p>{block.text}</p>
          {block.author ? <cite>{block.author}</cite> : null}
        </blockquote>
      );
    case 'image': {
      const { w, h } = imageDims(block.layout);
      return (
        <figure className="story-figure">
          <SafeImage
            src={block.src ?? '/placeholder.svg'}
            alt={block.caption ?? ''}
            width={w}
            height={h}
            sizes="(max-width: 768px) 100vw, 680px"
            className="h-auto w-full object-cover"
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    }
    case 'paragraph':
    default:
      return (
        <p>
          <GlossaryLink text={block.text ?? ''} />
        </p>
      );
  }
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const story: Story | null = await getStoryBySlug(slug);
  if (!story) notFound();

  const jsonLd = articleJsonLd({
    title: story.title,
    description: story.subtitle || `An F1 anthology story: ${story.title}.`,
    slug: story.slug,
    imageUrl: story.heroImage,
    year: story.year,
    category: story.category,
    publishedAt: story.createdAt,
    modifiedAt: story.updatedAt,
  });

  return (
    <article>
      <script
        type="application/ld+json"
        // Server-rendered Article schema from trusted story fields.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <header className="relative aspect-video w-full overflow-hidden">
        <SafeImage
          src={story.heroImage}
          alt={story.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.95) 100%)',
          }}
        />
        <div className="content-wrap absolute inset-x-0 bottom-0">
          <p
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            {story.category} · {story.year}
          </p>
          <h1
            className="mt-2 font-display text-[clamp(2.5rem,9vw,6rem)] leading-[0.9] tracking-[0.04em]"
            style={{ color: 'var(--paper)' }}
          >
            {story.title}
          </h1>
          {story.subtitle ? (
            <p
              className="mt-3 max-w-2xl pb-6 text-sm font-light leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              {story.subtitle}
            </p>
          ) : null}
        </div>
      </header>

      {/* Body */}
      <div className="content-wrap">
        <div className="story-prose mx-auto">
          {story.blocks.map((block, idx) => (
            <Block key={idx} block={block} />
          ))}
        </div>

        <div className="story-prose mx-auto mt-10 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <BackButton fallbackHref="/anthology" label="All stories" />
        </div>
      </div>
    </article>
  );
}
