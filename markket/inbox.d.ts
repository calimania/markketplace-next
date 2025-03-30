import { Store } from './store';
import { User } from './user';

export interface InboxMessage {
  id: number;
  documentId: string;
  Name: string;
  Message?: string;
  email: string;
  store?: Store;
  Archived?: boolean;
  parentMessageId?: InboxMessage;
  user?: User;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface InboxResponse {
  data: InboxMessage[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
}

export interface InboxThread extends InboxMessage {
  replies?: InboxMessage[];
}
