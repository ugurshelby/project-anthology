import { describe, expect, it } from 'vitest';
import { buildAttribution, classifyLicense, htmlToPlainText } from '@/lib/media/license';

const base = { licenseUrl: null, nonFree: false, copyrighted: true as boolean | null };

describe('classifyLicense', () => {
  it.each([
    ['cc-by-4.0', 'CC BY 4.0', false],
    ['cc-by-2.0', 'CC BY 2.0', false],
    ['cc-by-sa-4.0', 'CC BY-SA 4.0', true],
    ['cc-by-sa-2.0-fr', 'CC BY-SA 2.0 FR', true],
  ])('accepts %s', (code, label, sa) => {
    const v = classifyLicense({ ...base, licenseCode: code, licenseShortName: label });
    expect(v.ok).toBe(true);
    expect(v.label).toBe(label);
    expect(v.attributionRequired).toBe(true);
    expect(v.shareAlike).toBe(sa);
  });

  it('accepts public domain and CC0 without requiring attribution', () => {
    const pd = classifyLicense({ ...base, copyrighted: false, licenseCode: 'pd', licenseShortName: 'Public domain' });
    expect(pd).toMatchObject({ ok: true, label: 'Public domain', attributionRequired: false });
    const textlogo = classifyLicense({ ...base, copyrighted: false, licenseCode: 'pd-textlogo', licenseShortName: 'Public domain' });
    expect(textlogo.ok).toBe(true);
    const cc0 = classifyLicense({ ...base, copyrighted: false, licenseCode: 'cc0', licenseShortName: 'CC0' });
    expect(cc0).toMatchObject({ ok: true, label: 'CC0' });
  });

  it('accepts CC0 even though Commons flags it copyrighted=true (CC0 is a waiver, found in the real data)', () => {
    const v = classifyLicense({ ...base, copyrighted: true, licenseCode: 'cc0', licenseShortName: 'CC0' });
    expect(v).toMatchObject({ ok: true, label: 'CC0', attributionRequired: false });
  });

  it.each([
    ['cc-by-nc-4.0', 'CC BY-NC 4.0'],
    ['cc-by-nd-2.0', 'CC BY-ND 2.0'],
    ['gfdl', 'GFDL'],
    ['fair use', 'Fair use'],
    ['', ''],
    ['attribution', 'Attribution'],
    ['copyrighted free use', 'Copyrighted free use'],
  ])('rejects %s', (code, label) => {
    expect(classifyLicense({ ...base, licenseCode: code, licenseShortName: label }).ok).toBe(false);
  });

  it('rejects anything flagged non-free even with an allowed-looking code', () => {
    expect(classifyLicense({ ...base, nonFree: true, licenseCode: 'cc-by-4.0', licenseShortName: 'CC BY 4.0' }).ok).toBe(false);
  });

  it('rejects a PD code that is flagged copyrighted (contradictory metadata)', () => {
    expect(classifyLicense({ ...base, copyrighted: true, licenseCode: 'pd', licenseShortName: 'Public domain' }).ok).toBe(false);
  });
});

describe('htmlToPlainText / buildAttribution', () => {
  it('strips tags, decodes entities and truncates', () => {
    expect(htmlToPlainText('<a href="x">Jane &amp; Co</a>')).toBe('Jane & Co');
    expect(htmlToPlainText('x'.repeat(300), 20)).toHaveLength(20);
  });
  it('builds a credit line', () => {
    const ok = classifyLicense({ ...base, licenseCode: 'cc-by-sa-4.0', licenseShortName: 'CC BY-SA 4.0' });
    expect(buildAttribution('Liauzh', ok)).toBe('Liauzh / Wikimedia Commons, CC BY-SA 4.0');
    expect(buildAttribution('Unknown author', ok)).toContain('Unknown author');
  });
});
