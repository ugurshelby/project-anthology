'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useReducedMotion } from '@/app/(site)/_components/reduced-motion';
import type { RadioMoment } from '@/lib/data/radio';

interface RadioMasonryProps {
  items: RadioMoment[];
}

function RadioCard({ item }: { item: RadioMoment }) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const hasAudio = Boolean(item.audio_url);

  return (
    <article
      className="card"
      style={{ breakInside: 'avoid', marginBottom: 16, display: 'inline-block', width: '100%' }}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        style={{ all: 'unset', width: '100%', cursor: 'pointer', display: 'block' }}
        aria-expanded={expanded}
      >
        <div className="card-image-wrap">
          <Image
            src={item.cover_image ?? '/images/placeholders/radio.svg'}
            alt={`${item.driver} radio moment`}
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
          />
        </div>
        <div className="card-body">
          <p className="card-kicker">
            Radio / {item.year ?? 'Unknown'} / {item.gp_name ?? 'Unknown GP'}
          </p>
          <h3 className="card-title">{item.driver}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
            "{item.quote}"
          </p>
          <div
            className="expand-panel"
            style={{ maxHeight: expanded ? 240 : 0, transition: reduced ? 'none' : undefined }}
          >
            <p>{item.context ?? item.significance ?? 'No extra context available.'}</p>
            <button
              type="button"
              disabled={!hasAudio}
              style={{
                marginTop: 10,
                background: hasAudio ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                color: hasAudio ? '#111' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 12px',
                fontFamily: 'var(--font-condensed)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: hasAudio ? 'pointer' : 'not-allowed',
              }}
            >
              Play
            </button>
          </div>
        </div>
      </button>
    </article>
  );
}

export function RadioMasonry({ items }: RadioMasonryProps) {
  return (
    <div>
      <style>{`
        @media (min-width: 768px) { .radio-masonry { column-count: 2; } }
        @media (min-width: 1200px) { .radio-masonry { column-count: 3; } }
      `}</style>
      <div className="radio-masonry">
        {items.map((item) => (
          <RadioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
