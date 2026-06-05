import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

/**
 * robots.txt. Allow all public routes in production; disallow the cron API
 * surface (and Next internals) so crawlers never hit authenticated endpoints.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/cron/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
