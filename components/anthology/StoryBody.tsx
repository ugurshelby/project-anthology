import Image from 'next/image';
import type { StoryBlock } from '@/data/stories/types';
import { Reveal } from './Reveal';

/**
 * Editorial-flow story body — centered reading column (~68ch), framed image
 * cards (not full-bleed 100vw — 2026-07 redesign, see AnthologyHero for the
 * same change on the hero), drop-cap opening, condensed section headers,
 * pull-quotes with a thin accent vertical rule. Blocks fade/translate in on
 * scroll (Reveal, reduced-motion safe).
 */
export function StoryBody({ blocks }: { blocks: StoryBlock[] }) {
  const firstParagraphIndex = blocks.findIndex(
    (block) => block.type === 'paragraph' || block.type === undefined,
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-16 md:px-8">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Reveal key={i}>
                <h2 className="headline-md uppercase text-text-hi">{block.text}</h2>
              </Reveal>
            );
          case 'quote':
            return (
              <Reveal key={i}>
                <blockquote className="border-l-2 pl-5" style={{ borderColor: 'var(--accent)' }}>
                  <p className="font-condensed text-3xl font-600 leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                    {block.text}
                  </p>
                  {block.author ? <cite className="label-caps mt-3 block not-italic text-text-mid">{block.author}</cite> : null}
                </blockquote>
              </Reveal>
            );
          case 'image': {
            const aspect = block.layout === 'portrait' ? 'aspect-[3/4]' : 'aspect-video';
            return (
              <Reveal key={i}>
                <figure className="flex flex-col gap-2">
                  <div className={[aspect, 'relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-hairline'].join(' ')}>
                    <Image
                      src={block.src ?? '/placeholder.svg'}
                      alt={block.caption ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover"
                    />
                  </div>
                  {block.caption ? (
                    <figcaption className="label-caps text-text-low">{block.caption}</figcaption>
                  ) : null}
                </figure>
              </Reveal>
            );
          }
          case 'paragraph':
          default: {
            const isFirst = i === firstParagraphIndex;
            return (
              <Reveal key={i}>
                <p className={['body-lg text-text', isFirst ? 'first-letter:float-left first-letter:mr-3 first-letter:font-condensed first-letter:text-7xl first-letter:font-700 first-letter:leading-[0.8] first-letter:text-text-hi' : ''].join(' ')}>
                  {block.text}
                </p>
              </Reveal>
            );
          }
        }
      })}
    </div>
  );
}
