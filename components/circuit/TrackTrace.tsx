'use client';

import { useEffect, useState } from 'react';

/** The track outline files are one `<path d=…>` in an 800×600 viewBox (assets/f1-circuits, MIT). */
export function trackPathFromSvg(svg: string): string | null {
  return /<path[^>]*\sd="([^"]+)"/.exec(svg)?.[1] ?? null;
}

/**
 * Track outline drawn inline so it can animate (plan 13.3): the line draws itself
 * once (skipped under prefers-reduced-motion) and brightens on hover. Only the
 * licensed geometry is shown; sector boundaries and corner data are not in our
 * sources, so they are not drawn. Falls back to the plain file as an image.
 */
export function TrackTrace({ src, label }: { src: string; label: string }) {
  const [d, setD] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        if (!alive) return;
        const path = trackPathFromSvg(text);
        if (path) setD(path);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [src]);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element -- static SVG from /public, no optimisation needed
    return <img src={src} alt={label} className="h-full w-full object-contain invert" />;
  }

  return (
    <svg viewBox="-20 -20 840 640" role="img" aria-label={label} className="group h-full w-full">
      {d ? (
        <>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
          <path
            d={d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="apex-track-draw text-text-hi/85 transition-colors duration-300 group-hover:text-text-hi"
          />
        </>
      ) : null}
    </svg>
  );
}
