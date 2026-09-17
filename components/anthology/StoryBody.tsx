import { ApexImage } from '@/components/media/ApexImage';
import type { StoryBlock } from '@/data/stories/types';
import { Reveal } from './Reveal';

/**
 * Editorial story body — reading column (~max-w-3xl), framed image cards,
 * optically aligned drop-cap, stronger pull-quotes, scroll-reveal blocks.
 */
export function StoryBody({ blocks }: { blocks: StoryBlock[] }) {
  const firstParagraphIndex = blocks.findIndex(
    (block) => block.type === 'paragraph' || block.type === undefined,
  );

  return (
    <div className="story-body mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pb-8 pt-12 md:gap-10 md:px-8 md:pt-16">
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
                <blockquote
                  className="story-pullquote my-2 border-l-4 py-3 pl-5 md:pl-6"
                  style={{ borderColor: 'var(--accent)' }}
                >
                  <p
                    className="font-condensed text-[1.35rem] font-600 leading-snug text-text-hi md:text-[1.65rem] md:leading-tight"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {block.text}
                  </p>
                  {block.author ? (
                    <cite className="label-caps mt-4 block not-italic text-text-mid">
                      {block.author}
                    </cite>
                  ) : null}
                </blockquote>
              </Reveal>
            );
          case 'image': {
            // Cap vertical dominance on phone/tablet so images don't eclipse reading flow.
            const frame =
              block.layout === 'portrait'
                ? 'aspect-[3/4] max-h-[min(70vh,36rem)] md:max-h-none'
                : 'aspect-video max-h-[min(52vh,28rem)] w-full md:max-h-[min(56vh,32rem)] lg:max-h-none';
            return (
              <Reveal key={i}>
                <figure className="flex flex-col gap-2">
                  <div
                    className={[
                      frame,
                      'relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline',
                    ].join(' ')}
                  >
                    <ApexImage
                      src={block.src ?? '/placeholder.svg'}
                      alt={block.caption ?? ''}
                      fill
                      kind="media"
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover"
                    />
                  </div>
                  {block.caption ? (
                    <figcaption className="label-caps text-text-mid">{block.caption}</figcaption>
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
                <p
                  className={[
                    'story-prose body-lg text-text',
                    isFirst ? 'story-dropcap' : '',
                  ].join(' ')}
                >
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
