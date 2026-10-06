'use client';

import { useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { tokenizeWithGlossary, type GlossaryToken } from '@/lib/glossary/linker';

interface GlossaryLinkedTextProps {
  text?: string;
  locale?: string;
  className?: string;
}

export function GlossaryLinkedText({
  text = '',
  locale: propLocale,
  className,
}: GlossaryLinkedTextProps) {
  const contextLocale = useLocale();
  const locale = propLocale ?? contextLocale ?? 'tr';

  const tokens = useMemo<GlossaryToken[]>(() => {
    return tokenizeWithGlossary(text, locale);
  }, [text, locale]);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.type === 'term' && token.slug) {
          return (
            <Link
              key={idx}
              href={`/tech-glossary#${token.slug}`}
              title={token.termName ?? token.content}
              className="inline rounded-[2px] border-b border-dotted border-accent/60 font-medium text-text-hi transition-colors duration-150 hover:border-solid hover:border-accent hover:text-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              {token.content}
            </Link>
          );
        }
        return <span key={idx}>{token.content}</span>;
      })}
    </span>
  );
}
