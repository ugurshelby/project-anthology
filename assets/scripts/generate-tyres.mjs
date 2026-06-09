import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "tyres");
mkdirSync(OUT, { recursive: true });

const CX = 60;
const CY = 60;
const R_OUT = 56;
const R_RIM = 36;
const R_BAND = 46;
const R_HUB = 8;

const tyres = [
  { file: "c1.svg", label: "C1", color: "#ffffff", tread: "slick" },
  { file: "c2.svg", label: "C2", color: "#ffff00", tread: "slick" },
  { file: "c3.svg", label: "C3", color: "#ffff00", tread: "slick" },
  { file: "c4.svg", label: "C4", color: "#ff0000", tread: "slick" },
  { file: "c5.svg", label: "C5", color: "#ff0000", tread: "slick" },
  { file: "intermediate.svg", label: "INT", color: "#00c04b", tread: "intermediate" },
  { file: "wet.svg", label: "WET", color: "#0066cc", tread: "wet" },
];

function treadBlocks(tread) {
  if (tread === "slick") return "";

  const innerR = tread === "wet" ? 50 : 52;
  const height = R_OUT - innerR;
  const y = CY - R_OUT;

  const blocks = [];
  for (let i = 0; i < 24; i++) {
    const angle = i * 15;
    blocks.push(
      `<rect x="58" y="${y}" width="4" height="${height}" fill="#2a2a2a" transform="rotate(${angle}, ${CX}, ${CY})"/>`
    );
  }
  return blocks.join("\n  ");
}

function spokes() {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const angle = i * 72;
    lines.push(
      `<line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - R_RIM}" stroke="#555" stroke-width="3" transform="rotate(${angle}, ${CX}, ${CY})"/>`
    );
  }
  return lines.join("\n  ");
}

function buildSvg(label, color, tread) {
  const treadMarkup = treadBlocks(tread);
  const treadLayer = treadMarkup ? `  ${treadMarkup}\n` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <circle cx="${CX}" cy="${CY}" r="${R_OUT}" fill="#1c1c1c"/>
${treadLayer}  <circle cx="${CX}" cy="${CY}" r="${R_BAND}" fill="none" stroke="${color}" stroke-width="5"/>
  <circle cx="${CX}" cy="${CY}" r="${R_RIM}" fill="#3a3a3a" stroke="#555" stroke-width="1"/>
  ${spokes()}
  <circle cx="${CX}" cy="${CY}" r="${R_HUB}" fill="#222"/>
  <text x="${CX}" y="64" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
</svg>
`;
}

for (const { file, label, color, tread } of tyres) {
  writeFileSync(join(OUT, file), buildSvg(label, color, tread), "utf8");
  console.log(`Wrote ${file} (${tread})`);
}
