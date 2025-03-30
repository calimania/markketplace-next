'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Article } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const OrderPage = () => {
  const { store } = useContext(DashboardContext);
  const { items, loading, } = useCMSItems<Article>('orders', store);

  return (
    <DashboardCMS
      singular="order"
      plural="orders"
      items={items}
      loading={loading}
      store={store}
      description={'Sales notifications and fulfillment'}
    ></DashboardCMS>
  );
};

export default OrderPage;
