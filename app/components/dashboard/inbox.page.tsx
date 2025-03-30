'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { InboxMessage } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const InboxPage = () => {
  const { store } = useContext(DashboardContext);
  const { items, loading } = useCMSItems<InboxMessage>('inboxes', store);

  return (
    <DashboardCMS
      singular="inbox"
      plural="inbox"
      items={items}
      loading={loading}
      store={store}
      description="Direct DM messages"
    ></DashboardCMS>
  );
};

export default InboxPage;
