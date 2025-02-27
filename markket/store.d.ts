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
  Logo: {
    url: string;
    formats: {
      small: {
        url: string;
      }
    }
  };
  Favicon: {
    url: string;
  },
  URLS: {
    id: number;
    Label: string;
    URL: string;
  }[],
  SEO: {
    metaDescription: string;
    metaKeywords: string;
    metaTitle: string;
    metaAuthor: string;
    socialImage?: {
      url: string;
    };
  };
};
