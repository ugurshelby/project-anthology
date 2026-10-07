'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  formatStoryImageCredit,
  getStoryImageCredit,
  isSourcedStoryImage,
} from '@/data/stories/image-credits';

/**
 * Story photographs (master-plan 7.1 / AG-1). Images are used editorially, not
 * commercially. Only an image whose source is recorded in
 * `data/stories/image-credits.ts` (status 'sourced') gets a credit line and a
 * link to its original page; an 'unverified' image shows neither — the general
 * notice below covers it.
 */

const EXTERNAL_REL = 'noopener noreferrer nofollow';

/** Wraps the image frame in a link to the original source when one is recorded. */
export function StoryImageSourceLink({
  src,
  className = '',
  children,
}: {
  src: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  const t = useTranslations('anthology');
  const credit = src ? getStoryImageCredit(src) : null;
  if (!isSourcedStoryImage(credit)) return <>{children}</>;
  return (
    <a
      href={credit.sourceUrl}
      target="_blank"
      rel={EXTERNAL_REL}
      aria-label={t('imageSourceAria', { source: formatStoryImageCredit(credit) })}
      className={`block rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${className}`}
    >
      {children}
    </a>
  );
}

/** Credit line under an image: '<author> / <source> · <license>', linked to the original page. */
export function StoryImageSourceLine({ src, className = '' }: { src: string | undefined; className?: string }) {
  const t = useTranslations('anthology');
  const credit = src ? getStoryImageCredit(src) : null;
  if (!isSourcedStoryImage(credit)) return null;
  const text = formatStoryImageCredit(credit);
  return (
    <p className={`text-[11px] leading-snug text-text-low ${className}`}>
      <a
        href={credit.sourceUrl}
        target="_blank"
        rel={EXTERNAL_REL}
        aria-label={t('imageSourceAria', { source: text })}
        className="underline decoration-hairline underline-offset-2 transition-colors hover:text-text-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {text}
      </a>
    </p>
  );
}

/** Editorial-use notice shown once per story, after the body. */
export function StoryImageNotice() {
  const t = useTranslations('anthology');
  return (
    <aside className="mx-auto w-full max-w-3xl px-5 pb-4 md:px-8">
      <p className="border-t border-hairline pt-5 text-xs leading-relaxed text-text-low">
        {t.rich('imageNotice', {
          dmca: (chunks) => (
            <Link
              href="/dmca"
              className="underline underline-offset-2 transition-colors hover:text-text-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </aside>
  );
}
