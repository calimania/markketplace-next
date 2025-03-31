/**
 * @module markket
 * @description Types for Markket API requests & responses
 */
export { Article, } from './article';
export { Store, Media } from './store';
export { StripeAccount } from './stripe';
export { SEO } from './seo';
export { Page } from './page';
export { Product } from './product';
export { Event } from './event';
export { Album, AlbumTrack } from './album';
export { InboxMessage } from './inbox';
export { Form } from './form';
export { Subscriber } from './newsletter';
export { Order } from './order';

/**
 * @typedef {Object} StrapiResponse
 */
export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * @typedef {Object} StrapiContent
 */
export interface FetchOptions {
  contentType: string;
  filters?: Record<string, string | number | object>;
  populate?: string;
  sort?: string;
  status?: 'published' | 'draft' | 'all';
  includeAuth?: boolean;
  paginate?: {
    limit?: number;
    page?: number;
    pageSize?: number;
  };
}
