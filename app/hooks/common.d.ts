import { Article, Page, Product, Event, Album, AlbumTrack, Subscriber } from '@/markket';

export type ContentItem = Article | Page | Product | Event | Album | AlbumTrack | InboxMessage | Form | Subscriber;

export type ContentType = 'articles' | 'pages' | 'products' | 'albums' | 'tracks' | 'events' | 'subscribers' | 'inboxes' | 'forms' | 'subscribers';

export interface FetchOptions {
  populate?: string[];
  sort?: string;
  includeAuth?: boolean;
  status?: string;
  append?: string;
}
