import Image from 'next/image';

/**
 * Anthology story hero — 2026-07 editorial redesign: a contained, framed
 * image card (not a full-bleed 70vh backdrop) so the hero reads as one
 * figure in the story's visual hierarchy rather than swallowing the viewport
 * before a single word is read (Editorial UI Design System §3.1 — Contour /
 * figure-ground separation; Card-Based UI System — text-on-media requires a
 * scrim, never bare overlay).
 */
export function AnthologyHero({
  kicker,
  title,
  standfirst,
  byline,
  image,
}: {
  kicker: string;
  title: string;
  standfirst?: string;
  byline?: string;
  image: string;
}) {
  return (
    <header className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 pt-12 md:px-8 md:pt-16">
      <div className="flex flex-col gap-2">
        <span className="label-caps text-text-mid">{kicker}</span>
        <h1 className="display-hero uppercase text-text-hi">{title}</h1>
        {standfirst ? <p className="body-lg max-w-2xl text-text">{standfirst}</p> : null}
        {byline ? <p className="label-caps text-text-low">{byline}</p> : null}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-hairline">
        <Image src={image} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
      </div>
    </header>
  );
}
