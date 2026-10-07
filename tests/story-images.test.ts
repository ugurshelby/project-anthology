import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { storyContent } from '@/data/stories/content';
import { STORY_IMAGE_CREDITS, getStoryImageCredit, isSourcedStoryImage } from '@/data/stories/image-credits';

/**
 * Owner rule 2026-10-07: story images are real photographs, never AI-generated and never SVG / drawn illustrations,
 * and each one has a source record (`data/stories/image-credits.ts`).
 */

const PUBLIC = join(process.cwd(), 'public');
const RASTER = /\.(png|jpe?g|webp|avif)$/i;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}
const onDisk = walk(join(PUBLIC, 'stories')).map((f) => `/${relative(PUBLIC, f).split(sep).join('/')}`).sort();

function usedBy(): Array<{ slug: string; src: string }> {
  const out: Array<{ slug: string; src: string }> = [];
  for (const s of storyContent) {
    out.push({ slug: s.slug, src: s.heroImage });
    for (const b of [...s.blocks, ...(s.blocksTr ?? [])]) if (b.type === 'image' && b.src) out.push({ slug: s.slug, src: b.src });
  }
  return out;
}

describe('story images are photographs with a source record', () => {
  it('no SVG (or any non-raster file) lives under public/stories', () => {
    expect(onDisk.filter((f) => !RASTER.test(f))).toEqual([]);
  });

  it('every story cover and body image is an existing raster file under /stories', () => {
    for (const { slug, src } of usedBy()) {
      expect(src, slug).toMatch(/^\/stories\/[a-z0-9-]+\/(full|landscape|portrait)\/\d+\.(png|jpe?g|webp|avif)$/i);
      expect(existsSync(join(PUBLIC, src)), `${slug}: ${src} is missing`).toBe(true);
    }
  });

  it('every file has a source record and every record has a file (no orphans in either direction)', () => {
    const records = Object.keys(STORY_IMAGE_CREDITS).sort();
    expect(records).toEqual(onDisk);
  });

  it('every image used by a story has a record (so the page can show its credit)', () => {
    for (const { slug, src } of usedBy()) expect(getStoryImageCredit(src), `${slug}: ${src}`).not.toBeNull();
  });

  it('a sourced record names an https source page and a publisher; an unverified one keeps a hint for whoever checks it', () => {
    for (const [src, credit] of Object.entries(STORY_IMAGE_CREDITS)) {
      if (credit.status === 'sourced') {
        expect(credit.sourceUrl, src).toMatch(/^https:\/\/[^\s]+$/);
        expect(credit.sourceName.trim().length, src).toBeGreaterThan(1);
      } else {
        expect(credit.hint.trim().length, src).toBeGreaterThan(5);
      }
    }
  });

  it('isSourcedStoryImage only lets a sourced record name an author or link out', () => {
    expect(isSourcedStoryImage(null)).toBe(false);
    expect(isSourcedStoryImage({ status: 'unverified', hint: 'x' })).toBe(false);
    expect(isSourcedStoryImage({ status: 'sourced', sourceUrl: 'https://example.org/p', sourceName: 'Example' })).toBe(true);
    expect(getStoryImageCredit('/stories/does-not/exist/01.png')).toBeNull();
  });
});
