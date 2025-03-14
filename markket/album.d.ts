import { SEO } from './seo';
import { Media, Store } from './store';
import { ContentBlock } from './page';

export interface AlbumTrack {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  description: string;
  content: ContentBlock[];
  URLS?: {
    id: number;
    Label: string;
    URL: string;
  }[];
  SEO?: SEO;
};

export interface Album {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  cover: Media;
  tracks: AlbumTrack[];
  store?: Store;
  displayType: 'grid' | 'list' | 'carousel';
  SEO?: SEO;
};

export interface AlbumResponse {
  data: Album[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
};
