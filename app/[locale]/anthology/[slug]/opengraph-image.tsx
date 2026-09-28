import { ImageResponse } from 'next/og';
import { getStoryBySlug } from '@/lib/data/stories';
import { SITE_NAME } from '@/lib/seo';

/**
 * Per-story OpenGraph image (1200×630): category + year eyebrow, large story
 * title, Anthology palette. Falls back to a generic card if the story can't be
 * loaded (e.g. DB miss) so social previews never 500.
 */
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE_NAME} — F1 story`;

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

export default async function StoryOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  const title = story?.title ?? 'Anthology';
  const eyebrow = story
    ? [story.category, story.year].filter(Boolean).join(' · ')
    : 'Formula 1';

  // Scale the title down for long headlines so it stays within the card.
  const titleSize = title.length > 28 ? 84 : title.length > 18 ? 104 : 132;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: '#ff1801',
          }}
        >
          <div style={{ width: 40, height: 6, background: '#ff1801', marginRight: 18 }} />
          {eyebrow}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: -1,
            color: '#f4f1ea',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(244,241,234,0.5)',
          }}
        >
          <span>{SITE_NAME}</span>
          <div style={{ height: 8, width: 220, background: '#ff1801' }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
