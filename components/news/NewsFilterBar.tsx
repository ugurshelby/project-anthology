'use client';

import { NEWS_FILTERS, type NewsCategory } from '@/lib/news/categories';

export function NewsFilterBar({
  active,
  onChange,
}: {
  active: NewsCategory;
  onChange: (next: NewsCategory) => void;
}) {
  return (
    <nav
      aria-label="News categories"
      className="sticky top-0 z-20 -mx-5 border-b border-hairline bg-bg/80 px-5 py-3 backdrop-blur-xl md:top-14 md:-mx-0 md:px-0"
    >
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NEWS_FILTERS.map((filter) => {
          const selected = active === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              aria-pressed={selected}
              className={[
                'label-caps shrink-0 rounded-[var(--radius-pill)] border px-3.5 py-1.5 transition-colors',
                selected
                  ? 'border-white/20 bg-white/5 text-text-hi'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
