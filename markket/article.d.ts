export interface Article {
  id: number;
  Title: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Content: any[];
  SEO: {
    metaDescription: string;
    metaKeywords: string;
    metaTitle: string;
    metaAuthor: string;
    socialImage?: {
      url: string;
    };
  };
  Tags: Array<{ name: string }>;
  cover: {
    data: {
      attributes: {
        url: string;
      };
      };
  };
};
