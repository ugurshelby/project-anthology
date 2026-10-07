/**
 * Source record of every image under public/stories (the anthology story photographs).
 *
 * Owner rules (2026-10-07):
 *  - Story images are REAL photographs only: never AI-generated, never SVG or drawn illustrations. A new file needs an
 *    entry here in the same change (AGENTS.md); tests/story-images.test.ts fails otherwise.
 *  - They are used editorially, not commercially. The story pages say so, name the source where it is known and link
 *    the image to its original page. Where the source is not known the entry stays 'unverified' and is listed in
 *    docs/reference/hikaye-gorselleri-kaynak-listesi.md for the owner to check against the original.
 *
 * To record a source, replace the entry with a 'sourced' one (and keep the hint if it helps):
 *   '/stories/x/landscape/01.png': {
 *     status: 'sourced', sourceUrl: 'https://...', sourceName: 'Wikimedia Commons', author: 'Jane Doe', license: 'CC BY-SA 4.0',
 *   },
 * then run `npm run stories:credits` to refresh the list.
 */

interface StoryImageCreditBase {
  /** What we know about where the file came from (export tool, raw file name, duplicates). Not shown to readers. */
  hint?: string;
}

export interface UnverifiedStoryImage extends StoryImageCreditBase {
  status: 'unverified';
  hint: string;
}

export interface SourcedStoryImage extends StoryImageCreditBase {
  status: 'sourced';
  /** Original page of the image (https). The image links here. */
  sourceUrl: string;
  /** Who publishes it, e.g. 'Wikimedia Commons', 'Getty Images', 'F1 Photo Archive'. */
  sourceName: string;
  /** Photographer or agency, when the source names one. */
  author?: string;
  /** License as the source states it, e.g. 'CC BY-SA 4.0', 'Public domain', 'Editorial use'. */
  license?: string;
}

export type StoryImageCredit = UnverifiedStoryImage | SourcedStoryImage;

export const STORY_IMAGE_CREDITS: Record<string, StoryImageCredit> = {
  '/stories/brawn-2009/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 20, 2026-01-25); metadata names no author or source' },
  '/stories/brawn-2009/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 21, 2026-01-25); metadata names no author or source' },
  '/stories/brawn-2009/portrait/01.png': { status: 'unverified', hint: 'Canva export (design Portrait PC - 20, 2026-01-25); metadata names no author or source' },
  '/stories/button-canada/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 12, 2026-01-25); metadata names no author or source' },
  '/stories/button-canada/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 13, 2026-01-25); metadata names no author or source' },
  '/stories/button-canada/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/jenson-button-2011.avif (Button Canada wet)' },
  '/stories/collins-fangio-1956/full/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 26, 2026-01-27); metadata names no author or source; identical copy of /stories/collins-fangio-1956/landscape/01.png' },
  '/stories/collins-fangio-1956/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 26, 2026-01-27); metadata names no author or source; identical copy of /stories/collins-fangio-1956/full/01.png' },
  '/stories/collins-fangio-1956/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 27, 2026-01-27); metadata names no author or source' },
  '/stories/collins-fangio-1956/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/peter-colling-gives-fangio.webp (Collins to Fangio handover)' },
  '/stories/dijon-1979/landscape/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/dijon-1979.jpg (Dijon duel cover)' },
  '/stories/dijon-1979/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Portrait PC - 16, 2026-01-25); metadata names no author or source' },
  '/stories/dijon-1979/portrait/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 17, 2026-01-25); metadata names no author or source' },
  '/stories/fangio-nurburgring/landscape/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/fangio-1957.webp (Fangio 250F cover)' },
  '/stories/fangio-nurburgring/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 15, 2026-01-25); metadata names no author or source' },
  '/stories/fangio-nurburgring/portrait/01.png': { status: 'unverified', hint: 'Canva export (design Portrait PC - 14, 2026-01-25); metadata names no author or source' },
  '/stories/hakkinen-schumacher/landscape/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/zonta-overtake.jpg (Spa 2000 three-wide cover)' },
  '/stories/hakkinen-schumacher/landscape/02.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/mika-haikkinen-mclaren.jfif (Hakkinen Eau Rouge)' },
  '/stories/hakkinen-schumacher/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/schmaucher-f2000.webp (Schumacher F1-2000)' },
  '/stories/hamilton-silverstone/full/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/hamilton-silverstone-victory.avif (Hamilton flag lap 2021)' },
  '/stories/hamilton-silverstone/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 22, 2026-01-26); metadata names no author or source' },
  '/stories/hunt-lauda/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 2, 2026-01-25); metadata names no author or source' },
  '/stories/hunt-lauda/landscape/02.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/james-hunt-mclaren.webp (Hunt wet Zandvoort)' },
  '/stories/hunt-lauda/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/nikki-lauda-ferrari312t2.jpg (Lauda 312T2 portrait)' },
  '/stories/imola-1994/landscape/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/imola-tamburello.jpg (Tamburello cover)' },
  '/stories/imola-1994/portrait/01.png': { status: 'unverified', hint: 'Canva export (design Portrait PC - 18, 2026-01-25); metadata names no author or source' },
  '/stories/jaguar-monaco-diamond/full/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 38, 2026-01-31); metadata names no author or source; identical copy of /stories/jaguar-monaco-diamond/landscape/01.png' },
  '/stories/jaguar-monaco-diamond/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 38, 2026-01-31); metadata names no author or source; identical copy of /stories/jaguar-monaco-diamond/full/01.png' },
  '/stories/jaguar-monaco-diamond/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 39, 2026-01-31); metadata names no author or source' },
  '/stories/jaguar-monaco-diamond/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/jaguar-diamond.jfif (Steinmetz/Jaguar nose)' },
  '/stories/jerez-1997/full/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/jerez-qualifying.jfif (Jerez timing screen)' },
  '/stories/jerez-1997/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 32, 2026-01-27); metadata names no author or source' },
  '/stories/jerez-1997/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 33, 2026-01-27); metadata names no author or source' },
  '/stories/jerez-1997/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/villeneuve-champion.webp (Villeneuve champion)' },
  '/stories/massa-2008/full/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 6, 2026-01-25); metadata names no author or source; identical copy of /stories/massa-2008/landscape/01.png' },
  '/stories/massa-2008/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 6, 2026-01-25); metadata names no author or source; identical copy of /stories/massa-2008/full/01.png' },
  '/stories/massa-2008/landscape/02.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/2008-braziliangp.jpg (Interlagos wet grid)' },
  '/stories/massa-2008/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/felipe-massa-2008-braziliangp.webp (F2008 spray)' },
  '/stories/monaco-1982/full/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 29, 2026-01-27); metadata names no author or source; identical copy of /stories/monaco-1982/landscape/01.png' },
  '/stories/monaco-1982/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 29, 2026-01-27); metadata names no author or source; identical copy of /stories/monaco-1982/full/01.png' },
  '/stories/monaco-1982/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 30, 2026-01-27); metadata names no author or source' },
  '/stories/monaco-1982/portrait/01.png': { status: 'unverified', hint: 'Canva export (design Portrait PC - 29, 2026-01-28); metadata names no author or source' },
  '/stories/schumacher-1994-spain/full/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 23, 2026-01-27); metadata names no author or source; identical copy of /stories/schumacher-1994-spain/landscape/01.png' },
  '/stories/schumacher-1994-spain/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 23, 2026-01-27); metadata names no author or source; identical copy of /stories/schumacher-1994-spain/full/01.png' },
  '/stories/schumacher-1994-spain/landscape/02.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/schmaucher-benetton-b194.webp (B194 exhaust flames)' },
  '/stories/schumacher-1994-spain/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/benetton-cockpit.jpg (B194 cockpit)' },
  '/stories/schumacher-ferrari/full/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/monza-ferrari-podium.webp (Monza tifosi/banner)' },
  '/stories/schumacher-ferrari/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 9, 2026-01-26); metadata names no author or source' },
  '/stories/schumacher-ferrari/landscape/02.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/ferrari-f2004.webp (F2004 side profile)' },
  '/stories/schumacher-ferrari/portrait/01.png': { status: 'unverified', hint: 'Canva export (design Portrait Mobile - 9, 2026-01-26); metadata names no author or source' },
  '/stories/senna-donington-1993/full/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 35, 2026-01-27); metadata names no author or source; identical copy of /stories/senna-donington-1993/landscape/01.png' },
  '/stories/senna-donington-1993/landscape/01.png': { status: 'unverified', hint: 'Canva export (design Full PC - 35, 2026-01-27); metadata names no author or source; identical copy of /stories/senna-donington-1993/full/01.png' },
  '/stories/senna-donington-1993/landscape/02.png': { status: 'unverified', hint: 'Canva export (design Full PC - 36, 2026-01-27); metadata names no author or source' },
  '/stories/senna-donington-1993/portrait/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/senna-donington-trophy.jfif (SEGA Sonic trophy)' },
  '/stories/senna-monaco/full/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/senna-monacogp.webp (MP4/4 Monaco action)' },
  '/stories/senna-monaco/landscape/01.png': { status: 'unverified', hint: 'no embedded metadata; ingested 2026-09-17 from raw web file missing-images/senna-monacogp-pole.jfif (Monaco 1988 pole/cover)' },
};

/** Credit record for a story image path as used in content.ts ('/stories/<slug>/<layout>/NN.png'); null when unknown. */
export function getStoryImageCredit(src: string): StoryImageCredit | null {
  return STORY_IMAGE_CREDITS[src] ?? null;
}

/** Only an image with a recorded source may name an author or link out to it. */
export function isSourcedStoryImage(credit: StoryImageCredit | null): credit is SourcedStoryImage {
  return credit?.status === 'sourced';
}

/** Story slug of an image path ('/stories/<slug>/<layout>/NN.png'); null for any other path. */
export function storyImageSlug(src: string): string | null {
  const m = /^\/stories\/([^/]+)\//.exec(src);
  return m ? m[1] : null;
}

/** One-line credit for a sourced image: '<author> / <sourceName> · <license>', skipping missing parts. */
export function formatStoryImageCredit(credit: SourcedStoryImage): string {
  const who = credit.author ? `${credit.author} / ${credit.sourceName}` : credit.sourceName;
  return credit.license ? `${who} · ${credit.license}` : who;
}

/** Counts for the public /media-sources page (unverified entries are the owner's internal list and stay private). */
export function storyImageCreditSummary(credits: Record<string, StoryImageCredit> = STORY_IMAGE_CREDITS): {
  total: number;
  sourced: number;
  bySlug: Array<{ slug: string; images: Array<{ src: string; credit: SourcedStoryImage }> }>;
} {
  const entries = Object.entries(credits);
  const bySlug = new Map<string, Array<{ src: string; credit: SourcedStoryImage }>>();
  for (const [src, credit] of entries) {
    if (!isSourcedStoryImage(credit)) continue;
    const slug = storyImageSlug(src);
    if (!slug) continue;
    const list = bySlug.get(slug) ?? [];
    list.push({ src, credit });
    bySlug.set(slug, list);
  }
  return {
    total: entries.length,
    sourced: entries.filter(([, c]) => isSourcedStoryImage(c)).length,
    bySlug: [...bySlug.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slug, images]) => ({ slug, images: images.sort((x, y) => x.src.localeCompare(y.src)) })),
  };
}
