import { Article, Page, Product, Event } from '@/markket';

export type ContentItem = Article | Page | Product | Event;

export type ContentType = 'articles' | 'pages' | 'products' | 'albums' | 'tracks' | 'events'  | 'subscribers' | 'inbox';

export interface FetchOptions {
  populate?: string[];
  sort?: string;
  includeAuth?: boolean;
  status?: string;
  append?: string;
}
