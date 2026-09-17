import { ApexImage } from '@/components/media/ApexImage';

/**
 * Anthology story hero — contained framed image card (not full-bleed).
 * Single kicker line only — avoids repeating era/year under the title.
 */
export function AnthologyHero({
  kicker,
  title,
  standfirst,
  image,
}: {
  kicker: string;
  title: string;
  standfirst?: string;
  /** @deprecated Fold into kicker; ignored to prevent duplicate meta. */
  byline?: string;
  image: string;
}) {
  return (
    <header className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-12 md:gap-6 md:px-8 md:pt-16">
      <div className="flex flex-col gap-3">
        <span className="label-caps text-text-mid">{kicker}</span>
        <h1 className="display-hero uppercase text-text-hi">{title}</h1>
        {standfirst ? <p className="body-lg max-w-2xl text-text">{standfirst}</p> : null}
      </div>

      <div className="relative aspect-video max-h-[min(48vh,26rem)] w-full overflow-hidden rounded-[var(--radius-lg)] border border-hairline md:max-h-[min(52vh,30rem)] lg:max-h-none">
        <ApexImage
          src={image}
          alt=""
          fill
          priority
          kind="media"
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent"
        />
      </div>
    </header>
  );
}
