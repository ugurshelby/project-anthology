/** Home-page loading skeleton — mirrors SplitHomeLayout's two-column shape. */
export default function Loading() {
  return (
    <main id="main-content" className="mx-auto grid w-full max-w-[var(--container-max)] flex-1 grid-cols-1 gap-6 px-5 py-8 md:px-8 lg:grid-cols-2 lg:px-16 lg:py-12">
      <div aria-hidden className="h-[420px] animate-pulse rounded-[var(--radius-lg)] bg-surface lg:h-[560px]" />
      <div aria-hidden className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-surface" />
        <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-surface" />
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-surface" />
      </div>
    </main>
  );
}
