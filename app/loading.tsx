/** Home-page loading skeleton — mirrors the asymmetric bento grid shape. */
export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-label="Loading page content"
      className="mx-auto grid w-full max-w-[var(--container-max)] flex-1 grid-cols-1 gap-6 px-5 py-8 pb-mobile-nav md:px-8 md:pb-8 lg:grid-cols-12 lg:px-16 lg:py-12"
    >
      <span className="sr-only">Loading page content…</span>
      <div aria-hidden className="h-[360px] animate-pulse rounded-[var(--radius-lg)] bg-surface lg:col-span-7 lg:h-[440px]" />
      <div aria-hidden className="h-[360px] animate-pulse rounded-[var(--radius-lg)] bg-surface lg:col-span-5 lg:h-[440px]" />
      <div aria-hidden className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-surface lg:col-span-7" />
      <div aria-hidden className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-surface lg:col-span-5" />
    </main>
  );
}
