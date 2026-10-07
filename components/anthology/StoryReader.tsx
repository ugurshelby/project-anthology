'use client';

import { useState } from 'react';
import type { Story } from '@/lib/data/stories';
import { AnthologyHero } from '@/components/anthology/AnthologyHero';
import { StoryBody } from '@/components/anthology/StoryBody';
import { StoryImageNotice } from '@/components/anthology/StoryImageSource';

interface StoryReaderProps {
  story: Story;
  initialLanguage?: 'en' | 'tr';
}

const STORAGE_KEY = 'apex-anthology-lang';

export function StoryReader({ story, initialLanguage }: StoryReaderProps) {
  const hasTr = Boolean(story.blocksTr && story.blocksTr.length > 0);
  const [lang, setLang] = useState<'tr' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'tr') return saved;
      } catch {
        // Ignore storage errors
      }
    }
    if (initialLanguage) return initialLanguage;
    return story.blocksTr && story.blocksTr.length > 0 ? 'tr' : 'en';
  });

  const toggleLang = (newLang: 'tr' | 'en') => {
    setLang(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  };

  const isTr = lang === 'tr' && hasTr;

  const currentTitle = isTr && story.titleTr ? story.titleTr : story.title;
  const currentSubtitle = isTr && story.subtitleTr ? story.subtitleTr : story.subtitle;
  const currentBlocks = isTr && story.blocksTr && story.blocksTr.length > 0 ? story.blocksTr : story.blocks;
  
  const categoryTrMap: Record<string, string> = {
    'Legend': 'Efsane',
    'Rivalry': 'Rekabet',
    'Tragedy': 'Trajedi',
    'Dynasty': 'Hanedan',
    'Combat': 'Mücadele',
    'Modern Era': 'Modern Dönem',
    'Miracle': 'Mucize',
    'Myth': 'Mit',
    'Technical Mastery': 'Zanaat',
    'Honor': 'Onur',
    'Chaos': 'Kaos',
  };

  const categoryLabel = isTr ? (categoryTrMap[story.category] || story.category) : story.category;
  const kickerPrefix = isTr ? 'Antoloji' : 'The Anthology';
  const kicker = `${kickerPrefix} · ${categoryLabel}${story.year ? ` · ${story.year}` : ''}`;

  return (
    <article className="w-full">
      {/* Editorial Dual-Language Switcher */}
      {hasTr && (
        <div className="mx-auto flex w-full max-w-3xl justify-end px-5 pt-8 md:px-8">
          <div
            role="region"
            aria-label="Dil Seçimi / Language Selection"
            className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface/80 p-1 backdrop-blur-md shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleLang('tr')}
              aria-pressed={lang === 'tr'}
              className={[
                'rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                lang === 'tr'
                  ? 'bg-accent text-bg shadow-sm'
                  : 'text-text-mid hover:text-text-hi',
              ].join(' ')}
            >
              TÜRKÇE
            </button>
            <button
              type="button"
              onClick={() => toggleLang('en')}
              aria-pressed={lang === 'en'}
              className={[
                'rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                lang === 'en'
                  ? 'bg-accent text-bg shadow-sm'
                  : 'text-text-mid hover:text-text-hi',
              ].join(' ')}
            >
              ENGLISH
            </button>
          </div>
        </div>
      )}

      {/* Hero header */}
      <AnthologyHero
        kicker={kicker}
        title={currentTitle}
        standfirst={currentSubtitle}
        image={story.heroImage}
      />

      {/* Story prose & imagery */}
      <StoryBody blocks={currentBlocks} />
      <StoryImageNotice />
    </article>
  );
}
