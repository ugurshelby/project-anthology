import { StoryContent } from '../types';
import { storyContentMap } from '../data/storyContent';
import { storyMetadata } from '../data/storyMetadata';

export interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  layout: 'full' | 'landscape' | 'portrait';
  storyId: string;
  storyTitle: string;
  storyYear: string;
}

/**
 * Extract all images from all stories for gallery view
 */
export const getAllGalleryImages = (): GalleryImage[] => {
  const images: GalleryImage[] = [];

  storyMetadata.forEach((story) => {
    const content = storyContentMap[story.id] || [];
    
    content.forEach((block, index) => {
      if (block.type === 'image') {
        images.push({
          id: `${story.id}-${index}`,
          src: block.src,
          caption: block.caption,
          layout: block.layout,
          storyId: story.id,
          storyTitle: story.title,
          storyYear: story.year,
        });
      }
    });

    // Also add hero image
    images.push({
      id: `${story.id}-hero`,
      src: story.heroImage,
      caption: `${story.title} — ${story.year}`,
      layout: 'landscape', // Hero images are landscape
      storyId: story.id,
      storyTitle: story.title,
      storyYear: story.year,
    });
  });

  return images;
};

/**
 * Filter images by layout type
 */
export const filterImagesByLayout = (
  images: GalleryImage[],
  layout: 'all' | 'full' | 'landscape' | 'portrait'
): GalleryImage[] => {
  if (layout === 'all') return images;
  return images.filter(img => img.layout === layout);
};

/**
 * Filter images by story
 */
export const filterImagesByStory = (
  images: GalleryImage[],
  storyId: string
): GalleryImage[] => {
  return images.filter(img => img.storyId === storyId);
};
