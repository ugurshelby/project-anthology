import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-[var(--container-max)] flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center md:px-8 lg:px-16">
      <span className="label-caps text-text-mid">404</span>
      <h1
        className="font-condensed uppercase text-text-hi"
        style={{
          fontFamily: 'var(--font-condensed)',
          fontWeight: 700,
          fontSize: 'clamp(40px, 6vw, 72px)',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
        }}
      >
        Off Track
      </h1>
      <p className="body-md max-w-[48ch] text-text-mid">
        This page doesn&apos;t exist — the driver, team, or race you&apos;re looking for may have
        been renamed or never made the grid.
      </p>
      <Link
        href="/"
        className="label-caps mt-2 rounded-[var(--radius-pill)] border border-hairline bg-surface px-6 py-3 text-text-hi transition-colors hover:border-accent"
      >
        Back to Home
      </Link>
    </main>
  );
}
