import fs from 'node:fs';

const runId = process.env.DEBUG_RUN_ID || 'pre-deploy';

function appendNdjson(entry) {
  const logPath = new URL('../debug-2c6810.log', import.meta.url);
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf8');
}

// #region agent log
const raw = fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8');
const obj = JSON.parse(raw);
const unknownTopLevelKeys = Object.keys(obj).filter((k) => k.startsWith('_'));
appendNdjson({
  sessionId: '2c6810',
  runId,
  hypothesisId: 'H1',
  location: 'scripts/verify-vercel-json.mjs:1',
  message: 'vercel.json top-level keys checked',
  data: { unknownTopLevelKeys, hasBuildCommand: !!obj.buildCommand },
  timestamp: Date.now(),
});
// #endregion agent log

