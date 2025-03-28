/**
 * @module markket
 * @description Types for Markket API requests & responses
 */
export { Article, } from './article';
export { Store } from './store';
export { StripeAccount } from './stripe';
export { SEO } from './seo';
export { Page } from './page';
export { Product } from './product';

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
  filters?: Record<string, string | number | ojbect>;
  populate?: string;
  sort?: string;
  paginate?: {
    limit?: number;
    page?: number;
    pageSize?: number;
  };
}
