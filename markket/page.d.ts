import Store from '@/markket/store.d';
import { List } from './list';

interface BlockText {
  text: string;
  type?: 'text';
  bold?: boolean;
};

interface BlockLink {
  type: 'link';
  url: string;
  children: BlockText[];
};

type BlockChild = BlockText | BlockLink;

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'list-item' | 'image' | 'link' | 'quote' | 'code';
  type: string;
  level?: number;
  image?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
    width: number;
    height: number;
    name: string;
  },
  children: Array<{
    type: string;
    code?: boolean;
    text?: string;
    bold?: boolean;
    url?: string;
    children?: Array<{ text: string; type: string; }>;
  }>;
};

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
};

interface ImageData {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    large?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    thumbnail?: ImageFormat;
  };
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
};

interface SEO {
  id: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaUrl: string | null;
  metaAuthor: string | null;
  excludeFromSearch: boolean;
  metaDate: string | null;
  socialImage?: ImageData;
};

export interface Page {
  id: number;
  Title: string;
  Content: ContentBlock[];
  Active: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  menuOrder: number | null;
  documentId: string;
  store?: Store;
  SEO?: SEO;
  lists?: List[];
};

export interface PageResponse {
  data: Page[];
};
