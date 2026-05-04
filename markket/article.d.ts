import { type SEO } from './seo.d';
import { type Tag } from './tag.d';
import type { ContentBlock } from './page.d';
import type { Store } from './store';

export interface Article {
  id: number;
  slug: string;
  Title: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tiendaPublication?: { visibleStatus?: 'published' | 'draft' | 'unpublished'; publishedAt?: string | null };
  Tags?: Tag[];
  Content: ContentBlock[];
  store?: Store;
  SEO: SEO,
  cover: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
    data: {
      attributes: {
        url: string;
      };
      };
  };
};
