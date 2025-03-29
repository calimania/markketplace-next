'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Product } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const ProductPage = () => {
  const { store } = useContext(DashboardContext);
  const { items: products, loading, } = useCMSItems<Product>('products', store);

  return (
    <DashboardCMS
      singular="product"
      plural="products"
      items={products}
      loading={loading}
      store={store}
      description={'Information about Digital & Physical products, and subscriptions'}
    ></DashboardCMS>
  );
};

export default ProductPage;
