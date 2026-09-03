/**
 * Pirelli tyre compounds — the dry slick range (C1–C5) plus the two wet-weather
 * tyres. Used by the /tech-glossary tyre section, paired with the SVG icons in
 * public/tyres/. Order runs hardest → softest, then intermediate → full wet.
 *
 * Gauge values are 0–10 editorial indices (relative within the Pirelli range),
 * not lab measurements.
 */

export interface TyreCompound {
  /** Matches the file basename in public/tyres/ (e.g. "c1" → /tyres/c1.svg). */
  id: string;
  name: string;
  /** Sidewall colour as raced (for the label dot). */
  color: string;
  /** Where it sits in the range, shown as a small kicker. */
  kicker: string;
  /** One-line card copy. */
  blurb: string;
  /** Longer note for the mobile detail sheet. */
  description: string;
  grip: number;
  durability: number;
  warmup: number;
}

export const TYRE_COMPOUNDS: TyreCompound[] = [
  {
    id: 'c1',
    name: 'C1 — Hardest',
    color: '#f0f0ec',
    kicker: 'Dry · Slick',
    blurb: 'Highest-energy circuits. Slow to switch on, built for long stints.',
    description:
      'The hardest slick in the range. Slowest to warm up but the most durable, it is chosen for the highest-energy circuits (heavy braking, abrasive surfaces) where softer rubber would overheat and grain.',
    grip: 3,
    durability: 10,
    warmup: 2,
  },
  {
    id: 'c2',
    name: 'C2 — Hard',
    color: '#f0f0ec',
    kicker: 'Dry · Slick',
    blurb: 'Workhorse race tyre. Trades peak grip for a consistent long run.',
    description:
      'A workhorse hard compound. A strong one-stop tyre that trades a little peak grip for consistency across a long run — frequently the race tyre at demanding venues.',
    grip: 4,
    durability: 8,
    warmup: 4,
  },
  {
    id: 'c3',
    name: 'C3 — Medium',
    color: '#f5d33a',
    kicker: 'Dry · Slick',
    blurb: 'The range midpoint. Can play hard or soft depending on the nomination.',
    description:
      'The balanced middle of the range, and the most versatile compound. It can act as a hard or a soft depending on which three compounds Pirelli nominates for a given weekend.',
    grip: 6,
    durability: 6,
    warmup: 6,
  },
  {
    id: 'c4',
    name: 'C4 — Soft',
    color: '#e2403a',
    kicker: 'Dry · Slick',
    blurb: 'Twisty, lower-energy tracks. Fast switch-on, short life.',
    description:
      'A high-grip soft for twisty, lower-energy circuits. Quick to switch on and strong over a single lap, but it gives up life in exchange — usually a qualifying or short-stint tyre.',
    grip: 8,
    durability: 4,
    warmup: 8,
  },
  {
    id: 'c5',
    name: 'C5 — Softest',
    color: '#e2403a',
    kicker: 'Dry · Slick',
    blurb: 'Street-circuit qualifying weapon. Maximum grip, fastest drop-off.',
    description:
      'The softest, grippiest slick. Enormous one-lap pace for street circuits and qualifying, but it degrades fastest — drivers must manage it carefully if they race on it.',
    grip: 10,
    durability: 2,
    warmup: 10,
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    color: '#3fae4a',
    kicker: 'Wet · Treaded',
    blurb: 'Damp or drying track. Clears light standing water without full-wet drag.',
    description:
      'The crossover tyre for a damp or drying track. Its tread clears standing water at lower volumes than the full wet, and it is the fastest tyre in the narrow window between slick conditions and heavy rain.',
    grip: 7,
    durability: 5,
    warmup: 6,
  },
  {
    id: 'wet',
    name: 'Full Wet',
    color: '#2f6fc0',
    kicker: 'Wet · Treaded',
    blurb: 'Heavy rain. Deep tread against aquaplaning; slow once a dry line appears.',
    description:
      'The deep-tread rain tyre, able to disperse the most water and resist aquaplaning in the heaviest conditions. It runs cooler and offers the most grip when the track is truly flooded, but is slow once a dry line appears.',
    grip: 8,
    durability: 6,
    warmup: 5,
  },
];
