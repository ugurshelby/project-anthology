import Link from 'next/link';

const YEAR = new Date().getFullYear();

const EXPLORE_LINKS = [
  { href: '/season', label: 'Season' },
  { href: '/grid', label: 'Grid' },
  { href: '/circuits', label: 'Circuits' },
  { href: '/news', label: 'News' },
  { href: '/anthology', label: 'Anthology' },
  { href: '/tech-glossary', label: 'Tech Glossary' },
];

const LEGAL_LINKS = [
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/dmca', label: 'Copyright / DMCA' },
];

/** Editorial site footer — brand column, explore links, archive note. */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/[0.1] bg-bg/90 pb-mobile-nav md:pb-0">
      <div className="mx-auto grid w-full max-w-[var(--container-max)] gap-10 px-5 py-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-12 md:px-8 md:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:px-16">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span
              className="font-condensed text-2xl font-700 tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
            >
              APEX
            </span>
            <span className="label-caps text-text-mid">Archive & Anthology</span>
          </div>
          <p className="max-w-md body-md text-text-mid">
            A dark cinematic archive of Formula 1 — seasons, circuits, grid lore,
            and the stories that outlast the chequered flag.
          </p>
          <p className="max-w-2xl body-sm text-text-low">
            Apex is an independent, unofficial project. It is not affiliated with
            or endorsed by Formula 1, Formula One Licensing B.V., the FIA, or any
            team, driver, circuit or sponsor.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <span className="label-caps text-text-mid">Explore</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Explore">
            {EXPLORE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label-caps text-text-mid transition-colors hover:text-text-hi"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Legal">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label-caps text-text-low transition-colors hover:text-text-hi"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-2 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-16">
          <p className="label-caps text-text-mid">
            © {YEAR} Apex F1 — Archive & Anthology
          </p>
          <p className="data-tabular text-xs text-text-mid">
            Built for the paddock archive
          </p>
        </div>
      </div>
    </footer>
  );
}
