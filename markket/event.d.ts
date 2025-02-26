import { SEO } from './seo.d';
import { Store } from './store.d';
import { Tag } from './tag.d';

export interface Event {
  id: number;
  documentId: string;
  Name: string;
  usd_price: number;
  startDate: string;
  endDate: string;
  Description: string;
  maxCapacity: number | null;
  amountSold: number | null;
  active: boolean;
  STRIPE_PRODUCT_ID: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  SEO?: SEO;
  Tag?: Tag[];
  stores?: Store[];
  Thumbnail?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }
};
