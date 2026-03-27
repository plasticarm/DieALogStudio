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
  guideEnabled?: boolean;
  gamesWon?: number;
  gamesLost?: number;
  winningComics?: RatedComic[];
  playedGames?: string[];
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
  avatarUrl?: string;
  characterSheetUrl?: string;
  expressionSheetUrl?: string;
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
  artModel?: ArtModelType;
  styleDescription?: string;
  characters: Character[];
  environments: Environment[];
  environment: string;
  panelCount: number;
  styleReferenceImageUrl?: string;
  styleReferenceImageUrls?: string[];
  backgroundColor?: string;
  libraryVideoUrl?: string;
  selectedFonts?: string[];
  category?: string;
  archetypes?: string;
}

export interface GeneratedPanelScript {
  panelNumber: number;
  visualDescription: string;
  dialogue: {
    id: string;
    character: string;
    text: string;
  }[];
}

export interface TextField {
  id: string;
  text: string;
  x: number; // Percent 0-100
  y: number; // Percent 0-100
  width: number; // Percent 0-100
  height: number; // Percent 0-100
  font: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  rounding?: number;
  characterName: string;
  order?: number;
  dialogueId?: string; // Link to script dialogue
  overridePanZoom?: {
    scale: number;
    positionX: number;
    positionY: number;
  };
}

export interface PanelLayout {
  x: number; // Percent 0-100
  y: number; // Percent 0-100
  width: number; // Percent 0-100
  height: number; // Percent 0-100
  panelNumber: number;
  overridePanZoom?: {
    scale: number;
    positionX: number;
    positionY: number;
  };
}

export interface SavedComicStrip {
  id: string;
  arTargetId: string;
  name: string;
  comicProfileId: string;
  prompt: string;
  script: GeneratedPanelScript[];
  finishedImageUrl: string;
  imageHistory?: string[];
  exportImageUrl?: string;
  timestamp: number;
  panelCount: number;
  textFields?: TextField[];
  panelLayout?: PanelLayout[];
}

export interface ComicBook {
  id: string;
  seriesId?: string;
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

export interface RatedComic {
  id: string;
  comicProfileId: string;
  stripId: string;
  imageUrl: string;
  rating: number;
  timestamp: number;
  name: string;
  textFields?: TextField[];
  playerId?: string;
  isFlattened?: boolean;
}

export interface ProjectState {
  version: string;
  comics: ComicProfile[];
  history: SavedComicStrip[];
  bookPages: string[];
  books: ComicBook[];
  ratings?: RatedComic[];
  timestamp: number;
  globalBackgroundColor: string;
  activeSeriesId: string | null;
  activeBookId?: string | null;
  currentGuideStep?: number;
}

export type ArtModelType = 'gemini-2.5-flash-image' | 'gemini-3.1-flash-image-preview';