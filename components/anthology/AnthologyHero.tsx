import Image from 'next/image';

/**
 * Anthology story hero (design.md §3.3) — full-bleed cinematic image with a
 * bottom gradient, mono kicker, big condensed title, Inter standfirst, mono byline.
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
    <header className="relative flex min-h-[70vh] flex-col justify-end overflow-hidden">
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/10" />
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 md:px-8">
        <span className="label-caps text-text-mid">{kicker}</span>
        <h1 className="display-hero mt-3 uppercase text-text-hi">{title}</h1>
        {standfirst ? <p className="body-lg mt-4 max-w-2xl text-text">{standfirst}</p> : null}
        {byline ? <p className="label-caps mt-4 text-text-low">{byline}</p> : null}
      </div>
    </header>
  );
}
