
export interface Page {
  id: number;
  Title: string;
  slug: string;
  Content: any[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  store: {
    id: string;
    title: string;
  }
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
