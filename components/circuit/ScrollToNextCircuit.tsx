'use client';

import { useEffect } from 'react';

/** Gently scrolls the next-race circuit card into view on page load — the featured tile is the one a visitor cares about right now. */
export function ScrollToNextCircuit() {
  useEffect(() => {
    const el = document.getElementById('next-circuit-card');
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return null;
}
