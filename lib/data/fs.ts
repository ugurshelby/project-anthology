import { readFile } from 'fs/promises';
import { join } from 'path';

const PUBLIC_ROOT = join(process.cwd(), 'public');

export async function readPublicJson<T>(relativePath: string): Promise<T | null> {
  const normalized = relativePath.replace(/^\/+/, '');
  try {
    const raw = await readFile(join(PUBLIC_ROOT, normalized), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
