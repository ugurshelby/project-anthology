import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '@/components/seo/JsonLd';

describe('serializeJsonLd', () => {
  it('escapes < so a value cannot close the script element', () => {
    const out = serializeJsonLd({ headline: 'Senna </script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('u003c/script>');
  });

  it('stays valid JSON that parses back to the same value', () => {
    const data = { name: 'A < B', nested: { list: ['<b>', 1] } };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
