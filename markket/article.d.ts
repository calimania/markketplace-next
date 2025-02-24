export interface Article {
  id: number;
  slug: string;
  Title: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Tags?: {
    id: number;
    Label: string;
    Color?: string;
  }[];
  Content: any[];
  SEO: {
    metaDescription?: string;
    metaKeywords?: string;
    metaTitle?: string;
    metaAuthor?: string;
    metaUrl?: string;
    metaDate?: string;
    socialImage?: {
      url: string;
    };
  };
  cover: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
    data: {
      attributes: {
        url: string;
      };
      };
  };
};
