/**
 * Master-plan 7.1 / AG-1 — story photographs: a credit line and a link to the
 * original page appear ONLY for an image whose source is recorded ('sourced');
 * an 'unverified' image shows neither, and every story carries the
 * editorial-use notice.
 */

import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';
import type { StoryImageCredit } from '@/data/stories/image-credits';

const SOURCED = '/stories/test-story/landscape/01.png';
const UNVERIFIED = '/stories/test-story/landscape/02.png';

// Temporary local records (the real manifest is never edited by tests).
const TEST_CREDITS: Record<string, StoryImageCredit> = {
  [SOURCED]: {
    status: 'sourced',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    sourceName: 'Wikimedia Commons',
    author: 'Jane Doe',
    license: 'CC BY-SA 4.0',
  },
  [UNVERIFIED]: { status: 'unverified', hint: 'test' },
};

vi.mock('@/data/stories/image-credits', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/stories/image-credits')>();
  return { ...actual, getStoryImageCredit: (src: string) => TEST_CREDITS[src] ?? null };
});

// next-intl's navigation Link needs the Next.js runtime; a plain anchor keeps the href observable.
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, className }: { href: string; children?: React.ReactNode; className?: string }) =>
    React.createElement('a', { href, className }, children),
}));

// Reveal uses IntersectionObserver in effects only; static render is enough here.
const { StoryBody } = await import('@/components/anthology/StoryBody');
const { AnthologyHero } = await import('@/components/anthology/AnthologyHero');
const { StoryImageNotice } = await import('@/components/anthology/StoryImageSource');
const {
  formatStoryImageCredit,
  storyImageCreditSummary,
  storyImageSlug,
  STORY_IMAGE_CREDITS,
} = await import('@/data/stories/image-credits');

const Provider = NextIntlClientProvider as unknown as React.ComponentType<{
  locale: string;
  messages: unknown;
  timeZone: string;
  children?: React.ReactNode;
}>;

const render = (el: React.ReactElement, locale: 'en' | 'tr' = 'en') =>
  renderToStaticMarkup(
    React.createElement(Provider, { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' }, el),
  );

describe('story image source line and link', () => {
  const blocks = [
    { type: 'image' as const, src: SOURCED, caption: 'Sourced photo', layout: 'landscape' as const },
    { type: 'image' as const, src: UNVERIFIED, caption: 'Unverified photo', layout: 'landscape' as const },
  ];

  it('links a sourced image to its original page with a credit line', () => {
    const html = render(React.createElement(StoryBody, { blocks }));
    const links = html.match(/<a [^>]*href="https:\/\/commons\.wikimedia\.org\/wiki\/File:Example\.jpg"[^>]*>/g) ?? [];
    // image frame + credit line
    expect(links).toHaveLength(2);
    for (const a of links) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer nofollow"');
      expect(a).toContain(
        'aria-label="Original source of this image: Jane Doe / Wikimedia Commons · CC BY-SA 4.0 (opens in a new tab)"',
      );
    }
    expect(html).toContain('>Jane Doe / Wikimedia Commons · CC BY-SA 4.0</a>');
  });

  it('shows no credit and no link for an unverified image', () => {
    const html = render(React.createElement(StoryBody, { blocks: [blocks[1]] }));
    expect(html).not.toContain('<a ');
    expect(html).toContain('Unverified photo');
  });

  it('applies the same rule to the hero, with a localized label', () => {
    const sourced = render(
      React.createElement(AnthologyHero, { kicker: 'k', title: 't', image: SOURCED }),
      'tr',
    );
    expect(sourced).toContain('aria-label="Bu görselin özgün kaynağı: Jane Doe / Wikimedia Commons · CC BY-SA 4.0 (yeni sekmede açılır)"');
    const unverified = render(React.createElement(AnthologyHero, { kicker: 'k', title: 't', image: UNVERIFIED }));
    expect(unverified).not.toContain('<a ');
  });

  it('renders the editorial-use notice with a link to the takedown page in both locales', () => {
    const enHtml = render(React.createElement(StoryImageNotice));
    expect(enHtml).toContain('non-commercial, editorial purposes');
    expect(enHtml).toMatch(/<a [^>]*href="\/dmca"[^>]*>takedown process<\/a>/);
    const trHtml = render(React.createElement(StoryImageNotice), 'tr');
    expect(trHtml).toContain('ticari olmayan, editoryal amaçla');
    // The real Link adds the /tr prefix from the active locale.
    expect(trHtml).toMatch(/<a [^>]*href="\/dmca"[^>]*>kaldırma süreci<\/a>/);
  });
});

describe('story image credit helpers', () => {
  it('formats a credit, skipping missing author and license', () => {
    expect(formatStoryImageCredit({ status: 'sourced', sourceUrl: 'https://x.test', sourceName: 'Archive' })).toBe(
      'Archive',
    );
    expect(
      formatStoryImageCredit({ status: 'sourced', sourceUrl: 'https://x.test', sourceName: 'Archive', license: 'PD' }),
    ).toBe('Archive · PD');
  });

  it('extracts the story slug from an image path', () => {
    expect(storyImageSlug('/stories/brawn-2009/landscape/01.png')).toBe('brawn-2009');
    expect(storyImageSlug('/drivers/x.png')).toBeNull();
  });

  it('summarizes only sourced images for the public page', () => {
    const summary = storyImageCreditSummary(TEST_CREDITS);
    expect(summary).toMatchObject({ total: 2, sourced: 1 });
    expect(summary.bySlug).toEqual([{ slug: 'test-story', images: [{ src: SOURCED, credit: TEST_CREDITS[SOURCED] }] }]);
  });

  it('counts the real manifest', () => {
    const summary = storyImageCreditSummary();
    expect(summary.total).toBe(Object.keys(STORY_IMAGE_CREDITS).length);
    expect(summary.sourced).toBe(summary.bySlug.reduce((n, s) => n + s.images.length, 0));
  });
});

describe('message parity', () => {
  it('has the same story-image keys in EN and TR', () => {
    for (const key of ['imageNotice', 'imageSourceAria'] as const) {
      expect(en.anthology[key]).toBeTruthy();
      expect(tr.anthology[key]).toBeTruthy();
    }
    expect(Object.keys(tr.legal.mediaSources).sort()).toEqual(Object.keys(en.legal.mediaSources).sort());
  });
});
