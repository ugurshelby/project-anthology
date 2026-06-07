'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface BackButtonProps {
  /** Where to go if there is no history to pop back to (direct entry / shared link). */
  fallbackHref: string;
  /** Visible label, e.g. "All Circuits" — rendered as "← All Circuits". */
  label: string;
}

/**
 * Detail-page back affordance (B2). Pops browser history via router.back() and
 * also listens for the ESC key so the page behaves like a dismissible overlay.
 * When there is no in-app history (direct navigation), it falls back to a known
 * route instead of leaving the site. No animation — nothing here depends on
 * motion, so it is already reduced-motion neutral.
 */
export function BackButton({ fallbackHref, label }: BackButtonProps) {
  const router = useRouter();

  useEffect(() => {
    function goBack() {
      // history.length <= 1 means we arrived directly (no prior in-app page).
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackHref);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router, fallbackHref]);

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      aria-label={`Back to ${label} (or press Escape)`}
      className="cursor-pointer font-condensed text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-70"
      style={{ color: 'var(--accent)' }}
    >
      ← {label}
    </button>
  );
}
