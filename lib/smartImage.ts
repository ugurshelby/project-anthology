const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? '';

function canUseCloudinaryFetch(originalUrl: string): boolean {
  if (!CLOUDINARY_CLOUD_NAME) return false;
  if (!originalUrl.trim()) return false;
  try {
    const parsed = new URL(originalUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSmartNewsImageUrl(originalUrl: string, w: number, h: number): string {
  if (!canUseCloudinaryFetch(originalUrl)) return originalUrl;

  const transform = `c_fill,g_auto,f_auto,q_auto,dpr_auto,w_${w},h_${h}`;
  const encoded = encodeURIComponent(originalUrl);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transform}/${encoded}`;
}

export function getSmartFeaturedUrl(originalUrl: string): string {
  return getSmartNewsImageUrl(originalUrl, 1200, 630);
}

export function getSmartGridUrl(originalUrl: string): string {
  return getSmartNewsImageUrl(originalUrl, 600, 338);
}

export function getSmartMobileUrl(originalUrl: string): string {
  return getSmartNewsImageUrl(originalUrl, 400, 225);
}
