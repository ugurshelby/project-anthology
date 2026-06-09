export function buildDriverSvg({ clipId, abbr, number, primary, accent }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" width="80" height="100">
  <defs>
    <clipPath id="${clipId}">
      <rect width="80" height="100" rx="8"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${clipId})">
    <rect width="80" height="100" rx="8" fill="${primary}"/>
    <rect x="0" y="0" width="5" height="100" fill="${accent}"/>
    <text x="46" y="35" font-family="'Arial Black', sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" opacity="0.75" text-anchor="middle" dominant-baseline="central" letter-spacing="3">${abbr}</text>
    <text x="46" y="72" font-family="'Arial Black', sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${number}</text>
  </g>
</svg>
`;
}

export function buildTeamSvg({ abbr, primary, secondary, accent, text }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <clipPath id="card-${abbr}">
      <rect width="80" height="80" rx="12"/>
    </clipPath>
  </defs>
  <g clip-path="url(#card-${abbr})">
    <rect width="80" height="80" rx="12" fill="${primary}"/>
    <polygon points="0,80 80,0 80,80" fill="${secondary}" opacity="0.35"/>
    <rect x="0" y="0" width="5" height="80" fill="${accent}"/>
    <text x="42" y="42" font-family="'Arial Black', sans-serif" font-weight="900" font-size="24" fill="${text}" text-anchor="middle" dominant-baseline="central">${abbr}</text>
    <rect x="0" y="74" width="80" height="6" fill="${accent}"/>
  </g>
</svg>
`;
}
