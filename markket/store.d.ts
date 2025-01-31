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
  };
  Favicon: {
    url: string;
  },
  URLS: {
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
