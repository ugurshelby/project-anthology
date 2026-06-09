import { copyFileSync, mkdirSync, existsSync, rmSync, readdirSync } from "fs";
import { join } from "path";

const STORIES_ROOT = join(process.cwd(), "public", "stories");

const SOURCE = {
  full: "Full 1280x720",
  landscape: "Landscape 1280x720",
  portrait: "Portrait 1280x1707",
};

const LEGACY_DIRS = new Set(Object.values(SOURCE));

/** num (1–40) → story id (corrected mapping) */
const NUM_TO_STORY = {
  1: "senna-monaco",
  2: "brawn-2009",
  3: "senna-monaco",
  4: "hunt-lauda",
  5: "hunt-lauda",
  6: "massa-2008",
  7: "massa-2008",
  8: "massa-2008",
  9: "schumacher-ferrari",
  10: "schumacher-ferrari",
  11: "schumacher-ferrari",
  12: "hakkinen-schumacher",
  13: "hakkinen-schumacher",
  14: "button-canada",
  15: "button-canada",
  16: "fangio-nurburgring",
  17: "fangio-nurburgring",
  18: "dijon-1979",
  19: "dijon-1979",
  20: "imola-1994",
  21: "brawn-2009",
  22: "hamilton-silverstone",
  23: "schumacher-1994-spain",
  24: "schumacher-1994-spain",
  25: "schumacher-1994-spain",
  26: "collins-fangio-1956",
  27: "collins-fangio-1956",
  28: "collins-fangio-1956",
  29: "monaco-1982",
  30: "monaco-1982",
  31: "monaco-1982",
  32: "jerez-1997",
  33: "jerez-1997",
  34: "jerez-1997",
  35: "senna-donington-1993",
  36: "senna-donington-1993",
  37: "senna-donington-1993",
  38: "jaguar-monaco-diamond",
  39: "jaguar-monaco-diamond",
  40: "jaguar-monaco-diamond",
};

// Remove previous story-id folders (keep legacy source dirs)
for (const name of readdirSync(STORIES_ROOT, { withFileTypes: true })) {
  if (!name.isDirectory() || LEGACY_DIRS.has(name.name)) continue;
  const target = join(STORIES_ROOT, name.name);
  rmSync(target, { recursive: true, force: true });
  console.log(`Removed old: ${name.name}/`);
}

const counters = new Map();
let fileCount = 0;
const storyDirs = new Set();

function nextIndex(story) {
  const n = (counters.get(story) ?? 0) + 1;
  counters.set(story, n);
  return String(n).padStart(2, "0");
}

for (let num = 1; num <= 40; num++) {
  const story = NUM_TO_STORY[num];
  const idx = nextIndex(story);
  storyDirs.add(story);

  for (const [layout, folder] of Object.entries(SOURCE)) {
    const srcFile = join(STORIES_ROOT, folder, `${num}.png`);
    if (!existsSync(srcFile)) {
      console.error(`Missing source: ${srcFile}`);
      process.exit(1);
    }
    const destDir = join(STORIES_ROOT, story, layout);
    mkdirSync(destDir, { recursive: true });
    const destFile = join(destDir, `${idx}.png`);
    copyFileSync(srcFile, destFile);
    fileCount++;
    console.log(`${num}.png [${folder}] → ${story}/${layout}/${idx}.png`);
  }
}

console.log(`\nStory folders: ${storyDirs.size}`);
console.log(`Files copied: ${fileCount}`);
