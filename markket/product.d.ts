import { Store } from "./store";

interface Price {
  id: number;
  Price: number;
  Currency: string;
  STRIPE_ID: string;
  Description: string;
  Name: string;
}

interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: null | string;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

interface ImageFormats {
  large?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  thumbnail?: ImageFormat;
}

interface Slide {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: ImageFormats;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: string;
}

interface SEO {
  id: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaUrl: string | null;
  metaAuthor: string | null;
  excludeFromSearch: boolean;
  metaDate: string | null;
}

export interface Product {
  id: number;
  Name: string;
  usd_price: number | null;
  Description: string | null;
  quantity: number | null;
  active: boolean | null;
  attributes: any | null;
  SKU: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  slug: string;
  documentId: string;
  amountSold: number | null;
  Slides: Slide[];
  SEO?: SEO;
  PRICES?: Price[];
  Thumbnail?: ImageFormat;
  stores?: Store[];
}

export interface ProductResponse {
  data: Product[];
};
