/**
 * @deprecated Dev-only placeholder cards. Production portraits come from
 * assets/asset-package/ via `npm run sync:assets` — do not run this against public/.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "drivers", "_generated-placeholder");
mkdirSync(OUT, { recursive: true });

const drivers = [
  { file: "leclerc.svg", slug: "leclerc", abbr: "LEC", number: "16", primary: "#DC0000", accent: "#F7D117" },
  { file: "hamilton.svg", slug: "hamilton", abbr: "HAM", number: "44", primary: "#DC0000", accent: "#F7D117" },
  { file: "russell.svg", slug: "russell", abbr: "RUS", number: "63", primary: "#00D2BE", accent: "#C0C0C0" },
  { file: "antonelli.svg", slug: "antonelli", abbr: "ANT", number: "12", primary: "#00D2BE", accent: "#C0C0C0" },
  { file: "norris.svg", slug: "norris", abbr: "NOR", number: "4", primary: "#FF8000", accent: "#47C7FC" },
  { file: "piastri.svg", slug: "piastri", abbr: "PIA", number: "81", primary: "#FF8000", accent: "#47C7FC" },
  { file: "verstappen.svg", slug: "verstappen", abbr: "VER", number: "1", primary: "#1E5BC6", accent: "#F7C300" },
  { file: "lawson.svg", slug: "lawson", abbr: "LAW", number: "30", primary: "#1E5BC6", accent: "#F7C300" },
  { file: "alonso.svg", slug: "alonso", abbr: "ALO", number: "14", primary: "#006F62", accent: "#CEDC00" },
  { file: "stroll.svg", slug: "stroll", abbr: "STR", number: "18", primary: "#006F62", accent: "#CEDC00" },
  { file: "gasly.svg", slug: "gasly", abbr: "GAS", number: "10", primary: "#0090FF", accent: "#FF87BC" },
  { file: "doohan.svg", slug: "doohan", abbr: "DOO", number: "7", primary: "#0090FF", accent: "#FF87BC" },
  { file: "albon.svg", slug: "albon", abbr: "ALB", number: "23", primary: "#005AFF", accent: "#FFFFFF" },
  { file: "sainz.svg", slug: "sainz", abbr: "SAI", number: "55", primary: "#005AFF", accent: "#FFFFFF" },
  { file: "bearman.svg", slug: "bearman", abbr: "BEA", number: "87", primary: "#111111", accent: "#E10600" },
  { file: "ocon.svg", slug: "ocon", abbr: "OCO", number: "31", primary: "#111111", accent: "#E10600" },
  { file: "tsunoda.svg", slug: "tsunoda", abbr: "TSU", number: "22", primary: "#2647D8", accent: "#E10600" },
  { file: "hadjar.svg", slug: "hadjar", abbr: "HAD", number: "6", primary: "#2647D8", accent: "#E10600" },
  { file: "hulkenberg.svg", slug: "hulkenberg", abbr: "HUL", number: "27", primary: "#C00000", accent: "#FFFFFF" },
  { file: "bortoleto.svg", slug: "bortoleto", abbr: "BOR", number: "5", primary: "#52E252", accent: "#111111" },
  { file: "perez.svg", slug: "perez", abbr: "PER", number: "11", primary: "#111111", accent: "#C8102E" },
  { file: "bottas.svg", slug: "bottas", abbr: "BOT", number: "77", primary: "#111111", accent: "#C8102E" },
];

function buildSvg({ slug, abbr, number, primary, accent }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" width="80" height="100">
  <defs>
    <clipPath id="c-${slug}">
      <rect width="80" height="100" rx="8"/>
    </clipPath>
  </defs>
  <g clip-path="url(#c-${slug})">
    <rect width="80" height="100" rx="8" fill="${primary}"/>
    <rect x="0" y="0" width="5" height="100" fill="${accent}"/>
    <text x="46" y="35" font-family="'Arial Black', sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" opacity="0.75" text-anchor="middle" dominant-baseline="central" letter-spacing="3">${abbr}</text>
    <text x="46" y="72" font-family="'Arial Black', sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${number}</text>
  </g>
</svg>
`;
}

for (const driver of drivers) {
  writeFileSync(join(OUT, driver.file), buildSvg(driver), "utf8");
  console.log(`Wrote ${driver.file}`);
}
