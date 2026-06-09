import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, basename } from "path";

const INPUT_DIR = process.argv[2];
const OUTPUT_DIR = process.argv[3];

const WIDTH = 800;
const HEIGHT = 600;

function extractCoordinates(geometry) {
  if (geometry.type === "LineString") return geometry.coordinates;
  if (geometry.type === "MultiLineString")
    return geometry.coordinates.flat();
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function geojsonToSvg(geojsonPath, outputPath) {
  const data = JSON.parse(readFileSync(geojsonPath, "utf8"));
  const feature = data.features[0];
  const coords = extractCoordinates(feature.geometry);

  let minLon = Infinity,
    maxLon = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;

  for (const [lon, lat] of coords) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const lonRange = maxLon - minLon || 1e-9;
  const latRange = maxLat - minLat || 1e-9;

  const scale = Math.min(WIDTH / lonRange, HEIGHT / latRange);
  const scaledWidth = lonRange * scale;
  const scaledHeight = latRange * scale;
  const offsetX = (WIDTH - scaledWidth) / 2;
  const offsetY = (HEIGHT - scaledHeight) / 2;

  const points = coords.map(([lon, lat]) => {
    const x = offsetX + (lon - minLon) * scale;
    const y = offsetY + (maxLat - lat) * scale;
    return [x, y];
  });

  const id = basename(geojsonPath, ".geojson");
  const d =
    points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ") + " Z";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <path id="${id}" d="${d}" stroke="#ff1801" fill="none" stroke-width="2"/>
</svg>
`;

  writeFileSync(outputPath, svg, "utf8");
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const file of readdirSync(INPUT_DIR).filter((f) => f.endsWith(".geojson"))) {
  const name = basename(file, ".geojson");
  geojsonToSvg(join(INPUT_DIR, file), join(OUTPUT_DIR, `${name}.svg`));
  console.log(`Converted ${name}.geojson -> ${name}.svg`);
}
