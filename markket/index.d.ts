/**
 * @module markket
 * @description Types for Markket API requests & responses
 */
export { type Article } from './article';
export { type Store, type URL, type Media } from './store';
export { type StripeAccount } from './stripe';
export { type SEO } from './seo';
export { type Page } from './page';
export { type Product, type Price } from './product';
export { type Event } from './event';
export { type Album, type AlbumTrack } from './album';
export { type InboxMessage } from './inbox';
export { type Form } from './form';
export { type Subscriber } from './newsletter';
export { type Order } from './order';
export { type Tag } from './tag';

type EventRecord = Event;

/**
 *
 */
export type ContentTypes = Page | Article | Store | Product | EventRecord | Album | AlbumTrack | Tag;


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
  headers?: Record<string, string | string[]>;
  paginate?: {
    limit?: number;
    page?: number;
    pageSize?: number;
  };
}

export type Values = Page | Article | Product | Event | Album | AlbumTrack;

export type contentTypes = 'page' | 'article' | 'product' | 'event' | 'album' | 'track';
