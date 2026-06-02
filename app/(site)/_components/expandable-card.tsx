'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useReducedMotion } from '@/app/(site)/_components/reduced-motion';

interface ExpandableCardProps {
  imageSrc: string;
  imageAlt: string;
  kicker: string;
  title: string;
  summary: string;
  ctaLabel?: string;
  ctaHref?: string;
  metaLine?: string;
}

export function ExpandableCard({
  imageSrc,
  imageAlt,
  kicker,
  title,
  summary,
  ctaLabel = 'Read Story ->',
  ctaHref,
  metaLine,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();

  return (
    <article className="card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          all: 'unset',
          display: 'block',
          width: '100%',
          cursor: 'pointer',
        }}
        aria-expanded={expanded}
      >
        <div className="card-image-wrap">
          <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
        <div className="card-body">
          <p className="card-kicker">{kicker}</p>
          <h3 className="card-title">{title}</h3>
          {metaLine ? (
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>{metaLine}</p>
          ) : null}
          <div
            className="expand-panel"
            style={{ maxHeight: expanded ? 220 : 0, transition: reduced ? 'none' : undefined }}
          >
            <p>{summary}</p>
            {ctaHref ? (
              <Link className="expand-link" href={ctaHref}>
                {ctaLabel}
              </Link>
            ) : (
              <span className="expand-link">{ctaLabel}</span>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}
