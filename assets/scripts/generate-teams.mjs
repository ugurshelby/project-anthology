import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "teams");
mkdirSync(OUT, { recursive: true });

const teams = [
  { file: "red-bull.svg", abbr: "RBR", primary: "#1E5BC6", secondary: "#DC052D", accent: "#F7C300", text: "#FFFFFF" },
  { file: "mclaren.svg", abbr: "MCL", primary: "#FF8000", secondary: "#2D2D2D", accent: "#47C7FC", text: "#FFFFFF" },
  { file: "racing-bulls.svg", abbr: "RB", primary: "#2647D8", secondary: "#FFFFFF", accent: "#E10600", text: "#FFFFFF" },
  { file: "ferrari.svg", abbr: "FER", primary: "#DC0000", secondary: "#111111", accent: "#F7D117", text: "#FFFFFF" },
  { file: "mercedes.svg", abbr: "MER", primary: "#00D2BE", secondary: "#000000", accent: "#C0C0C0", text: "#000000" },
  { file: "aston-martin.svg", abbr: "AMR", primary: "#006F62", secondary: "#111111", accent: "#CEDC00", text: "#FFFFFF" },
  { file: "alpine.svg", abbr: "ALP", primary: "#0090FF", secondary: "#111111", accent: "#FF87BC", text: "#FFFFFF" },
  { file: "haas.svg", abbr: "HAA", primary: "#111111", secondary: "#000000", accent: "#E10600", text: "#FFFFFF" },
  { file: "williams.svg", abbr: "WIL", primary: "#005AFF", secondary: "#041E42", accent: "#FFFFFF", text: "#FFFFFF" },
  { file: "audi.svg", abbr: "AUD", primary: "#C00000", secondary: "#8B9196", accent: "#FFFFFF", text: "#FFFFFF" },
  { file: "cadillac.svg", abbr: "CAD", primary: "#111111", secondary: "#FFFFFF", accent: "#C8102E", text: "#FFFFFF" },
];

function buildSvg({ abbr, primary, secondary, accent, text }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <clipPath id="card">
      <rect width="80" height="80" rx="12"/>
    </clipPath>
  </defs>
  <g clip-path="url(#card)">
    <rect width="80" height="80" rx="12" fill="${primary}"/>
    <polygon points="0,80 80,0 80,80" fill="${secondary}" opacity="0.35"/>
    <rect x="0" y="0" width="5" height="80" fill="${accent}"/>
    <text x="42" y="42" font-family="'Arial Black', sans-serif" font-weight="900" font-size="24" fill="${text}" text-anchor="middle" dominant-baseline="central">${abbr}</text>
    <rect x="0" y="74" width="80" height="6" fill="${accent}"/>
  </g>
</svg>
`;
}

for (const team of teams) {
  writeFileSync(join(OUT, team.file), buildSvg(team), "utf8");
  console.log(`Wrote ${team.file}`);
}
