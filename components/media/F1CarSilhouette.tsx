import { useId } from 'react';

/**
 * Era of the drawn side profile. The shape follows the regulations of the
 * time, so a 1970 wedge never borrows a 2023 halo:
 * - `classic`: before 1990 — low wedge, exposed helmet, small rear wing on a pylon.
 * - `raised`: 1990–2017 — raised nose over a hanging front wing, tall airbox, no halo.
 * - `halo`: 2018 onwards — halo, long wheelbase; 18-inch covered wheels from 2022.
 */
export type CarEra = 'classic' | 'raised' | 'halo';

export function carEraForSeason(season: number | null | undefined): CarEra {
  if (!season || !Number.isFinite(season)) return 'halo';
  if (season < 1990) return 'classic';
  if (season < 2018) return 'raised';
  return 'halo';
}

interface Shape {
  body: string;
  /** Livery accent band; drawn inside the body clip. */
  stripe: string;
  nose: string;
  frontWing: string;
  frontWingEnd: string;
  /** Carbon parts drawn behind the bodywork (floor, wing pylons). */
  carbon: string;
  rearEndplate: string;
  rearPlanes: string;
  halo?: string;
  helmet: { cx: number; cy: number; r: number };
  wheels: { front: [cx: number, r: number]; rear: [cx: number, r: number]; rim: number };
}

/* Side profiles on a 600 x 150 canvas, ground at y = 136, nose to the left. */
const SHAPES: Record<CarEra, Shape> = {
  halo: {
    body:
      'M 22 114 C 70 108 140 98 196 92 C 220 88 238 82 252 80 L 308 78 C 312 62 316 50 324 46 L 340 44 C 380 48 470 76 548 100 L 552 116 L 470 124 L 300 126 L 200 124 C 140 122 80 122 22 120 Z',
    stripe:
      'M 18 112 C 120 102 220 94 310 96 C 400 98 470 106 560 114 L 560 120 C 470 114 400 108 310 108 C 220 108 120 112 18 122 Z',
    nose: 'M 18 110 C 36 108 52 107 70 105 L 70 124 L 18 124 Z',
    frontWing: 'M 10 131 L 104 131 L 106 125 C 80 120 46 116 14 112 Z',
    frontWingEnd: 'M 10 111 L 20 110 L 20 132 L 10 132 Z',
    carbon: 'M 150 128 L 542 128 L 542 132 L 150 132 Z M 544 52 L 554 52 L 552 104 L 542 104 Z',
    rearEndplate: 'M 532 40 C 532 34 536 31 542 31 L 584 29 C 588 29 590 31 590 35 L 590 94 C 590 99 587 102 582 103 L 556 110 C 548 104 540 70 532 40 Z',
    rearPlanes: 'M 530 40 C 544 31 566 28 590 29 L 590 39 C 568 39 548 43 532 48 Z',
    halo: 'M 254 80 C 262 68 274 63 290 62 C 304 61 314 64 318 70',
    helmet: { cx: 296, cy: 72, r: 9 },
    wheels: { front: [130, 36], rear: [478, 36], rim: 25 },
  },
  raised: {
    body:
      'M 30 100 C 80 94 150 88 206 84 C 230 82 246 80 258 79 L 308 77 C 312 60 316 46 324 42 L 340 40 C 380 46 470 76 544 100 L 548 116 L 470 124 L 300 126 L 214 122 C 170 116 120 110 30 108 Z',
    stripe:
      'M 26 98 C 120 90 220 88 310 92 C 400 96 470 104 556 112 L 556 118 C 470 112 400 106 310 104 C 220 102 120 102 26 110 Z',
    nose: 'M 26 99 C 42 97 56 96 70 95 L 70 112 L 26 112 Z',
    frontWing: 'M 12 131 L 106 131 L 106 126 C 80 123 46 121 16 120 Z',
    frontWingEnd: 'M 12 117 L 22 116 L 22 132 L 12 132 Z',
    carbon:
      'M 160 128 L 536 128 L 536 132 L 160 132 Z M 56 106 L 64 106 L 66 126 L 58 126 Z M 540 46 L 550 46 L 548 104 L 538 104 Z',
    rearEndplate: 'M 530 30 C 530 24 534 21 540 21 L 580 20 C 584 20 586 22 586 26 L 586 92 C 586 97 583 100 578 101 L 552 108 C 544 100 538 64 530 30 Z',
    rearPlanes: 'M 528 30 C 542 21 564 19 586 20 L 586 30 C 564 30 546 34 530 38 Z',
    helmet: { cx: 294, cy: 70, r: 9 },
    wheels: { front: [134, 33], rear: [472, 34], rim: 17 },
  },
  classic: {
    body:
      'M 34 118 L 150 104 C 200 96 240 90 270 88 L 330 86 C 400 90 460 96 520 104 L 528 118 L 470 124 L 300 126 L 200 124 L 34 122 Z',
    stripe: 'M 30 114 L 150 100 C 260 88 400 92 540 108 L 540 114 C 400 100 260 98 150 108 L 30 122 Z',
    nose: 'M 30 117 L 62 113 L 62 124 L 30 124 Z',
    frontWing: 'M 20 128 L 92 128 L 92 123 C 70 121 44 120 22 120 Z',
    frontWingEnd: 'M 20 117 L 30 116 L 30 129 L 20 129 Z',
    carbon: 'M 170 128 L 516 128 L 516 132 L 170 132 Z M 520 66 L 528 66 L 526 108 L 518 108 Z M 310 88 L 316 66 L 324 66 L 330 88 Z',
    rearEndplate: 'M 500 60 C 500 55 504 52 510 52 L 556 51 C 560 51 562 53 562 57 L 562 78 C 562 82 559 84 555 84 L 506 86 C 502 80 500 70 500 60 Z',
    rearPlanes: 'M 498 60 C 512 53 538 50 562 51 L 562 60 C 540 60 518 63 500 67 Z',
    helmet: { cx: 290, cy: 78, r: 10 },
    wheels: { front: [138, 29], rear: [464, 35], rim: 15 },
  },
};

export interface F1CarSilhouetteProps {
  /** Main livery colour (body). */
  body: string;
  /** Second livery colour (nose tip, side band, wing flaps). */
  accent: string;
  era?: CarEra;
  className?: string;
}

/**
 * Minimal two-tone side profile of a Formula 1 car. Flat livery fills with
 * one soft shade for volume and a contact shadow; no grids, glows or labels,
 * so it reads as a car at any size. Decorative: the caller labels it.
 */
export function F1CarSilhouette({ body, accent, era = 'halo', className = '' }: F1CarSilhouetteProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const s = SHAPES[era];
  const clip = `car-body-${uid}`;
  const shade = `car-shade-${uid}`;
  const shadow = `car-shadow-${uid}`;
  const visor = `car-visor-${uid}`;
  const tyre = '#0e0f11';
  const carbon = '#1a1c20';

  return (
    <svg
      viewBox="0 0 600 150"
      aria-hidden="true"
      focusable="false"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clip}>
          <path d={s.body} />
        </clipPath>
        <linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.38" />
        </linearGradient>
        <clipPath id={visor}>
          <circle cx={s.helmet.cx} cy={s.helmet.cy} r={s.helmet.r} />
        </clipPath>
        <radialGradient id={shadow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contact shadow */}
      <ellipse cx="300" cy="137" rx="290" ry="7" fill={`url(#${shadow})`} />

      {/* Floor, pylons and rear wing sit behind the bodywork */}
      <path d={s.carbon} fill={carbon} />
      <path d={s.rearEndplate} fill={body} />
      <path d={s.rearEndplate} fill={`url(#${shade})`} />
      <path d={s.rearPlanes} fill={accent} />

      {/* Bodywork: livery, accent band and nose, then one shade for volume */}
      <path d={s.body} fill={body} />
      <g clipPath={`url(#${clip})`}>
        <path d={s.stripe} fill={accent} />
        <path d={s.nose} fill={accent} />
        <rect x="0" y="0" width="600" height="150" fill={`url(#${shade})`} />
      </g>
      <path d={s.body} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1" strokeLinejoin="round" />

      {/* Driver */}
      <circle cx={s.helmet.cx} cy={s.helmet.cy} r={s.helmet.r} fill="#e9eaec" />
      <g clipPath={`url(#${visor})`}>
        <rect
          x={s.helmet.cx - s.helmet.r}
          y={s.helmet.cy - s.helmet.r * 0.38}
          width={s.helmet.r * 1.05}
          height={s.helmet.r * 0.5}
          fill="#15171a"
        />
      </g>
      {s.halo ? (
        <path d={s.halo} fill="none" stroke={carbon} strokeWidth="5" strokeLinecap="round" />
      ) : null}

      {/* Front wing */}
      <path d={s.frontWing} fill={body} />
      <path d={s.frontWing} fill={`url(#${shade})`} />
      <path d={s.frontWingEnd} fill={accent} />

      {/* Wheels: tyre, sidewall line, rim */}
      {[s.wheels.front, s.wheels.rear].map(([cx, r]) => (
        <g key={cx}>
          <circle cx={cx} cy={136 - r} r={r} fill={tyre} />
          <circle cx={cx} cy={136 - r} r={r - 3} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" />
          <circle cx={cx} cy={136 - r} r={s.wheels.rim} fill="#2a2d33" />
          <circle cx={cx} cy={136 - r} r={s.wheels.rim} fill={`url(#${shade})`} />
          <circle cx={cx} cy={136 - r} r={3.5} fill="#5a5f68" />
        </g>
      ))}
    </svg>
  );
}
