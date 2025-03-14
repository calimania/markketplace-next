import { Media } from './store';

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
  SEO?: {
    id: number;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    metaUrl: string | null;
    metaAuthor: string | null;
    excludeFromSearch: boolean;
    metaDate: string | null;
  };
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
};

export interface CollectionResponse {
  data: Collection[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};
