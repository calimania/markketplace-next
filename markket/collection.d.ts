import { SEO } from './seo';
import { Media, Store } from './store';

export interface CollectionItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  URLS?: {
    id: number;
    Label: string;
    URL: string;
  }[];
  SEO?: SEO;
};

export interface Collection {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  cover: Media;
  items: CollectionItem[];
  store?: Store;
  displayType: 'grid' | 'list' | 'carousel';
  SEO?: SEO;
};

export interface CollectionResponse {
  data: Collection[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
};
