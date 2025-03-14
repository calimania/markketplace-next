import { SEO } from './seo';
import { Media, Store } from './store';

export interface ListItem {
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

export interface List {
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

export interface ListResponse {
  data: List[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
};
