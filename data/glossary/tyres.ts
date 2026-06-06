/**
 * Pirelli tyre compounds — the dry slick range (C1–C5) plus the two wet-weather
 * tyres. Used by the /tech-glossary tyre section, paired with the SVG icons in
 * public/tyres/. Order runs hardest → softest, then intermediate → full wet.
 */

export interface TyreCompound {
  /** Matches the file basename in public/tyres/ (e.g. "c1" → /tyres/c1.svg). */
  id: string;
  name: string;
  /** Sidewall colour as raced (for the label dot). */
  color: string;
  /** Where it sits in the range, shown as a small kicker. */
  kicker: string;
  description: string;
}

export const TYRE_COMPOUNDS: TyreCompound[] = [
  {
    id: 'c1',
    name: 'C1 — Hardest',
    color: '#f0f0ec',
    kicker: 'Dry · Slick',
    description:
      'The hardest slick in the range. Slowest to warm up but the most durable, it is chosen for the highest-energy circuits (heavy braking, abrasive surfaces) where softer rubber would overheat and grain. Long stints, low degradation, least outright grip.',
  },
  {
    id: 'c2',
    name: 'C2 — Hard',
    color: '#f0f0ec',
    kicker: 'Dry · Slick',
    description:
      'A workhorse hard compound. A strong one-stop tyre that trades a little peak grip for consistency across a long run — frequently the race tyre at demanding venues.',
  },
  {
    id: 'c3',
    name: 'C3 — Medium',
    color: '#f5d33a',
    kicker: 'Dry · Slick',
    description:
      'The balanced middle of the range, and the most versatile compound. It can act as a hard or a soft depending on which three compounds Pirelli nominates for a given weekend.',
  },
  {
    id: 'c4',
    name: 'C4 — Soft',
    color: '#e2403a',
    kicker: 'Dry · Slick',
    description:
      'A high-grip soft for twisty, lower-energy circuits. Quick to switch on and strong over a single lap, but it gives up life in exchange — usually a qualifying or short-stint tyre.',
  },
  {
    id: 'c5',
    name: 'C5 — Softest',
    color: '#e2403a',
    kicker: 'Dry · Slick',
    description:
      'The softest, grippiest slick. Enormous one-lap pace for street circuits and qualifying, but it degrades fastest — drivers must manage it carefully if they race on it.',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    color: '#3fae4a',
    kicker: 'Wet · Treaded',
    description:
      'The crossover tyre for a damp or drying track. Its tread clears standing water at lower volumes than the full wet, and it is the fastest tyre in the narrow window between slick conditions and heavy rain.',
  },
  {
    id: 'wet',
    name: 'Full Wet',
    color: '#2f6fc0',
    kicker: 'Wet · Treaded',
    description:
      'The deep-tread rain tyre, able to disperse the most water and resist aquaplaning in the heaviest conditions. It runs cooler and offers the most grip when the track is truly flooded, but is slow once a dry line appears.',
  },
];
