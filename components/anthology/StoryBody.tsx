import Image from 'next/image';
import type { StoryBlock } from '@/data/stories/types';
import { Reveal } from './Reveal';

/**
 * Editorial-flow story body (design.md §3.1/§3.3) — the only non-bento layout.
 * Centered reading column (~68ch), full-bleed images, drop-cap opening,
 * condensed section headers, pull-quotes with a thin accent vertical rule.
 * Blocks fade/translate in on scroll (Reveal, reduced-motion safe).
 */
export function StoryBody({ blocks }: { blocks: StoryBlock[] }) {
  let firstParagraphSeen = false;

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
          case 'image':
            return (
              <Reveal key={i} className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
                <figure className="flex flex-col gap-2">
                  <div className="relative aspect-[16/9] w-full">
                    <Image src={block.src ?? '/placeholder.svg'} alt={block.caption ?? ''} fill sizes="100vw" className="object-cover" />
                  </div>
                  {block.caption ? (
                    <figcaption className="label-caps mx-auto max-w-3xl px-5 text-text-low md:px-8">
                      {block.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </Reveal>
            );
          case 'paragraph':
          default: {
            const isFirst = !firstParagraphSeen;
            firstParagraphSeen = true;
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
