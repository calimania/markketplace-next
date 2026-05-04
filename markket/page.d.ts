import Store from '@/markket/store.d';
import { Album } from './album';
import { SEO } from './seo';
import type { StrapiBlock } from './richtext';

export type ContentBlock = StrapiBlock;

export interface Page {
  id: number;
  Title: string;
  Content: ContentBlock[];
  Active: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tiendaPublication?: { visibleStatus?: 'published' | 'draft' | 'unpublished'; publishedAt?: string | null };
  locale: string;
  menuOrder: number | null;
  documentId: string;
  store?: Store;
  SEO?: SEO;
  albums?: Album[];
};

export interface PageResponse {
  data: Page[];
};
