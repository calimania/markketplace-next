import { type SEO } from './seo.d';
import { type Tag } from './tag.d';

export interface Article {
  id: number;
  slug: string;
  Title: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Tags?: Tag[];
  Content: any[];
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
