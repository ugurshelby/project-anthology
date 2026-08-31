import Link from 'next/link';

const YEAR = new Date().getFullYear();

const FOOTER_LINKS = [
  { href: '/tech-glossary', label: 'Tech Glossary' },
  { href: '/circuits', label: 'Circuits' },
  { href: '/news', label: 'News' },
  { href: '/anthology', label: 'Anthology' },
];

/** Site footer. Copyright derives from the current year (no hardcoded 2024). */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline pb-mobile-nav md:pb-0">
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8 lg:px-16">
        <p className="label-caps text-text-low">
          © {YEAR} Apex F1 — Archive & Anthology
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="label-caps text-text-mid transition-colors hover:text-text-hi"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
