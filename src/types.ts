export type NovelStatus = 'unread' | 'reading' | 'completed';

export type NovelGenre = 
  | 'Romance' 
  | 'Fantasy' 
  | 'Horror' 
  | 'Mystery' 
  | 'Adventure' 
  | 'Comedy' 
  | 'Thriller' 
  | 'Drama' 
  | 'Lainnya';

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface Novel {
  id: string;
  userId: string;
  title: string;
  author: string;
  genre: NovelGenre | string;
  synopsis: string;
  coverUrl: string;
  fileUrl?: string;
  fileName?: string;
  fileType: 'pdf' | 'epub' | 'text';
  totalPages: number;
  currentPage: number;
  progressPercent: number;
  status: NovelStatus;
  isFavorite: boolean;
  lastReadAt?: string;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export type ActiveTab = 'home' | 'collection' | 'categories' | 'favorites' | 'history' | 'profile';

export type ViewMode = 'grid' | 'shelf';

export interface ReaderTheme {
  id: 'cream' | 'white' | 'sepia' | 'dark';
  name: string;
  bg: string;
  text: string;
  cardBg: string;
  accent: string;
}

export interface ReaderSettings {
  fontSize: number; // 14 to 28
  fontFamily: 'serif' | 'sans' | 'reader';
  theme: 'cream' | 'white' | 'sepia' | 'dark';
  lineHeight: number; // 1.4 to 2.2
}
