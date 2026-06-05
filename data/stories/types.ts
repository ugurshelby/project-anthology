/** Story content types — shared by the content data module and the data layer. */

export type StoryBlockType = 'paragraph' | 'quote' | 'heading' | 'image';

export interface StoryBlock {
  type: StoryBlockType;
  /** paragraph/quote/heading text */
  text?: string;
  /** quote attribution */
  author?: string;
  /** image src (public path) */
  src?: string;
  /** image caption */
  caption?: string;
  /** image layout — maps to public/stories/{slug}/{layout}/ */
  layout?: 'full' | 'landscape' | 'portrait';
}

/** Full authored record (source of truth before it lands in stories.content jsonb). */
export interface StoryContentRecord {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  heroImage: string;
  blocks: StoryBlock[];
}

/** Shape stored in stories.content jsonb (everything except slug/title). */
export interface StoryContentJson {
  subtitle: string;
  year: string;
  category: string;
  heroImage: string;
  blocks: StoryBlock[];
}
