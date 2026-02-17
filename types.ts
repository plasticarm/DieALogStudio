export interface ApiKeys {
  gemini?: string;
  elevenLabs?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  apiKeys: ApiKeys;
}

export interface AppSession {
  id: string;
  userId: string;
  name: string;
  lastModified: number;
  data: ProjectState;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface ComicProfile {
  id: string;
  name: string;
  artStyle: string;
  characters: Character[];
  environments: Environment[];
  environment: string;
  panelCount: number;
  styleReferenceImageUrl?: string;
  backgroundColor?: string;
}

export interface GeneratedPanelScript {
  panelNumber: number;
  visualDescription: string;
  dialogue: {
    character: string;
    text: string;
  }[];
}

export interface SavedComicStrip {
  id: string;
  arTargetId: string;
  name: string;
  comicProfileId: string;
  prompt: string;
  script: GeneratedPanelScript[];
  finishedImageUrl: string;
  exportImageUrl?: string;
  timestamp: number;
  panelCount: number;
}

export interface ComicBook {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  pages: string[];
  timestamp: number;
  width: number;
  height: number;
  logoUrl?: string;
  externalPageUrls: string[];
  showPageNumbers: boolean;
  pageNumberPosition: 'top' | 'bottom';
}

export interface ProjectState {
  version: string;
  comics: ComicProfile[];
  history: SavedComicStrip[];
  bookPages: string[];
  books: ComicBook[];
  timestamp: number;
  globalBackgroundColor: string;
  activeSeriesId: string | null;
}

export type ArtModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';