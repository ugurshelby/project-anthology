/**
 * Minimal Metadata Hook
 * Replaces react-helmet-async with lightweight DOM manipulation
 * Reduces bundle size by ~15KB
 */

import { useEffect } from 'react';

interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
}

/**
 * Update document metadata (title, meta tags, Open Graph, Twitter Cards)
 */
export function useMetadata(options: MetadataOptions): void {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName = 'Project Anthology: The F1 Narrative',
  } = options;

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      if (!content) return;
      
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description || '');

    // Open Graph tags
    updateMetaTag('og:title', title || '', 'property');
    updateMetaTag('og:description', description || '', 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    
    if (image) {
      updateMetaTag('og:image', image, 'property');
    }
    
    if (url) {
      updateMetaTag('og:url', url, 'property');
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || '');
    updateMetaTag('twitter:description', description || '');
    
    if (image) {
      updateMetaTag('twitter:image', image);
    }

    // Cleanup function (optional - metadata persists after component unmounts)
    return () => {
      // Optionally reset to default values
      // For now, we leave metadata as-is for better UX
    };
  }, [title, description, image, url, type, siteName]);
}
