import { Slide } from "./product";
import { SEO } from "./seo.d";
import { Store } from "./store.d";
import { Tag } from "./tag.d";

export interface RSVP {
  id: number;
  documentId: string;
  name?: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  locale?: string;
  approved?: boolean | null;
  usd_price?: number | string | null;
  sendgrid_contact_id?: string | null;
  sendgrid_list_id?: string | null;
  last_synced_at?: string | null;
  sync_status?: 'pending' | 'synced' | 'failed';
  user?: {
    id?: number;
    documentId?: string;
    email?: string;
    username?: string;
  };
  event?: Pick<Event, 'id' | 'documentId' | 'Name' | 'slug'>;
  store?: Pick<Store, 'id' | 'documentId' | 'slug' | 'title'>;
}

export interface Event {
  id: number;
  documentId: string;
  Name: string;
  usd_price: number;
  startDate: string;
  Slides: Slide[];
  endDate: string;
  timezone?: string;
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
    alternativeText?: string | null;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  };
}
