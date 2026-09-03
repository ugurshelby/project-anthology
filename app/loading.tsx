/** Home-page loading skeleton — cinematic hero + three paddock tiles. */
export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-label="Loading page content"
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-5 pt-0 pb-mobile-nav md:px-8 md:pb-8 lg:px-16"
    >
      <span className="sr-only">Loading page content…</span>
      <div
        aria-hidden
        className="-mx-5 h-[520px] animate-pulse bg-surface md:-mx-8 md:h-[600px] lg:-mx-16"
      />
      <div className="mt-6 flex gap-4 overflow-hidden md:mt-8 md:grid md:grid-cols-8 lg:grid-cols-12 lg:gap-6">
        <div aria-hidden className="h-80 min-w-[85vw] animate-pulse rounded-[var(--radius-lg)] bg-surface md:min-w-0 md:col-span-4" />
        <div aria-hidden className="h-80 min-w-[85vw] animate-pulse rounded-[var(--radius-lg)] bg-surface md:min-w-0 md:col-span-4" />
        <div aria-hidden className="h-80 min-w-[85vw] animate-pulse rounded-[var(--radius-lg)] bg-surface md:min-w-0 md:col-span-4" />
      </div>
    </main>
  );
}
