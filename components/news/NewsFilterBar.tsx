'use client';

import { useLocale } from 'next-intl';
import { NEWS_FILTERS, type NewsCategory } from '@/lib/news/categories';

export function NewsFilterBar({
  active,
  onChange,
}: {
  active: NewsCategory;
  onChange: (next: NewsCategory) => void;
}) {
  const locale = useLocale();

  const getFilterLabel = (id: NewsCategory, defaultLabel: string) => {
    if (locale !== 'tr') return defaultLabel;
    switch (id) {
      case 'all':
        return 'Tüm Haberler';
      case 'race-recaps':
        return 'Yarış Özetleri';
      case 'tech':
        return 'Teknik & Güncellemeler';
      case 'paddock':
        return 'Padok Söylentileri';
      case 'driver-market':
        return 'Pilot Pazarı';
      case 'breaking':
        return 'Son Dakika';
      default:
        return defaultLabel;
    }
  };

  return (
    <nav
      aria-label={locale === 'tr' ? 'Haber kategorileri' : 'News categories'}
      className="sticky top-0 z-20 -mx-5 border-b border-hairline bg-bg/80 px-5 py-3 backdrop-blur-xl md:top-14 md:-mx-0 md:px-0"
    >
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NEWS_FILTERS.map((filter) => {
          const selected = active === filter.id;
          const label = getFilterLabel(filter.id, filter.label);
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              aria-pressed={selected}
              className={[
                'touch-target label-caps flex min-h-11 shrink-0 items-center rounded-[var(--radius-pill)] border px-4 py-2 transition-colors font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
                selected
                  ? 'border-white/20 bg-white/10 text-text-hi font-bold'
                  : 'border-transparent text-text-low hover:text-text-mid hover:bg-white/[0.03]',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
