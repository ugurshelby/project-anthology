import type { CommonsFileInfo } from '@/lib/media/types';

/** Factory for a Commons file with sane, license-OK defaults. */
export function makeFile(over: Partial<CommonsFileInfo> = {}): CommonsFileInfo {
  return {
    title: 'File:Example.jpg',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    width: 3000,
    height: 2000,
    mime: 'image/jpeg',
    thumbUrl: 'https://upload.wikimedia.org/thumb/example.jpg',
    originalUrl: 'https://upload.wikimedia.org/example.jpg',
    licenseCode: 'cc-by-sa-4.0',
    licenseShortName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    nonFree: false,
    copyrighted: true,
    restrictions: '',
    artist: 'Jane Doe',
    credit: '',
    description: '',
    objectName: '',
    year: null,
    categories: [],
    ...over,
  };
}
