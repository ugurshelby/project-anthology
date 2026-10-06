import type { CommonsFileInfo, LicenseVerdict } from '@/lib/media/types';

/**
 * License gate. Allow-list only: a file is usable ONLY if Commons' own
 * machine-readable license code is one of
 *   - public domain family (`pd`, `pd-*`, `cc0`, `cc-zero`)
 *   - Creative Commons Attribution (`cc-by-*`) or Attribution-ShareAlike (`cc-by-sa-*`)
 * Everything else (NC, ND, GFDL-only, "fair use", unknown, missing) is rejected.
 * Rejecting on doubt is deliberate: a missed image costs a placeholder, a wrong
 * one costs a takedown.
 */

const CC_BY = /^cc-by-(\d(?:\.\d)?)(?:-([a-z]{2,3}))?$/; // cc-by-4.0, cc-by-2.0-fr
const CC_BY_SA = /^cc-by-sa-(\d(?:\.\d)?)(?:-([a-z]{2,3}))?$/;
const PD = /^(pd($|-)|cc0|cc-zero|public domain)/;

const REJECT_HINTS = /(non-?commercial|no-?deriv|\bnc\b|\bnd\b|fair[- ]use|non-?free|copyrighted free use|gfdl|all rights reserved)/i;

function ccLabel(code: string): string | null {
  const by = CC_BY.exec(code);
  if (by) return `CC BY ${by[1]}${by[2] ? ` ${by[2].toUpperCase()}` : ''}`;
  const sa = CC_BY_SA.exec(code);
  if (sa) return `CC BY-SA ${sa[1]}${sa[2] ? ` ${sa[2].toUpperCase()}` : ''}`;
  return null;
}

export function classifyLicense(
  info: Pick<CommonsFileInfo, 'licenseCode' | 'licenseShortName' | 'licenseUrl' | 'nonFree' | 'copyrighted'>,
): LicenseVerdict {
  const code = info.licenseCode.trim().toLowerCase();
  const short = info.licenseShortName.trim();
  const url = info.licenseUrl;

  if (info.nonFree) return reject(short || code, url, 'marked non-free');
  if (REJECT_HINTS.test(short) || REJECT_HINTS.test(code)) {
    return reject(short || code, url, 'license text hints at a non-free or restricted license');
  }
  if (!code && !short) return reject('unknown', url, 'no license metadata');

  const cc = ccLabel(code);
  if (cc) {
    return {
      ok: true,
      label: cc,
      attributionRequired: true,
      shareAlike: CC_BY_SA.test(code),
      url,
    };
  }

  if (PD.test(code) || /^public domain$/i.test(short) || /^cc0/i.test(short)) {
    const isCc0 = /^cc0/i.test(short) || code === 'cc0' || code === 'cc-zero';
    // Commons marks PD works "copyrighted = false", so a pd* code with copyrighted=true is contradictory.
    // CC0 is different: it is a waiver of a work that IS copyrighted, so Commons sets copyrighted=true.
    if (!isCc0 && info.copyrighted === true) return reject(short || code, url, 'PD code but copyrighted flag set');
    return {
      ok: true,
      label: isCc0 ? 'CC0' : 'Public domain',
      attributionRequired: false,
      shareAlike: false,
      url,
    };
  }

  return reject(short || code, url, 'license not on the allow-list');
}

function reject(label: string, url: string | null, reason: string): LicenseVerdict {
  return { ok: false, label, attributionRequired: false, shareAlike: false, url, reason };
}

const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

/** Commons `Artist`/`Credit` are HTML. Reduce to safe plain text for storage and display. */
export function htmlToPlainText(html: string, maxLen = 140): string {
  const stripped = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITY_MAP[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1).trimEnd()}…` : stripped;
}

/** Ready-to-render credit line, e.g. `Foto: Liauzh / Wikimedia Commons, CC BY-SA 4.0`. */
export function buildAttribution(author: string, license: LicenseVerdict): string {
  const who = author && !/^unknown/i.test(author) ? author : 'Unknown author';
  return `${who} / Wikimedia Commons, ${license.label}`;
}
