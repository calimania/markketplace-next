import { SEO, ImageData } from './seo';

interface MediaFormats {
  large: ImageFormat;
  small: ImageFormat;
  medium: ImageFormat;
  thumbnail: ImageFormat;
}

export interface Media {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: MediaFormats;
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

export interface Store {
  id: number;
  title: string;
  Description: string;
  slug: string;
  documentId: string;
  Description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  STRIPE_CUSTOMER_ID: string;
  Cover: Media;
  Logo: ImageData;
  Favicon: ImageData;
  URLS: {
    id: number;
    Label: string;
    URL: string;
  }[],
  SEO: SEO;
};
