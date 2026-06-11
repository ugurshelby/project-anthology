/**
 * RSS 2.0 feed for published anthology stories (Council SEO #4).
 * Aggregators and Google News discover long-form content through this; the
 * <link rel="alternate"> in the root layout advertises it.
 */

import { getPublishedStories } from '@/lib/data/stories';
import { absoluteUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const revalidate = 900;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(iso: string): string | null {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toUTCString() : null;
}

export async function GET(): Promise<Response> {
  const stories = await getPublishedStories();

  const items = stories
    .map((story) => {
      const url = absoluteUrl(`/anthology/${story.slug}`);
      const pubDate = rfc822(story.createdAt);
      return [
        '    <item>',
        `      <title>${escapeXml(story.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(story.subtitle || `An F1 anthology story: ${story.title}.`)}</description>`,
        story.category ? `      <category>${escapeXml(story.category)}</category>` : null,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Anthology</title>
    <link>${absoluteUrl('/anthology')}</link>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=900, stale-while-revalidate=3600',
    },
  });
}
