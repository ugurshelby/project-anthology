export interface Story {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  heroImage: string;
  content: StoryContent[];
  color?: string;
}

export type StoryContent = 
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; author: string }
  | { type: 'image'; src: string; caption: string; layout: 'full' | 'portrait' | 'landscape'; isBackground?: boolean }
  | { type: 'heading'; text: string };

export interface LocationState {
  backgroundLocation?: Location;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}
