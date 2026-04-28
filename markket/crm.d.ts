export type CrmSubscriberStatus = 'pending' | 'synced' | 'failed';

export interface CrmCustomerSubscriber {
  documentId: string;
  active: boolean;
  sync_status: CrmSubscriberStatus;
  unsubscribed_at: string | null;
}

export interface CrmCustomer {
  email: string;
  name?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  rsvpsCount: number;
  lastRsvpAt: string | null;
  subscriber: CrmCustomerSubscriber | null;
}
