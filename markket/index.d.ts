/**
 * @module markket
 * @description Types for Markket API requests & responses
 */

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
  filter?: string;
  populate?: string;
  single?: string;
  paginate?: {
    limit?: number;
    page?: number;
  };
}
