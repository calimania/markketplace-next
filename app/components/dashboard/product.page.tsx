'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Product } from '@/markket/';
import { useState, useEffect, useContext } from 'react';
import { strapiClient as strapi } from '@/markket/api.strapi';
import { DashboardContext } from '@/app/providers/dashboard.provider';

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { store } = useContext(DashboardContext);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        const ar = await strapi.fetch({
          contentType: 'products',
          includeAuth: true,
          filters: {
            stores: {
              $eq: store?.id,
            },
          },
          status: 'published',
          sort: 'updatedAt:desc',
          populate: 'SEO,SEO.socialImage',
        });
        setProducts((ar?.data || []) as Product[]);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (store?.id) {
      fetchPages();
    } else {
      setProducts([]);
    }
  }, [store?.id]);

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
