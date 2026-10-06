import { buildAttribution } from '@/lib/media/license';
import type { Candidate } from '@/lib/media/types';

/** Author + ready-to-render credit line for a chosen candidate (stored in the DB, shown next to the image). */
export function buildAttributionFor(candidate: Candidate): { author: string; attribution: string } {
  const raw = candidate.file.artist || candidate.file.credit;
  const author = raw && raw.length > 1 ? raw : 'Unknown author';
  return { author, attribution: buildAttribution(author, candidate.license) };
}
