import { Store } from "./store";

export type Form = {
  documentId: string;
  id: number;
  Name: string;
  Message: string;
  structure: any;
  SEO: SEO;
  store: Store;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
