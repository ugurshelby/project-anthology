import { describe, expect, it } from 'vitest';
import { hasPublisherSizes, publisherImageLoader, publisherImageUrl } from '@/lib/news/imageVariants';

const MS = 'https://cdn-3.motorsport.com/images/amp/01WV3LrY/s6/lando-norris-mclaren-oscar-pia.jpg';
const GHOST = 'https://storage.ghost.io/c/dd/af/ddafbd99-2ccd-468c-b622-4b3cccf80b49/content/images/2026/03/SI202603050143.jpg';
const BBC = 'https://ichef.bbci.co.uk/ace/standard/240/cpsprodpb/0892/live/e16baa60-f8ea-11ef-9e61-71ee71f26eb1.png';

describe('publisherImageUrl', () => {
  it('motorsport.com: picks the smallest size code at least as wide as asked', () => {
    expect(publisherImageUrl(MS, 128)).toBe(MS.replace('/s6/', '/s4/')); // 135 px
    expect(publisherImageUrl(MS, 256)).toBe(MS.replace('/s6/', '/s3/')); // 300 px
    expect(publisherImageUrl(MS, 640)).toBe(MS.replace('/s6/', '/s1000/'));
    expect(publisherImageUrl(MS, 1920)).toBe(MS.replace('/s6/', '/s1200/')); // largest available
  });

  it('Ghost: requests a WebP width from the image service', () => {
    expect(publisherImageUrl(GHOST, 128)).toBe(GHOST.replace('/content/images/', '/content/images/size/w160/format/webp/'));
    expect(publisherImageUrl(GHOST, 750)).toBe(GHOST.replace('/content/images/', '/content/images/size/w1000/format/webp/'));
  });

  it('Ghost: leaves already-sized URLs and GIF/SVG alone', () => {
    const sized = GHOST.replace('/content/images/', '/content/images/size/w300/');
    expect(publisherImageUrl(sized, 128)).toBeNull();
    expect(publisherImageUrl(GHOST.replace('.jpg', '.gif'), 128)).toBeNull();
  });

  it('BBC: swaps the width segment and asks for WebP', () => {
    expect(publisherImageUrl(BBC, 128)).toBe(BBC + '.webp');
    expect(publisherImageUrl(BBC, 640)).toBe(BBC.replace('/240/', '/800/') + '.webp');
    expect(publisherImageUrl(BBC + '.webp', 300)).toBe(BBC.replace('/240/', '/480/') + '.webp');
  });

  it('returns null for hosts without a known size scheme', () => {
    expect(publisherImageUrl('https://example.com/photo.jpg', 128)).toBeNull();
    expect(hasPublisherSizes('https://example.com/photo.jpg')).toBe(false);
    expect(hasPublisherSizes(null)).toBe(false);
  });
});

describe('publisherImageLoader', () => {
  it('feeds next/image a sized URL, or the original when it cannot', () => {
    expect(publisherImageLoader({ src: MS, width: 64 })).toBe(MS.replace('/s6/', '/s4/'));
    expect(publisherImageLoader({ src: 'https://example.com/a.jpg', width: 64 })).toBe('https://example.com/a.jpg');
  });
});
