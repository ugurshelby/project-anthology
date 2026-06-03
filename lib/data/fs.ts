/**
 * Read build-time static JSON from the `public/` directory (server-side only).
 * This is the 2nd fallback tier (after DB, before live proxy). It only READS;
 * the ingestion path never writes to disk (serverless FS is ephemeral).
 *
 * Returns null on any error (missing file, bad JSON) so callers fall through.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const PUBLIC_ROOT = path.join(process.cwd(), 'public');

export async function readPublicJson<T>(relPath: string): Promise<T | null> {
  const full = path.join(PUBLIC_ROOT, relPath.replace(/^\/+/, ''));
  // Guard against path traversal outside public/.
  if (!full.startsWith(PUBLIC_ROOT)) return null;
  try {
    const raw = await fs.readFile(full, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
